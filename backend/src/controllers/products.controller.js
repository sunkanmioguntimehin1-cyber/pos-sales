import { Product } from '../models/product.model.js';
import { Category } from '../models/category.model.js';
import { Stock } from '../models/stock.model.js';
import { Branch } from '../models/branch.model.js';
import { respondWithError } from '../utils/respondWithError.js';
import {
  getHeadOfficeId, getProductStockLevels, setLocationStock, adjustLocationStock, getLocationStock, InsufficientStockError,
} from '../services/stock.service.js';
import { recordMovements, getMovements as getStockMovements } from '../services/stockLog.service.js';

export async function getProducts(req, res) {
  try {
    const { category, search, isActive, branchId } = req.query;

    const filter = {};

    if (category && category !== 'all') {
      filter.categoryId = category;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(filter)
      .populate('categoryId', 'name color')
      .sort({ name: 1 });

    // `?branchId=` re-scopes the returned `stock` to that location without
    // touching the stored total, so the POS can show what is sellable at the
    // selected till rather than the business-wide figure. It also swaps in the
    // location's minimum target, so the Inventory screen's Low/Critical flags
    // compare against that shelf's own level rather than the product default.
    if (branchId) {
      const branch = await Branch.findById(branchId).select('name type').lean();
      if (!branch) {
        res.status(404).json({ error: 'Branch not found' });
        return;
      }

      const rows = await Stock.find({
        productId: { $in: products.map((product) => product._id) },
        branchId: branch._id,
      }).select('productId quantity minQuantity').lean();

      const byProduct = new Map(rows.map((row) => [String(row.productId), row]));
      for (const product of products) {
        // Assigning to the document only affects the response — nothing here
        // is saved, so the denormalised total stays intact. `totalStock` is
        // carried alongside so the UI can show "3 here / 40 company-wide", and
        // `minQuantity` is the location's shelf target for the same request.
        product.$locals.totalStock = product.stock;
        product.stock = byProduct.get(String(product._id))?.quantity ?? 0;
        product.$locals.minQuantity = byProduct.get(String(product._id))?.minQuantity ?? product.lowStockThreshold ?? 0;
      }
    }

    res.json({ products });
  } catch (error) {
    respondWithError(res, error, { context: 'Get products error', message: 'Failed to get products' });
  }
}

export async function getProduct(req, res) {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId).populate('categoryId', 'name color');

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json({ product });
  } catch (error) {
    respondWithError(res, error, { context: 'Get product error', message: 'Failed to get product' });
  }
}

export async function createProduct(req, res) {
  try {
    const { name, sku, barcode, description, price, costPrice, categoryId, image, stock, lowStockThreshold, isActive } = req.body;

    if (!name || price === undefined) {
      res.status(400).json({ error: 'Name and price are required' });
      return;
    }

    const headOfficeId = await getHeadOfficeId();
    const openingStock = Math.max(0, Number(stock) || 0);

    const product = new Product({
      name,
      sku,
      barcode,
      description,
      price,
      costPrice,
      categoryId,
      image,
      // The opening quantity is the total across all locations, and the head
      // office is the only location holding it on day one. Written through the
      // service so the per-location row and this total can never disagree.
      stock: openingStock,
      lowStockThreshold: lowStockThreshold || 10,
      // Previously dropped, so "Inactive" products were silently created active
      // and kept showing up in the POS.
      ...(isActive === undefined ? {} : { isActive: Boolean(isActive) }),
    });

    await product.save();

    // New stock is always booked into the head office. Writing it here rather
    // than on the product document is what lets a later transfer move the same
    // units to a branch without inventing stock. The HQ row inherits the
    // product threshold as its minimum target.
    await setLocationStock(product._id, headOfficeId, openingStock, {
      minQuantity: lowStockThreshold || 10,
    });

    // The opening quantity is a movement like any other: it enters the log so
    // the Movement Log shows where a brand-new product's stock came from.
    await recordMovements([{
      productId: product._id,
      branchId: headOfficeId,
      type: 'receive',
      quantity: openingStock,
      source: 'create',
      sourceId: product._id,
      ref: product.sku || 'New product',
      note: 'Opening stock',
      staffId: req.user?.userId,
    }]);

    await product.populate('categoryId', 'name color');

    res.status(201).json({ product });
  } catch (error) {
    respondWithError(res, error, { context: 'Create product error', message: 'Failed to create product' });
  }
}

export async function updateProduct(req, res) {
  try {
    const { productId } = req.params;
    // Allowlist rather than spreading req.body: passing the raw body through
    // let a client overwrite immutable fields (_id, createdAt) or anything
    // else on the document.
    const MUTABLE_FIELDS = [
      'name', 'sku', 'barcode', 'description', 'price', 'costPrice',
      'categoryId', 'image', 'lowStockThreshold', 'isActive',
    ];
    const updates = {};
    for (const field of MUTABLE_FIELDS) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    // `stock` is accepted for backwards compatibility with the edit form but
    // is not written directly onto the document — it is routed to a location
    // through the stock service, which owns the total.
    const stockWasProvided = req.body.stock !== undefined;

    if (Object.keys(updates).length === 0 && !stockWasProvided) {
      res.status(400).json({ error: 'No updatable fields provided' });
      return;
    }

    if (Object.keys(updates).length > 0) {
      await Product.findByIdAndUpdate(
        { _id: productId },
        { $set: updates },
        { runValidators: true }
      );
    }

    if (stockWasProvided) {
      // The edit form's stock box is an absolute figure, so it sets the head
      // office quantity and leaves any other location untouched.
      await setLocationStock(productId, await getHeadOfficeId(), Math.max(0, Number(req.body.stock) || 0));
    }

    const product = await Product.findById(productId).populate('categoryId', 'name color');

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json({ product });
  } catch (error) {
    respondWithError(res, error, { context: 'Update product error', message: 'Failed to update product' });
  }
}

export async function deleteProduct(req, res) {
  try {
    const { productId } = req.params;

    const product = await Product.findByIdAndDelete({ _id: productId });
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Per-location rows are the source of truth; leaving them behind would
    // resurrect the product's stock if the same id were ever reused, and would
    // keep the aggregate query in syncProductStockTotal honest.
    await Stock.deleteMany({ productId: product._id });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    respondWithError(res, error, { context: 'Delete product error', message: 'Failed to delete product' });
  }
}

/** Maps a product's location rows into the API breakdown shape. */
function toStockBreakdown(stockLevels) {
  const total = stockLevels.reduce((sum, level) => sum + level.quantity, 0);
  return {
    stockLevels: stockLevels.map((level) => ({
      id: String(level._id),
      branchId: level.branchId?._id ? String(level.branchId._id) : level.branchId,
      branchName: level.branchId?.name,
      branchType: level.branchId?.type,
      quantity: level.quantity,
      minQuantity: level.minQuantity ?? 0,
      updatedAt: level.updatedAt,
    })),
    total,
  };
}

/**
 * The Movement Log: every recorded stock change, newest first.
 *
 * The source of truth for the Inventory screen's Movement Log tab and the
 * Stock History panel. Entries are one per location per movement, so a
 * transfer surfaces as an out row and an in row sharing a ref. Filters are
 * optional and composable; without one it returns the latest movements across
 * the whole business.
 */
export async function getMovements(req, res) {
  try {
    const { productId, branchId, type, startDate, endDate, limit } = req.query;
    const movements = await getStockMovements({
      productId,
      branchId,
      type,
      startDate,
      endDate,
      limit,
    });
    res.json({ movements });
  } catch (error) {
    respondWithError(res, error, { context: 'Get movements error', message: 'Failed to get movements' });
  }
}

/** Per-location breakdown of where a product's stock is held. */
export async function getProductStock(req, res) {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId).select('name sku').lean();
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json(toStockBreakdown(await getProductStockLevels(productId)));
  } catch (error) {
    respondWithError(res, error, { context: 'Get product stock error', message: 'Failed to get product stock' });
  }
}

/**
 * Sets the minimum/target stock level for one product at one location.
 *
 * A separate responsibility from moving units: a store can plan a shelf (say
 * "keep 40 phone cases at Accra Mall") before the first units ever arrive.
 * Upserts so a target can be set on a branch holding zero stock.
 */
export async function setProductStockTarget(req, res) {
  try {
    const { productId, branchId } = req.params;
    const { minQuantity } = req.body;

    if (minQuantity === undefined) {
      res.status(400).json({ error: 'minQuantity is required' });
      return;
    }
    const safe = Math.max(0, Number(minQuantity) || 0);

    const [product, branch] = await Promise.all([
      Product.findById(productId).select('name sku').lean(),
      Branch.findById(branchId).select('_id').lean(),
    ]);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    if (!branch) {
      res.status(404).json({ error: 'Branch not found' });
      return;
    }

    await Stock.findOneAndUpdate(
      { productId, branchId },
      { $set: { minQuantity: safe }, $setOnInsert: { quantity: 0 } },
      { upsert: true, new: true }
    );

    res.json(toStockBreakdown(await getProductStockLevels(productId)));
  } catch (error) {
    respondWithError(res, error, { context: 'Set stock target error', message: 'Failed to set stock target' });
  }
}

export async function adjustStock(req, res) {
  try {
    const { productId } = req.params;
    const { adjustment, type, branchId } = req.body;

    if (adjustment === undefined) {
      res.status(400).json({ error: 'Adjustment amount required' });
      return;
    }

    const product = await Product.findById({ _id: productId });
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Defaults to the head office so every existing caller keeps working
    // without naming a location.
    const targetBranchId = branchId || (await getHeadOfficeId());
    const amount = Number(adjustment) || 0;

    // The Movement Log records the delta actually applied, so the before
    // quantity is captured for corrections and for clamping write-offs.
    const before = await getLocationStock(productId, targetBranchId);
    let delta = 0;

    if (type === 'set') {
      await setLocationStock(productId, targetBranchId, amount);
      delta = amount - before;
    } else {
      try {
        await adjustLocationStock(productId, targetBranchId, amount);
        delta = amount;
      } catch (error) {
        if (!(error instanceof InsufficientStockError)) throw error;
        // Preserves the long-standing behaviour of the stock screen: writing
        // off more than you hold lands on zero rather than erroring out. The
        // order path uses the throwing variant instead, because a sale must
        // not silently oversell.
        await setLocationStock(productId, targetBranchId, 0);
        delta = -before;
      }
    }

    // A zero delta is a no-op and would only clutter the log with rooms made.
    if (delta !== 0) {
      const logType = type === 'set' ? 'correction' : (amount > 0 ? 'receive' : 'damage');
      const note = type === 'set'
        ? `Count correction from ${before} to ${amount}`
        : (amount > 0 ? `Restocked +${amount}` : `Written off ${Math.abs(amount)}`);
      await recordMovements([{
        productId,
        branchId: targetBranchId,
        type: logType,
        quantity: delta,
        source: 'adjust',
        sourceId: product._id,
        ref: 'Manual adjustment',
        note,
        staffId: req.user?.userId,
      }]);
    }

    const updated = await Product.findById(productId).populate('categoryId', 'name color');
    res.json({ product: updated });
  } catch (error) {
    respondWithError(res, error, { context: 'Adjust stock error', message: 'Failed to adjust stock' });
  }
}

export async function getCategories(req, res) {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ categories });
  } catch (error) {
    respondWithError(res, error, { context: 'Get categories error', message: 'Failed to get categories' });
  }
}

export async function createCategory(req, res) {
  try {
    const { name, description, color } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const category = new Category({ name, description, color });
    await category.save();

    res.status(201).json({ category });
  } catch (error) {
    respondWithError(res, error, { context: 'Create category error', message: 'Failed to create category' });
  }
}

export async function updateCategory(req, res) {
  try {
    const { categoryId } = req.params;
    const updates = req.body;

    const category = await Category.findByIdAndUpdate(
      { _id: categoryId },
      updates,
      { new: true }
    );

    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    res.json({ category });
  } catch (error) {
    respondWithError(res, error, { context: 'Update category error', message: 'Failed to update category' });
  }
}

export async function deleteCategory(req, res) {
  try {
    const { categoryId } = req.params;

    const category = await Category.findByIdAndDelete({ _id: categoryId });
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    await Product.updateMany({ categoryId }, { $unset: { categoryId: 1 } });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    respondWithError(res, error, { context: 'Delete category error', message: 'Failed to delete category' });
  }
}

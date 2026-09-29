import { Product } from '../models/product.model.js';
import { Category } from '../models/category.model.js';
import { Stock } from '../models/stock.model.js';
import { Branch } from '../models/branch.model.js';
import { respondWithError } from '../utils/respondWithError.js';
import {
  getHeadOfficeId, getProductStockLevels, setLocationStock, adjustLocationStock, InsufficientStockError,
} from '../services/stock.service.js';

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
    // selected till rather than the business-wide figure.
    if (branchId) {
      const branch = await Branch.findById(branchId).select('name type').lean();
      if (!branch) {
        res.status(404).json({ error: 'Branch not found' });
        return;
      }

      const rows = await Stock.find({
        productId: { $in: products.map((product) => product._id) },
        branchId: branch._id,
      }).select('productId quantity').lean();

      const byProduct = new Map(rows.map((row) => [String(row.productId), row.quantity]));
      for (const product of products) {
        // Assigning to the document only affects the response — nothing here
        // is saved, so the denormalised total stays intact. `totalStock` is
        // carried alongside so the UI can show "3 here / 40 company-wide".
        product.$locals.totalStock = product.stock;
        product.stock = byProduct.get(String(product._id)) ?? 0;
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
    // units to a branch without inventing stock.
    await setLocationStock(product._id, headOfficeId, openingStock);

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

/** Per-location breakdown of where a product's stock is held. */
export async function getProductStock(req, res) {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId).select('name sku').lean();
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const stockLevels = await getProductStockLevels(productId);
    const total = stockLevels.reduce((sum, level) => sum + level.quantity, 0);

    res.json({
      stockLevels: stockLevels.map((level) => ({
        id: String(level._id),
        branchId: level.branchId?._id ? String(level.branchId._id) : level.branchId,
        branchName: level.branchId?.name,
        branchType: level.branchId?.type,
        quantity: level.quantity,
        updatedAt: level.updatedAt,
      })),
      total,
    });
  } catch (error) {
    respondWithError(res, error, { context: 'Get product stock error', message: 'Failed to get product stock' });
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

    if (type === 'set') {
      await setLocationStock(productId, targetBranchId, amount);
    } else {
      try {
        await adjustLocationStock(productId, targetBranchId, amount);
      } catch (error) {
        if (!(error instanceof InsufficientStockError)) throw error;
        // Preserves the long-standing behaviour of the stock screen: writing
        // off more than you hold lands on zero rather than erroring out. The
        // order path uses the throwing variant instead, because a sale must
        // not silently oversell.
        await setLocationStock(productId, targetBranchId, 0);
      }
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

import { Product } from '../models/product.model.js';
import { Category } from '../models/category.model.js';
import { respondWithError } from '../utils/respondWithError.js';

export async function getProducts(req, res) {
  try {
    const { category, search, isActive } = req.query;
    
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

    const product = new Product({
      name,
      sku,
      barcode,
      description,
      price,
      costPrice,
      categoryId,
      image,
      stock: stock || 0,
      lowStockThreshold: lowStockThreshold || 10,
      // Previously dropped, so "Inactive" products were silently created active
      // and kept showing up in the POS.
      ...(isActive === undefined ? {} : { isActive: Boolean(isActive) }),
    });

    await product.save();
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
      'categoryId', 'image', 'stock', 'lowStockThreshold', 'isActive',
    ];
    const updates = {};
    for (const field of MUTABLE_FIELDS) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No updatable fields provided' });
      return;
    }

    const product = await Product.findByIdAndUpdate(
      { _id: productId },
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('categoryId', 'name color');

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

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    respondWithError(res, error, { context: 'Delete product error', message: 'Failed to delete product' });
  }
}

export async function adjustStock(req, res) {
  try {
    const { productId } = req.params;
    const { adjustment, type } = req.body;

    if (adjustment === undefined) {
      res.status(400).json({ error: 'Adjustment amount required' });
      return;
    }

    const product = await Product.findById({ _id: productId });
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    if (type === 'set') {
      product.stock = adjustment;
    } else {
      product.stock += adjustment;
    }

    if (product.stock < 0) {
      product.stock = 0;
    }

    await product.save();

    res.json({ product });
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

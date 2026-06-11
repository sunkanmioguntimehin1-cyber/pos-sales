import { Product } from '../models/product.model.js';
import { Category } from '../models/category.model.js';

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
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
}

export async function createProduct(req, res) {
  try {
    const { name, sku, barcode, description, price, costPrice, categoryId, image, stock, lowStockThreshold } = req.body;

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
    });

    await product.save();
    await product.populate('categoryId', 'name color');

    res.status(201).json({ product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
}

export async function updateProduct(req, res) {
  try {
    const { productId } = req.params;
    const updates = req.body;

    const product = await Product.findByIdAndUpdate(
      { _id: productId },
      updates,
      { new: true }
    ).populate('categoryId', 'name color');

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json({ product });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
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
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
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
    console.error('Adjust stock error:', error);
    res.status(500).json({ error: 'Failed to adjust stock' });
  }
}

export async function getCategories(req, res) {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
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
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
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
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Failed to update category' });
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
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
}

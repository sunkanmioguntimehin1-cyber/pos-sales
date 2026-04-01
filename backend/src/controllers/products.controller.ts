import { Request, Response } from 'express';
import { Product } from '../models/product.model.js';
import { Category } from '../models/category.model.js';

function requireTenantId(req: Request, res: Response): string | null {
  if (req.user?.role === 'superadmin') {
    return req.headers['x-tenant-id'] as string || null;
  }
  const tenantId = req.headers['x-tenant-id'] as string;
  if (!tenantId) {
    res.status(400).json({ error: 'Tenant ID required' });
    return null;
  }
  return tenantId;
}

export async function getProducts(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = requireTenantId(req, res);
    if (tenantId === undefined) return;

    const { category, search, isActive } = req.query;
    
    const filter: Record<string, unknown> = tenantId ? { tenantId } : {};
    
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

export async function createProduct(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = requireTenantId(req, res);
    if (tenantId === undefined) return;

    const { name, sku, barcode, description, price, costPrice, categoryId, image, stock, lowStockThreshold } = req.body;

    if (!name || price === undefined) {
      res.status(400).json({ error: 'Name and price are required' });
      return;
    }

    const productData: any = {
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
    };
    if (tenantId) productData.tenantId = tenantId;

    const product = new Product(productData);
    await product.save();
    await product.populate('categoryId', 'name color');

    res.status(201).json({ product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
}

export async function updateProduct(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = requireTenantId(req, res);
    if (tenantId === undefined) return;

    const { productId } = req.params;
    const updates = req.body;
    delete updates.tenantId;

    const query: any = { _id: productId };
    if (tenantId) query.tenantId = tenantId;

    const product = await Product.findOneAndUpdate(
      query,
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

export async function deleteProduct(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = requireTenantId(req, res);
    if (tenantId === undefined) return;

    const { productId } = req.params;

    const query: any = { _id: productId };
    if (tenantId) query.tenantId = tenantId;

    const product = await Product.findOneAndDelete(query);
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

export async function adjustStock(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = requireTenantId(req, res);
    if (tenantId === undefined) return;

    const { productId } = req.params;
    const { adjustment, type } = req.body;

    if (adjustment === undefined) {
      res.status(400).json({ error: 'Adjustment amount required' });
      return;
    }

    const query: any = { _id: productId };
    if (tenantId) query.tenantId = tenantId;

    const product = await Product.findOne(query);
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

export async function getCategories(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = requireTenantId(req, res);
    if (tenantId === undefined) return;

    const filter = tenantId ? { tenantId } : {};
    const categories = await Category.find(filter).sort({ name: 1 });
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
}

export async function createCategory(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = requireTenantId(req, res);
    if (tenantId === undefined) return;

    const { name, description, color } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const categoryData: any = { name, description, color };
    if (tenantId) categoryData.tenantId = tenantId;

    const category = new Category(categoryData);
    await category.save();

    res.status(201).json({ category });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
}

export async function updateCategory(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = requireTenantId(req, res);
    if (tenantId === undefined) return;

    const { categoryId } = req.params;
    const updates = req.body;
    delete updates.tenantId;

    const query: any = { _id: categoryId };
    if (tenantId) query.tenantId = tenantId;

    const category = await Category.findOneAndUpdate(
      query,
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

export async function deleteCategory(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = requireTenantId(req, res);
    if (tenantId === undefined) return;

    const { categoryId } = req.params;

    const query: any = { _id: categoryId };
    if (tenantId) query.tenantId = tenantId;

    const category = await Category.findOneAndDelete(query);
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    const productQuery: any = { categoryId };
    if (tenantId) productQuery.tenantId = tenantId;
    await Product.updateMany(productQuery, { $unset: { categoryId: 1 } });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
}

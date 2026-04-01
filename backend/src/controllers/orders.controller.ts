import { Request, Response } from 'express';
import { Order } from '../models/order.model.js';
import { Product } from '../models/product.model.js';
import { Customer } from '../models/customer.model.js';

export interface CreateOrderBody {
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod?: string;
  customerId?: string;
  branchId?: string;
  notes?: string;
}

function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${dateStr}-${random}`;
}

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

export async function getOrders(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = requireTenantId(req, res);
    if (tenantId === undefined) return;

    const { status, startDate, endDate } = req.query;
    
    const filter: Record<string, unknown> = tenantId ? { tenantId } : {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        (filter.createdAt as Record<string, Date>).$gte = new Date(startDate as string);
      }
      if (endDate) {
        (filter.createdAt as Record<string, Date>).$lte = new Date(endDate as string);
      }
    }

    const orders = await Order.find(filter)
      .populate('staffId', 'name')
      .populate('customerId', 'name')
      .populate('branchId', 'name')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
}

export async function createOrder(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = requireTenantId(req, res);
    if (tenantId === undefined) return;

    const { items, subtotal, tax, total, paymentMethod, customerId, branchId, notes }: CreateOrderBody = req.body;

    if (!items || items.length === 0) {
      res.status(400).json({ error: 'Order must have at least one item' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    let staffId = req.user.userId;
    if (req.user.role === 'tenant_admin' && tenantId) {
      const Staff = (await import('../models/staff.model.js')).Staff;
      const adminAsStaff = await Staff.findOne({ tenantId, role: 'admin' });
      if (adminAsStaff) {
        staffId = adminAsStaff._id.toString();
      }
    }

    for (const item of items) {
      const query: any = { _id: item.productId };
      if (tenantId) query.tenantId = tenantId;
      await Product.findOneAndUpdate(
        query,
        { $inc: { stock: -item.quantity } }
      );
    }

    if (customerId && tenantId) {
      await Customer.findOneAndUpdate(
        { _id: customerId, tenantId },
        {
          $inc: { visitCount: 1, totalSpent: total },
          $set: { lastVisit: new Date() },
        }
      );
    }

    const orderData: any = {
      orderNumber: generateOrderNumber(),
      items,
      subtotal,
      tax,
      total,
      paymentMethod,
      customerId,
      staffId,
      branchId,
      notes,
    };
    if (tenantId) orderData.tenantId = tenantId;

    const order = new Order(orderData);
    await order.save();
    await order.populate([
      { path: 'staffId', select: 'name' },
      { path: 'customerId', select: 'name' },
      { path: 'branchId', select: 'name' },
    ]);

    res.status(201).json({ order });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
}

export async function getOrder(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = requireTenantId(req, res);
    if (tenantId === undefined) return;

    const { orderId } = req.params;

    const query: any = { _id: orderId };
    if (tenantId) query.tenantId = tenantId;

    const order = await Order.findOne(query)
      .populate('staffId', 'name')
      .populate('customerId', 'name email')
      .populate('branchId', 'name');

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to get order' });
  }
}

export async function updateOrderStatus(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = requireTenantId(req, res);
    if (tenantId === undefined) return;

    const { orderId } = req.params;
    const { status } = req.body;

    if (!['pending', 'completed', 'cancelled', 'refunded'].includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const query: any = { _id: orderId };
    if (tenantId) query.tenantId = tenantId;

    const order = await Order.findOneAndUpdate(
      query,
      { status },
      { new: true }
    ).populate('staffId', 'name');

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json({ order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
}

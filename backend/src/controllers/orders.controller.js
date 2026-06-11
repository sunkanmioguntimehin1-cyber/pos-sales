import { Order } from '../models/order.model.js';
import { Product } from '../models/product.model.js';
import { Customer } from '../models/customer.model.js';

function generateOrderNumber() {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${dateStr}-${random}`;
}

export async function getOrders(req, res) {
  try {
    const { status, startDate, endDate } = req.query;
    
    const filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
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

export async function createOrder(req, res) {
  try {
    const { items, subtotal, tax, total, paymentMethod, customerId, branchId, notes } = req.body;

    if (!items || items.length === 0) {
      res.status(400).json({ error: 'Order must have at least one item' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const staffId = req.user.userId;

    for (const item of items) {
      await Product.findByIdAndUpdate(
        { _id: item.productId },
        { $inc: { stock: -item.quantity } }
      );
    }

    if (customerId) {
      await Customer.findByIdAndUpdate(
        { _id: customerId },
        {
          $inc: { visitCount: 1, totalSpent: total },
          $set: { lastVisit: new Date() },
        }
      );
    }

    const order = new Order({
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
    });

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

export async function getOrder(req, res) {
  try {
    const { orderId } = req.params;

    const order = await Order.findById({ _id: orderId })
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

export async function updateOrderStatus(req, res) {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!['pending', 'completed', 'cancelled', 'refunded'].includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const order = await Order.findByIdAndUpdate(
      { _id: orderId },
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

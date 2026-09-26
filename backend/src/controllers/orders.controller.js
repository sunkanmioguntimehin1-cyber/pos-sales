import { Order } from '../models/order.model.js';
import { Product } from '../models/product.model.js';
import { Customer } from '../models/customer.model.js';
import { respondWithError } from '../utils/respondWithError.js';

function generateOrderNumber() {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
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
    respondWithError(res, error, { context: 'Get orders error', message: 'Failed to get orders' });
  }
}

export async function createOrder(req, res) {
  try {
    const { items, subtotal, tax, total, paymentMethod, customerId, branchId, staffId, notes } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Order must have at least one item' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const invalidItem = items.find(
      (item) => !item?.productId || !item?.productName || !item?.quantity || item.unitPrice === undefined
    );
    if (invalidItem) {
      res.status(400).json({ error: 'Each item needs productId, productName, quantity and unitPrice' });
      return;
    }

    // The POS lets a cashier hand the terminal to a colleague; attribute the
    // sale to whoever they verified, falling back to the logged-in user.
    const attributedStaffId = staffId || req.user.userId;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        res.status(400).json({ error: `Product ${item.productId} not found` });
        return;
      }
      if (product.stock < item.quantity) {
        res.status(400).json({
          error: `Insufficient stock for ${product.name}: ${product.stock} available, ${item.quantity} requested`,
        });
        return;
      }
    }

    // Only decrement once every line has been validated, so a rejected order
    // never leaves partially deducted stock behind.
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
      staffId: attributedStaffId,
      branchId,
      notes,
    });

    // orderNumber is unique; on the rare collision regenerate and retry rather
    // than failing the customer's sale.
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        await order.save();
        break;
      } catch (error) {
        if (error?.code === 11000 && attempt < 4) {
          order.orderNumber = generateOrderNumber();
          continue;
        }
        throw error;
      }
    }

    await order.populate([
      { path: 'staffId', select: 'name' },
      { path: 'customerId', select: 'name' },
      { path: 'branchId', select: 'name' },
    ]);

    res.status(201).json({ order });
  } catch (error) {
    respondWithError(res, error, { context: 'Create order error', message: 'Failed to create order' });
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
    respondWithError(res, error, { context: 'Get order error', message: 'Failed to get order' });
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
    respondWithError(res, error, { context: 'Update order status error', message: 'Failed to update order status' });
  }
}

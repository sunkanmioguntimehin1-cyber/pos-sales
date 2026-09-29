import { Order } from '../models/order.model.js';
import { Product } from '../models/product.model.js';
import { Customer } from '../models/customer.model.js';
import { Branch } from '../models/branch.model.js';
import { respondWithError } from '../utils/respondWithError.js';
import {
  getHeadOfficeId, getLocationStock, adjustLocationStock, InsufficientStockError,
} from '../services/stock.service.js';

function generateOrderNumber() {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ORD-${dateStr}-${random}`;
}

/**
 * Credits units back to the location they were taken from.
 *
 * Prefers each line's own `locationId`, falling back to the order header for
 * orders placed before stock was tracked per location. Failures are swallowed
 * per line: this runs on compensation and restore paths, and one bad line must
 * not prevent the rest of the order's stock from coming back.
 */
async function restoreItemsToLocation(items, fallbackBranchId) {
  for (const item of items) {
    const branchId = item.locationId || fallbackBranchId;
    if (!branchId) continue;
    try {
      await adjustLocationStock(item.productId, branchId, item.quantity);
    } catch (error) {
      console.error(`Failed to restore ${item.quantity} x ${item.productId} to ${branchId}:`, error.message);
    }
  }
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

    // Stock is drawn from the location the terminal is set to, not from
    // whichever branch happens to be flagged default. Falling back to head
    // office keeps orders working if the POS has not chosen a location yet.
    const sourceBranchId = branchId || (await getHeadOfficeId());
    const sourceBranch = await Branch.findById(sourceBranchId).select('name type').lean();
    if (!sourceBranch) {
      res.status(400).json({ error: `Branch ${sourceBranchId} not found` });
      return;
    }

    // VALIDATION PASS — no writes, so a rejected order never leaves partially
    // deducted stock behind. Availability is read per location rather than off
    // Product.stock, which is the business-wide total.
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        res.status(400).json({ error: `Product ${item.productId} not found` });
        return;
      }

      const available = await getLocationStock(product._id, sourceBranchId);
      if (available < item.quantity) {
        res.status(400).json({
          error: `Insufficient stock for ${product.name} at ${sourceBranch.name}: ${available} available, ${item.quantity} requested`,
        });
        return;
      }
    }

    // WRITE PASS — only after every line has been validated.
    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      try {
        await adjustLocationStock(item.productId, sourceBranchId, -item.quantity);
      } catch (error) {
        if (!(error instanceof InsufficientStockError)) throw error;
        // Another sale took the last units between the check and this write.
        // Credit back every line already deducted before rejecting — a partial
        // deduction would leave the books worse than a failed sale.
        await restoreItemsToLocation(items.slice(0, index), sourceBranchId);
        res.status(409).json({ error: error.message });
        return;
      }
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
      items: items.map((item) => ({ ...item, locationId: sourceBranchId })),
      subtotal,
      tax,
      total,
      paymentMethod,
      customerId,
      staffId: attributedStaffId,
      branchId: sourceBranchId,
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

/** Statuses that mean the goods go back on the shelf. */
const RESTOCKING_STATUSES = new Set(['cancelled', 'refunded']);

export async function updateOrderStatus(req, res) {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!['pending', 'completed', 'cancelled', 'refunded'].includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    // Read first rather than using a blind findByIdAndUpdate: the restore below
    // must only run on the transition *into* a restocking status. Without the
    // previous value, cancelling the same order twice would credit the stock
    // back twice.
    const existing = await Order.findById(orderId);
    if (!existing) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const previousStatus = existing.status;
    if (previousStatus === status) {
      const unchanged = await Order.findById(orderId)
        .populate('staffId', 'name')
        .populate('customerId', 'name')
        .populate('branchId', 'name type');
      res.json({ order: unchanged });
      return;
    }

    const order = await Order.findByIdAndUpdate(
      { _id: orderId },
      { status },
      { new: true }
    ).populate('staffId', 'name')
     .populate('customerId', 'name')
     .populate('branchId', 'name type');

    if (RESTOCKING_STATUSES.has(status) && !RESTOCKING_STATUSES.has(previousStatus)) {
      await restoreItemsToLocation(order.items, order.branchId?._id || order.branchId);

      // A refunded sale is not revenue and not a visit. Left uncorrected the
      // customer keeps their inflated spend total, and their tier goes with it.
      if (order.customerId) {
        const customerRef = order.customerId._id || order.customerId;
        await Customer.findByIdAndUpdate(
          { _id: customerRef },
          { $inc: { visitCount: -1, totalSpent: -order.total } }
        );
      }
    }

    res.json({ order });
  } catch (error) {
    respondWithError(res, error, { context: 'Update order status error', message: 'Failed to update order status' });
  }
}

import { StockTransfer } from '../models/stockTransfer.model.js';
import { Product } from '../models/product.model.js';
import { Branch } from '../models/branch.model.js';
import { respondWithError } from '../utils/respondWithError.js';
import {
  transferStock, getLocationStock, InsufficientStockError,
} from '../services/stock.service.js';

/**
 * Collapses duplicate lines for the same product into one.
 *
 * A request listing the same product twice would otherwise be validated line
 * by line — each passing on its own — and then the second line would fail
 * after the first had already moved stock. Summing first makes the
 * availability check and the movement agree.
 */
function normalizeItems(items) {
  const merged = new Map();

  for (const item of items) {
    const existing = merged.get(item.productId);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      merged.set(item.productId, { productId: item.productId, productName: item.productName, quantity: item.quantity });
    }
  }

  return [...merged.values()];
}

export async function getTransfers(req, res) {
  try {
    const { branchId, startDate, endDate, limit } = req.query;

    const filter = {};

    if (branchId && branchId !== 'all') {
      // A transfer touches a location in either direction.
      filter.$or = [{ fromBranchId: branchId }, { toBranchId: branchId }];
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const transfers = await StockTransfer.find(filter)
      .populate('fromBranchId', 'name type')
      .populate('toBranchId', 'name type')
      .populate('staffId', 'name')
      .populate('items.productId', 'name sku')
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit) || 100, 500));

    res.json({ transfers });
  } catch (error) {
    respondWithError(res, error, { context: 'Get transfers error', message: 'Failed to get transfers' });
  }
}

export async function getTransfer(req, res) {
  try {
    const { transferId } = req.params;

    const transfer = await StockTransfer.findById(transferId)
      .populate('fromBranchId', 'name type')
      .populate('toBranchId', 'name type')
      .populate('staffId', 'name')
      .populate('items.productId', 'name sku');

    if (!transfer) {
      res.status(404).json({ error: 'Transfer not found' });
      return;
    }

    res.json({ transfer });
  } catch (error) {
    respondWithError(res, error, { context: 'Get transfer error', message: 'Failed to get transfer' });
  }
}

export async function createTransfer(req, res) {
  try {
    const { fromBranchId, toBranchId, items, staffId, notes } = req.body;

    if (!fromBranchId || !toBranchId) {
      res.status(400).json({ error: 'Both a source and a destination branch are required' });
      return;
    }

    if (fromBranchId === toBranchId) {
      res.status(400).json({ error: 'Source and destination must be different' });
      return;
    }

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'A transfer needs at least one item' });
      return;
    }

    const invalid = items.find(
      (item) => !item?.productId || !item?.quantity || Number(item.quantity) <= 0
    );
    if (invalid) {
      res.status(400).json({ error: 'Each item needs a productId and a quantity above zero' });
      return;
    }

    const [fromBranch, toBranch] = await Promise.all([
      Branch.findById(fromBranchId).select('name type status').lean(),
      Branch.findById(toBranchId).select('name type status').lean(),
    ]);

    if (!fromBranch) {
      res.status(400).json({ error: `Source branch ${fromBranchId} not found` });
      return;
    }
    if (!toBranch) {
      res.status(400).json({ error: `Destination branch ${toBranchId} not found` });
      return;
    }
    if (fromBranch.status === 'inactive' || toBranch.status === 'inactive') {
      res.status(400).json({ error: 'Cannot transfer to or from an inactive branch' });
      return;
    }

    const lines = normalizeItems(items);

    // VALIDATION PASS — no movements, so a rejected transfer leaves both
    // locations untouched. Availability is checked against the source
    // location, not the business-wide total.
    for (const line of lines) {
      const product = await Product.findById(line.productId).select('name').lean();
      if (!product) {
        res.status(400).json({ error: `Product ${line.productId} not found` });
        return;
      }

      const available = await getLocationStock(line.productId, fromBranchId);
      if (available < line.quantity) {
        res.status(400).json({
          error: `Insufficient stock for ${product.name} at ${fromBranch.name}: ${available} available, ${line.quantity} requested`,
        });
        return;
      }
    }

    // MOVE PASS — each line is independently compensated, and if any line
    // fails the ones already moved are reversed so the transfer is all-or-
    // nothing. This is not a database transaction (see transferStock for why),
    // so a crash mid-transfer can still leave stock split across two places.
    const moved = [];
    try {
      for (const line of lines) {
        await transferStock({
          productId: line.productId,
          fromBranchId,
          toBranchId,
          quantity: line.quantity,
        });
        moved.push(line);
      }
    } catch (error) {
      for (const line of moved) {
        try {
          await transferStock({
            productId: line.productId,
            fromBranchId: toBranchId,
            toBranchId: fromBranchId,
            quantity: line.quantity,
          });
        } catch (rollbackError) {
          console.error(
            `Failed to roll back ${line.quantity} x ${line.productId}: ${rollbackError.message}`
          );
        }
      }

      const message = error instanceof InsufficientStockError
        ? error.message
        : 'Transfer failed and was rolled back';
      res.status(409).json({ error: message });
      return;
    }

    const products = await Product.find({ _id: { $in: lines.map((line) => line.productId) } })
      .select('name')
      .lean();
    const names = new Map(products.map((product) => [String(product._id), product.name]));

    const transfer = await StockTransfer.create({
      fromBranchId,
      toBranchId,
      items: lines.map((line) => ({
        productId: line.productId,
        productName: names.get(String(line.productId)) || line.productName || 'Unknown product',
        quantity: line.quantity,
      })),
      status: 'completed',
      staffId: staffId || req.user?.userId,
      notes,
    });

    await transfer.populate([
      { path: 'fromBranchId', select: 'name type' },
      { path: 'toBranchId', select: 'name type' },
      { path: 'staffId', select: 'name' },
    ]);

    res.status(201).json({ transfer });
  } catch (error) {
    respondWithError(res, error, { context: 'Create transfer error', message: 'Failed to create transfer' });
  }
}

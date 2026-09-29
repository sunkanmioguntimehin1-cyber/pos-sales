import mongoose from 'mongoose';
import { StockLog } from '../models/stockLog.model.js';
import { StockTransfer } from '../models/stockTransfer.model.js';
import { Product } from '../models/product.model.js';
import { Staff } from '../models/staff.model.js';

function toObjectId(value) {
  return value instanceof mongoose.Types.ObjectId ? value : new mongoose.Types.ObjectId(String(value));
}

/**
 * Writes movement entries with their human-readable names resolved in one
 * pass, so callers only ever think in ids.
 *
 * Each entry describes ONE location's ledger: a transfer contributes two
 * entries (out at the source, in at the destination), a sale one, and so on.
 * `quantity` is signed — positive units entered `branchId`, negative left it.
 *
 * @param {Array<{
 *   productId: string, branchId: string, type: 'sale'|'receive'|'damage'|'correction'|'transfer',
 *   quantity: number, source: 'transfer'|'order'|'adjust'|'create', sourceId: string,
 *   fromBranchId?: string, toBranchId?: string, ref?: string, note?: string, staffId?: string
 * }>} entries
 */
export async function recordMovements(entries) {
  const scoped = entries.filter((entry) => entry?.productId && entry?.branchId && entry.quantity !== 0);
  if (scoped.length === 0) return 0;

  const [products, staffByRole] = await Promise.all([
    Product.find(
      { _id: { $in: [...new Set(scoped.map((entry) => entry.productId))] } },
      { _id: 1, name: 1 }
    ).lean(),
    // staffId is almost always the authenticated user (req.user.userId). Bulk
    // reading the names once beats N findById calls, and the callers do not
    // need to care how it is resolved.
    Staff.find(
      { _id: { $in: [...new Set(scoped.map((entry) => entry.staffId).filter(Boolean))] } },
      { _id: 1, name: 1 }
    ).lean(),
  ]);

  const productNames = new Map(products.map((product) => [String(product._id), product.name]));
  const staffNames = new Map(staffByRole.map((staff) => [String(staff._id), staff.name]));

  const result = await StockLog.insertMany(
    scoped.map((entry) => ({
      productId: toObjectId(entry.productId),
      productName: productNames.get(String(entry.productId)) || 'Unknown product',
      type: entry.type,
      quantity: Math.round(Number(entry.quantity) || 0),
      branchId: toObjectId(entry.branchId),
      ...(entry.fromBranchId ? { fromBranchId: toObjectId(entry.fromBranchId) } : {}),
      ...(entry.toBranchId ? { toBranchId: toObjectId(entry.toBranchId) } : {}),
      source: entry.source,
      sourceId: toObjectId(entry.sourceId),
      ref: entry.ref,
      staffId: entry.staffId ? toObjectId(entry.staffId) : undefined,
      staffName: entry.staffId ? staffNames.get(String(entry.staffId)) : undefined,
      note: entry.note,
    }))
  );

  return result.length;
}

function movementsFilter({ productId, branchId, type, startDate, endDate } = {}) {
  const filter = {};

  if (productId) filter.productId = toObjectId(productId);
  if (branchId) filter.branchId = toObjectId(branchId);
  if (type && type !== 'all') filter.type = type;

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  return filter;
}

/** The Movement Log: newest first, limited like the other list endpoints. */
export async function getMovements({ productId, branchId, type, startDate, endDate, limit } = {}) {
  return StockLog.find(movementsFilter({ productId, branchId, type, startDate, endDate }))
    .populate('branchId', 'name type')
    .populate('fromBranchId', 'name type')
    .populate('toBranchId', 'name type')
    .populate('staffId', 'name')
    .sort({ createdAt: -1 })
    .limit(Math.min(Number(limit) || 200, 500));
}

/**
 * Seeds the Movement Log from every transfer recorded before the log existed.
 *
 * Transfers are immutable and already in the backend, so backfilling them is
 * a matter of replaying the documents — the stock itself is what it is, this
 * only fills in "what happened when". It is idempotent and safe on every boot:
 * a transfer whose originating log entry already exists is skipped, so a crash
 * mid-backfill cannot double-log the transfers processed before it.
 */
export async function backfillTransferLogs() {
  const transfers = await StockTransfer.find().select('_id fromBranchId toBranchId items staffId notes').lean();
  if (transfers.length === 0) return 0;

  const logged = await StockLog.find(
    { source: 'transfer', sourceId: { $in: transfers.map((transfer) => transfer._id) } },
    { _id: 0, sourceId: 1 }
  ).lean();
  const loggedIds = new Set(logged.map((entry) => String(entry.sourceId)));

  const entries = [];
  for (const transfer of transfers) {
    if (loggedIds.has(String(transfer._id))) continue;
    for (const item of transfer.items) {
      entries.push({
        productId: item.productId,
        branchId: transfer.fromBranchId,
        type: 'transfer',
        quantity: -item.quantity,
        source: 'transfer',
        sourceId: transfer._id,
        fromBranchId: transfer.fromBranchId,
        toBranchId: transfer.toBranchId,
        ref: transferRef(transfer._id),
        staffId: transfer.staffId,
        note: transfer.notes,
      });
      entries.push({
        productId: item.productId,
        branchId: transfer.toBranchId,
        type: 'transfer',
        quantity: item.quantity,
        source: 'transfer',
        sourceId: transfer._id,
        fromBranchId: transfer.fromBranchId,
        toBranchId: transfer.toBranchId,
        ref: transferRef(transfer._id),
        staffId: transfer.staffId,
        note: transfer.notes,
      });
    }
  }

  // The transfer records guarantee productName: backfilled entries resolve it
  // through the shared lookup, so nothing has to change per-caller.
  return recordMovements(entries);
}

/** A short, copyable handle for a transfer, shared by its log entries. */
export function transferRef(transferId) {
  return `TRF-${String(transferId).slice(0, 8).toUpperCase()}`;
}
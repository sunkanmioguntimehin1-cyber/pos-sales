import mongoose, { Schema } from 'mongoose';
import { applyIdVirtual } from './plugins/applyIdVirtual.js';

/**
 * An immutable, per-item record of stock moving in or out of one location.
 *
 * Unlike Stock (which holds the current quantity) and StockTransfer (which
 * groups a multi-product movement into one document), a log entry is one line
 * of one movement: "40 units of X left HQ to Y", "40 units of X arrived at Y
 * from HQ", "3 units of Z were sold at Y". Every source that changes a shelf
 * — a sale, a manual adjustment, a transfer, a new product's opening stock —
 * writes through here so the Inventory screen's Movement Log and Stock History
 * views can answer "what happened to this product/location, and when?".
 *
 * `source` + `sourceId` identify the originating document so re-runs are
 * idempotent: the boot-time backfill and any future reconciliation can look up
 * whether a movement was already logged without double-inserting.
 */
const stockLogSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    // Denormalised so a historical entry still names what moved even if the
    // product is later renamed or deleted (same rationale as StockTransfer).
    productName: { type: String, required: true },
    type: {
      type: String,
      enum: ['sale', 'receive', 'damage', 'correction', 'transfer'],
      required: true,
    },
    // Signed: positive units entered the location, negative units left it.
    quantity: { type: Number, required: true },
    // The single location this entry refers to. For a transfer a pair of
    // entries (one out at the source, one in at the destination) carries the
    // movement, so each row stays a "one location" fact.
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    // Only populated for transfer entries; lets the UI render "HQ → Accra Mall".
    fromBranchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    toBranchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    // Which originating document produced this line and its identifier,
    // e.g. { source: 'order', sourceId: <order _id> } or { source: 'transfer',
    // sourceId: <transfer _id> }. The (source, sourceId) pair is a natural key
    // for idempotent backfills.
    source: { type: String, enum: ['transfer', 'order', 'adjust', 'create'], required: true },
    sourceId: { type: Schema.Types.ObjectId, required: true },
    // Human-readable pointer shown in the UI: an order number, a transfer id
    // or a note supplied with the adjustment.
    ref: { type: String, trim: true },
    staffId: { type: Schema.Types.ObjectId, ref: 'Staff' },
    staffName: { type: String, trim: true },
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

stockLogSchema.index({ productId: 1, createdAt: -1 });
stockLogSchema.index({ branchId: 1, createdAt: -1 });
stockLogSchema.index({ createdAt: -1 });
// A transfer backfill must not double-log the same originating document.
stockLogSchema.index({ source: 1, sourceId: 1 });

applyIdVirtual(stockLogSchema);

export const StockLog = mongoose.model('StockLog', stockLogSchema);
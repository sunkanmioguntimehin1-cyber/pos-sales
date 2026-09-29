import mongoose, { Schema } from 'mongoose';
import { applyIdVirtual } from './plugins/applyIdVirtual.js';

const transferItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  // Denormalised so a historical transfer still names what moved even if the
  // product is later renamed or deleted.
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
}, { _id: false });

/**
 * An immutable record of stock moving between two locations.
 *
 * Transfers apply immediately and are never edited. Reversing one is a new
 * transfer in the opposite direction, which is the only way to guarantee a
 * movement is never counted twice — an editable transfer invites cancelling
 * the same movement more than once and silently corrupting both locations.
 */
const stockTransferSchema = new Schema(
  {
    fromBranchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    toBranchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    items: { type: [transferItemSchema], required: true },
    status: { type: String, enum: ['completed', 'cancelled'], default: 'completed' },
    staffId: { type: Schema.Types.ObjectId, ref: 'Staff' },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

stockTransferSchema.index({ createdAt: -1 });
stockTransferSchema.index({ fromBranchId: 1, createdAt: -1 });
stockTransferSchema.index({ toBranchId: 1, createdAt: -1 });

applyIdVirtual(stockTransferSchema);

export const StockTransfer = mongoose.model('StockTransfer', stockTransferSchema);

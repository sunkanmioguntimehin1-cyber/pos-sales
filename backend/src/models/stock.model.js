import mongoose, { Schema } from 'mongoose';
import { applyIdVirtual } from './plugins/applyIdVirtual.js';

/**
 * Stock is tracked per location, not on the product.
 *
 * A product is stocked into the head office when it is created, and only moves
 * to a branch via an explicit transfer, so the same product can legitimately
 * read 0 at a branch and 40 at head office. Storing a single number on the
 * product (as this app used to) cannot express that.
 */
const stockSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    quantity: { type: Number, default: 0, min: 0 },
    /**
     * This location's minimum/target stock level for the product — the level
     * the Inventory screen compares a branch's `quantity` against before
     * flagging it Low or Critical. Lives on the per-branch row (not on the
     * product) because each branch can legitimately want a different shelf:
     * the flagship store may keep 40 units of a phone case while a kiosk needs
     * 5. Product.lowStockThreshold remains the *default* target for any row
     * created without an explicit one.
     */
    minQuantity: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

// One row per product per location, enforced by the database rather than by
// convention: every read in stock.service.js assumes findOne() is unambiguous.
stockSchema.index({ productId: 1, branchId: 1 }, { unique: true });
stockSchema.index({ branchId: 1 });

applyIdVirtual(stockSchema);

export const Stock = mongoose.model('Stock', stockSchema);

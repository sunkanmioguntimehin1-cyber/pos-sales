import mongoose, { Schema } from 'mongoose';
import { applyIdVirtual } from './plugins/applyIdVirtual.js';

const orderItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 },
  /**
   * The location this unit was actually drawn from, which is not necessarily
   * the order header's branchId (the POS lets a cashier pick which till's
   * location to sell from). Restoring stock on cancel or refund has to credit
   * back the location it left, or the totals drift.
   *
   * Optional: orders placed before per-location stock existed have no value
   * here and fall back to the header branch.
   */
  locationId: { type: Schema.Types.ObjectId, ref: 'Branch' },
}, { _id: false });

const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String },
    status: { 
      type: String, 
      enum: ['pending', 'completed', 'cancelled', 'refunded'], 
      default: 'completed' 
    },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    staffId: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    notes: { type: String },
  },
  { timestamps: true }
);

orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ staffId: 1 });
orderSchema.index({ customerId: 1 });

applyIdVirtual(orderSchema);

export const Order = mongoose.model('Order', orderSchema);

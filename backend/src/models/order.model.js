import mongoose, { Schema } from 'mongoose';

const orderItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 },
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

export const Order = mongoose.model('Order', orderSchema);

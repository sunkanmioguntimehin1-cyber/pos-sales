import mongoose, { Document, Schema, Types } from 'mongoose';

export type OrderStatus = 'pending' | 'completed' | 'cancelled' | 'refunded';

export interface IOrderItem {
  productId: Types.ObjectId;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  items: IOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod?: string;
  status: OrderStatus;
  customerId?: Types.ObjectId;
  staffId: Types.ObjectId;
  branchId?: Types.ObjectId;
  tenantId: Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 },
}, { _id: false });

const orderSchema = new Schema<IOrder>(
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
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

orderSchema.index({ tenantId: 1 });
orderSchema.index({ tenantId: 1, orderNumber: 1 });
orderSchema.index({ tenantId: 1, status: 1 });
orderSchema.index({ tenantId: 1, createdAt: -1 });
orderSchema.index({ staffId: 1 });
orderSchema.index({ customerId: 1 });

export const Order = mongoose.model<IOrder>('Order', orderSchema);

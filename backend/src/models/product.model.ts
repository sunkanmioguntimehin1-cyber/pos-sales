import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  sku?: string;
  barcode?: string;
  description?: string;
  price: number;
  costPrice?: number;
  categoryId?: Types.ObjectId;
  image?: string;
  stock: number;
  lowStockThreshold: number;
  isActive: boolean;
  tenantId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, sparse: true, trim: true },
    barcode: { type: String, sparse: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, min: 0 },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
    image: { type: String },
    stock: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 10, min: 0 },
    isActive: { type: Boolean, default: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  },
  { timestamps: true }
);

productSchema.index({ tenantId: 1 });
productSchema.index({ tenantId: 1, sku: 1 }, { sparse: true });
productSchema.index({ tenantId: 1, barcode: 1 }, { sparse: true });
productSchema.index({ tenantId: 1, categoryId: 1 });
productSchema.index({ tenantId: 1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text' });

export const Product = mongoose.model<IProduct>('Product', productSchema);

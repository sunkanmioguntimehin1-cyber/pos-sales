import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description?: string;
  color?: string;
  tenantId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    color: { type: String, default: '#6366F1' },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  },
  { timestamps: true }
);

categorySchema.index({ tenantId: 1 });
categorySchema.index({ tenantId: 1, name: 1 });

export const Category = mongoose.model<ICategory>('Category', categorySchema);

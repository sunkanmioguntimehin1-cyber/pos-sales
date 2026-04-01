import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBranch extends Document {
  name: string;
  address?: string;
  phone?: string;
  isDefault: boolean;
  tenantId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const branchSchema = new Schema<IBranch>(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    isDefault: { type: Boolean, default: false },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  },
  { timestamps: true }
);

branchSchema.index({ tenantId: 1 });
branchSchema.index({ tenantId: 1, isDefault: 1 });

export const Branch = mongoose.model<IBranch>('Branch', branchSchema);

import mongoose, { Document, Schema, Types } from 'mongoose';

export type CustomerTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface ICustomer extends Document {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  tier: CustomerTier;
  totalSpent: number;
  visitCount: number;
  lastVisit?: Date;
  notes?: string;
  tenantId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, sparse: true, lowercase: true, trim: true },
    phone: { type: String, sparse: true, trim: true },
    address: { type: String, trim: true },
    tier: { 
      type: String, 
      enum: ['bronze', 'silver', 'gold', 'platinum'], 
      default: 'bronze' 
    },
    totalSpent: { type: Number, default: 0, min: 0 },
    visitCount: { type: Number, default: 0, min: 0 },
    lastVisit: { type: Date },
    notes: { type: String },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  },
  { timestamps: true }
);

customerSchema.index({ tenantId: 1 });
customerSchema.index({ tenantId: 1, email: 1 }, { sparse: true });
customerSchema.index({ tenantId: 1, phone: 1 }, { sparse: true });
customerSchema.index({ tenantId: 1, tier: 1 });
customerSchema.index({ name: 'text' });

export const Customer = mongoose.model<ICustomer>('Customer', customerSchema);

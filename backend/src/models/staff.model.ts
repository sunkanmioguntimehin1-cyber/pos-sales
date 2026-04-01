import mongoose, { Document, Schema, Types } from 'mongoose';

export type StaffRole = 'admin' | 'manager' | 'cashier';
export type StaffStatus = 'active' | 'inactive';

export interface IStaff extends Document {
  email?: string;
  name: string;
  phone?: string;
  pinHash?: string;
  role: StaffRole;
  status: StaffStatus;
  tenantId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const staffSchema = new Schema<IStaff>(
  {
    email: { type: String, sparse: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    pinHash: { type: String },
    role: { 
      type: String, 
      enum: ['admin', 'manager', 'cashier'], 
      required: true,
      default: 'cashier'
    },
    status: { 
      type: String, 
      enum: ['active', 'inactive'], 
      default: 'active'
    },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  },
  { timestamps: true }
);

staffSchema.index({ email: 1 }, { sparse: true });
staffSchema.index({ tenantId: 1 });
staffSchema.index({ tenantId: 1, role: 1 });
staffSchema.index({ tenantId: 1, status: 1 });

export const Staff = mongoose.model<IStaff>('Staff', staffSchema);

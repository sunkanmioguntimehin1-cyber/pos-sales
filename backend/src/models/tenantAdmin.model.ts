import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITenantAdmin extends Document {
  email: string;
  passwordHash: string;
  name: string;
  tenantId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const tenantAdminSchema = new Schema<ITenantAdmin>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  },
  { timestamps: true }
);

tenantAdminSchema.index({ email: 1 });
tenantAdminSchema.index({ tenantId: 1 }, { unique: true });

export const TenantAdmin = mongoose.model<ITenantAdmin>('TenantAdmin', tenantAdminSchema);

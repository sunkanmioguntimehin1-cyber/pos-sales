import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITenantSettings {
  primaryColor: string;
  accentColor: string;
  theme: 'dark' | 'light' | 'gold';
}

export interface ITenant extends Document {
  subdomain: string;
  name: string;
  description?: string;
  logo?: string;
  isActive: boolean;
  settings: ITenantSettings;
  createdAt: Date;
  updatedAt: Date;
}

const tenantSettingsSchema = new Schema<ITenantSettings>({
  primaryColor: { type: String, default: '#3B82F6' },
  accentColor: { type: String, default: '#6366F1' },
  theme: { type: String, enum: ['dark', 'light', 'gold'], default: 'dark' },
}, { _id: false });

const tenantSchema = new Schema<ITenant>(
  {
    subdomain: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    logo: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    settings: { type: tenantSettingsSchema, default: () => ({}) },
  },
  { timestamps: true }
);

tenantSchema.index({ subdomain: 1 });
tenantSchema.index({ isActive: 1 });

export const Tenant = mongoose.model<ITenant>('Tenant', tenantSchema);

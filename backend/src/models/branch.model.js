import mongoose, { Schema } from 'mongoose';
import { applyIdVirtual } from './plugins/applyIdVirtual.js';

const branchSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

branchSchema.index({ isDefault: 1 });

applyIdVirtual(branchSchema);

export const Branch = mongoose.model('Branch', branchSchema);

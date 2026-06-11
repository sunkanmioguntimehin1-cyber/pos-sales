import mongoose, { Schema } from 'mongoose';

const branchSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

branchSchema.index({ isDefault: 1 });

export const Branch = mongoose.model('Branch', branchSchema);

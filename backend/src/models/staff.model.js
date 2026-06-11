import mongoose, { Schema } from 'mongoose';

const staffSchema = new Schema(
  {
    email: { type: String, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String },
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
  },
  { timestamps: true }
);

staffSchema.index({ email: 1 }, { sparse: true });
staffSchema.index({ role: 1 });
staffSchema.index({ status: 1 });

export const Staff = mongoose.model('Staff', staffSchema);

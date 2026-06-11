import mongoose, { Schema } from 'mongoose';

const customerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
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
  },
  { timestamps: true }
);

customerSchema.index({ email: 1 }, { sparse: true });
customerSchema.index({ phone: 1 }, { sparse: true });
customerSchema.index({ tier: 1 });
customerSchema.index({ name: 'text' });

export const Customer = mongoose.model('Customer', customerSchema);

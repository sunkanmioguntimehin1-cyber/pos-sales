import mongoose, { Schema } from 'mongoose';

const storeSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, default: 'My Store' },
    description: { type: String, trim: true, default: '' },
    logo: { type: String, trim: true },
    settings: {
      primaryColor: { type: String, default: '#3B82F6' },
      accentColor: { type: String, default: '#6366F1' },
      theme: { type: String, enum: ['dark', 'light', 'gold'], default: 'dark' },
    },
  },
  { timestamps: true }
);

export const Store = mongoose.model('Store', storeSchema);

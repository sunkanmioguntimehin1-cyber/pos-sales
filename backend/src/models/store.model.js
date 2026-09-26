import mongoose, { Schema } from 'mongoose';
import { applyIdVirtual } from './plugins/applyIdVirtual.js';

const storeSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, default: 'My Store' },
    description: { type: String, trim: true, default: '' },
    logo: { type: String, trim: true },
    settings: {
      primaryColor: { type: String, default: '#3B82F6' },
      accentColor: { type: String, default: '#6366F1' },
      theme: { type: String, enum: ['dark', 'light', 'gold'], default: 'dark' },
      paymentMethods: {
        cash: { type: Boolean, default: true },
        transfer: {
          enabled: { type: Boolean, default: true },
          gtb: { type: Boolean, default: true },
          firstbank: { type: Boolean, default: true },
        },
        pos: {
          enabled: { type: Boolean, default: true },
          gtb: { type: Boolean, default: true },
          firstbank: { type: Boolean, default: true },
        },
      },
    },
  },
  { timestamps: true }
);

applyIdVirtual(storeSchema);

export const Store = mongoose.model('Store', storeSchema);

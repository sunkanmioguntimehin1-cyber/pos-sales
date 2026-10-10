import mongoose, { Schema } from 'mongoose';
import { applyIdVirtual } from './plugins/applyIdVirtual.js';

const posTerminalSchema = new Schema(
  {
    id: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    enabled: { type: Boolean, default: true },
    type: { type: String, enum: ['gtb', 'firstbank', 'other'], default: 'other' },
  },
  { _id: false }
);

const storeSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, default: 'My Store' },
    description: { type: String, trim: true, default: '' },
    logo: { type: String, trim: true },
    settings: {
      primaryColor: { type: String, default: '#3B82F6' },
      accentColor: { type: String, default: '#6366F1' },
      theme: { type: String, enum: ['dark', 'light', 'gold'], default: 'dark' },
      tax: {
        rate: { type: Number, default: 8.25, min: 0, max: 100 },
        number: { type: String, trim: true, default: '' },
        includedInPrice: { type: Boolean, default: false },
      },
      /**
       * The store-wide discount the till may apply to a sale. Set by the admin
       * in Settings → Discount; the cashier can only switch it on or off at
       * checkout, never change the rate. `rate` is a percentage of the
       * tax-inclusive total.
       */
      discount: {
        rate: { type: Number, default: 0, min: 0, max: 100 },
      },
      paymentMethods: {
        cash: { type: Boolean, default: true },
        transfer: {
          enabled: { type: Boolean, default: true },
          gtb: { type: Boolean, default: true },
          firstbank: { type: Boolean, default: true },
        },
        pos: {
          enabled: { type: Boolean, default: true },
          gtb: { type: Boolean },
          firstbank: { type: Boolean },
          terminals: {
            type: [posTerminalSchema],
            default: () => [
              { id: 'gtb_pos', name: 'GTBank POS', enabled: true, type: 'gtb' },
              { id: 'firstbank_pos', name: 'FirstBank POS', enabled: true, type: 'firstbank' },
            ],
          },
        },
      },
    },
  },
  { timestamps: true }
);

applyIdVirtual(storeSchema);

export const Store = mongoose.model('Store', storeSchema);

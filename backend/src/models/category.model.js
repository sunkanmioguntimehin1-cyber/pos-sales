import mongoose, { Schema } from 'mongoose';
import { applyIdVirtual } from './plugins/applyIdVirtual.js';

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    color: { type: String, default: '#6366F1' },
  },
  { timestamps: true }
);

categorySchema.index({ name: 1 });

applyIdVirtual(categorySchema);

export const Category = mongoose.model('Category', categorySchema);

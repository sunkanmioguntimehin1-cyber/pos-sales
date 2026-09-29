import mongoose, { Schema } from 'mongoose';
import { applyIdVirtual } from './plugins/applyIdVirtual.js';

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, trim: true },
    barcode: { type: String, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, min: 0 },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
    image: { type: String },
    stock: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 10, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ sku: 1 }, { sparse: true });
productSchema.index({ barcode: 1 }, { sparse: true });
productSchema.index({ categoryId: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ name: 'text', description: 'text' });

/**
 * Business-wide total across all locations.
 *
 * `stock` holds the total on disk, but GET /api/products?branchId=X rewrites it
 * in the response to that location's quantity. Stashing the real total in
 * $locals and reading it back through this virtual means the client can show
 * "3 here / 40 company-wide" from one payload. When the response is not
 * location-scoped it simply mirrors `stock`.
 */
productSchema.virtual('totalStock').get(function getTotalStock() {
  return this.$locals.totalStock ?? this.stock ?? 0;
});

/**
 * This response's stock baseline for restock flags.
 *
 * GET /api/products?branchId=X swaps in that location's per-shelf minimum, so
 * the Inventory screen compares against the branch's own target. Without a
 * branch the company default (the product threshold) applies. Like totalStock,
 * the value is stashed in $locals — it is a view-specific number, never
 * persisted onto the product document.
 */
productSchema.virtual('minQuantity').get(function getMinQuantity() {
  return this.$locals.minQuantity ?? this.lowStockThreshold ?? 0;
});

applyIdVirtual(productSchema);

export const Product = mongoose.model('Product', productSchema);

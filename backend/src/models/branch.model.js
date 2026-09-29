import mongoose, { Schema } from 'mongoose';
import { applyIdVirtual } from './plugins/applyIdVirtual.js';

const branchSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    isDefault: { type: Boolean, default: false },
    /**
     * Exactly one branch is the head office: the central store that new stock is
     * booked into and the default location the POS sells from. The rest are
     * retail outlets that only hold stock after a transfer.
     *
     * The enum is 'head_office' rather than a boolean because the value is
     * persisted and sent to the client, and a named field is self-describing in
     * an API response.
     */
    type: { type: String, enum: ['head_office', 'branch'], default: 'branch' },
    manager: { type: String, trim: true },
  },
  { timestamps: true }
);

branchSchema.index({ isDefault: 1 });
// Partial so it only constrains head office: a plain unique index on `type`
// would allow exactly one branch in the whole app. This makes "at most one
// head office" a database guarantee rather than an application convention.
branchSchema.index(
  { type: 1 },
  { unique: true, partialFilterExpression: { type: 'head_office' } }
);

applyIdVirtual(branchSchema);

export const Branch = mongoose.model('Branch', branchSchema);

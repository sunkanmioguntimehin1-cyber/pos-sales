import mongoose, { Schema } from 'mongoose';
import { applyIdVirtual } from './plugins/applyIdVirtual.js';

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
    /**
     * The location this person works at. Sales are only possible at the
     * branch on the staff member's record (admins are exempt — they are not
     * location-bound), so this decides which POS shows them.
     *
     * Optional in the schema so pre-existing documents still validate;
     * `backfillStaffBranch()` fills in the head office on boot, so a missing
     * value only means "not yet backfilled", never "works everywhere".
     */
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
  },
  { timestamps: true }
);

staffSchema.index({ email: 1 }, { sparse: true });
staffSchema.index({ role: 1 });
staffSchema.index({ status: 1 });
staffSchema.index({ branchId: 1 });

applyIdVirtual(staffSchema);

export const Staff = mongoose.model('Staff', staffSchema);

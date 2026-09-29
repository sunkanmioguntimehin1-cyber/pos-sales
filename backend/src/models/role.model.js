import mongoose, { Schema } from 'mongoose';
import { applyIdVirtual } from './plugins/applyIdVirtual.js';
import { ALL_PERMISSIONS } from '../constants/permissions.js';

/**
 * A staff role: a named bundle of permissions.
 *
 * `key` is what staff records store (the `role` field is a string that names a
 * role, not a foreign key). Keeping it a string — rather than an ObjectId ref —
 * is what lets an existing installation keep its staff untouched: every
 * pre-role staff record already holds one of these keys. Role details
 * (display name, colour, permission list) live here and are attached to staff
 * responses at read time, so renaming a role needs no cascade.
 */
const roleSchema = new Schema(
  {
    key: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    permissions: {
      type: [String],
      enum: ALL_PERMISSIONS,
      default: [],
    },
    /**
     * Whether this role is tied to the branch on the staff member's record.
     * `false` means "works at any branch": the POS cashier picker includes
     * people with one of these roles regardless of their branch, which is the
     * old hard-coded `role === 'admin'` exemption generalised to any role.
     */
    locationBound: { type: Boolean, default: true },
    /**
     * A built-in role: it cannot be deleted, renamed, or have its permissions
     * trimmed below the point where nobody could administer the store again.
     */
    isSystem: { type: Boolean, default: false },
    /** Badge colour key used by the staff and roles screens. */
    color: { type: String, default: 'bg-blue-500/15 text-blue-400' },
  },
  { timestamps: true }
);

roleSchema.index({ key: 1 }, { unique: true });

applyIdVirtual(roleSchema);

export const Role = mongoose.model('Role', roleSchema);
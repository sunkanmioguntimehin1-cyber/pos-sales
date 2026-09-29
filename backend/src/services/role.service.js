import { Role } from '../models/role.model.js';
import { ALL_PERMISSIONS } from '../constants/permissions.js';

/**
 * The roles every installation starts from. `admin` is system (immutable and
 * always holds every permission — the store must never reach a state where
 * nobody can administer it); `manager` and `cashier` are editable defaults so
 * existing staff mapped onto them keep working but a store can tune them.
 */
export const DEFAULT_ROLES = [
  {
    key: 'admin',
    name: 'Admin',
    description: 'Full access to every feature',
    permissions: ALL_PERMISSIONS,
    locationBound: false,
    isSystem: true,
    color: 'bg-red-500/15 text-red-400',
  },
  {
    key: 'manager',
    name: 'Manager',
    description: 'Runs the store day to day',
    permissions: [
      'pos',
      'products:view', 'products:manage',
      'stock:view', 'stock:manage', 'stock:transfer',
      'orders:view', 'orders:manage',
      'customers:view', 'customers:manage',
      'branches:view', 'branches:manage',
      'staff:view',
      'reports:view',
    ],
    locationBound: false,
    isSystem: false,
    color: 'bg-blue-500/15 text-blue-400',
  },
  {
    key: 'cashier',
    name: 'Cashier',
    description: 'Processes sales at the till',
    permissions: [
      'pos',
      'products:view',
      'stock:view',
      'orders:view',
      'customers:view',
      'branches:view',
      'staff:view',
    ],
    locationBound: true,
    isSystem: false,
    color: 'bg-emerald-500/15 text-emerald-400',
  },
];

/**
 * Guarantees the built-in roles exist. Idempotent and safe on every boot:
 * `$setOnInsert` seeds a missing role with its defaults and leaves an existing
 * one untouched, so an admin who renamed or re-permissioned `cashier` keeps
 * their changes and a restart never undoes them.
 */
export async function ensureRoles() {
  let created = 0;
  for (const defaults of DEFAULT_ROLES) {
    const result = await Role.updateOne(
      { key: defaults.key },
      { $setOnInsert: defaults },
      { upsert: true }
    );
    created += result.upsertedCount ?? 0;
  }
  return created;
}

export async function getRoleByKey(key) {
  return Role.findOne({ key }).lean();
}

/** The role keys whose holders can work at any location (the POS picker includes them everywhere). */
export async function getNonLocationBoundRoleKeys() {
  const roles = await Role.find({ locationBound: false }, { key: 1 }).lean();
  return roles.map((role) => role.key);
}

/** key -> role, for attaching roleName/roleColor/permissions to staff responses in one pass. */
export async function getRolesMap() {
  const roles = await Role.find().lean();
  return new Map(roles.map((role) => [role.key, role]));
}
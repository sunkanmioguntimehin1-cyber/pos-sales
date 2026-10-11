import { Role } from '../models/role.model.js';
import { ALL_PERMISSIONS } from '../constants/permissions.js';

/** Everything the store runs on, minus the ability to define roles. */
const ADMINISTRATOR_PERMISSIONS = ALL_PERMISSIONS.filter((permission) => permission !== 'roles:manage');

/**
 * The day-to-day operating permissions a Mid Admin holds: the Manager set but
 * without the product-cost capability, so product creation is possible while
 * cost, overhead and operating costs stay hidden in the UI.
 */
const MID_ADMIN_PERMISSIONS = [
  'pos',
  'products:view', 'products:manage',
  'stock:view', 'stock:manage', 'stock:transfer',
  'orders:view', 'orders:manage',
  'customers:view', 'customers:manage',
  'branches:view', 'branches:manage',
  'staff:view',
  'reports:view',
];

/**
 * The roles every installation starts from.
 *
 * `super-admin` and the legacy `admin` are system roles (immutable and always
 * holding every permission — the store must never reach a state where nobody
 * can administer it). `administrator`, `mid-admin`, `manager` and `cashier` are
 * editable defaults so existing staff mapped onto them keep working but a store
 * can tune them.
 */
export const DEFAULT_ROLES = [
  {
    key: 'super-admin',
    name: 'Super Admin',
    description: 'Unrestricted access to every feature, including roles',
    permissions: ALL_PERMISSIONS,
    locationBound: false,
    isSystem: true,
    color: 'bg-purple-500/15 text-purple-400',
  },
  {
    // Legacy system role kept for the lockout guarantee. Its display name was
    // "Admin"; it is renamed to "System Admin" so it is distinct from the
    // editable `administrator` role below.
    key: 'admin',
    name: 'System Admin',
    description: 'Full access to every feature',
    permissions: ALL_PERMISSIONS,
    locationBound: false,
    isSystem: true,
    color: 'bg-red-500/15 text-red-400',
  },
  {
    key: 'administrator',
    name: 'Admin',
    description: 'Runs the whole store but cannot edit roles and permissions',
    permissions: ADMINISTRATOR_PERMISSIONS,
    locationBound: false,
    isSystem: false,
    color: 'bg-orange-500/15 text-orange-400',
  },
  {
    key: 'mid-admin',
    name: 'Mid Admin',
    description: 'Manages products and stock but cannot see product costs',
    permissions: MID_ADMIN_PERMISSIONS,
    locationBound: false,
    isSystem: false,
    color: 'bg-cyan-500/15 text-cyan-400',
  },
  {
    key: 'manager',
    name: 'Manager',
    description: 'Runs the store day to day',
    permissions: [
      'pos',
      'products:view', 'products:manage', 'products:cost',
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
 *
 * System roles are the exception: they are immutable, so their permission set
 * and location binding are re-applied on every boot. That is what grants a
 * system role permissions added later (e.g. `products:cost`) on a database that
 * was first seeded before those permissions existed.
 */
export async function ensureRoles() {
  let created = 0;
  for (const defaults of DEFAULT_ROLES) {
    if (defaults.isSystem) {
      const insert = {
        key: defaults.key,
        name: defaults.name,
        description: defaults.description,
        isSystem: true,
        color: defaults.color,
      };
      const result = await Role.updateOne(
        { key: defaults.key },
        {
          $set: { permissions: ALL_PERMISSIONS, locationBound: false },
          $setOnInsert: insert,
        },
        { upsert: true }
      );
      created += result.upsertedCount ?? 0;
      continue;
    }

    const result = await Role.updateOne(
      { key: defaults.key },
      { $setOnInsert: defaults },
      { upsert: true }
    );
    created += result.upsertedCount ?? 0;
  }

  // The legacy system role shipped as "Admin" and is now "System Admin" so it
  // is distinct from the editable `administrator` role. Only rename it while it
  // still carries the old default, so a store that renamed it keeps their name.
  await Role.updateOne({ key: 'admin', name: 'Admin' }, { $set: { name: 'System Admin' } });

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
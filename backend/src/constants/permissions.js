/**
 * The application's permission catalog.
 *
 * A single source of truth for every capability a role can hold: the Role
 * model validates against it, the middleware checks a user's token against it,
 * and the Roles screen renders its checkbox list from it. Keys use `noun:verb`
 * so a UI can group them by noun and a route can demand one verb or the other.
 */
export const PERMISSIONS = {
  pos: 'Ring up sales (use the POS)',

  'products:view': 'View products and categories',
  'products:manage': 'Create, edit and delete products and categories',

  'stock:view': 'View inventory, stock levels and transfers',
  'stock:manage': 'Adjust stock and set per-branch stock targets',
  'stock:transfer': 'Create stock transfers between locations',

  'orders:view': 'View orders',
  'orders:manage': 'Update order status, cancel and refund orders',

  'customers:view': 'View customers',
  'customers:manage': 'Create, edit and delete customers',

  'branches:view': 'View branches and their locations',
  'branches:manage': 'Create, edit and delete branches',

  'staff:view': 'View the staff list and their locations',
  'staff:manage': 'Create, edit and delete staff and assign their roles',

  'roles:manage': 'Create, edit and delete roles and their permissions',

  'reports:view': 'View reports and dashboard analytics',

  'settings:manage': 'Edit store settings',
};

export const ALL_PERMISSIONS = Object.keys(PERMISSIONS);

/** Grouped by noun for the Roles screen's checkbox list. */
export const PERMISSION_GROUPS = [
  { label: 'Sales', permissions: ['pos'] },
  { label: 'Products', permissions: ['products:view', 'products:manage'] },
  { label: 'Stock & Inventory', permissions: ['stock:view', 'stock:manage', 'stock:transfer'] },
  { label: 'Orders', permissions: ['orders:view', 'orders:manage'] },
  { label: 'Customers', permissions: ['customers:view', 'customers:manage'] },
  { label: 'Branches', permissions: ['branches:view', 'branches:manage'] },
  { label: 'Staff', permissions: ['staff:view', 'staff:manage'] },
  { label: 'Roles', permissions: ['roles:manage'] },
  { label: 'Reports', permissions: ['reports:view'] },
  { label: 'Settings', permissions: ['settings:manage'] },
];
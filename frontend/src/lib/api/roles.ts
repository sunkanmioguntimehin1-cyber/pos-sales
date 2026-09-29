import api from './axios';
import { Staff } from './staff';

/**
 * Single source of truth for every capability the app can gate on. Keys are
 * `noun:verb` and mirror the backend catalogue (`backend/src/constants/permissions.js`).
 */
export type PermissionKey =
  | 'pos'
  | 'products:view' | 'products:manage'
  | 'stock:view' | 'stock:manage' | 'stock:transfer'
  | 'orders:view' | 'orders:manage'
  | 'customers:view' | 'customers:manage'
  | 'branches:view' | 'branches:manage'
  | 'staff:view' | 'staff:manage'
  | 'roles:manage'
  | 'reports:view'
  | 'settings:manage';

export interface PermissionDefinition {
  key: PermissionKey;
  label: string;
}

export const ALL_PERMISSIONS: PermissionDefinition[] = [
  { key: 'pos', label: 'Ring up sales (use the POS)' },
  { key: 'products:view', label: 'View products and categories' },
  { key: 'products:manage', label: 'Create, edit and delete products and categories' },
  { key: 'stock:view', label: 'View inventory, stock levels and transfers' },
  { key: 'stock:manage', label: 'Adjust stock and set per-branch stock targets' },
  { key: 'stock:transfer', label: 'Create stock transfers between locations' },
  { key: 'orders:view', label: 'View orders' },
  { key: 'orders:manage', label: 'Update order status, cancel and refund orders' },
  { key: 'customers:view', label: 'View customers' },
  { key: 'customers:manage', label: 'Create, edit and delete customers' },
  { key: 'branches:view', label: 'View branches and their locations' },
  { key: 'branches:manage', label: 'Create, edit and delete branches' },
  { key: 'staff:view', label: 'View the staff list and their locations' },
  { key: 'staff:manage', label: 'Create, edit and delete staff and assign their roles' },
  { key: 'roles:manage', label: 'Create, edit and delete roles and their permissions' },
  { key: 'reports:view', label: 'View reports and dashboard analytics' },
  { key: 'settings:manage', label: 'Edit store settings' },
];

export const ALL_PERMISSION_KEYS = ALL_PERMISSIONS.map((permission) => permission.key);

/** Grouped by noun, so the Roles screen renders a tidy permission matrix. */
export const PERMISSION_GROUPS: { label: string; permissions: PermissionKey[] }[] = [
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

const LABELS = new Map(ALL_PERMISSIONS.map((permission) => [permission.key, permission.label]));

export function permissionLabel(key: PermissionKey): string {
  return LABELS.get(key) ?? key;
}

export interface Role {
  id: string;
  key: string;
  name: string;
  description?: string;
  permissions: PermissionKey[];
  /** `false` means "works at any branch" and is the POS picker's location exemption. */
  locationBound: boolean;
  /** Built-in roles cannot be deleted or re-permissioned; they seed every install. */
  isSystem: boolean;
  color: string;
  /** Number of staff currently holding this role, from the list endpoint. */
  memberCount: number;
  createdAt: string;
}

/** A role carry-over on a staff member (badge colour + display name) attached at read time. */
export interface RoleSummary {
  roleName?: string;
  roleColor?: string;
}

export type CreateRoleData = {
  key: string;
  name: string;
  description?: string;
  permissions: PermissionKey[];
  locationBound?: boolean;
  color?: string;
};

export type UpdateRoleData = Partial<CreateRoleData>;

export const rolesApi = {
  getAll: () =>
    api.get<{ roles: Role[] }>('/api/roles').then(res => res.data.roles),

  getById: (roleId: string) =>
    api.get<{ role: Role }>(`/api/roles/${roleId}`).then(res => res.data.role),

  create: (data: CreateRoleData) =>
    api.post<{ role: Role }>('/api/roles', data).then(res => res.data.role),

  update: (roleId: string, data: UpdateRoleData) =>
    api.put<{ role: Role }>(`/api/roles/${roleId}`, data).then(res => res.data.role),

  delete: (roleId: string) =>
    api.delete<{ message: string }>(`/api/roles/${roleId}`).then(res => res.data),
};

export function roleLabel(staff: Pick<Staff, 'role' | 'roleName'>): string {
  return staff.roleName ?? staff.role;
}
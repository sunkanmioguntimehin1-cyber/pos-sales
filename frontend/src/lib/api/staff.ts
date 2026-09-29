import api from './axios';

export interface Staff {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  /**
   * The role key stored on the record — a string naming a role in /api/roles
   * (e.g. 'cashier'), not a foreign key. See `roleName` for the display name.
   */
  role: string;
  roleName?: string;
  roleColor?: string;
  status: 'active' | 'inactive';
  /**
   * The location this person works at. `null` on a database that predates
   * branch assignment and has not been backfilled since — the backend never
   * treats it as "works everywhere", it files those at the head office on boot.
   */
  branchId: string | null;
  /** Present only when the list was read with the branch populated. */
  branchName?: string;
  branchType?: 'head_office' | 'branch';
  createdAt: string;
}

export interface CreateStaffData {
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  pin?: string;
  /** A role key that must exist — the backend validates it against /api/roles. */
  role: string;
  status?: 'active' | 'inactive';
  /** Omit to file this person at the head office. */
  branchId?: string;
}

export type UpdateStaffData = Partial<CreateStaffData>;

export const staffApi = {
  getAll: (params?: { role?: string; status?: string; search?: string; branchId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.role) searchParams.set('role', params.role);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.search) searchParams.set('search', params.search);
    // Narrows to staff who work at this location, plus admins, who are not
    // location-bound. Used by the POS so a sale cannot be rung up by someone
    // based at a different branch.
    if (params?.branchId) searchParams.set('branchId', params.branchId);
    const query = searchParams.toString();
    return api.get<{ staff: Staff[] }>(`/api/staff${query ? `?${query}` : ''}`).then(res => res.data.staff);
  },

  getById: (staffId: string) =>
    api.get<{ staff: Staff }>(`/api/staff/${staffId}`).then(res => res.data.staff),

  create: (data: CreateStaffData) =>
    api.post<{ staff: Staff }>('/api/staff', data).then(res => res.data.staff),

  update: (staffId: string, data: UpdateStaffData) =>
    api.put<{ staff: Staff }>(`/api/staff/${staffId}`, data).then(res => res.data.staff),

  delete: (staffId: string) =>
    api.delete<{ message: string }>(`/api/staff/${staffId}`).then(res => res.data),

  verifyPin: (staffId: string, pin: string) =>
    api.post<{ success: boolean; staff: { id: string; name: string; role: string } }>(
      '/api/staff/verify-pin',
      { staffId, pin }
    ).then(res => res.data),
};

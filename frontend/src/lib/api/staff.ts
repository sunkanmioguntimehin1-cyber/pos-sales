import api from './axios';

export interface Staff {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'admin' | 'manager' | 'cashier';
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface CreateStaffData {
  name: string;
  email?: string;
  phone?: string;
  pin?: string;
  role: 'admin' | 'manager' | 'cashier';
  status?: 'active' | 'inactive';
}

export type UpdateStaffData = Partial<CreateStaffData>;

export const staffApi = {
  getAll: (params?: { role?: string; status?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.role) searchParams.set('role', params.role);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.search) searchParams.set('search', params.search);
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

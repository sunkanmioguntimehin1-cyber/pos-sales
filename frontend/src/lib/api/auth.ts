import api from './axios';

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'tenant_admin' | 'staff';
  tenantId?: string | null;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export const authApi = {
  login: (data: LoginData) => 
    api.post<LoginResponse>('/api/auth/login', data).then(res => res.data),
  
  register: (data: RegisterData) => 
    api.post<LoginResponse>('/api/auth/register', data).then(res => res.data),
  
  getMe: () => 
    api.get<{ user: User }>('/api/auth/me').then(res => res.data),
};

import api from './axios';

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'cashier';
}

export interface LoginResponse {
  token: string;
  user: User;
}

export const authApi = {
  login: (data: LoginData) =>
    api.post<LoginResponse>('/api/auth/login', data).then(res => res.data),

  getMe: () =>
    api.get<{ user: User }>('/api/auth/me').then(res => res.data),
};

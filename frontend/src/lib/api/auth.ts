import api from './axios';
import { PermissionKey } from './roles';

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  /** The role key (e.g. 'cashier') — see `roleName` for the display name. */
  role: string;
  /** Human name of the role key, attached at read time by the backend. */
  roleName?: string;
  /**
   * The permissions baked into the JWT at login. `requirePermission` on the
   * backend validates with the same list, so the UI gates on a signed fact.
   */
  permissions?: PermissionKey[];
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

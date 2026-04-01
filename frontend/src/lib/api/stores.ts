import api from './axios';
import type { Tenant } from '@/types/tenant';

export interface Store {
  id: string;
  name: string;
  subdomain: string;
  description?: string;
  logo?: string;
  isActive: boolean;
  settings: {
    primaryColor: string;
    accentColor: string;
    theme: 'dark' | 'light' | 'gold';
  };
  createdAt: string;
  admin?: {
    id: string;
    name: string;
    email: string;
  };
  staffCount?: number;
  stats?: {
    staffCount: number;
    branchCount: number;
  };
}

export interface CreateStoreData {
  name: string;
  subdomain: string;
  description?: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  settings?: {
    primaryColor?: string;
    accentColor?: string;
    theme?: 'dark' | 'light' | 'gold';
  };
}

export const storesApi = {
  getAll: () => 
    api.get<{ stores: Store[] }>('/api/superadmin/stores').then(res => res.data.stores),
  
  getById: (storeId: string) => 
    api.get<{ store: Store }>(`/api/superadmin/stores/${storeId}`).then(res => res.data.store),
  
  create: (data: CreateStoreData) => 
    api.post<{ store: Store; admin: { id: string; email: string; name: string } }>(
      '/api/superadmin/stores', 
      data
    ).then(res => res.data),
  
  update: (storeId: string, data: Partial<Store>) => 
    api.put<{ store: Store }>(`/api/superadmin/stores/${storeId}`, data).then(res => res.data.store),
  
  delete: (storeId: string) => 
    api.delete<{ message: string }>(`/api/superadmin/stores/${storeId}`).then(res => res.data),
  
  getCurrent: () => 
    api.get<{ store: Store }>('/api/stores/me').then(res => res.data.store),
  
  getBySubdomain: (subdomain: string) => 
    api.get<{ store: Store }>(`/api/stores/${subdomain}`).then(res => res.data.store),
};

export function storeToTenant(store: Store): Tenant {
  return {
    id: store.id,
    subdomain: store.subdomain,
    name: store.name,
    logo: store.logo,
    description: store.description,
    settings: store.settings,
    createdAt: store.createdAt,
    isActive: store.isActive,
  };
}

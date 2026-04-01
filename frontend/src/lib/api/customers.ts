import api from './axios';

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalSpent: number;
  visitCount: number;
  lastVisit?: string;
  notes?: string;
  createdAt: string;
}

export interface CreateCustomerData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export const customersApi = {
  getAll: (params?: { tier?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.tier) searchParams.set('tier', params.tier);
    if (params?.search) searchParams.set('search', params.search);
    const query = searchParams.toString();
    return api.get<{ customers: Customer[] }>(`/api/customers${query ? `?${query}` : ''}`).then(res => res.data.customers);
  },
  
  getById: (customerId: string) => 
    api.get<{ customer: Customer }>(`/api/customers/${customerId}`).then(res => res.data.customer),
  
  create: (data: CreateCustomerData) => 
    api.post<{ customer: Customer }>('/api/customers', data).then(res => res.data.customer),
  
  update: (customerId: string, data: Partial<CreateCustomerData>) => 
    api.put<{ customer: Customer }>(`/api/customers/${customerId}`, data).then(res => res.data.customer),
  
  delete: (customerId: string) => 
    api.delete<{ message: string }>(`/api/customers/${customerId}`).then(res => res.data),
};

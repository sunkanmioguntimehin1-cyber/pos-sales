import api from './axios';

export interface Branch {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  isDefault: boolean;
  createdAt: string;
}

export interface CreateBranchData {
  name: string;
  address?: string;
  phone?: string;
  isDefault?: boolean;
}

export const branchesApi = {
  getAll: () => {
    return api.get<{ branches: Branch[] }>('/api/branches').then(res => res.data.branches);
  },
  
  getById: (branchId: string) => 
    api.get<{ branch: Branch }>(`/api/branches/${branchId}`).then(res => res.data.branch),
  
  create: (data: CreateBranchData) => 
    api.post<{ branch: Branch }>('/api/branches', data).then(res => res.data.branch),
  
  update: (branchId: string, data: Partial<CreateBranchData>) => 
    api.put<{ branch: Branch }>(`/api/branches/${branchId}`, data).then(res => res.data.branch),
  
  delete: (branchId: string) => 
    api.delete<{ message: string }>(`/api/branches/${branchId}`).then(res => res.data),
};

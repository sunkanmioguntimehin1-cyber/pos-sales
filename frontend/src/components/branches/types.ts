export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  manager: string;
  status: 'active' | 'inactive';
}

export interface BranchFormData {
  name: string;
  address: string;
  phone: string;
  manager: string;
  status: 'active' | 'inactive';
}

export const emptyBranchFormData: BranchFormData = {
  name: '',
  address: '',
  phone: '',
  manager: '',
  status: 'active',
};

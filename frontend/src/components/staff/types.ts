export interface Staff {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'admin' | 'manager' | 'cashier';
  status: 'active' | 'inactive';
  branchId: string | null;
  branchName?: string;
  branchType?: 'head_office' | 'branch';
  createdAt?: string;
}

export interface StaffFormData {
  name: string;
  email?: string;
  role: 'admin' | 'manager' | 'cashier';
  phone?: string;
  password?: string;
  pin?: string;
  status: 'active' | 'inactive';
  /** Empty means the head office — the location new stock is received at. */
  branchId?: string;
}

export const emptyStaffFormData: StaffFormData = {
  name: '',
  email: '',
  role: 'cashier',
  phone: '',
  password: '',
  pin: '',
  status: 'active',
  branchId: '',
};

export interface Staff {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'admin' | 'manager' | 'cashier';
  status: 'active' | 'inactive';
  createdAt?: string;
}

export interface StaffFormData {
  name: string;
  email?: string;
  role: 'admin' | 'manager' | 'cashier';
  phone?: string;
  pin?: string;
  status: 'active' | 'inactive';
}

export const emptyStaffFormData: StaffFormData = {
  name: '',
  email: '',
  role: 'cashier',
  phone: '',
  pin: '',
  status: 'active',
};

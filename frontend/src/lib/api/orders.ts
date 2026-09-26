import api from './axios';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

/** Shape the backend returns after `.populate('customerId', 'name email')`. */
export interface PopulatedCustomerRef {
  _id: string;
  id: string;
  name: string;
  email?: string;
}

/** Shape the backend returns after `.populate('staffId'|'branchId', 'name')`. */
export interface PopulatedNameRef {
  _id: string;
  id: string;
  name: string;
}

export interface Order {
  id: string;
  _id?: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod?: string;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  /**
   * Populated into these three fields by the backend, so they arrive as objects
   * (with just `name` selected) rather than ids.
   */
  customerId?: string | PopulatedCustomerRef | null;
  staffId: string | PopulatedNameRef;
  branchId?: string | PopulatedNameRef | null;
  notes?: string;
  createdAt: string;
}

export interface CreateOrderData {
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod?: string;
  /** Attributes the sale to this staff member instead of the logged-in user. */
  staffId?: string;
  customerId?: string;
  branchId?: string;
  notes?: string;
}

function nameOf(value: string | { name: string } | null | undefined): string | undefined {
  if (!value) return undefined;
  return typeof value === 'string' ? undefined : value.name;
}

export function getOrderCustomerName(order: Pick<Order, 'customerId'>): string | undefined {
  return nameOf(order.customerId);
}

export function getOrderStaffName(order: Pick<Order, 'staffId'>): string | undefined {
  return nameOf(order.staffId);
}

export function getOrderBranchName(order: Pick<Order, 'branchId'>): string | undefined {
  return nameOf(order.branchId);
}

export const ordersApi = {
  getAll: (params?: { status?: string; startDate?: string; endDate?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    const query = searchParams.toString();
    return api.get<{ orders: Order[] }>(`/api/orders${query ? `?${query}` : ''}`).then(res => res.data.orders);
  },
  
  getById: (orderId: string) => 
    api.get<{ order: Order }>(`/api/orders/${orderId}`).then(res => res.data.order),
  
  create: (data: CreateOrderData) => 
    api.post<{ order: Order }>('/api/orders', data).then(res => res.data.order),
  
  updateStatus: (orderId: string, status: Order['status']) => 
    api.put<{ order: Order }>(`/api/orders/${orderId}/status`, { status }).then(res => res.data.order),
};

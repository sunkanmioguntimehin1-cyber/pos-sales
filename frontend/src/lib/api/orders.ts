import api from './axios';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod?: string;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  customerId?: string;
  customer?: { _id: string; name: string };
  staffId: string;
  staff?: { _id: string; name: string };
  branchId?: string;
  branch?: { _id: string; name: string };
  notes?: string;
  createdAt: string;
}

export interface CreateOrderData {
  items: Omit<OrderItem, 'totalPrice'>[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod?: string;
  customerId?: string;
  branchId?: string;
  notes?: string;
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

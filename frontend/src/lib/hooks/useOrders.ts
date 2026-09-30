import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ordersApi, Order, CreateOrderData } from '@/lib/api';
import { toBranchQueryId } from '@/lib/utils/branchQuery';

export type { Order, CreateOrderData } from '@/lib/api/orders';
export { getOrderCustomerName, getOrderStaffName, getOrderBranchName } from '@/lib/api/orders';

export function useOrders(filters?: { status?: string; branchId?: string; startDate?: string; endDate?: string; enabled?: boolean }) {
  // `enabled` only controls whether the query runs (used by the Branch Details
  // panel) and is stripped so it never becomes an API parameter.
  const { enabled = true, ...query } = filters || {};
  // The Branch Details panel always passes a real id, but the same "all"
  // sentinel guard applies here so a UI value can never be cast to an ObjectId.
  const branchId = toBranchQueryId(query.branchId);

  return useQuery({
    queryKey: ['orders', query],
    queryFn: () => ordersApi.getAll({ ...query, branchId }),
    staleTime: 30 * 1000,
    enabled,
  });
}

export function useOrder(orderId: string) {
  return useQuery({
    // Singular key: list queries live under ['orders', filters], and sharing a
    // prefix would make list mutations overwrite this single-object cache.
    queryKey: ['order', orderId],
    queryFn: () => ordersApi.getById(orderId),
    enabled: !!orderId,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderData) => ordersApi.create(data),
    onSuccess: (data) => {
      toast.success(`Order ${data.orderNumber} created successfully!`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      // A sale draws stock from the location the terminal is set to.
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-stock'] });
      // A completed sale bumps the customer's totalSpent/visitCount server-side.
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: Order['status'] }) =>
      ordersApi.updateStatus(orderId, status),
    onSuccess: (_data, { status }) => {
      toast.success(`Order ${status === 'cancelled' ? 'cancelled' : status} successfully!`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      // Cancelling or refunding puts the goods back on the shelf.
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-stock'] });
      // A restock also reverses the customer's visit count and spend.
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

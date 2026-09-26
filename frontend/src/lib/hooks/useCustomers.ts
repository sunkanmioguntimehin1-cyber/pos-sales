import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { customersApi, Customer, CreateCustomerData } from '@/lib/api';
import { snapshotLists, patchLists, restoreLists } from './optimistic';

export type { Customer, CreateCustomerData } from '@/lib/api/customers';

const CUSTOMERS = ['customers'] as const;

export function useCustomers(filters?: { tier?: string; search?: string }) {
  return useQuery({
    queryKey: ['customers', filters],
    queryFn: () => customersApi.getAll(filters),
    staleTime: 60 * 1000,
  });
}

export function useCustomer(customerId: string) {
  return useQuery({
    // Singular key: list queries live under ['customers', filters], and sharing
    // a prefix would make list mutations overwrite this single-object cache.
    queryKey: ['customer', customerId],
    queryFn: () => customersApi.getById(customerId),
    enabled: !!customerId,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerData) => customersApi.create(data),
    onMutate: async (newCustomer) => {
      const previous = await snapshotLists<Customer>(queryClient, CUSTOMERS);

      patchLists<Customer>(queryClient, CUSTOMERS, (old) => [
        ...old,
        {
          ...newCustomer,
          id: `temp-${Date.now()}`,
          tier: 'bronze',
          totalSpent: 0,
          visitCount: 0,
          createdAt: new Date().toISOString(),
        } as Customer,
      ]);

      return { previous };
    },
    onSuccess: () => {
      toast.success('Customer added successfully!');
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) restoreLists<Customer>(queryClient, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ customerId, data }: { customerId: string; data: Partial<CreateCustomerData> }) =>
      customersApi.update(customerId, data),
    onMutate: async ({ customerId, data }) => {
      const previous = await snapshotLists<Customer>(queryClient, CUSTOMERS);

      patchLists<Customer>(queryClient, CUSTOMERS, (old) =>
        old.map((customer) =>
          customer.id === customerId ? { ...customer, ...data } : customer
        )
      );

      return { previous };
    },
    onSuccess: () => {
      toast.success('Customer updated successfully!');
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) restoreLists<Customer>(queryClient, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (customerId: string) => customersApi.delete(customerId),
    onMutate: async (customerId) => {
      const previous = await snapshotLists<Customer>(queryClient, CUSTOMERS);

      patchLists<Customer>(queryClient, CUSTOMERS, (old) =>
        old.filter((customer) => customer.id !== customerId)
      );

      return { previous };
    },
    onSuccess: () => {
      toast.success('Customer deleted successfully');
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) restoreLists<Customer>(queryClient, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS });
    },
  });
}

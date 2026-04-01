import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { customersApi, Customer, CreateCustomerData } from '@/lib/api';

export type { Customer, CreateCustomerData } from '@/lib/api/customers';

export function useCustomers(filters?: { tier?: string; search?: string }) {
  return useQuery({
    queryKey: ['customers', filters],
    queryFn: () => customersApi.getAll(filters),
    staleTime: 60 * 1000,
  });
}

export function useCustomer(customerId: string) {
  return useQuery({
    queryKey: ['customers', customerId],
    queryFn: () => customersApi.getById(customerId),
    enabled: !!customerId,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerData) => customersApi.create(data),
    onMutate: async (newCustomer) => {
      await queryClient.cancelQueries({ queryKey: ['customers'] });
      const previousCustomers = queryClient.getQueryData<Customer[]>(['customers']);

      queryClient.setQueryData<Customer[]>(['customers'], (old = []) => [
        ...old,
        {
          ...newCustomer,
          id: `temp-${Date.now()}`,
          tier: 'bronze' as const,
          totalSpent: 0,
          visitCount: 0,
          createdAt: new Date().toISOString(),
        } as Customer,
      ]);

      return { previousCustomers };
    },
    onSuccess: () => {
      toast.success('Customer added successfully!');
    },
    onError: (_err, _vars, context) => {
      if (context?.previousCustomers) {
        queryClient.setQueryData(['customers'], context.previousCustomers);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ customerId, data }: { customerId: string; data: Partial<CreateCustomerData> }) =>
      customersApi.update(customerId, data),
    onMutate: async ({ customerId, data }) => {
      await queryClient.cancelQueries({ queryKey: ['customers'] });
      const previousCustomers = queryClient.getQueryData<Customer[]>(['customers']);

      queryClient.setQueryData<Customer[]>(['customers'], (old = []) =>
        old.map(customer =>
          customer.id === customerId ? { ...customer, ...data } : customer
        )
      );

      return { previousCustomers };
    },
    onSuccess: () => {
      toast.success('Customer updated successfully!');
    },
    onError: (_err, _vars, context) => {
      if (context?.previousCustomers) {
        queryClient.setQueryData(['customers'], context.previousCustomers);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (customerId: string) => customersApi.delete(customerId),
    onMutate: async (customerId) => {
      await queryClient.cancelQueries({ queryKey: ['customers'] });
      const previousCustomers = queryClient.getQueryData<Customer[]>(['customers']);

      queryClient.setQueryData<Customer[]>(['customers'], (old = []) =>
        old.filter(customer => customer.id !== customerId)
      );

      return { previousCustomers };
    },
    onSuccess: () => {
      toast.success('Customer deleted successfully');
    },
    onError: (_err, _vars, context) => {
      if (context?.previousCustomers) {
        queryClient.setQueryData(['customers'], context.previousCustomers);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

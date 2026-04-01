import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { storesApi, Store, CreateStoreData } from '@/lib/api';

export function useStores() {
  return useQuery({
    queryKey: ['stores'],
    queryFn: () => storesApi.getAll(),
    staleTime: 60 * 1000,
  });
}

export function useStore(storeId: string) {
  return useQuery({
    queryKey: ['stores', storeId],
    queryFn: () => storesApi.getById(storeId),
    enabled: !!storeId,
  });
}

export function useCreateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStoreData) => storesApi.create(data),
    onMutate: async (newStore) => {
      await queryClient.cancelQueries({ queryKey: ['stores'] });
      const previousStores = queryClient.getQueryData<Store[]>(['stores']);

      queryClient.setQueryData<Store[]>(['stores'], (old = []) => [
        ...old,
        {
          ...newStore,
          id: `temp-${Date.now()}`,
          isActive: true,
          settings: newStore.settings || { primaryColor: '#3B82F6', accentColor: '#6366F1', theme: 'dark' },
          createdAt: new Date().toISOString(),
        } as Store,
      ]);

      return { previousStores };
    },
    onSuccess: (data) => {
      toast.success(`Store "${data.store.name}" created successfully!`);
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
    onError: (_err, _newStore, context) => {
      if (context?.previousStores) {
        queryClient.setQueryData(['stores'], context.previousStores);
      }
    },
  });
}

export function useUpdateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storeId, data }: { storeId: string; data: Partial<Store> }) =>
      storesApi.update(storeId, data),
    onMutate: async ({ storeId, data }) => {
      await queryClient.cancelQueries({ queryKey: ['stores'] });
      const previousStores = queryClient.getQueryData<Store[]>(['stores']);

      queryClient.setQueryData<Store[]>(['stores'], (old = []) =>
        old.map(store =>
          store.id === storeId ? { ...store, ...data } : store
        )
      );

      return { previousStores };
    },
    onSuccess: (data) => {
      toast.success(`Store updated successfully!`);
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
    onError: (_err, _vars, context) => {
      if (context?.previousStores) {
        queryClient.setQueryData(['stores'], context.previousStores);
      }
    },
  });
}

export function useDeleteStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (storeId: string) => storesApi.delete(storeId),
    onMutate: async (storeId) => {
      await queryClient.cancelQueries({ queryKey: ['stores'] });
      const previousStores = queryClient.getQueryData<Store[]>(['stores']);

      queryClient.setQueryData<Store[]>(['stores'], (old = []) =>
        old.filter(store => store.id !== storeId)
      );

      return { previousStores };
    },
    onSuccess: () => {
      toast.success('Store deleted successfully');
    },
    onError: (_err, _vars, context) => {
      if (context?.previousStores) {
        queryClient.setQueryData(['stores'], context.previousStores);
      }
    },
  });
}

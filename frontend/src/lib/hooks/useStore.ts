import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { storeApi, Store } from '@/lib/api';

export function useStore() {
  return useQuery({
    queryKey: ['store'],
    queryFn: () => storeApi.get(),
    staleTime: 60 * 1000,
  });
}

export function useUpdateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Store>) => storeApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store'] });
      toast.success('Store settings saved!');
    },
  });
}

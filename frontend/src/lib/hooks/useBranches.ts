import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { branchesApi, Branch, CreateBranchData } from '@/lib/api';

export type { Branch, CreateBranchData } from '@/lib/api/branches';

export function useBranches() {
  return useQuery({
    queryKey: ['branches'],
    queryFn: () => branchesApi.getAll(),
    staleTime: 60 * 1000,
  });
}

export function useBranch(branchId: string) {
  return useQuery({
    queryKey: ['branches', branchId],
    queryFn: () => branchesApi.getById(branchId),
    enabled: !!branchId,
  });
}

export function useCreateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBranchData) => branchesApi.create(data),
    onMutate: async (newBranch) => {
      await queryClient.cancelQueries({ queryKey: ['branches'] });
      const previousBranches = queryClient.getQueryData<Branch[]>(['branches']);

      queryClient.setQueryData<Branch[]>(['branches'], (old = []) => [
        ...old,
        {
          ...newBranch,
          id: `temp-${Date.now()}`,
          isDefault: newBranch.isDefault || false,
          createdAt: new Date().toISOString(),
        } as Branch,
      ]);

      return { previousBranches };
    },
    onSuccess: () => {
      toast.success('Branch added successfully!');
    },
    onError: (_err, _vars, context) => {
      if (context?.previousBranches) {
        queryClient.setQueryData(['branches'], context.previousBranches);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
  });
}

export function useUpdateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ branchId, data }: { branchId: string; data: Partial<CreateBranchData> }) =>
      branchesApi.update(branchId, data),
    onMutate: async ({ branchId, data }) => {
      await queryClient.cancelQueries({ queryKey: ['branches'] });
      const previousBranches = queryClient.getQueryData<Branch[]>(['branches']);

      queryClient.setQueryData<Branch[]>(['branches'], (old = []) =>
        old.map(branch =>
          branch.id === branchId ? { ...branch, ...data } : branch
        )
      );

      return { previousBranches };
    },
    onSuccess: () => {
      toast.success('Branch updated successfully!');
    },
    onError: (_err, _vars, context) => {
      if (context?.previousBranches) {
        queryClient.setQueryData(['branches'], context.previousBranches);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
  });
}

export function useDeleteBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (branchId: string) => branchesApi.delete(branchId),
    onMutate: async (branchId) => {
      await queryClient.cancelQueries({ queryKey: ['branches'] });
      const previousBranches = queryClient.getQueryData<Branch[]>(['branches']);

      queryClient.setQueryData<Branch[]>(['branches'], (old = []) =>
        old.filter(branch => branch.id !== branchId)
      );

      return { previousBranches };
    },
    onSuccess: () => {
      toast.success('Branch deleted successfully');
    },
    onError: (_err, _vars, context) => {
      if (context?.previousBranches) {
        queryClient.setQueryData(['branches'], context.previousBranches);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
  });
}

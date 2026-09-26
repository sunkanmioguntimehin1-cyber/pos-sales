import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { branchesApi, Branch, CreateBranchData } from '@/lib/api';
import { snapshotLists, patchLists, restoreLists } from './optimistic';

export type { Branch, CreateBranchData } from '@/lib/api/branches';

const BRANCHES = ['branches'] as const;

export function useBranches() {
  return useQuery({
    queryKey: ['branches'],
    queryFn: () => branchesApi.getAll(),
    staleTime: 60 * 1000,
  });
}

export function useBranch(branchId: string) {
  return useQuery({
    // Singular key: the list lives under ['branches'], and sharing a prefix
    // would make list mutations overwrite this single-object cache.
    queryKey: ['branch', branchId],
    queryFn: () => branchesApi.getById(branchId),
    enabled: !!branchId,
  });
}

export function useCreateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBranchData) => branchesApi.create(data),
    onMutate: async (newBranch) => {
      const previous = await snapshotLists<Branch>(queryClient, BRANCHES);

      patchLists<Branch>(queryClient, BRANCHES, (old) => [
        ...old,
        {
          ...newBranch,
          id: `temp-${Date.now()}`,
          isDefault: newBranch.isDefault || false,
          status: newBranch.status || 'active',
          createdAt: new Date().toISOString(),
        } as Branch,
      ]);

      return { previous };
    },
    onSuccess: () => {
      toast.success('Branch added successfully!');
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) restoreLists<Branch>(queryClient, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: BRANCHES });
    },
  });
}

export function useUpdateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ branchId, data }: { branchId: string; data: Partial<CreateBranchData> }) =>
      branchesApi.update(branchId, data),
    onMutate: async ({ branchId, data }) => {
      const previous = await snapshotLists<Branch>(queryClient, BRANCHES);

      patchLists<Branch>(queryClient, BRANCHES, (old) =>
        old.map((branch) =>
          branch.id === branchId ? { ...branch, ...data } : branch
        )
      );

      return { previous };
    },
    onSuccess: () => {
      toast.success('Branch updated successfully!');
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) restoreLists<Branch>(queryClient, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: BRANCHES });
    },
  });
}

export function useDeleteBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (branchId: string) => branchesApi.delete(branchId),
    onMutate: async (branchId) => {
      const previous = await snapshotLists<Branch>(queryClient, BRANCHES);

      patchLists<Branch>(queryClient, BRANCHES, (old) =>
        old.filter((branch) => branch.id !== branchId)
      );

      return { previous };
    },
    onSuccess: () => {
      toast.success('Branch deleted successfully');
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) restoreLists<Branch>(queryClient, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: BRANCHES });
    },
  });
}

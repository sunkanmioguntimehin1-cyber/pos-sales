import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { staffApi, Staff, CreateStaffData, UpdateStaffData } from '@/lib/api';
import { snapshotLists, patchLists, restoreLists } from './optimistic';
import { toBranchQueryId } from '@/lib/utils/branchQuery';

export type { Staff } from '@/lib/api/staff';

const STAFF = ['staff'] as const;

export function useStaff(filters?: { role?: string; status?: string; search?: string; branchId?: string; enabled?: boolean }) {
  // `enabled` only controls whether the query runs (used by the Branch Details
  // panel, which may lack the permission to fetch a section). It must not leak
  // into the API call.
  const { enabled = true, ...query } = filters || {};
  // The sentinel must not reach the API — the backend would try to cast it to
  // an ObjectId. Note the query key keeps the raw filters so a caller's cached
  // entry is keyed on exactly what it asked for.
  const branchId = toBranchQueryId(query.branchId);

  return useQuery({
    queryKey: ['staff', query],
    queryFn: () => staffApi.getAll({ ...query, branchId }),
    staleTime: 60 * 1000,
    enabled,
  });
}

export function useStaffById(staffId: string) {
  return useQuery({
    // Singular key: list queries live under ['staff', filters], and sharing a
    // prefix would make list mutations overwrite this single-object cache.
    queryKey: ['staffMember', staffId],
    queryFn: () => staffApi.getById(staffId),
    enabled: !!staffId,
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStaffData) => staffApi.create(data),
    onMutate: async (newStaff) => {
      const previous = await snapshotLists<Staff>(queryClient, STAFF);

      patchLists<Staff>(queryClient, STAFF, (old) => [
        ...old,
        {
          ...newStaff,
          id: `temp-${Date.now()}`,
          createdAt: new Date().toISOString(),
          status: newStaff.status || 'active',
          // An empty selection means head office, so the placeholder row is
          // honestly "unassigned" until the refetch resolves the real branch.
          branchId: newStaff.branchId || null,
        } as Staff,
      ]);

      return { previous };
    },
    onSuccess: () => {
      toast.success('Staff member added successfully!');
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) restoreLists<Staff>(queryClient, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: STAFF });
    },
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ staffId, data }: { staffId: string; data: UpdateStaffData }) =>
      staffApi.update(staffId, data),
    onMutate: async ({ staffId, data }) => {
      const previous = await snapshotLists<Staff>(queryClient, STAFF);

      patchLists<Staff>(queryClient, STAFF, (old) =>
        old.map((staff) =>
          staff.id === staffId ? { ...staff, ...data } : staff
        )
      );

      return { previous };
    },
    onSuccess: () => {
      toast.success('Staff member updated successfully!');
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) restoreLists<Staff>(queryClient, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: STAFF });
    },
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (staffId: string) => staffApi.delete(staffId),
    onMutate: async (staffId) => {
      const previous = await snapshotLists<Staff>(queryClient, STAFF);

      patchLists<Staff>(queryClient, STAFF, (old) =>
        old.filter((staff) => staff.id !== staffId)
      );

      return { previous };
    },
    onSuccess: () => {
      toast.success('Staff member deleted successfully');
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) restoreLists<Staff>(queryClient, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: STAFF });
    },
  });
}

export function useVerifyPin() {
  return useMutation({
    mutationFn: ({ staffId, pin }: { staffId: string; pin: string }) =>
      staffApi.verifyPin(staffId, pin),
  });
}

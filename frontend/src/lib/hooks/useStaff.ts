import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { staffApi, Staff, CreateStaffData, UpdateStaffData } from '@/lib/api';
import { snapshotLists, patchLists, restoreLists } from './optimistic';

export type { Staff } from '@/lib/api/staff';

const STAFF = ['staff'] as const;

export function useStaff(filters?: { role?: string; status?: string; search?: string }) {
  return useQuery({
    queryKey: ['staff', filters],
    queryFn: () => staffApi.getAll(filters),
    staleTime: 60 * 1000,
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

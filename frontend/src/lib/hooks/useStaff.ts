import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { staffApi, Staff, CreateStaffData, UpdateStaffData } from '@/lib/api';

export type { Staff } from '@/lib/api/staff';

export function useStaff(filters?: { role?: string; status?: string; search?: string }) {
  return useQuery({
    queryKey: ['staff', filters],
    queryFn: () => staffApi.getAll(filters),
    staleTime: 60 * 1000,
  });
}

export function useStaffById(staffId: string) {
  return useQuery({
    queryKey: ['staff', staffId],
    queryFn: () => staffApi.getById(staffId),
    enabled: !!staffId,
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStaffData) => staffApi.create(data),
    onMutate: async (newStaff) => {
      await queryClient.cancelQueries({ queryKey: ['staff'] });
      const previousStaff = queryClient.getQueryData<Staff[]>(['staff']);

      queryClient.setQueryData<Staff[]>(['staff'], (old = []) => [
        ...old,
        {
          ...newStaff,
          id: `temp-${Date.now()}`,
          createdAt: new Date().toISOString(),
          status: newStaff.status || 'active',
        } as Staff,
      ]);

      return { previousStaff };
    },
    onSuccess: () => {
      toast.success('Staff member added successfully!');
    },
    onError: (_err, _vars, context) => {
      if (context?.previousStaff) {
        queryClient.setQueryData(['staff'], context.previousStaff);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ staffId, data }: { staffId: string; data: UpdateStaffData }) =>
      staffApi.update(staffId, data),
    onMutate: async ({ staffId, data }) => {
      await queryClient.cancelQueries({ queryKey: ['staff'] });
      const previousStaff = queryClient.getQueryData<Staff[]>(['staff']);

      queryClient.setQueryData<Staff[]>(['staff'], (old = []) =>
        old.map(staff =>
          staff.id === staffId ? { ...staff, ...data } : staff
        )
      );

      return { previousStaff };
    },
    onSuccess: () => {
      toast.success('Staff member updated successfully!');
    },
    onError: (_err, _vars, context) => {
      if (context?.previousStaff) {
        queryClient.setQueryData(['staff'], context.previousStaff);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (staffId: string) => staffApi.delete(staffId),
    onMutate: async (staffId) => {
      await queryClient.cancelQueries({ queryKey: ['staff'] });
      const previousStaff = queryClient.getQueryData<Staff[]>(['staff']);

      queryClient.setQueryData<Staff[]>(['staff'], (old = []) =>
        old.filter(staff => staff.id !== staffId)
      );

      return { previousStaff };
    },
    onSuccess: () => {
      toast.success('Staff member deleted successfully');
    },
    onError: (_err, _vars, context) => {
      if (context?.previousStaff) {
        queryClient.setQueryData(['staff'], context.previousStaff);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}

export function useVerifyPin() {
  return useMutation({
    mutationFn: ({ staffId, pin }: { staffId: string; pin: string }) =>
      staffApi.verifyPin(staffId, pin),
  });
}

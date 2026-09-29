import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { rolesApi, Role, CreateRoleData, UpdateRoleData } from '@/lib/api';
import { snapshotLists, patchLists, restoreLists } from './optimistic';

export type { Role, CreateRoleData, UpdateRoleData, PermissionKey } from '@/lib/api/roles';

const ROLES = ['roles'] as const;

export function useRoles() {
  return useQuery({
    queryKey: ROLES,
    queryFn: () => rolesApi.getAll(),
    staleTime: 60 * 1000,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoleData) => rolesApi.create(data),
    onMutate: async (newRole) => {
      const previous = await snapshotLists<Role>(queryClient, ROLES);

      patchLists<Role>(queryClient, ROLES, (old) => [
        ...old,
        {
          ...newRole,
          id: `temp-${Date.now()}`,
          isSystem: false,
          locationBound: newRole.locationBound !== false,
          memberCount: 0,
          createdAt: new Date().toISOString(),
        } as Role,
      ]);

      return { previous };
    },
    onSuccess: () => {
      toast.success('Role created successfully!');
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) restoreLists<Role>(queryClient, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ROLES });
      // A new role can already be assigned to staff, so the staff role picker
      // must see it too.
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, data }: { roleId: string; data: UpdateRoleData }) =>
      rolesApi.update(roleId, data),
    onMutate: async ({ roleId, data }) => {
      const previous = await snapshotLists<Role>(queryClient, ROLES);

      patchLists<Role>(queryClient, ROLES, (old) =>
        old.map((role) => (role.id === roleId ? { ...role, ...data } : role))
      );

      return { previous };
    },
    onSuccess: () => {
      toast.success('Role updated successfully!');
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) restoreLists<Role>(queryClient, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ROLES });
      // The role's badge colour and display name are read off staff responses,
      // so a rename must refresh both lists.
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleId: string) => rolesApi.delete(roleId),
    onMutate: async (roleId) => {
      const previous = await snapshotLists<Role>(queryClient, ROLES);

      patchLists<Role>(queryClient, ROLES, (old) =>
        old.filter((role) => role.id !== roleId)
      );

      return { previous };
    },
    onSuccess: () => {
      toast.success('Role deleted successfully');
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) restoreLists<Role>(queryClient, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ROLES });
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}
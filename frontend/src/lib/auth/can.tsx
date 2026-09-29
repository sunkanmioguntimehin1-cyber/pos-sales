'use client';
import type { ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';
import { PermissionKey } from '@/lib/api/roles';

/**
 * Pure check: does this user hold the permission? Kept separate from the hook
 * so sidebar config and rendering logic can use it without subscribing.
 *
 * The permissions array travels inside the JWT from the backend, so this is a
 * signed fact from the server — not a client-side guess.
 */
export function can(user: { permissions?: PermissionKey[] } | null | undefined, permission: PermissionKey): boolean {
  return user?.permissions?.includes(permission) ?? false;
}

export function canAny(user: { permissions?: PermissionKey[] } | null | undefined, permissions: PermissionKey[]): boolean {
  return permissions.some((permission) => can(user, permission));
}

/** Hook form of `can`, so a component re-renders when the signed-in user changes. */
export function useCan() {
  const user = useAuthStore((state) => state.user);
  const has = (permission: PermissionKey) => can(user, permission);
  const hasAny = (permissions: PermissionKey[]) => canAny(user, permissions);
  return { has, hasAny, user };
}

interface GateProps {
  permission: PermissionKey;
  children: ReactNode;
}

/** Hides its children entirely unless the current user holds the permission. */
export function Gate({ permission, children }: GateProps) {
  const { has } = useCan();
  if (!has(permission)) return null;
  return <>{children}</>;
}
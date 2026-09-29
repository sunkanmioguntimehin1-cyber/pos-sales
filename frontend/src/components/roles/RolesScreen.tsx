'use client';
import { useMemo, useState } from 'react';
import { IconPlus, IconEdit, IconTrash, IconShield, IconMapPin } from '@/components/ui/Icons';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { Role } from '@/lib/api';
import { useRoles } from '@/lib/hooks';
import { useCan } from '@/lib/auth/can';
import { RoleFormModal } from './RoleFormModal';
import { DeleteRoleModal } from './DeleteRoleModal';

export function RolesScreen() {
  const { data: roles = [], isLoading } = useRoles();
  const { has } = useCan();
  const canManage = has('roles:manage');

  const [formRole, setFormRole] = useState<Role | null | 'new'>(null);
  const [deleteRole, setDeleteRole] = useState<Role | null>(null);

  const systemCount = useMemo(() => roles.filter((role) => role.isSystem).length, [roles]);
  const customRoles = useMemo(() => roles.filter((role) => !role.isSystem), [roles]);
  const totalMembers = useMemo(() => roles.reduce((sum, role) => sum + role.memberCount, 0), [roles]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4">
          <div className="text-[10px] text-subtle font-bold uppercase tracking-widest mb-1.5">Total Roles</div>
          <div className="text-[26px] font-extrabold text-blue-400">{isLoading ? '...' : roles.length}</div>
        </div>
        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4">
          <div className="text-[10px] text-subtle font-bold uppercase tracking-widest mb-1.5">Custom Roles</div>
          <div className="text-[26px] font-extrabold text-emerald-400">{isLoading ? '...' : customRoles.length}</div>
        </div>
        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4">
          <div className="text-[10px] text-subtle font-bold uppercase tracking-widest mb-1.5">Built-in</div>
          <div className="text-[26px] font-extrabold text-amber-400">{isLoading ? '...' : systemCount}</div>
        </div>
        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4">
          <div className="text-[10px] text-subtle font-bold uppercase tracking-widest mb-1.5">Members Assigned</div>
          <div className="text-[26px] font-extrabold text-muted">{isLoading ? '...' : totalMembers}</div>
        </div>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="px-4 py-3 flex items-center gap-2.5 border-b border-[var(--border)]">
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-subtle mb-0.5">Permissions</p>
            <p className="text-[12px] text-muted">
              Roles bundle the actions your staff can take. Change a role and every holder picks it up on their next login.
            </p>
          </div>
          {canManage && (
            <button
              onClick={() => setFormRole('new')}
              className="h-9 flex items-center gap-1.5 px-3.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[13px] font-semibold shadow-[0_2px_8px_rgba(59,130,246,0.3)] transition-all"
            >
              <IconPlus size={12} /> Add Role
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="p-4">
            <SkeletonTable rows={3} cols={4} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 p-4">
            {roles.map((role) => (
              <div
                key={role.id}
                className="flex flex-col gap-3 rounded-xl border border-[var(--border-strong)] p-4 bg-[var(--surface-2)] hover:border-[var(--border)] transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${role.color || 'bg-blue-500/15 text-blue-400'}`}>
                        {role.name}
                      </span>
                      {role.isSystem && (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-subtle">
                          <IconShield size={10} /> Built-in
                        </span>
                      )}
                    </div>
                    <div className="mt-1 truncate text-[11px] text-subtle">{role.key}</div>
                  </div>
                  {canManage && (
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <button
                        onClick={() => setFormRole(role)}
                        className="w-7 h-7 flex items-center justify-center rounded-md text-muted hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                        title="Edit Role"
                      >
                        <IconEdit size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteRole(role)}
                        disabled={role.isSystem || role.memberCount > 0}
                        className="w-7 h-7 flex items-center justify-center rounded-md text-muted hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30 disabled:hover:text-muted disabled:hover:bg-transparent transition-all"
                        title={role.isSystem ? 'Built-in roles cannot be deleted' : role.memberCount > 0 ? 'Role is in use' : 'Delete Role'}
                      >
                        <IconTrash size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {role.description && <p className="text-[12.5px] text-muted line-clamp-2">{role.description}</p>}

                <div className="flex items-center gap-3 text-[11px] text-subtle flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    <IconMapPin size={11} className={role.locationBound ? '' : 'text-emerald-400'} />
                    {role.locationBound ? 'Works at their branch' : 'Any location'}
                  </span>
                  <span className="inline-flex items-center gap-1">{role.permissions.length} permission{role.permissions.length === 1 ? '' : 's'}</span>
                  <span className="ml-auto">{role.memberCount} member{role.memberCount === 1 ? '' : 's'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {canManage && (
        <>
          <RoleFormModal
            key={formRole === 'new' ? '__new__' : formRole?.id ?? 'closed'}
            isOpen={formRole !== null}
            onClose={() => setFormRole(null)}
            role={formRole === 'new' ? null : formRole}
          />
          <DeleteRoleModal
            isOpen={!!deleteRole}
            onClose={() => setDeleteRole(null)}
            role={deleteRole}
          />
        </>
      )}
    </div>
  );
}
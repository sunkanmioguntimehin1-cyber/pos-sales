'use client';
import { Modal } from '@/components/ui/Modal';
import { IconAlertTriangle } from '@/components/ui/Icons';
import { Role } from '@/lib/api';
import { useDeleteRole } from '@/lib/hooks';

interface DeleteRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
}

export function DeleteRoleModal({ isOpen, onClose, role }: DeleteRoleModalProps) {
  const deleteRole = useDeleteRole();

  if (!role) return null;

  const handleDelete = () => {
    deleteRole.mutate(role.id, { onSuccess: onClose });
  };

  const inUse = role.memberCount > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Role"
      width="sm"
      footer={
        <>
          <button
            onClick={onClose}
            className="h-9 px-4 bg-[var(--surface-2)] border border-[var(--border-strong)] text-muted hover:text-[var(--text)] rounded-lg text-[13px] font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={inUse}
            className="h-9 px-4 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg text-[13px] font-semibold shadow-[0_2px_8px_rgba(239,68,68,0.3)] transition-all"
          >
            Delete
          </button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
          <IconAlertTriangle size={24} className="text-red-400" />
        </div>
        <p className="text-[13px] text-muted mb-2">
          Are you sure you want to delete <span className="font-semibold text-[var(--text)]">{role.name}</span>?
        </p>
        {inUse ? (
          <p className="text-[12px] text-red-400">
            This role is assigned to {role.memberCount} staff member{role.memberCount === 1 ? '' : 's'}.
            Reassign them to another role before deleting it.
          </p>
        ) : (
          <p className="text-[12px] text-subtle">
            Staff currently holding this role will lose it. This action cannot be undone.
          </p>
        )}
      </div>
    </Modal>
  );
}
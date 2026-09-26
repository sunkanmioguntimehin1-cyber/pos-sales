'use client';
import { Modal } from '@/components/ui/Modal';
import { IconAlertTriangle } from '@/components/ui/Icons';
import { Staff } from './types';

interface DeleteStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  staff: Staff | null;
}

export function DeleteStaffModal({ isOpen, onClose, onDelete, staff }: DeleteStaffModalProps) {
  if (!staff) return null;

  const handleDelete = () => {
    onDelete(staff.id);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Staff"
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
            className="h-9 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg text-[13px] font-semibold shadow-[0_2px_8px_rgba(239,68,68,0.3)] transition-all"
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
          Are you sure you want to delete <span className="font-semibold text-[var(--text)]">{staff.name}</span>?
        </p>
        <p className="text-[12px] text-subtle">
          This action cannot be undone. All staff data will be permanently removed.
        </p>
      </div>
    </Modal>
  );
}

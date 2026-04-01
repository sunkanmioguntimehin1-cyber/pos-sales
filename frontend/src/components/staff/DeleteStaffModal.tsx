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
            className="h-9 px-4 bg-[#1E2535] border border-white/[0.12] text-slate-400 hover:text-slate-200 rounded-lg text-[13px] font-semibold transition-all"
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
        <p className="text-[13px] text-slate-300 mb-2">
          Are you sure you want to delete <span className="font-semibold text-slate-100">{staff.name}</span>?
        </p>
        <p className="text-[12px] text-slate-500">
          This action cannot be undone. All staff data will be permanently removed.
        </p>
      </div>
    </Modal>
  );
}

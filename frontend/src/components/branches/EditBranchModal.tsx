'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '@/components/ui/Modal';
import { BranchForm } from './BranchForm';
import { BranchFormData, emptyBranchFormData } from './types';
import { Branch } from '@/lib/api/branches';

interface EditBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (id: string, data: BranchFormData) => void;
  branch: Branch | null;
}

export function EditBranchModal({ isOpen, onClose, onEdit, branch }: EditBranchModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BranchFormData>({
    defaultValues: emptyBranchFormData,
  });

  // `defaultValues` is only read on mount, and this modal stays mounted across
  // opens — so without an explicit reset the second branch you edit would show
  // the first one's details. It also used to blank the manager and infer status
  // from `isDefault`, which is a separate concern entirely.
  useEffect(() => {
    if (!isOpen || !branch) return;
    reset({
      name: branch.name,
      address: branch.address || '',
      phone: branch.phone || '',
      manager: branch.manager || '',
      status: branch.status,
    });
  }, [isOpen, branch, reset]);

  const onFormSubmit = (data: BranchFormData) => {
    if (branch) {
      onEdit(branch.id, data);
    }
    handleClose();
  };

  const handleClose = () => {
    reset(emptyBranchFormData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Branch"
      width="md"
      footer={
        <>
          <button
            onClick={handleClose}
            className="h-9 px-4 bg-[var(--surface-2)] border border-[var(--border-strong)] text-muted hover:text-[var(--text)] rounded-lg text-[13px] font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit(onFormSubmit)}
            className="h-9 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[13px] font-semibold shadow-[0_2px_8px_rgba(59,130,246,0.3)] transition-all"
          >
            Save Changes
          </button>
        </>
      }
    >
      <BranchForm
        control={control}
        errors={errors}
        isHeadOffice={branch?.type === 'head_office'}
      />
    </Modal>
  );
}

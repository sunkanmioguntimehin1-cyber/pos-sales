'use client';
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
    formState: { errors },
  } = useForm<BranchFormData>({
    defaultValues: branch ? {
      name: branch.name,
      address: branch.address || '',
      phone: branch.phone || '',
      manager: '',
      status: branch.isDefault ? 'active' : 'inactive',
    } : emptyBranchFormData,
  });

  const onFormSubmit = (data: BranchFormData) => {
    if (branch) {
      onEdit(branch.id, data);
    }
    handleClose();
  };

  const handleClose = () => {
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
            className="h-9 px-4 bg-[#1E2535] border border-white/[0.12] text-slate-400 hover:text-slate-200 rounded-lg text-[13px] font-semibold transition-all"
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
      <BranchForm control={control} errors={errors} />
    </Modal>
  );
}

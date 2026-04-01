'use client';
import { useForm } from 'react-hook-form';
import { Modal } from '@/components/ui/Modal';
import { BranchForm } from './BranchForm';
import { BranchFormData, emptyBranchFormData } from './types';

interface AddBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: BranchFormData) => void;
}

export function AddBranchModal({ isOpen, onClose, onAdd }: AddBranchModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BranchFormData>({
    defaultValues: emptyBranchFormData,
  });

  const onFormSubmit = (data: BranchFormData) => {
    onAdd(data);
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
      title="Add New Branch"
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
            Add Branch
          </button>
        </>
      }
    >
      <BranchForm control={control} errors={errors} />
    </Modal>
  );
}

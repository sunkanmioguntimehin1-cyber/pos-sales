'use client';
import { useForm } from 'react-hook-form';
import { Modal } from '@/components/ui/Modal';
import { StaffForm } from './StaffForm';
import { Staff, StaffFormData, emptyStaffFormData } from './types';

interface EditStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (id: string, data: StaffFormData) => void;
  staff: Staff | null;
}

export function EditStaffModal({ isOpen, onClose, onEdit, staff }: EditStaffModalProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<StaffFormData>({
    defaultValues: staff ? {
      name: staff.name,
      email: staff.email,
      role: staff.role,
      phone: staff.phone,
      pin: '',
      status: staff.status,
    } : emptyStaffFormData,
  });

  const onFormSubmit = (data: StaffFormData) => {
    if (staff) {
      onEdit(staff.id, data);
    }
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Staff"
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
      <StaffForm control={control} errors={errors} isEdit />
    </Modal>
  );
}

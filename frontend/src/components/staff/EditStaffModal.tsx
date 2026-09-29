'use client';
import { useEffect } from 'react';
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
    reset,
    formState: { errors },
  } = useForm<StaffFormData>({
    defaultValues: emptyStaffFormData,
  });

  // `defaultValues` is only read on mount, and this modal stays mounted across
  // opens — so without an explicit reset the second person you edit would show
  // the first one's details.
  useEffect(() => {
    if (!isOpen || !staff) return;
    reset({
      name: staff.name,
      email: staff.email,
      role: staff.role,
      phone: staff.phone,
      password: '',
      pin: '',
      status: staff.status,
      // A staff record with no branch (not yet backfilled) must show the head
      // office rather than an empty select, which would read as "not chosen".
      branchId: staff.branchId ?? '',
    });
  }, [isOpen, staff, reset]);

  const onFormSubmit = (data: StaffFormData) => {
    if (staff) {
      onEdit(staff.id, data);
    }
    handleClose();
  };

  const handleClose = () => {
    reset(emptyStaffFormData);
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
      <StaffForm control={control} errors={errors} isEdit />
    </Modal>
  );
}

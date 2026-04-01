'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '@/components/ui/Modal';
import { InventoryForm } from './InventoryForm';
import { InventoryFormData, InventoryItem, emptyInventoryFormData } from './types';

interface AddInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<InventoryItem, 'id'>) => void;
}

const generateProductCode = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PRD-${timestamp}-${random}`;
};

const getStatus = (onHand: number, reorder: number): InventoryItem['status'] => {
  if (onHand === 0) return 'out';
  if (onHand <= reorder) return 'critical';
  if (onHand <= reorder * 1.5) return 'low';
  return 'ok';
};

export function AddInventoryModal({ isOpen, onClose, onAdd }: AddInventoryModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<InventoryFormData>({
    defaultValues: emptyInventoryFormData,
  });

  const productCodeType = watch('productCodeType');

  useEffect(() => {
    if (productCodeType === 'auto' && isOpen) {
      setValue('productCode', generateProductCode());
    }
  }, [productCodeType, isOpen, setValue]);

  const validateForm = (data: InventoryFormData): boolean => {
    let hasErrors = false;

    if (data.productCodeType === 'manual' && !data.productCode.trim()) {
      setError('productCode', { type: 'manual', message: 'Product code is required' });
      hasErrors = true;
    }
    if (!data.name.trim()) {
      setError('name', { type: 'manual', message: 'Name is required' });
      hasErrors = true;
    }
    if (!data.color.trim()) {
      setError('color', { type: 'manual', message: 'Color is required' });
      hasErrors = true;
    }
    if (!data.size.trim()) {
      setError('size', { type: 'manual', message: 'Size is required' });
      hasErrors = true;
    }
    if (!data.onHand || parseInt(data.onHand) < 0) {
      setError('onHand', { type: 'manual', message: 'Valid quantity is required' });
      hasErrors = true;
    }
    if (!data.reorder || parseInt(data.reorder) < 0) {
      setError('reorder', { type: 'manual', message: 'Reorder point is required' });
      hasErrors = true;
    }
    if (!data.location.trim()) {
      setError('location', { type: 'manual', message: 'Location is required' });
      hasErrors = true;
    }

    return !hasErrors;
  };

  const onFormSubmit = (formData: InventoryFormData) => {
    if (!validateForm(formData)) return;

    const onHand = parseInt(formData.onHand) || 0;
    const reserved = parseInt(formData.reserved) || 0;
    const reorder = parseInt(formData.reorder) || 0;
    const available = onHand - reserved;

    onAdd({
      productCode: formData.productCodeType === 'auto' ? generateProductCode() : formData.productCode,
      name: formData.name.trim(),
      color: formData.color.trim(),
      size: formData.size.trim(),
      onHand,
      reserved,
      available,
      reorder,
      location: formData.location.trim().toUpperCase(),
      updated: 'Just now',
      status: getStatus(onHand, reorder),
    });

    handleClose();
  };

  const handleClose = () => {
    reset(emptyInventoryFormData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Inventory"
      width="lg"
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
            Add Inventory
          </button>
        </>
      }
    >
      <InventoryForm control={control} errors={errors} />
    </Modal>
  );
}

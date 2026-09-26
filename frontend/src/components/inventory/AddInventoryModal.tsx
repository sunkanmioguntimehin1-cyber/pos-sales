'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '@/components/ui/Modal';
import { InventoryForm } from './InventoryForm';
import { InventoryFormData, emptyInventoryFormData } from './types';

interface AddInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Only the fields that map onto the product schema are passed through. */
  onAdd: (item: {
    productCode: string;
    name: string;
    price: number;
    costPrice?: number;
    onHand: number;
    reorder: number;
  }) => void;
}

const generateProductCode = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PRD-${timestamp}-${random}`;
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
    if (data.price === '' || parseFloat(data.price) < 0) {
      setError('price', { type: 'manual', message: 'Selling price is required' });
      hasErrors = true;
    }
    if (data.onHand === '' || parseInt(data.onHand) < 0) {
      setError('onHand', { type: 'manual', message: 'Valid quantity is required' });
      hasErrors = true;
    }
    if (data.reorder === '' || parseInt(data.reorder) < 0) {
      setError('reorder', { type: 'manual', message: 'Reorder point is required' });
      hasErrors = true;
    }

    return !hasErrors;
  };

  const onFormSubmit = (formData: InventoryFormData) => {
    if (!validateForm(formData)) return;

    const costPrice = parseFloat(formData.costPrice);

    onAdd({
      // Reuse the code already shown in the form. Generating a second one here
      // saved the product under a code the user never saw.
      productCode: formData.productCode.trim() || generateProductCode(),
      name: formData.name.trim(),
      price: parseFloat(formData.price) || 0,
      costPrice: Number.isNaN(costPrice) ? undefined : costPrice,
      onHand: parseInt(formData.onHand) || 0,
      reorder: parseInt(formData.reorder) || 0,
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
            className="h-9 px-4 bg-[var(--surface-2)] border border-[var(--border-strong)] text-muted hover:text-[var(--text)] rounded-lg text-[13px] font-semibold transition-all"
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

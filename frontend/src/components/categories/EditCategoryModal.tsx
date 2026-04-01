'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '@/components/ui/Modal';
import { CategoryForm, CategoryFormData, emptyCategoryFormData } from './CategoryForm';

interface CategoryDisplay {
  id: string;
  name: string;
  description?: string;
  color?: string;
  productCount: number;
  isActive: boolean;
  createdAt: string;
}

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryDisplay | null;
  onUpdate: (id: string, data: { name: string; description?: string }) => void;
  existingNames: string[];
}

export function EditCategoryModal({ isOpen, onClose, category, onUpdate, existingNames }: EditCategoryModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CategoryFormData>({
    defaultValues: emptyCategoryFormData,
  });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        description: category.description || '',
        emoji: '📦',
        status: category.isActive ? 'active' : 'inactive',
      });
    }
  }, [category, reset]);

  const validateForm = (data: CategoryFormData): boolean => {
    let hasErrors = false;
    
    if (!data.name.trim()) {
      setError('name', { type: 'manual', message: 'Category name is required' });
      hasErrors = true;
    } else if (existingNames.includes(data.name.trim().toLowerCase()) && data.name.trim().toLowerCase() !== category?.name.toLowerCase()) {
      setError('name', { type: 'manual', message: 'Category name already exists' });
      hasErrors = true;
    }
    
    return !hasErrors;
  };

  const onFormSubmit = (formData: CategoryFormData) => {
    if (!validateForm(formData) || !category) return;

    onUpdate(category.id, {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
    });

    handleClose();
  };

  const handleClose = () => {
    reset(emptyCategoryFormData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Category"
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
      {category && (
        <CategoryForm
          control={control}
          errors={errors}
        />
      )}
    </Modal>
  );
}

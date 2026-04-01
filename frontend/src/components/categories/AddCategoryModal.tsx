'use client';
import { useForm } from 'react-hook-form';
import { Modal } from '@/components/ui/Modal';
import { CategoryForm, CategoryFormData, emptyCategoryFormData } from './CategoryForm';

interface CategoryData {
  name: string;
  description?: string;
  color?: string;
}

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: CategoryData) => void;
  existingNames: string[];
}

export function AddCategoryModal({ isOpen, onClose, onAdd, existingNames }: AddCategoryModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CategoryFormData>({
    defaultValues: emptyCategoryFormData,
  });

  const validateForm = (data: CategoryFormData): boolean => {
    let hasErrors = false;
    
    if (!data.name.trim()) {
      setError('name', { type: 'manual', message: 'Category name is required' });
      hasErrors = true;
    } else if (existingNames.includes(data.name.trim().toLowerCase())) {
      setError('name', { type: 'manual', message: 'Category name already exists' });
      hasErrors = true;
    }
    
    return !hasErrors;
  };

  const onSubmit = (formData: CategoryFormData) => {
    if (!validateForm(formData)) return;

    onAdd({
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
      title="Add New Category"
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
            onClick={handleSubmit(onSubmit)} 
            className="h-9 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[13px] font-semibold shadow-[0_2px_8px_rgba(59,130,246,0.3)] transition-all"
          >
            Add Category
          </button>
        </>
      }
    >
      <CategoryForm
        control={control}
        errors={errors}
      />
    </Modal>
  );
}

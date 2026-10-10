'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '@/components/ui/Modal';
import { ProductForm, ProductFormData, emptyFormData } from './ProductForm';
import { generateBarcode } from '@/lib/utils/barcode';

interface AddProductFormData {
  name: string;
  productCode: string;
  description: string;
  size: string;
  colour: string;
  barcode: string;
  sellingPrice: number;
  cost: number;
  overheadCost?: number;
  operatingCost?: number;
  stock: number;
  categoryId?: string;
  isActive?: boolean;
  taxable: boolean;
  image?: string;
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (product: AddProductFormData) => void;
}

const generateProductCode = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PRD-${timestamp}-${random}`;
};

export function AddProductModal({ isOpen, onClose, onAdd }: AddProductModalProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [barcode, setBarcode] = useState<string>('');
  
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: emptyFormData,
  });

  const productCodeType = watch('productCodeType');

  useEffect(() => {
    if (productCodeType === 'auto' && isOpen) {
      setValue('productCode', generateProductCode());
    }
  }, [productCodeType, isOpen, setValue]);

  useEffect(() => {
    if (isOpen) {
      // Fresh scannable EAN-13 barcode each time the Add form opens. The
      // backend falls back to generating one too, for products created via
      // other flows (e.g. Inventory).
      setBarcode(generateBarcode());
    }
  }, [isOpen]);

  const validateForm = (data: ProductFormData): boolean => {
    let hasErrors = false;
    
    if (data.productCodeType === 'manual' && !data.productCode.trim()) {
      setError('productCode', { type: 'manual', message: 'Product code is required' });
      hasErrors = true;
    }
    if (!data.sellingPrice || parseFloat(data.sellingPrice) < 0) {
      setError('sellingPrice', { type: 'manual', message: 'Valid selling price is required' });
      hasErrors = true;
    }
    if (!data.cost || parseFloat(data.cost) < 0) {
      setError('cost', { type: 'manual', message: 'Valid cost is required' });
      hasErrors = true;
    }
    if (!data.stock || parseInt(data.stock) < 0) {
      setError('stock', { type: 'manual', message: 'Valid stock is required' });
      hasErrors = true;
    }
    
    return !hasErrors;
  };

  const onSubmit = (formData: ProductFormData) => {
    if (!validateForm(formData)) return;

    const sellingPrice = parseFloat(formData.sellingPrice);
    const cost = parseFloat(formData.cost);
    const stock = parseInt(formData.stock);
    const overheadCost = parseFloat(formData.overheadCost);
    const operatingCost = parseFloat(formData.operatingCost);

    onAdd({
      // Reuse the code shown in the form rather than generating a second one.
      productCode: formData.productCode.trim() || generateProductCode(),
      name: formData.name,
      description: formData.description.trim(),
      size: formData.size.trim(),
      colour: formData.colour.trim(),
      barcode,
      sellingPrice,
      cost,
      overheadCost: Number.isNaN(overheadCost) ? undefined : overheadCost,
      operatingCost: Number.isNaN(operatingCost) ? undefined : operatingCost,
      stock,
      categoryId: formData.category || undefined,
      isActive: formData.status !== 'inactive',
      taxable: formData.taxable,
      image: imagePreview || undefined,
    });

    handleClose();
  };

  const handleClose = () => {
    reset(emptyFormData);
    setImagePreview(null);
    setBarcode('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Product"
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
            onClick={handleSubmit(onSubmit)} 
            className="h-9 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[13px] font-semibold shadow-[0_2px_8px_rgba(59,130,246,0.3)] transition-all"
          >
            Add Product
          </button>
        </>
      }
    >
      <ProductForm
        control={control}
        errors={errors}
        imagePreview={imagePreview}
        setImagePreview={setImagePreview}
        showTax
        barcode={barcode}
      />
    </Modal>
  );
}

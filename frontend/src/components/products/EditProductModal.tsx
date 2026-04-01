'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '@/components/ui/Modal';
import { ProductForm, ProductFormData } from './ProductForm';
import { Product } from '@/lib/api/products';

interface EditProductFormData {
  productCode: string;
  name: string;
  sellingPrice: number;
  cost: number;
  stock: number;
  categoryId?: string;
  image?: string;
}

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onUpdate: (productId: string, productData: EditProductFormData) => void;
}

const defaultFormData: ProductFormData = {
  productCodeType: 'manual',
  productCode: '',
  name: '',
  color: '',
  size: '',
  category: 'Electronics',
  sellingPrice: '',
  cost: '',
  discount: '0',
  stock: '',
  status: 'active',
  emoji: '🎧',
  image: null,
};

const generateProductCode = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PRD-${timestamp}-${random}`;
};

export function EditProductModal({ isOpen, onClose, product, onUpdate }: EditProductModalProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: defaultFormData,
  });

  const productCodeType = watch('productCodeType');

  useEffect(() => {
    if (productCodeType === 'auto') {
      setValue('productCode', generateProductCode());
    }
  }, [productCodeType, setValue]);

  useEffect(() => {
    if (product) {
      reset({
        productCodeType: 'manual',
        productCode: product.sku || '',
        name: product.name,
        color: '',
        size: '',
        category: product.category?.name || '',
        sellingPrice: product.price.toString(),
        cost: (product.costPrice || 0).toString(),
        discount: '0',
        stock: product.stock.toString(),
        status: 'active',
        emoji: '📦',
        image: null,
      });
      setImagePreview(product.image || null);
    }
  }, [product, reset]);

  const validateForm = (data: ProductFormData): boolean => {
    let hasErrors = false;
    
    if (data.productCodeType === 'manual' && !data.productCode.trim()) {
      setError('productCode', { type: 'manual', message: 'SKU is required' });
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
    if (!validateForm(formData) || !product) return;

    const sellingPrice = parseFloat(formData.sellingPrice);
    const cost = parseFloat(formData.cost);
    const stock = parseInt(formData.stock);

    onUpdate(product.id, {
      productCode: formData.productCodeType === 'auto' ? generateProductCode() : formData.productCode,
      name: formData.name,
      sellingPrice,
      cost,
      stock,
      image: imagePreview || undefined,
    });

    handleClose();
  };

  const handleClose = () => {
    reset(defaultFormData);
    setImagePreview(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Product"
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
            onClick={handleSubmit(onSubmit)} 
            className="h-9 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[13px] font-semibold shadow-[0_2px_8px_rgba(59,130,246,0.3)] transition-all"
          >
            Save Changes
          </button>
        </>
      }
    >
      {product && (
        <ProductForm
          control={control}
          errors={errors}
          imagePreview={imagePreview}
          setImagePreview={setImagePreview}
          isEdit
        />
      )}
    </Modal>
  );
}

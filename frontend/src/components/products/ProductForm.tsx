'use client';
import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Control, FieldErrors, Controller } from 'react-hook-form';
import { IconX, IconUpload } from '@/components/ui/Icons';

export interface ProductFormData {
  productCodeType: 'auto' | 'manual';
  productCode: string;
  name: string;
  color: string;
  size: string;
  category: string;
  sellingPrice: string;
  cost: string;
  discount: string;
  stock: string;
  status: string;
  emoji: string;
  image: File | null;
}

export const emptyFormData: ProductFormData = {
  productCodeType: 'auto',
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

const categories = ['Electronics', 'Cases', 'Accessories', 'Cables'];
const emojis = ['🎧', '🔌', '📱', '⚡', '💻', '🔗', '🔊', '🛡️', '⌨️', '🖱️', '🎮', '📀', '🔋', '💡', '🎤', '📷'];

const inputCls = "w-full h-9 px-3 bg-[#1E2535] border border-white/[0.12] rounded-lg text-slate-100 text-[13px] placeholder:text-slate-500 outline-none focus:border-blue-500 transition-all";
const inputErrorCls = "w-full h-9 px-3 bg-[#1E2535] border border-red-500 rounded-lg text-slate-100 text-[13px] placeholder:text-slate-500 outline-none focus:border-red-500 transition-all";
const labelCls = "block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5";
const selectCls = "w-full h-9 px-3 bg-[#1E2535] border border-white/[0.12] rounded-lg text-slate-300 text-[13px] outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer pr-7 bg-[image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748B%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-no-repeat bg-[position:right_10px_center]";

interface ProductFormProps {
  control: Control<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
  imagePreview: string | null;
  setImagePreview: React.Dispatch<React.SetStateAction<string | null>>;
  isEdit?: boolean;
}

export function ProductForm({ control, errors, imagePreview, setImagePreview, isEdit = false }: ProductFormProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>, onChange: (file: File | null) => void) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
      onChange(e.target.files[0]);
    }
  };

  const removeImage = (onChange: (file: File | null) => void) => {
    onChange(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <div className="mb-4">
        <label className={labelCls}>Product Image</label>
        <Controller
          name="image"
          control={control}
          render={({ field }) =>
            imagePreview ? (
              <div className="relative w-full h-40 bg-[#1E2535] border border-white/[0.12] rounded-lg overflow-hidden">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(field.onChange)}
                  className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-lg bg-black/50 text-white hover:bg-black/70 transition-all"
                >
                  <IconX size={14} />
                </button>
                {isEdit && (
                  <div className="absolute bottom-2 left-2 text-[10px] text-slate-400 bg-black/50 px-2 py-1 rounded">
                    New image selected
                  </div>
                )}
              </div>
            ) : (
              <div
                className={`relative w-full h-40 border-2 border-dashed rounded-lg transition-all cursor-pointer ${dragActive ? 'border-blue-500 bg-blue-500/5' : 'border-white/[0.12] hover:border-white/[0.2]'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileInput(e, field.onChange)}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <IconUpload size={24} className="text-slate-500 mb-2" />
                  <span className="text-[13px] text-slate-400">Drag & drop or click to upload</span>
                  <span className="text-[11px] text-slate-500 mt-1">PNG, JPG, GIF up to 5MB</span>
                </div>
              </div>
            )
          }
        />
      </div>

      <div className="mb-4">
        <label className={labelCls}>Product Code *</label>
        <Controller
          name="productCodeType"
          control={control}
          render={({ field: codeTypeField }) => (
            <div className="space-y-2">
              <div className="flex gap-1 p-[3px] bg-[#1E2535] rounded-lg border border-white/[0.12] w-fit">
                <button
                  type="button"
                  onClick={() => codeTypeField.onChange('auto')}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
                    codeTypeField.value === 'auto'
                      ? 'bg-blue-500 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Auto-generate
                </button>
                <button
                  type="button"
                  onClick={() => codeTypeField.onChange('manual')}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
                    codeTypeField.value === 'manual'
                      ? 'bg-blue-500 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Manual
                </button>
              </div>
              {codeTypeField.value === 'manual' && (
                <Controller
                  name="productCode"
                  control={control}
                  render={({ field }) => (
                    <>
                      <input
                        {...field}
                        type="text"
                        className={errors.productCode ? inputErrorCls : inputCls}
                        placeholder="Enter product code"
                      />
                      {errors.productCode && <span className="text-[11px] text-red-400 mt-1">{errors.productCode.message}</span>}
                    </>
                  )}
                />
              )}
            </div>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className={labelCls}>Product Name</label>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className={inputCls}
                placeholder="Enter product name (optional)"
              />
            )}
          />
        </div>
        <div>
          <label className={labelCls}>Color *</label>
          <Controller
            name="color"
            control={control}
            render={({ field }) => (
              <>
                <input
                  {...field}
                  type="text"
                  className={errors.color ? inputErrorCls : inputCls}
                  placeholder="e.g., Gold, Silver, Black..."
                />
                {errors.color && <span className="text-[11px] text-red-400 mt-1">{errors.color.message}</span>}
              </>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className={labelCls}>Size *</label>
          <Controller
            name="size"
            control={control}
            render={({ field }) => (
              <>
                <input
                  {...field}
                  type="text"
                  className={errors.size ? inputErrorCls : inputCls}
                  placeholder="e.g., XS, S, M, L, 10, 12..."
                />
                {errors.size && <span className="text-[11px] text-red-400 mt-1">{errors.size.message}</span>}
              </>
            )}
          />
        </div>
        <div>
          <label className={labelCls}>Category</label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <select {...field} className={selectCls}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <label className={labelCls}>Selling Price *</label>
          <Controller
            name="sellingPrice"
            control={control}
            render={({ field }) => (
              <>
                <input
                  {...field}
                  type="number"
                  step="0.01"
                  min="0"
                  className={errors.sellingPrice ? inputErrorCls : inputCls}
                  placeholder="0.00"
                />
                {errors.sellingPrice && <span className="text-[11px] text-red-400 mt-1">{errors.sellingPrice.message}</span>}
              </>
            )}
          />
        </div>
        <div>
          <label className={labelCls}>Cost *</label>
          <Controller
            name="cost"
            control={control}
            render={({ field }) => (
              <>
                <input
                  {...field}
                  type="number"
                  step="0.01"
                  min="0"
                  className={errors.cost ? inputErrorCls : inputCls}
                  placeholder="0.00"
                />
                {errors.cost && <span className="text-[11px] text-red-400 mt-1">{errors.cost.message}</span>}
              </>
            )}
          />
        </div>
        <div>
          <label className={labelCls}>Discount (%)</label>
          <Controller
            name="discount"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="number"
                min="0"
                max="100"
                className={inputCls}
                placeholder="0"
              />
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className={labelCls}>Stock *</label>
          <Controller
            name="stock"
            control={control}
            render={({ field }) => (
              <>
                <input
                  {...field}
                  type="number"
                  min="0"
                  className={errors.stock ? inputErrorCls : inputCls}
                  placeholder="0"
                />
                {errors.stock && <span className="text-[11px] text-red-400 mt-1">{errors.stock.message}</span>}
              </>
            )}
          />
        </div>
        <div>
          <label className={labelCls}>Status</label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <select {...field} className={selectCls}>
                <option value="active">Active</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
              </select>
            )}
          />
        </div>
      </div>

      <div className="mb-4">
        <label className={labelCls}>Emoji (Fallback Icon)</label>
        <Controller
          name="emoji"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-8 gap-1.5 p-2 bg-[#1E2535] border border-white/[0.12] rounded-lg">
              {emojis.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => field.onChange(e)}
                  className={`w-8 h-8 flex items-center justify-center text-base rounded-md transition-all ${field.value === e ? 'bg-blue-500 text-white' : 'hover:bg-white/[0.05]'}`}
                >
                  {e}
                </button>
              ))}
            </div>
          )}
        />
      </div>
    </>
  );
}

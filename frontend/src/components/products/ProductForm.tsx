'use client';
import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Control, FieldErrors, Controller, useWatch } from 'react-hook-form';
import { IconX, IconUpload } from '@/components/ui/Icons';
import { Barcode } from '@/components/ui/Barcode';
import { useCategories, useStore } from '@/lib/hooks';

/**
 * Mirrors the product schema. "Low/out of stock" is derived from `stock` vs
 * `lowStockThreshold` at render time, so only the real `isActive` flag is
 * editable here alongside the stored attributes (description, size, colour).
 */
export interface ProductFormData {
  productCodeType: 'auto' | 'manual';
  productCode: string;
  name: string;
  /** Category *id* — the backend filters and stores categoryId. */
  category: string;
  description: string;
  size: string;
  colour: string;
  sellingPrice: string;
  cost: string;
  overheadCost: string;
  operatingCost: string;
  stock: string;
  status: string;
  /** Whether this product attracts the store's tax rate. */
  taxable: boolean;
  image: File | null;
}

export const emptyFormData: ProductFormData = {
  productCodeType: 'auto',
  productCode: '',
  name: '',
  category: '',
  description: '',
  size: '',
  colour: '',
  sellingPrice: '',
  cost: '',
  overheadCost: '',
  operatingCost: '',
  stock: '',
  status: 'active',
  taxable: true,
  image: null,
};


const inputCls = "w-full h-9 px-3 bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-lg text-[var(--text)] text-[13px] placeholder:text-subtle outline-none focus:border-blue-500 transition-all";
const inputErrorCls = "w-full h-9 px-3 bg-[var(--surface-2)] border border-red-500 rounded-lg text-[var(--text)] text-[13px] placeholder:text-subtle outline-none focus:border-red-500 transition-all";
const labelCls = "block text-[10px] font-bold uppercase tracking-widest text-subtle mb-1.5";
const selectCls = "w-full h-9 px-3 bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-lg text-muted text-[13px] outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer pr-7 bg-[image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748B%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-no-repeat bg-[position:right_10px_center]";

interface ProductFormProps {
  control: Control<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
  imagePreview: string | null;
  setImagePreview: React.Dispatch<React.SetStateAction<string | null>>;
  isEdit?: boolean;
  /** Show the per-product tax toggle + tax reference (Add Product flow only). */
  showTax?: boolean;
  /** Auto-generated EAN-13 barcode to preview (Add generates, Edit shows stored). */
  barcode?: string;
}

export function ProductForm({ control, errors, imagePreview, setImagePreview, isEdit = false, showTax = false, barcode }: ProductFormProps) {
  // Categories live in the database; the previous hardcoded name list meant the
  // submitted value could never be a valid categoryId.
  const { data: categories = [] } = useCategories();
  const { data: store } = useStore();
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live tax preview for the Add form: the price stays exactly as typed; we
  // only show the tax amount and the tax-inclusive total for reference.
  const taxRate = store?.settings?.tax?.rate ?? 8.25;
  const taxIncluded = store?.settings?.tax?.includedInPrice ?? false;
  const sellingPriceValue = useWatch({ control, name: 'sellingPrice' });
  const taxableValue = useWatch({ control, name: 'taxable' });
  const priceNum = parseFloat(sellingPriceValue || '') || 0;
  // When prices are tax-inclusive the tax is the portion already inside the
  // price; otherwise it is charged on top of it.
  const taxAmount = taxIncluded
    ? priceNum * (taxRate / (100 + taxRate))
    : priceNum * (taxRate / 100);
  const taxInclusiveTotal = taxIncluded ? priceNum : priceNum + taxAmount;
  const showTaxReference = showTax && taxableValue !== false && priceNum > 0;

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
              <div className="relative w-full h-40 bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-lg overflow-hidden">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(field.onChange)}
                  className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-lg bg-[var(--overlay)] text-white hover:bg-[var(--overlay)] transition-all"
                >
                  <IconX size={14} />
                </button>
                {isEdit && (
                  <div className="absolute bottom-2 left-2 text-[10px] text-muted bg-[var(--overlay)] px-2 py-1 rounded">
                    New image selected
                  </div>
                )}
              </div>
            ) : (
              <div
                className={`relative w-full h-40 border-2 border-dashed rounded-lg transition-all cursor-pointer ${dragActive ? 'border-blue-500 bg-blue-500/5' : 'border-[var(--border-strong)] hover:border-[var(--border-strong)]'}`}
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
                  <IconUpload size={24} className="text-subtle mb-2" />
                  <span className="text-[13px] text-muted">Drag & drop or click to upload</span>
                  <span className="text-[11px] text-subtle mt-1">PNG, JPG, GIF up to 5MB</span>
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
              <div className="flex gap-1 p-[3px] bg-[var(--surface-2)] rounded-lg border border-[var(--border-strong)] w-fit">
                <button
                  type="button"
                  onClick={() => codeTypeField.onChange('auto')}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
                    codeTypeField.value === 'auto'
                      ? 'bg-blue-500 text-white'
                      : 'text-muted hover:text-[var(--text)]'
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
                      : 'text-muted hover:text-[var(--text)]'
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

      <div className="mb-4">
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
      </div>

      <div className="mb-4">
        <div>
          <label className={labelCls}>Category</label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <select {...field} className={selectCls}>
                <option value="">Uncategorised</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
          />
        </div>
      </div>

      {barcode && (
        <div className="mb-4">
          <label className={labelCls}>Barcode</label>
          <div className="flex items-center gap-3 bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-lg p-3">
            <Barcode value={barcode} height={36} width={1.5} displayValue />
            <span className="text-[10px] text-subtle">{isEdit ? 'Stored barcode' : 'Auto-generated, scannable'}</span>
          </div>
        </div>
      )}

      <div className="mb-4">
        <label className={labelCls}>Description / Material</label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <textarea
              {...field}
              rows={2}
              className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-lg text-[var(--text)] text-[13px] placeholder:text-subtle outline-none focus:border-blue-500 transition-all resize-none"
              placeholder="Material, notes or description (optional)"
            />
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className={labelCls}>Size</label>
          <Controller
            name="size"
            control={control}
            render={({ field }) => (
              <input {...field} type="text" className={inputCls} placeholder="e.g. M, 42, 10oz (optional)" />
            )}
          />
        </div>
        <div>
          <label className={labelCls}>Colour</label>
          <Controller
            name="colour"
            control={control}
            render={({ field }) => (
              <input {...field} type="text" className={inputCls} placeholder="e.g. Black, Red (optional)" />
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
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
                {showTaxReference && (
                  <span className="text-[10px] text-subtle mt-1 block leading-tight">
                    {taxIncluded
                      ? `Includes ${taxRate.toFixed(2)}% tax (₦${taxAmount.toFixed(2)})`
                      : `Tax ${taxRate.toFixed(2)}%: ₦${taxAmount.toFixed(2)} · Total: ₦${taxInclusiveTotal.toFixed(2)}`}
                  </span>
                )}
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
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className={labelCls}>Overhead Cost</label>
          <Controller
            name="overheadCost"
            control={control}
            render={({ field }) => (
              <>
                <input
                  {...field}
                  type="number"
                  step="0.01"
                  min="0"
                  className={inputCls}
                  placeholder="0.00 (optional)"
                />
                {errors.overheadCost && <span className="text-[11px] text-red-400 mt-1">{errors.overheadCost.message}</span>}
              </>
            )}
          />
        </div>
        <div>
          <label className={labelCls}>Operating Cost</label>
          <Controller
            name="operatingCost"
            control={control}
            render={({ field }) => (
              <>
                <input
                  {...field}
                  type="number"
                  step="0.01"
                  min="0"
                  className={inputCls}
                  placeholder="0.00 (optional)"
                />
                {errors.operatingCost && <span className="text-[11px] text-red-400 mt-1">{errors.operatingCost.message}</span>}
              </>
            )}
          />
        </div>
      </div>

      {showTax && (
        <div className="mb-4">
          <label className={labelCls}>Apply Tax ({taxRate.toFixed(2)}%)</label>
          <Controller
            name="taxable"
            control={control}
            render={({ field }) => (
              <div
                className="flex gap-1 p-[3px] bg-[var(--surface-2)] rounded-lg border border-[var(--border-strong)] w-fit"
                role="radiogroup"
                aria-label="Apply tax"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={field.value !== false}
                  onClick={() => field.onChange(true)}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
                    field.value !== false
                      ? 'bg-blue-500 text-white'
                      : 'text-muted hover:text-[var(--text)]'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={field.value === false}
                  onClick={() => field.onChange(false)}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
                    field.value === false
                      ? 'bg-blue-500 text-white'
                      : 'text-muted hover:text-[var(--text)]'
                  }`}
                >
                  No
                </button>
              </div>
            )}
          />
          <span className="text-[11px] text-subtle mt-1 block">
            {taxIncluded
              ? `The selling price above already includes ${taxRate.toFixed(2)}% tax.`
              : `Tax is added on top of the selling price at checkout.`}
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className={labelCls}>Opening Stock (Head Office) *</label>
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
                {/* The backend books a new product's stock into the head
                    office; branches get theirs from a transfer. */}
                <span className="text-[11px] text-subtle mt-1 block">
                  Received at head office. Send stock to branches from Transfers.
                </span>
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
                {/* Low/out of stock is derived from stock vs threshold, not stored. */}
                <option value="active">Active</option>
                <option value="inactive">Inactive (hidden from POS)</option>
              </select>
            )}
          />
        </div>
      </div>

    </>
  );
}

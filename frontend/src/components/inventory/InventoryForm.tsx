'use client';
import { Control, FieldErrors, Controller } from 'react-hook-form';
import { InventoryFormData } from './types';

const inputCls = "w-full h-9 px-3 bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-lg text-[var(--text)] text-[13px] placeholder:text-subtle outline-none focus:border-blue-500 transition-all";
const inputErrorCls = "w-full h-9 px-3 bg-[var(--surface-2)] border border-red-500 rounded-lg text-[var(--text)] text-[13px] placeholder:text-subtle outline-none focus:border-red-500 transition-all";
const labelCls = "block text-[10px] font-bold uppercase tracking-widest text-subtle mb-1.5";

interface InventoryFormProps {
  control: Control<InventoryFormData>;
  errors: FieldErrors<InventoryFormData>;
}

export function InventoryForm({ control, errors }: InventoryFormProps) {
  return (
    <>
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

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <label className={labelCls}>Name *</label>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <>
                <input
                  {...field}
                  type="text"
                  className={errors.name ? inputErrorCls : inputCls}
                  placeholder="Product name"
                />
                {errors.name && <span className="text-[11px] text-red-400 mt-1">{errors.name.message}</span>}
              </>
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
                  placeholder="e.g., Black"
                />
                {errors.color && <span className="text-[11px] text-red-400 mt-1">{errors.color.message}</span>}
              </>
            )}
          />
        </div>
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
                  placeholder="e.g., M"
                />
                {errors.size && <span className="text-[11px] text-red-400 mt-1">{errors.size.message}</span>}
              </>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <label className={labelCls}>On Hand *</label>
          <Controller
            name="onHand"
            control={control}
            render={({ field }) => (
              <>
                <input
                  {...field}
                  type="number"
                  min="0"
                  className={errors.onHand ? inputErrorCls : inputCls}
                  placeholder="0"
                />
                {errors.onHand && <span className="text-[11px] text-red-400 mt-1">{errors.onHand.message}</span>}
              </>
            )}
          />
        </div>
        <div>
          <label className={labelCls}>Reserved</label>
          <Controller
            name="reserved"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="number"
                min="0"
                className={inputCls}
                placeholder="0"
              />
            )}
          />
        </div>
        <div>
          <label className={labelCls}>Reorder Point *</label>
          <Controller
            name="reorder"
            control={control}
            render={({ field }) => (
              <>
                <input
                  {...field}
                  type="number"
                  min="0"
                  className={errors.reorder ? inputErrorCls : inputCls}
                  placeholder="0"
                />
                {errors.reorder && <span className="text-[11px] text-red-400 mt-1">{errors.reorder.message}</span>}
              </>
            )}
          />
        </div>
      </div>

      <div className="mb-4">
        <label className={labelCls}>Location *</label>
        <Controller
          name="location"
          control={control}
          render={({ field }) => (
            <>
              <input
                {...field}
                type="text"
                className={errors.location ? inputErrorCls : inputCls}
                placeholder="e.g., A-12"
              />
              {errors.location && <span className="text-[11px] text-red-400 mt-1">{errors.location.message}</span>}
            </>
          )}
        />
      </div>
    </>
  );
}

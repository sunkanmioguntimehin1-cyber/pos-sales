'use client';
import { useForm, Controller } from 'react-hook-form';
import { IconAlertTriangle } from '@/components/ui/Icons';
import { StockAdjustmentFormData, InventoryItem, ADJUSTMENT_TYPE_OPTIONS } from './types';

interface StockAdjustmentFormProps {
  onSubmit: (data: StockAdjustmentFormData) => void;
  inventory: InventoryItem[];
  /** Name of the location adjustments will be applied to. */
  locationName?: string;
}

const selectCls = "w-full h-9 px-3 bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-lg text-muted text-[13px] outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer pr-7 bg-[image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748B%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-no-repeat bg-[position:right_10px_center]";
const selectErrorCls = "w-full h-9 px-3 bg-[var(--surface-2)] border border-red-500 rounded-lg text-muted text-[13px] outline-none focus:border-red-500 transition-all appearance-none cursor-pointer pr-7 bg-[image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748B%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-no-repeat bg-[position:right_10px_center]";
const inputCls = "w-full h-9 px-3 bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-lg text-[var(--text)] text-[13px] placeholder:text-subtle outline-none focus:border-blue-500 transition-all";
const inputErrorCls = "w-full h-9 px-3 bg-[var(--surface-2)] border border-red-500 rounded-lg text-[var(--text)] text-[13px] placeholder:text-subtle outline-none focus:border-red-500 transition-all";

export function StockAdjustmentForm({ onSubmit, inventory, locationName }: StockAdjustmentFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors },
  } = useForm<StockAdjustmentFormData>({
    defaultValues: {
      productCode: '',
      type: '',
      quantity: '',
      note: '',
      minQuantity: '',
    },
  });

  // The location's current target for the product in the dropdown, so the
  // field can show what the new minimum level would replace.
  const selectedProductCode = watch('productCode');
  const currentMinLevel = inventory.find((item) => item.productCode === selectedProductCode)?.reorder;

  const validateForm = (data: StockAdjustmentFormData): boolean => {
    let hasErrors = false;

    if (!data.productCode) {
      setError('productCode', { type: 'manual', message: 'Please select a product' });
      hasErrors = true;
    }
    if (!data.type) {
      setError('type', { type: 'manual', message: 'Please select adjustment type' });
      hasErrors = true;
    }
    if (!data.quantity || parseInt(data.quantity) <= 0) {
      setError('quantity', { type: 'manual', message: 'Quantity must be greater than 0' });
      hasErrors = true;
    }
    if (data.minQuantity !== undefined && data.minQuantity !== '' && parseInt(data.minQuantity) < 0) {
      setError('minQuantity', { type: 'manual', message: 'Minimum level cannot be negative' });
      hasErrors = true;
    }

    return !hasErrors;
  };

  const onFormSubmit = (data: StockAdjustmentFormData) => {
    if (!validateForm(data)) return;

    // An empty min level just means the target is being left alone.
    onSubmit({
      ...data,
      minQuantity: data.minQuantity?.trim() ? data.minQuantity : undefined,
    });
    reset({
      productCode: '',
      type: '',
      quantity: '',
      note: '',
      minQuantity: '',
    });
  };

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 h-fit">
      <div className="font-bold text-[13px] text-[var(--text)] mb-1.5 flex items-center gap-1.5">
        <IconAlertTriangle size={13} className="text-amber-400" />
        Stock Adjustment
      </div>
      <div className="text-[11px] text-subtle mb-3.5">
        Applied to <span className="font-semibold text-[var(--text)]">{locationName ?? 'head office'}</span>.
      </div>
      <form id="stock-adjustment-form" onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-3">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-subtle mb-1.5">Product *</label>
          <Controller
            name="productCode"
            control={control}
            render={({ field }) => (
              <>
                <select
                  {...field}
                  className={errors.productCode ? selectErrorCls : selectCls}
                >
                  <option value="">Select product…</option>
                  {inventory.map(item => (
                    <option key={item.productCode} value={item.productCode}>
                      {item.name} ({item.productCode}) — {item.onHand} on hand
                    </option>
                  ))}
                </select>
                {errors.productCode && <span className="text-[11px] text-red-400 mt-1">{errors.productCode.message}</span>}
              </>
            )}
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-subtle mb-1.5">Type *</label>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <>
                <select
                  {...field}
                  className={errors.type ? selectErrorCls : selectCls}
                >
                  <option value="">Select type…</option>
                  {ADJUSTMENT_TYPE_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                {errors.type && <span className="text-[11px] text-red-400 mt-1">{errors.type.message}</span>}
              </>
            )}
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-subtle mb-1.5">Quantity *</label>
          <Controller
            name="quantity"
            control={control}
            render={({ field }) => (
              <>
                <input
                  {...field}
                  type="number"
                  min="1"
                  className={errors.quantity ? inputErrorCls : inputCls}
                  placeholder="Enter quantity"
                />
                {errors.quantity && <span className="text-[11px] text-red-400 mt-1">{errors.quantity.message}</span>}
              </>
            )}
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-subtle mb-1.5">Reason / Note</label>
          <Controller
            name="note"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className={inputCls}
                placeholder="e.g. Received PO-2024-012"
              />
            )}
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-subtle mb-1.5">
            Minimum Level (optional) — for {locationName ?? 'this location'}
          </label>
          <Controller
            name="minQuantity"
            control={control}
            render={({ field }) => (
              <>
                <input
                  {...field}
                  type="number"
                  min="0"
                  className={errors.minQuantity ? inputErrorCls : inputCls}
                  placeholder={currentMinLevel !== undefined ? `Set new target (currently ${currentMinLevel})` : 'Leave blank to keep current target'}
                />
                {errors.minQuantity && <span className="text-[11px] text-red-400 mt-1">{errors.minQuantity.message}</span>}
              </>
            )}
          />
          <span className="text-[11px] text-subtle mt-1 block">
            0 turns the low-stock warning off for this product at this location.
          </span>
        </div>

        <button type="submit" className="w-full h-9 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg text-[13px] shadow-[0_2px_8px_rgba(59,130,246,0.3)] transition-all">
          Apply Adjustment
        </button>
      </form>

      <CriticalAlerts inventory={inventory} />
    </div>
  );
}

function CriticalAlerts({ inventory }: { inventory: InventoryItem[] }) {
  const criticalItems = inventory.filter(p => p.status === 'critical' || p.status === 'out');

  if (criticalItems.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-[var(--border)]">
      <div className="text-[10px] font-bold uppercase tracking-widest text-subtle mb-2.5">Critical Alerts</div>
      {criticalItems.map(item => (
        <div key={item.productCode} className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg mb-1.5">
          <div className="text-xs font-semibold text-[var(--text)]">{item.name}</div>
          <div className="text-[11px] text-red-400 mt-0.5">{item.onHand === 0 ? 'Out of stock' : `${item.onHand} units left`}</div>
        </div>
      ))}
    </div>
  );
}

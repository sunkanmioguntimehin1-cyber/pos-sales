'use client';
import { useForm, Controller } from 'react-hook-form';
import { IconAlertTriangle } from '@/components/ui/Icons';
import { StockAdjustmentFormData, InventoryItem } from './types';

interface StockAdjustmentFormProps {
  onSubmit: (data: StockAdjustmentFormData) => void;
  inventory: InventoryItem[];
}

const selectCls = "w-full h-9 px-3 bg-[#1E2535] border border-white/[0.12] rounded-lg text-slate-300 text-[13px] outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer pr-7 bg-[image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748B%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-no-repeat bg-[position:right_10px_center]";
const selectErrorCls = "w-full h-9 px-3 bg-[#1E2535] border border-red-500 rounded-lg text-slate-300 text-[13px] outline-none focus:border-red-500 transition-all appearance-none cursor-pointer pr-7 bg-[image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748B%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-no-repeat bg-[position:right_10px_center]";
const inputCls = "w-full h-9 px-3 bg-[#1E2535] border border-white/[0.12] rounded-lg text-slate-100 text-[13px] placeholder:text-slate-500 outline-none focus:border-blue-500 transition-all";
const inputErrorCls = "w-full h-9 px-3 bg-[#1E2535] border border-red-500 rounded-lg text-slate-100 text-[13px] placeholder:text-slate-500 outline-none focus:border-red-500 transition-all";

export function StockAdjustmentForm({ onSubmit, inventory }: StockAdjustmentFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<StockAdjustmentFormData>({
    defaultValues: {
      productCode: '',
      type: '',
      quantity: '',
      note: '',
    },
  });

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

    return !hasErrors;
  };

  const onFormSubmit = (data: StockAdjustmentFormData) => {
    if (!validateForm(data)) return;

    onSubmit(data);
    reset({
      productCode: '',
      type: '',
      quantity: '',
      note: '',
    });
  };

  return (
    <div className="bg-[#161B27] border border-white/[0.07] rounded-xl p-4 h-fit">
      <div className="font-bold text-[13px] text-slate-100 mb-3.5 flex items-center gap-1.5">
        <IconAlertTriangle size={13} className="text-amber-400" />
        Stock Adjustment
      </div>
      <form id="stock-adjustment-form" onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-3">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Product *</label>
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
                      {item.name} ({item.color}, {item.size})
                    </option>
                  ))}
                </select>
                {errors.productCode && <span className="text-[11px] text-red-400 mt-1">{errors.productCode.message}</span>}
              </>
            )}
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Type *</label>
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
                  <option value="receive">Add stock (receive)</option>
                  <option value="damage">Remove stock (damage)</option>
                  <option value="correction">Count correction</option>
                  <option value="transfer">Transfer out</option>
                </select>
                {errors.type && <span className="text-[11px] text-red-400 mt-1">{errors.type.message}</span>}
              </>
            )}
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Quantity *</label>
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
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Reason / Note</label>
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
    <div className="mt-4 pt-4 border-t border-white/[0.07]">
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2.5">Critical Alerts</div>
      {criticalItems.map(item => (
        <div key={item.productCode} className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg mb-1.5">
          <div className="text-xs font-semibold text-slate-100">{item.name}</div>
          <div className="text-[11px] text-red-400 mt-0.5">{item.onHand === 0 ? 'Out of stock' : `${item.onHand} units left`}</div>
        </div>
      ))}
    </div>
  );
}

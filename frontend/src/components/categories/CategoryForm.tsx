'use client';
import { Control, Controller } from 'react-hook-form';

export interface CategoryFormData {
  name: string;
  description: string;
  emoji: string;
  status: 'active' | 'inactive';
}

export const emptyCategoryFormData: CategoryFormData = {
  name: '',
  description: '',
  emoji: '📦',
  status: 'active',
};

const emojis = ['📦', '🛒', '🛍️', '👕', '👗', '👟', '💄', '🧴', '🍔', '☕', '🍕', '🧸', '📱', '💻', '🎮', '🎧', '⌚', '🕶️', '💍', '👜', '🎁', '📚', '🖊️', '🏠'];

const inputCls = "w-full h-9 px-3 bg-[#1E2535] border border-white/[0.12] rounded-lg text-slate-100 text-[13px] placeholder:text-slate-500 outline-none focus:border-blue-500 transition-all";
const inputErrorCls = "w-full h-9 px-3 bg-[#1E2535] border border-red-500 rounded-lg text-slate-100 text-[13px] placeholder:text-slate-500 outline-none focus:border-red-500 transition-all";
const labelCls = "block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5";
const selectCls = "w-full h-9 px-3 bg-[#1E2535] border border-white/[0.12] rounded-lg text-slate-300 text-[13px] outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer pr-7 bg-[image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748B%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-no-repeat bg-[position:right_10px_center]";

interface CategoryFormProps {
  control: Control<CategoryFormData>;
  errors: {
    name?: { message?: string };
    description?: { message?: string };
  };
}

export function CategoryForm({ control, errors }: CategoryFormProps) {
  return (
    <>
      <div className="mb-4">
        <label className={labelCls}>Category Name *</label>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <>
              <input
                {...field}
                type="text"
                className={errors.name ? inputErrorCls : inputCls}
                placeholder="Enter category name"
              />
              {errors.name && <span className="text-[11px] text-red-400 mt-1">{errors.name.message}</span>}
            </>
          )}
        />
      </div>

      <div className="mb-4">
        <label className={labelCls}>Description</label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <textarea
              {...field}
              className="w-full h-20 px-3 py-2 bg-[#1E2535] border border-white/[0.12] rounded-lg text-slate-100 text-[13px] placeholder:text-slate-500 outline-none focus:border-blue-500 transition-all resize-none"
              placeholder="Brief description of this category"
            />
          )}
        />
      </div>

      <div className="mb-4">
        <label className={labelCls}>Icon (Emoji)</label>
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

      <div className="mb-4">
        <label className={labelCls}>Status</label>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <select
              {...field}
              className={selectCls}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          )}
        />
      </div>
    </>
  );
}

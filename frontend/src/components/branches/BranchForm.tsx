'use client';
import { Controller, UseFormReturn } from 'react-hook-form';
import { BranchFormData } from './types';

interface BranchFormProps {
  control: UseFormReturn<BranchFormData>['control'];
  errors: UseFormReturn<BranchFormData>['formState']['errors'];
}

const inputCls = "w-full h-9 px-3 bg-[#1E2535] border border-white/[0.12] rounded-lg text-slate-100 text-[13px] placeholder:text-slate-500 outline-none focus:border-blue-500 transition-all";
const inputErrorCls = "w-full h-9 px-3 bg-[#1E2535] border border-red-500 rounded-lg text-slate-100 text-[13px] placeholder:text-slate-500 outline-none focus:border-red-500 transition-all";
const labelCls = "block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5";
const selectCls = "w-full h-9 px-3 bg-[#1E2535] border border-white/[0.12] rounded-lg text-slate-300 text-[13px] outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer pr-7 bg-[image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748B%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-no-repeat bg-[position:right_10px_center]";
const selectErrorCls = "w-full h-9 px-3 bg-[#1E2535] border border-red-500 rounded-lg text-slate-300 text-[13px] outline-none focus:border-red-500 transition-all appearance-none cursor-pointer pr-7 bg-[image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748B%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-no-repeat bg-[position:right_10px_center]";
const textareaCls = "w-full h-20 px-3 py-2 bg-[#1E2535] border border-white/[0.12] rounded-lg text-slate-100 text-[13px] placeholder:text-slate-500 outline-none focus:border-blue-500 transition-all resize-none";

export function BranchForm({ control, errors }: BranchFormProps) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className={labelCls}>Branch Name *</label>
        <Controller
          name="name"
          control={control}
          rules={{ required: 'Branch name is required' }}
          render={({ field }) => (
            <>
              <input
                {...field}
                type="text"
                className={errors.name ? inputErrorCls : inputCls}
                placeholder="Enter branch name"
              />
              {errors.name && <span className="text-[11px] text-red-400 mt-1">{errors.name.message}</span>}
            </>
          )}
        />
      </div>

      <div>
        <label className={labelCls}>Address *</label>
        <Controller
          name="address"
          control={control}
          rules={{ required: 'Address is required' }}
          render={({ field }) => (
            <>
              <textarea
                {...field}
                className={errors.address ? textareaCls.replace('border-white/[0.12]', 'border-red-500') : textareaCls}
                placeholder="Enter full address"
              />
              {errors.address && <span className="text-[11px] text-red-400 mt-1">{errors.address.message}</span>}
            </>
          )}
        />
      </div>

      <div>
        <label className={labelCls}>Phone Number *</label>
        <Controller
          name="phone"
          control={control}
          rules={{ required: 'Phone number is required' }}
          render={({ field }) => (
            <>
              <input
                {...field}
                type="tel"
                className={errors.phone ? inputErrorCls : inputCls}
                placeholder="Enter phone number"
              />
              {errors.phone && <span className="text-[11px] text-red-400 mt-1">{errors.phone.message}</span>}
            </>
          )}
        />
      </div>

      <div>
        <label className={labelCls}>Manager Name *</label>
        <Controller
          name="manager"
          control={control}
          rules={{ required: 'Manager name is required' }}
          render={({ field }) => (
            <>
              <input
                {...field}
                type="text"
                className={errors.manager ? inputErrorCls : inputCls}
                placeholder="Enter manager name"
              />
              {errors.manager && <span className="text-[11px] text-red-400 mt-1">{errors.manager.message}</span>}
            </>
          )}
        />
      </div>

      <div>
        <label className={labelCls}>Status *</label>
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
    </div>
  );
}

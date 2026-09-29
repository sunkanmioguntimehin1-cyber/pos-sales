'use client';
import { Controller, UseFormReturn } from 'react-hook-form';
import { useBranches } from '@/lib/hooks';
import { StaffFormData } from './types';

interface StaffFormProps {
  control: UseFormReturn<StaffFormData>['control'];
  errors: UseFormReturn<StaffFormData>['formState']['errors'];
  isEdit?: boolean;
}

const inputCls = "w-full h-9 px-3 bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-lg text-[var(--text)] text-[13px] placeholder:text-subtle outline-none focus:border-blue-500 transition-all";
const inputErrorCls = "w-full h-9 px-3 bg-[var(--surface-2)] border border-red-500 rounded-lg text-[var(--text)] text-[13px] placeholder:text-subtle outline-none focus:border-red-500 transition-all";
const labelCls = "block text-[10px] font-bold uppercase tracking-widest text-subtle mb-1.5";
const selectCls = "w-full h-9 px-3 bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-lg text-muted text-[13px] outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer pr-7 bg-[image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748B%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-no-repeat bg-[position:right_10px_center]";

export function StaffForm({ control, errors, isEdit }: StaffFormProps) {
  // Only needed for the location dropdown. The backend guarantees a head
  // office exists, so the list is never empty once it loads.
  const { data: branches = [], isLoading: isLoadingBranches } = useBranches();

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className={labelCls}>Full Name *</label>
        <Controller
          name="name"
          control={control}
          rules={{ required: 'Full name is required' }}
          render={({ field }) => (
            <>
              <input
                {...field}
                type="text"
                className={errors.name ? inputErrorCls : inputCls}
                placeholder="Enter full name"
              />
              {errors.name && <span className="text-[11px] text-red-400 mt-1">{errors.name.message}</span>}
            </>
          )}
        />
      </div>

      <div>
        <label className={labelCls}>Email Address *</label>
        <Controller
          name="email"
          control={control}
          rules={{
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          }}
          render={({ field }) => (
            <>
              <input
                {...field}
                type="email"
                className={errors.email ? inputErrorCls : inputCls}
                placeholder="Enter email address"
              />
              {errors.email && <span className="text-[11px] text-red-400 mt-1">{errors.email.message}</span>}
            </>
          )}
        />
      </div>

      <div>
        <label className={labelCls}>Role *</label>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <select {...field} className={selectCls}>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="cashier">Cashier</option>
            </select>
          )}
        />
      </div>

      <div>
        <label className={labelCls}>Works At</label>
        <Controller
          name="branchId"
          control={control}
          render={({ field }) => (
            <>
              <select {...field} value={field.value ?? ''} className={selectCls} disabled={isLoadingBranches}>
                {/* The head office is always the fallback, matching what the
                    backend files someone at when no branch is named. */}
                <option value="">Head Office (default)</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}{branch.type === 'head_office' ? ' (HQ)' : ''}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-subtle mt-1 block">
                {field.value
                  ? 'This person can only ring up sales at this location.'
                  : 'This person will be filed at the head office. Admins can work at any location.'}
              </span>
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
        <label className={labelCls}>{isEdit ? 'New Password (leave blank to keep current)' : 'Password *'}</label>
        <Controller
          name="password"
          control={control}
          rules={{
            required: isEdit ? false : 'Password is required',
            minLength: { value: 6, message: 'Password must be at least 6 characters' },
          }}
          render={({ field }) => (
            <>
              <input
                {...field}
                type="password"
                className={errors.password ? inputErrorCls : inputCls}
                placeholder={isEdit ? "Enter new password or leave blank" : "Enter password"}
              />
              {errors.password && <span className="text-[11px] text-red-400 mt-1">{errors.password.message}</span>}
            </>
          )}
        />
      </div>

      <div>
        <label className={labelCls}>{isEdit ? 'New PIN (leave blank to keep current)' : 'PIN Code (optional)'}</label>
        <Controller
          name="pin"
          control={control}
          rules={{
            minLength: { value: 4, message: 'PIN must be at least 4 digits' },
            maxLength: { value: 6, message: 'PIN must be at most 6 digits' },
          }}
          render={({ field }) => (
            <>
              <input
                {...field}
                type="password"
                maxLength={6}
                className={errors.pin ? inputErrorCls : inputCls}
                placeholder={isEdit ? "Enter new PIN or leave blank" : "Enter 4-6 digit PIN (optional)"}
              />
              {errors.pin && <span className="text-[11px] text-red-400 mt-1">{errors.pin.message}</span>}
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
            <select {...field} className={selectCls}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          )}
        />
      </div>
    </div>
  );
}

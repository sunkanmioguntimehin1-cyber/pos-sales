'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '@/components/ui/Modal';
import { IconUser } from '@/components/ui/Icons';
import { Customer } from './types';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (customer: Customer) => void;
}

interface FormData {
  name: string;
  phone: string;
  email: string;
}

export function AddCustomerModal({ isOpen, onClose, onAdd }: AddCustomerModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    setIsSubmitting(true);
    const newCustomer: Customer = {
      id: crypto.randomUUID(),
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email.trim(),
      tier: 'bronze',
      lastVisit: 'Today',
      totalSpent: 0,
      visitCount: 0,
      createdAt: new Date().toISOString(),
    };
    reset();
    setIsSubmitting(false);
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Customer"
      width="md"
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
            disabled={isSubmitting}
            className="h-9 px-4 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg text-[13px] font-semibold shadow-[0_2px_8px_rgba(59,130,246,0.3)] transition-all"
          >
            {isSubmitting ? 'Adding...' : 'Add Customer'}
          </button>
        </>
      }
    >
      <div className="flex items-center gap-3 mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="w-10 h-10 rounded-full bg-blue-500/15 flex items-center justify-center text-blue-400">
          <IconUser size={18} />
        </div>
        <div>
          <div className="text-[13px] font-semibold text-slate-100">Quick Add Customer</div>
          <div className="text-[11px] text-slate-400">Add a customer for this sale</div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
            Full Name *
          </label>
          <input
            {...register('name', { required: 'Name is required' })}
            type="text"
            className={`w-full h-9 px-3 bg-[#1E2535] border rounded-lg text-slate-100 text-[13px] placeholder:text-slate-500 outline-none transition-all ${
              errors.name ? 'border-red-500 focus:border-red-500' : 'border-white/[0.12] focus:border-blue-500'
            }`}
            placeholder="Enter customer name"
          />
          {errors.name && <span className="text-[11px] text-red-400 mt-1">{errors.name.message}</span>}
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
            Phone Number *
          </label>
          <input
            {...register('phone', { required: 'Phone is required' })}
            type="tel"
            className={`w-full h-9 px-3 bg-[#1E2535] border rounded-lg text-slate-100 text-[13px] placeholder:text-slate-500 outline-none transition-all ${
              errors.phone ? 'border-red-500 focus:border-red-500' : 'border-white/[0.12] focus:border-blue-500'
            }`}
            placeholder="+31 6 1234 5678"
          />
          {errors.phone && <span className="text-[11px] text-red-400 mt-1">{errors.phone.message}</span>}
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
            Email Address
          </label>
          <input
            {...register('email')}
            type="email"
            className="w-full h-9 px-3 bg-[#1E2535] border border-white/[0.12] rounded-lg text-slate-100 text-[13px] placeholder:text-slate-500 outline-none focus:border-blue-500 transition-all"
            placeholder="customer@email.com (optional)"
          />
        </div>
      </form>
    </Modal>
  );
}

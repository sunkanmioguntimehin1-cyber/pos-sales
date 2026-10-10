'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import { IconUser } from '@/components/ui/Icons';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Resolves once the customer is persisted so the caller can link them to the sale. */
  onAdd: (customer: {
    name: string;
    phone: string;
    email: string;
    address?: string;
    weddingAnniversary?: string;
    proposalAnniversary?: string;
    notes?: string;
  }) => Promise<void> | void;
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  weddingAnniversary: string;
  proposalAnniversary: string;
  notes: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AddCustomerModal({ isOpen, onClose, onAdd }: AddCustomerModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await onAdd({
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: data.email.trim(),
        address: data.address.trim() || undefined,
        weddingAnniversary: data.weddingAnniversary || undefined,
        proposalAnniversary: data.proposalAnniversary || undefined,
        notes: data.notes.trim() || undefined,
      });
      reset();
      onClose();
    } catch {
      toast.error('Could not add customer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
            className="h-9 px-4 bg-[var(--surface-2)] border border-[var(--border-strong)] text-muted hover:text-[var(--text)] rounded-lg text-[13px] font-semibold transition-all"
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
          <div className="text-[13px] font-semibold text-[var(--text)]">Quick Add Customer</div>
          <div className="text-[11px] text-muted">Add a customer for this sale</div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-subtle mb-1.5">
            Full Name *
          </label>
          <input
            {...register('name', { required: 'Name is required' })}
            type="text"
            className={`w-full h-9 px-3 bg-[var(--surface-2)] border rounded-lg text-[var(--text)] text-[13px] placeholder:text-subtle outline-none transition-all ${
              errors.name ? 'border-red-500 focus:border-red-500' : 'border-[var(--border-strong)] focus:border-blue-500'
            }`}
            placeholder="Enter customer name"
          />
          {errors.name && <span className="text-[11px] text-red-400 mt-1">{errors.name.message}</span>}
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-subtle mb-1.5">
            Phone Number *
          </label>
          <input
            {...register('phone', { required: 'Phone is required' })}
            type="tel"
            className={`w-full h-9 px-3 bg-[var(--surface-2)] border rounded-lg text-[var(--text)] text-[13px] placeholder:text-subtle outline-none transition-all ${
              errors.phone ? 'border-red-500 focus:border-red-500' : 'border-[var(--border-strong)] focus:border-blue-500'
            }`}
            placeholder="+31 6 1234 5678"
          />
          {errors.phone && <span className="text-[11px] text-red-400 mt-1">{errors.phone.message}</span>}
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-subtle mb-1.5">
            Email Address *
          </label>
          <input
            {...register('email', {
              required: 'Email is required',
              pattern: { value: EMAIL_PATTERN, message: 'Enter a valid email address' },
            })}
            type="email"
            className={`w-full h-9 px-3 bg-[var(--surface-2)] border rounded-lg text-[var(--text)] text-[13px] placeholder:text-subtle outline-none transition-all ${
              errors.email ? 'border-red-500 focus:border-red-500' : 'border-[var(--border-strong)] focus:border-blue-500'
            }`}
            placeholder="customer@email.com"
          />
          {errors.email && <span className="text-[11px] text-red-400 mt-1">{errors.email.message}</span>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-subtle mb-1.5">
              Wedding Anniversary
            </label>
            <input
              {...register('weddingAnniversary')}
              type="date"
              className="w-full h-9 px-3 bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-lg text-[var(--text)] text-[13px] outline-none focus:border-blue-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-subtle mb-1.5">
              Proposal Anniversary
            </label>
            <input
              {...register('proposalAnniversary')}
              type="date"
              className="w-full h-9 px-3 bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-lg text-[var(--text)] text-[13px] outline-none focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-subtle mb-1.5">
            Address
          </label>
          <input
            {...register('address')}
            type="text"
            className="w-full h-9 px-3 bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-lg text-[var(--text)] text-[13px] placeholder:text-subtle outline-none focus:border-blue-500 transition-all"
            placeholder="Enter customer address"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-subtle mb-1.5">
            Notes
          </label>
          <textarea
            {...register('notes')}
            rows={2}
            className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-lg text-[var(--text)] text-[13px] placeholder:text-subtle outline-none focus:border-blue-500 transition-all resize-none"
            placeholder="Optional notes about this customer"
          />
        </div>
      </form>
    </Modal>
  );
}

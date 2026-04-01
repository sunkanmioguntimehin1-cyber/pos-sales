'use client';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { IconMail, IconCheck } from '@/components/ui/Icons';
import { Customer, CartItem } from './types';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  cart: CartItem[];
  total: number;
  tax: number;
  subtotal: number;
  paymentMethod: string;
  staffName: string;
}

export function ReceiptModal({ isOpen, onClose, customer, cart, total, tax, subtotal, paymentMethod, staffName }: ReceiptModalProps) {
  const [email, setEmail] = useState(customer?.email || '');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendReceipt = async () => {
    if (!email) return;
    
    setIsSending(true);
    // Simulate sending receipt
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSending(false);
    setSent(true);
  };

  const handleClose = () => {
    setSent(false);
    setEmail(customer?.email || '');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Send Receipt"
      width="md"
      footer={
        <>
          <button
            onClick={handleClose}
            className="h-9 px-4 bg-[#1E2535] border border-white/[0.12] text-slate-400 hover:text-slate-200 rounded-lg text-[13px] font-semibold transition-all"
          >
            {sent ? 'Done' : 'Skip'}
          </button>
          {!sent && (
            <button
              onClick={handleSendReceipt}
              disabled={!email || isSending}
              className="h-9 px-4 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg text-[13px] font-semibold shadow-[0_2px_8px_rgba(59,130,246,0.3)] transition-all flex items-center gap-2"
            >
              {isSending ? (
                <>Sending...</>
              ) : (
                <>
                  <IconMail size={14} />
                  Send Receipt
                </>
              )}
            </button>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {sent ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500 flex items-center justify-center text-emerald-400">
              <IconCheck size={32} />
            </div>
            <div className="text-center">
              <div className="text-[15px] font-bold text-slate-100 mb-1">Receipt Sent Successfully!</div>
              <div className="text-[12px] text-slate-400">Receipt has been sent to {email}</div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-blue-500/15 flex items-center justify-center text-blue-400">
                <IconMail size={18} />
              </div>
              <div>
                <div className="text-[13px] font-semibold text-slate-100">Email Receipt</div>
                <div className="text-[11px] text-slate-400">Send a digital copy to the customer</div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-9 px-3 bg-[#1E2535] border border-white/[0.12] rounded-lg text-slate-100 text-[13px] placeholder:text-slate-500 outline-none focus:border-blue-500 transition-all"
                placeholder="customer@email.com"
              />
            </div>

            <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.07]">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Receipt Preview</div>
              </div>
              <div className="p-4">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-2">
                  <span>Tax (8.25%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[13px] font-bold text-slate-100 pt-2 border-t border-white/[0.07]">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-white/[0.07]">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Payment</span>
                    <span className="text-slate-200">{paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Cashier</span>
                    <span className="text-slate-200">{staffName}</span>
                  </div>
                  {customer && (
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Customer</span>
                      <span className="text-slate-200">{customer.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

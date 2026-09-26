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
  orderNumber?: string;
}

export function ReceiptModal({ isOpen, onClose, customer, cart, total, tax, subtotal, paymentMethod, staffName, orderNumber }: ReceiptModalProps) {
  // `email` was only seeded on mount, so opening the receipt for a customer
  // created during the sale left the field blank. The parent keys this
  // component on the order number, so each sale starts from clean state —
  // no effect needed to sync the field.
  const [email, setEmail] = useState(customer?.email ?? '');
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
    setEmail(customer?.email ?? '');
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
            className="h-9 px-4 bg-[var(--surface-2)] border border-[var(--border-strong)] text-muted hover:text-[var(--text)] rounded-lg text-[13px] font-semibold transition-all"
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
              <div className="text-[15px] font-bold text-[var(--text)] mb-1">Receipt Sent Successfully!</div>
              <div className="text-[12px] text-muted">Receipt has been sent to {email}</div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-blue-500/15 flex items-center justify-center text-blue-400">
                <IconMail size={18} />
              </div>
              <div>
                <div className="text-[13px] font-semibold text-[var(--text)]">Email Receipt</div>
                <div className="text-[11px] text-muted">Send a digital copy to the customer</div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-subtle mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-9 px-3 bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-lg text-[var(--text)] text-[13px] placeholder:text-subtle outline-none focus:border-blue-500 transition-all"
                placeholder="customer@email.com"
              />
            </div>

            <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--border)]">
                <div className="text-[10px] font-bold uppercase tracking-widest text-subtle">Receipt Preview</div>
              </div>
              <div className="p-4">
                <div className="flex justify-between text-[11px] text-muted mb-1">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-muted mb-2">
                  <span>Tax (8.25%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[13px] font-bold text-[var(--text)] pt-2 border-t border-[var(--border)]">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-[var(--border)]">
                  {orderNumber && (
                    <div className="flex justify-between text-[11px] text-muted">
                      <span>Order</span>
                      <span className="font-mono text-[var(--text)]">{orderNumber}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[11px] text-muted">
                    <span>Payment</span>
                    <span className="text-[var(--text)]">{paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-muted">
                    <span>Cashier</span>
                    <span className="text-[var(--text)]">{staffName}</span>
                  </div>
                  {customer && (
                    <div className="flex justify-between text-[11px] text-muted">
                      <span>Customer</span>
                      <span className="text-[var(--text)]">{customer.name}</span>
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

'use client';
import { useState } from 'react';
import { IconCheck } from '@/components/ui/Icons';

interface PaymentMethodSettingsProps {
  onUpdate?: (methods: PaymentMethodConfig) => void;
}

interface PaymentMethodConfig {
  cash: boolean;
  transfer: {
    gtb: boolean;
    firstbank: boolean;
  };
  pos: {
    gtb: boolean;
    firstbank: boolean;
  };
}

export function PaymentMethodSettings({ onUpdate }: PaymentMethodSettingsProps) {
  const [methods, setMethods] = useState<PaymentMethodConfig>({
    cash: true,
    transfer: {
      gtb: true,
      firstbank: true,
    },
    pos: {
      gtb: true,
      firstbank: true,
    },
  });

  const toggleMethod = (key: keyof PaymentMethodConfig) => {
    const updated = { ...methods, [key]: !methods[key] };
    setMethods(updated);
    onUpdate?.(updated);
  };

  const toggleBank = (bank: 'gtb' | 'firstbank') => {
    const updated = {
      ...methods,
      transfer: { ...methods.transfer, [bank]: !methods.transfer[bank] },
    };
    setMethods(updated);
    onUpdate?.(updated);
  };

  const togglePOS = (bank: 'gtb' | 'firstbank') => {
    const updated = {
      ...methods,
      pos: { ...methods.pos, [bank]: !methods.pos[bank] },
    };
    setMethods(updated);
    onUpdate?.(updated);
  };

  const hasTransfer = methods.transfer.gtb || methods.transfer.firstbank;
  const hasPOS = methods.pos.gtb || methods.pos.firstbank;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-[15px] font-bold text-slate-100">Payment Methods</h3>
        <p className="text-[12px] text-slate-500 mt-0.5">Configure which payment methods are available at POS</p>
      </div>

      <div className="bg-[#161B27] border border-white/[0.07] rounded-xl overflow-hidden">
        {/* Cash */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07]">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💵</span>
            <div>
              <div className="text-[13px] font-semibold text-slate-100">Cash</div>
              <div className="text-[11px] text-slate-500">Accept cash payments with change calculation</div>
            </div>
          </div>
          <button
            onClick={() => toggleMethod('cash')}
            className={`w-12 h-7 rounded-full transition-all relative ${
              methods.cash ? 'bg-emerald-500' : 'bg-slate-600'
            }`}
          >
            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${
              methods.cash ? 'left-6' : 'left-1'
            }`} />
          </button>
        </div>

        {/* Transfer */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07]">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏦</span>
            <div>
              <div className="text-[13px] font-semibold text-slate-100">Bank Transfer</div>
              <div className="text-[11px] text-slate-500">Accept bank transfers (GTBank, FirstBank)</div>
            </div>
          </div>
          <button
            onClick={() => toggleMethod('transfer')}
            className={`w-12 h-7 rounded-full transition-all relative ${
              hasTransfer ? 'bg-emerald-500' : 'bg-slate-600'
            }`}
          >
            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${
              hasTransfer ? 'left-6' : 'left-1'
            }`} />
          </button>
        </div>

        {hasTransfer && (
          <div className="px-4 py-3 bg-[#1E2535] border-b border-white/[0.07]">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => toggleBank('gtb')}
                className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${
                  methods.transfer.gtb
                    ? 'border-blue-500/50 bg-blue-500/10 text-blue-400'
                    : 'border-white/[0.12] text-slate-400 hover:border-white/[0.2]'
                }`}
              >
                <span className="text-[12px] font-semibold">GTBank</span>
                {methods.transfer.gtb && <IconCheck size={14} />}
              </button>
              <button
                onClick={() => toggleBank('firstbank')}
                className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${
                  methods.transfer.firstbank
                    ? 'border-blue-500/50 bg-blue-500/10 text-blue-400'
                    : 'border-white/[0.12] text-slate-400 hover:border-white/[0.2]'
                }`}
              >
                <span className="text-[12px] font-semibold">FirstBank</span>
                {methods.transfer.firstbank && <IconCheck size={14} />}
              </button>
            </div>
          </div>
        )}

        {/* POS Machine */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💳</span>
            <div>
              <div className="text-[13px] font-semibold text-slate-100">POS Machine</div>
              <div className="text-[11px] text-slate-500">Accept card payments via POS terminals</div>
            </div>
          </div>
          <button
            onClick={() => toggleMethod('pos')}
            className={`w-12 h-7 rounded-full transition-all relative ${
              hasPOS ? 'bg-emerald-500' : 'bg-slate-600'
            }`}
          >
            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${
              hasPOS ? 'left-6' : 'left-1'
            }`} />
          </button>
        </div>

        {hasPOS && (
          <div className="px-4 py-3 bg-[#1E2535] border-t border-white/[0.07]">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => togglePOS('gtb')}
                className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${
                  methods.pos.gtb
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                    : 'border-white/[0.12] text-slate-400 hover:border-white/[0.2]'
                }`}
              >
                <span className="text-[12px] font-semibold">GTBank POS</span>
                {methods.pos.gtb && <IconCheck size={14} />}
              </button>
              <button
                onClick={() => togglePOS('firstbank')}
                className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${
                  methods.pos.firstbank
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                    : 'border-white/[0.12] text-slate-400 hover:border-white/[0.2]'
                }`}
              >
                <span className="text-[12px] font-semibold">FirstBank POS</span>
                {methods.pos.firstbank && <IconCheck size={14} />}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div>
            <div className="text-[12px] font-semibold text-amber-400">Tip</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Disabling a payment method will hide it from the POS terminal. You can enable/disable methods based on your store&apos;s capabilities.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

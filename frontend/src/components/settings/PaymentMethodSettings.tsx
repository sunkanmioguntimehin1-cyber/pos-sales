'use client';
import { useState } from 'react';
import { IconCheck } from '@/components/ui/Icons';
import { useStore, useUpdateStore } from '@/lib/hooks';
import type { PaymentMethodConfig } from '@/lib/api/store';

const DEFAULT_METHODS: PaymentMethodConfig = {
  cash: true,
  transfer: { enabled: true, gtb: true, firstbank: true },
  pos: {
    enabled: true,
    terminals: [
      { id: 'gtb_pos', name: 'GTBank POS', enabled: true, type: 'gtb' },
      { id: 'firstbank_pos', name: 'FirstBank POS', enabled: true, type: 'firstbank' },
    ],
  },
};

export function PaymentMethodSettings() {
  const { data: store } = useStore();
  const updateStore = useUpdateStore();

  // Local copy of the persisted config. `null` means "not edited yet", so the
  // server value stays authoritative until the first toggle — no effect needed.
  const [methods, setMethods] = useState<PaymentMethodConfig | null>(null);
  const current = methods ?? store?.settings?.paymentMethods ?? DEFAULT_METHODS;

  const persist = (next: PaymentMethodConfig) => {
    setMethods(next);
    updateStore.mutate({ settings: { ...store?.settings, paymentMethods: next } });
  };

  /**
   * The previous version called `!methods[key]` on the `transfer`/`pos`
   * *objects*, which is always false, so switching them off assigned the
   * boolean `true` and destroyed the nested shape.
   */
  const toggleMethod = (key: 'cash') => {
    persist({ ...current, [key]: !current[key] });
  };

  const toggleGroup = (group: 'transfer' | 'pos') => {
    const groupConfig = current[group];
    persist({
      ...current,
      [group]: {
        ...current,
        enabled: !groupConfig.enabled,
        // Turning the group off must also drop the individual selections,
        // otherwise re-enabling silently restores stale banks.
        gtb: !groupConfig.enabled ? false : groupConfig.gtb,
        firstbank: !groupConfig.enabled ? false : groupConfig.firstbank,
      },
    });
  };

  const toggleBank = (group: 'transfer' | 'pos', bank: 'gtb' | 'firstbank') => {
    const groupConfig = current[group];
    persist({ ...current, [group]: { ...groupConfig, [bank]: !groupConfig[bank] } });
  };

  const togglePosTerminal = (terminalId: string) => {
    const terminals = current.pos.terminals || [];
    const updated = terminals.map((t) =>
      t.id === terminalId ? { ...t, enabled: !t.enabled } : t
    );
    persist({
      ...current,
      pos: {
        ...current.pos,
        terminals: updated,
      },
    });
  };

  const addPosTerminal = () => {
    const name = prompt('Enter POS terminal name (e.g., Zenith Bank POS)');
    if (!name || !name.trim()) return;
    const id = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
    const terminals = current.pos.terminals || [];
    if (terminals.some((t) => t.id === id)) {
      alert('A terminal with a similar name already exists');
      return;
    }
    persist({
      ...current,
      pos: {
        ...current.pos,
        terminals: [
          ...terminals,
          {
            id: id || `pos_${Date.now()}`,
            name: name.trim(),
            enabled: true,
            type: 'other',
          },
        ],
      },
    });
  };

  const removePosTerminal = (terminalId: string) => {
    if (!confirm('Remove this POS terminal?')) return;
    const terminals = current.pos.terminals || [];
    persist({
      ...current,
      pos: {
        ...current.pos,
        terminals: terminals.filter((t) => t.id !== terminalId),
      },
    });
  };


  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-[15px] font-bold text-[var(--text)]">Payment Methods</h3>
        <p className="text-[12px] text-subtle mt-0.5">Configure which payment methods are available at POS</p>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
        {/* Cash */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💵</span>
            <div>
              <div className="text-[13px] font-semibold text-[var(--text)]">Cash</div>
              <div className="text-[11px] text-subtle">Accept cash payments with change calculation</div>
            </div>
          </div>
          <button
            onClick={() => toggleMethod('cash')}
            aria-pressed={current.cash}
            className={`w-12 h-7 rounded-full transition-all relative ${
              current.cash ? 'bg-emerald-500' : 'bg-[var(--surface-2)]'
            }`}
          >
            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${
              current.cash ? 'left-6' : 'left-1'
            }`} />
          </button>
        </div>

        {/* Transfer */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏦</span>
            <div>
              <div className="text-[13px] font-semibold text-[var(--text)]">Bank Transfer</div>
              <div className="text-[11px] text-subtle">Accept bank transfers (GTBank, FirstBank)</div>
            </div>
          </div>
          <button
            onClick={() => toggleGroup('transfer')}
            aria-pressed={current.transfer.enabled}
            className={`w-12 h-7 rounded-full transition-all relative ${
              current.transfer.enabled ? 'bg-emerald-500' : 'bg-[var(--surface-2)]'
            }`}
          >
            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${
              current.transfer.enabled ? 'left-6' : 'left-1'
            }`} />
          </button>
        </div>

        {current.transfer.enabled && (
          <div className="px-4 py-3 bg-[var(--surface-2)] border-b border-[var(--border)]">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => toggleBank('transfer', 'gtb')}
                className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${
                  current.transfer.gtb
                    ? 'border-blue-500/50 bg-blue-500/10 text-blue-400'
                    : 'border-[var(--border-strong)] text-muted hover:border-[var(--border-strong)]'
                }`}
              >
                <span className="text-[12px] font-semibold">GTBank</span>
                {current.transfer.gtb && <IconCheck size={14} />}
              </button>
              <button
                onClick={() => toggleBank('transfer', 'firstbank')}
                className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${
                  current.transfer.firstbank
                    ? 'border-blue-500/50 bg-blue-500/10 text-blue-400'
                    : 'border-[var(--border-strong)] text-muted hover:border-[var(--border-strong)]'
                }`}
              >
                <span className="text-[12px] font-semibold">FirstBank</span>
                {current.transfer.firstbank && <IconCheck size={14} />}
              </button>
            </div>
          </div>
        )}

        {/* POS Machine */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💳</span>
            <div>
              <div className="text-[13px] font-semibold text-[var(--text)]">POS Machine</div>
              <div className="text-[11px] text-subtle">Accept card payments via POS terminals</div>
            </div>
          </div>
          <button
            onClick={() => toggleGroup('pos')}
            aria-pressed={current.pos.enabled}
            className={`w-12 h-7 rounded-full transition-all relative ${
              current.pos.enabled ? 'bg-emerald-500' : 'bg-[var(--surface-2)]'
            }`}
          >
            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${
              current.pos.enabled ? 'left-6' : 'left-1'
            }`} />
          </button>
        </div>

        {current.pos.enabled && (
          <div className="px-4 py-3 bg-[var(--surface-2)] border-t border-[var(--border)]">
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                {(current.pos.terminals || []).map((terminal) => (
                  <div
                    key={terminal.id}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${
                      terminal.enabled
                        ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                        : 'border-[var(--border-strong)] text-muted hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => togglePosTerminal(terminal.id)}
                      className="flex items-center gap-1 min-w-0 flex-1 text-left"
                    >
                      <span className="text-[12px] font-semibold truncate pr-2">{terminal.name}</span>
                      {terminal.enabled && <IconCheck size={14} className="flex-shrink-0" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => removePosTerminal(terminal.id)}
                      title="Remove this POS terminal"
                      className="text-red-400 hover:text-red-300 text-sm leading-none flex-shrink-0 ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addPosTerminal}
                className="h-8 px-3 rounded-lg border border-dashed border-[var(--border-strong)] text-[11px] text-muted hover:text-[var(--text)] hover:border-[var(--border)] transition-all"
              >
                + Add Another POS Machine
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
            <div className="text-[11px] text-muted mt-0.5">
              Disabling a payment method hides it from the POS terminal. Changes are saved to the store record immediately.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

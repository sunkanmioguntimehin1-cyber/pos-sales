'use client';
import { IconArrowDown, IconArrowUp, IconHistory } from '@/components/ui/Icons';
import { InventoryItem, StockLog } from './types';

interface StockHistoryPanelProps {
  product: InventoryItem;
  logs: StockLog[];
}

const logIcon = (t: string) => {
  switch (t) {
    case 'sale': return '🛍️';
    case 'receive': return '📦';
    case 'adjust': return '🔧';
    case 'damage': return '⚠️';
    case 'transfer': return '↔️';
    default: return '📋';
  }
};

const logColorCls = (t: string) => {
  switch (t) {
    case 'sale': return 'text-red-400 bg-red-500/10';
    case 'receive': return 'text-emerald-400 bg-emerald-500/10';
    case 'adjust': return 'text-amber-400 bg-amber-500/10';
    case 'damage': return 'text-red-400 bg-red-500/10';
    case 'transfer': return 'text-blue-400 bg-blue-500/10';
    default: return 'text-slate-400 bg-slate-500/10';
  }
};

const typeLabel = (t: string) => {
  switch (t) {
    case 'sale': return 'Sale';
    case 'receive': return 'Received';
    case 'adjust': return 'Adjustment';
    case 'damage': return 'Damage';
    case 'transfer': return 'Transfer';
    default: return 'Other';
  }
};

export function StockHistoryPanel({ product, logs }: StockHistoryPanelProps) {
  const productLogs = logs.filter(
    log => log.product.toLowerCase() === product.name.toLowerCase()
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl p-4">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Current Stock</div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-[#161B27] rounded-lg border border-white/[0.07]">
            <div className="text-[10px] text-slate-500 mb-1">On Hand</div>
            <div className="text-lg font-extrabold text-slate-100">{product.onHand}</div>
          </div>
          <div className="text-center p-3 bg-[#161B27] rounded-lg border border-white/[0.07]">
            <div className="text-[10px] text-slate-500 mb-1">Reserved</div>
            <div className="text-lg font-extrabold text-slate-100">{product.reserved}</div>
          </div>
          <div className="text-center p-3 bg-[#161B27] rounded-lg border border-white/[0.07]">
            <div className="text-[10px] text-slate-500 mb-1">Available</div>
            <div className="text-lg font-extrabold text-emerald-400">{product.available}</div>
          </div>
        </div>
      </div>

      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
          <IconHistory size={12} />
          Movement History
        </div>
        {productLogs.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-[13px]">
            No movement history found for this product
          </div>
        ) : (
          <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl overflow-hidden">
            {productLogs.map((log, index) => (
              <div
                key={log.id}
                className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.07] last:border-0"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-base ${logColorCls(log.type)}`}>
                  {logIcon(log.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-slate-100">{typeLabel(log.type)}</div>
                  <div className="text-[11px] text-slate-500 mt-px">{log.ref} · {log.user}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-extrabold tabular-nums flex items-center gap-1 ${log.qty > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {log.qty > 0 ? <IconArrowUp size={12} /> : <IconArrowDown size={12} />}
                    {log.qty > 0 ? '+' : ''}{log.qty}
                  </div>
                  <div className="text-[10px] text-slate-500">{log.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl p-4">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Product Info</div>
        <div className="grid grid-cols-2 gap-3 text-[12px]">
          <div>
            <div className="text-slate-500">Code</div>
            <div className="text-slate-100 font-mono">{product.productCode}</div>
          </div>
          <div>
            <div className="text-slate-500">Location</div>
            <div className="text-slate-100">{product.location}</div>
          </div>
          <div>
            <div className="text-slate-500">Color</div>
            <div className="text-slate-100">{product.color}</div>
          </div>
          <div>
            <div className="text-slate-500">Size</div>
            <div className="text-slate-100">{product.size}</div>
          </div>
          <div>
            <div className="text-slate-500">Reorder Point</div>
            <div className="text-slate-100">{product.reorder}</div>
          </div>
          <div>
            <div className="text-slate-500">Last Updated</div>
            <div className="text-slate-100">{product.updated}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

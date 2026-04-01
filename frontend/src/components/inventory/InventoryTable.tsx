'use client';
import { useState } from 'react';
import { IconSearch, IconPlus, IconEdit, IconHistory, IconPrinter, IconSliders } from '@/components/ui/Icons';
import { InventoryItem, StockLog } from './types';

interface InventoryTableProps {
  inventory: InventoryItem[];
  logs: StockLog[];
  onAddInventory: () => void;
  onAdjustStock: () => void;
  onViewHistory: (item: InventoryItem) => void;
  onPrint: (item: InventoryItem) => void;
}

const selectCls = "w-full h-9 px-3 bg-[#1E2535] border border-white/[0.12] rounded-lg text-slate-300 text-[13px] outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer pr-7 bg-[image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748B%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-no-repeat bg-[position:right_10px_center]";

const logIcon = (t: string) => t === 'sale' ? '🛍️' : t === 'receive' ? '📦' : '🔧';
const logColorCls = (t: string) => t === 'sale' ? 'text-red-400 bg-red-500/10' : t === 'receive' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10';
const stockColorCls = (s: string) => s === 'ok' ? 'text-slate-100' : s === 'low' ? 'text-amber-400' : 'text-red-400';
const stockBadge = (s: string) => {
  if (s === 'ok')       return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400">In Stock</span>;
  if (s === 'low')      return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400">Low</span>;
  if (s === 'critical') return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400">Critical</span>;
  return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400">Out</span>;
};

export function InventoryTable({ inventory, logs, onAddInventory, onAdjustStock, onViewHistory, onPrint }: InventoryTableProps) {
  const [tab, setTab] = useState<'stock' | 'logs'>('stock');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');

  const categories = ['Electronics', 'Cases', 'Accessories', 'Cables'];

  const filtered = inventory.filter(item =>
    (catFilter === 'All' || item.name.toLowerCase().includes(catFilter.toLowerCase())) &&
    (item.name.toLowerCase().includes(search.toLowerCase()) || 
     item.productCode.toLowerCase().includes(search.toLowerCase()) ||
     item.color.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="bg-[#161B27] border border-white/[0.07] rounded-xl overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-2.5 border-b border-white/[0.07] flex-wrap">
        <div className="flex gap-0.5 p-[3px] bg-[#1E2535] rounded-xl border border-white/[0.07] flex-shrink-0">
          {(['stock', 'logs'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all border ${
                tab === t ? 'bg-[#161B27] border-white/[0.12] text-slate-100 shadow-sm' : 'bg-transparent border-transparent text-slate-500 hover:text-slate-400'
              }`}
            >
              {t === 'stock' ? 'Stock Levels' : 'Movement Log'}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
            <IconSearch size={14} />
          </span>
          <input 
            className="w-full h-9 pl-8 pr-3 bg-[#1E2535] border border-white/[0.12] rounded-lg text-slate-100 text-[13px] placeholder:text-slate-500 outline-none focus:border-blue-500 transition-all" 
            placeholder={tab === 'stock' ? "Search by name, code, or color…" : "Search logs…"} 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        {tab === 'stock' && (
          <select className={selectCls} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            <option value="All">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
        <div className="flex-1" />
        {tab === 'stock' && (
          <>
            <button
              onClick={onAdjustStock}
              className="h-9 flex items-center gap-1.5 px-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[13px] font-semibold shadow-[0_2px_8px_rgba(245,158,11,0.3)] transition-all"
            >
              <IconSliders size={12} /> Adjust Stock
            </button>
            <button
              onClick={onAddInventory}
              className="h-9 flex items-center gap-1.5 px-3.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[13px] font-semibold shadow-[0_2px_8px_rgba(59,130,246,0.3)] transition-all"
            >
              <IconPlus size={12} /> Add Inventory
            </button>
          </>
        )}
      </div>

      {tab === 'stock' ? (
        <StockTable items={filtered} onViewHistory={onViewHistory} onPrint={onPrint} />
      ) : (
        <LogsTable logs={logs} />
      )}

      <div className="px-4 py-2.5 border-t border-white/[0.07] bg-[#1E2535] flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {tab === 'stock' 
            ? `Showing ${filtered.length} of ${inventory.length} items`
            : `Showing ${logs.length} log entries`
          }
        </span>
        <div className="flex gap-1">
          {['Prev', '1', 'Next'].map((p, i) => (
            <button 
              key={p} 
              className={`h-7 min-w-[28px] px-2 flex items-center justify-center rounded-md text-xs font-semibold transition-all ${
                i === 1 ? 'bg-blue-500 text-white' : 'bg-[#252D3D] border border-white/[0.12] text-slate-400 hover:text-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StockTable({ items, onViewHistory, onPrint }: { items: InventoryItem[]; onViewHistory: (item: InventoryItem) => void; onPrint: (item: InventoryItem) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {['Product', 'Code', 'Color', 'Size', 'On Hand', 'Reserved', 'Available', 'Reorder Pt.', 'Location', 'Status', 'Actions'].map(h => (
              <th key={h} className="px-3.5 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-white/[0.07] bg-[#1E2535] whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr 
              key={item.productCode} 
              className={`hover:bg-white/[0.02] transition-colors ${(item.status === 'critical' || item.status === 'out') ? 'bg-red-500/[0.04]' : ''}`}
            >
              <td className="px-3.5 py-3 border-b border-white/[0.07] font-semibold text-slate-100 text-[13px]">{item.name}</td>
              <td className="px-3.5 py-3 border-b border-white/[0.07]">
                <span className="font-mono text-[11px] text-slate-500">{item.productCode}</span>
              </td>
              <td className="px-3.5 py-3 border-b border-white/[0.07] text-xs text-slate-400">{item.color}</td>
              <td className="px-3.5 py-3 border-b border-white/[0.07] text-xs text-slate-400">{item.size}</td>
              <td className={`px-3.5 py-3 border-b border-white/[0.07] font-extrabold tabular-nums ${stockColorCls(item.status)}`}>{item.onHand}</td>
              <td className="px-3.5 py-3 border-b border-white/[0.07] text-slate-500 tabular-nums text-xs">{item.reserved}</td>
              <td className={`px-3.5 py-3 border-b border-white/[0.07] font-extrabold tabular-nums ${stockColorCls(item.status)}`}>{item.available}</td>
              <td className="px-3.5 py-3 border-b border-white/[0.07] text-slate-500 tabular-nums text-xs">{item.reorder}</td>
              <td className="px-3.5 py-3 border-b border-white/[0.07]">
                <span className="font-mono text-[10px] bg-[#1E2535] px-1.5 py-0.5 rounded border border-white/[0.07]">{item.location}</span>
              </td>
              <td className="px-3.5 py-3 border-b border-white/[0.07]">{stockBadge(item.status)}</td>
              <td className="px-3.5 py-3 border-b border-white/[0.07]">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onViewHistory(item)}
                    className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                    title="View History"
                  >
                    <IconHistory size={14} />
                  </button>
                  <button
                    onClick={() => onPrint(item)}
                    className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
                    title="Print Label"
                  >
                    <IconPrinter size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LogsTable({ logs }: { logs: StockLog[] }) {
  return (
    <div>
      {logs.map((log, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.07] last:border-0">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-base ${logColorCls(log.type)}`}>
            {logIcon(log.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-slate-100">{log.product}</div>
            <div className="text-[11px] text-slate-500 mt-px">{log.ref} · {log.user}</div>
          </div>
          <div className="text-right">
            <div className={`text-sm font-extrabold tabular-nums ${log.qty > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {log.qty > 0 ? '+' : ''}{log.qty}
            </div>
            <div className="text-[10px] text-slate-500">{log.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

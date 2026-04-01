'use client';
import { useState } from 'react';
import { IconSearch, IconDownload, IconReceipt } from '@/components/ui/Icons';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { useOrders, Order } from '@/lib/hooks';

const selectCls = "h-9 px-3 bg-[#1E2535] border border-white/[0.12] rounded-lg text-slate-300 text-[13px] outline-none focus:border-blue-500 transition-all appearance-none";

export function OrdersScreen() {
  const [search, setSearch]   = useState('');
  const [statusF, setStatusF] = useState('All');

  const { data: orders = [], isLoading } = useOrders({
    status: statusF !== 'All' ? statusF.toLowerCase() : undefined,
  });

  const filtered = orders.filter(o =>
    (statusF === 'All' || o.status === statusF.toLowerCase()) &&
    (o.orderNumber.toLowerCase().includes(search.toLowerCase()) || (o.customer?.name || 'Walk-in').toLowerCase().includes(search.toLowerCase()))
  );

  const revenue  = filtered.filter(o => o.status === 'completed').reduce((s, o) => s + o.total, 0);
  const refunded = filtered.filter(o => o.status === 'refunded').reduce((s, o) => s + o.total, 0);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Paid';
      case 'refunded': return 'Refunded';
      case 'cancelled': return 'Voided';
      case 'pending': return 'Pending';
      default: return status;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div className="flex flex-col gap-4">

      <div className="grid grid-cols-4 gap-3">
        <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">Revenue (today)</div>
          <div className="text-[22px] font-extrabold tabular-nums text-emerald-400">{isLoading ? '...' : `$${revenue.toFixed(2)}`}</div>
        </div>
        <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">Transactions</div>
          <div className="text-[22px] font-extrabold tabular-nums text-blue-400">{isLoading ? '...' : filtered.filter(o => o.status === 'completed').length}</div>
        </div>
        <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">Refunded</div>
          <div className="text-[22px] font-extrabold tabular-nums text-amber-400">{isLoading ? '...' : `$${refunded.toFixed(2)}`}</div>
        </div>
        <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">Voided</div>
          <div className="text-[22px] font-extrabold tabular-nums text-red-400">{isLoading ? '...' : filtered.filter(o => o.status === 'cancelled').length}</div>
        </div>
      </div>

      <div className="bg-[#161B27] border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="px-4 py-3 flex items-center gap-2.5 border-b border-white/[0.07] flex-wrap">
          <div className="relative max-w-[260px]">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"><IconSearch size={14} /></span>
            <input className="w-full h-9 pl-8 pr-3 bg-[#1E2535] border border-white/[0.12] rounded-lg text-slate-100 text-[13px] placeholder:text-slate-500 outline-none focus:border-blue-500 transition-all" placeholder="Search order #, customer..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className={selectCls} value={statusF} onChange={e => setStatusF(e.target.value)}>
            {['All', 'Paid', 'Refunded', 'Voided'].map(s => <option key={s}>{s}</option>)}
          </select>
          <select className={selectCls}>
            {['Today', 'Yesterday', 'This week', 'This month'].map(d => <option key={d}>{d}</option>)}
          </select>
          <div className="flex-1" />
          <button className="h-9 flex items-center gap-1.5 px-3.5 bg-[#1E2535] border border-white/[0.12] text-slate-400 hover:text-slate-200 hover:bg-[#252D3D] rounded-lg text-[13px] font-semibold transition-all">
            <IconDownload size={12} /> Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-4">
              <SkeletonTable rows={5} cols={9} />
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {['Order ID', 'Customer', 'Cashier', 'Items', 'Method', 'Total', 'Time', 'Status', ''].map(h => (
                    <th key={h} className="px-3.5 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-white/[0.07] bg-[#1E2535] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-3.5 py-3 border-b border-white/[0.07]">
                      <span className="font-mono text-[12px] text-blue-400 font-bold">{o.orderNumber}</span>
                    </td>
                    <td className="px-3.5 py-3 border-b border-white/[0.07] text-slate-200 font-medium text-sm">{o.customer?.name || 'Walk-in'}</td>
                    <td className="px-3.5 py-3 border-b border-white/[0.07] text-slate-400 text-xs">{o.staff?.name || '-'}</td>
                    <td className="px-3.5 py-3 border-b border-white/[0.07]">
                      <span className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-full bg-[#1E2535] text-[11px] font-bold text-slate-300">{o.items.length}</span>
                    </td>
                    <td className="px-3.5 py-3 border-b border-white/[0.07]">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${o.paymentMethod === 'cash' ? 'bg-slate-500/15 text-slate-400' : 'bg-blue-500/15 text-blue-400'}`}>{o.paymentMethod || '-'}</span>
                    </td>
                    <td className="px-3.5 py-3 border-b border-white/[0.07] font-bold tabular-nums text-sm text-slate-100">${o.total.toFixed(2)}</td>
                    <td className="px-3.5 py-3 border-b border-white/[0.07] text-xs text-slate-500">{formatTime(o.createdAt)}</td>
                    <td className="px-3.5 py-3 border-b border-white/[0.07]">
                      {o.status === 'completed' && <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400">Paid</span>}
                      {o.status === 'refunded' && <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400">Refunded</span>}
                      {o.status === 'cancelled' && <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400">Voided</span>}
                      {o.status === 'pending' && <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400">Pending</span>}
                    </td>
                    <td className="px-3.5 py-3 border-b border-white/[0.07]">
                      <button className="w-7 h-7 flex items-center justify-center rounded-md bg-[#1E2535] border border-white/[0.12] text-slate-400 hover:text-slate-200 transition-all">
                        <IconReceipt size={11} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-4 py-2.5 border-t border-white/[0.07] bg-[#1E2535] flex items-center justify-between">
          <span className="text-xs text-slate-500">Showing {filtered.length} of {orders.length} orders</span>
          <div className="flex gap-1">
            {['← Prev', '1', '2', '3', 'Next →'].map((p, i) => (
              <button key={p} className={`h-7 min-w-[32px] px-2 flex items-center justify-center rounded-md text-xs font-semibold transition-all ${i === 1 ? 'bg-blue-500 text-white' : 'bg-[#252D3D] border border-white/[0.12] text-slate-400 hover:text-slate-200'}`}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

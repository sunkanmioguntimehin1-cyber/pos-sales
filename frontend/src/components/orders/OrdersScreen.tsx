'use client';
import { useState } from 'react';
import {
  IconSearch, IconDownload, IconReceipt, IconStore, IconRefresh, IconX, IconAlertTriangle,
} from '@/components/ui/Icons';
import { Modal } from '@/components/ui/Modal';
import { SkeletonTable } from '@/components/ui/Skeleton';
import {
  useOrders, useUpdateOrderStatus, Order,
  getOrderCustomerName, getOrderStaffName, getOrderBranchName,
} from '@/lib/hooks';
import { useCan } from '@/lib/auth/can';

const selectCls = "h-9 px-3 bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-lg text-muted text-[13px] outline-none focus:border-blue-500 transition-all appearance-none";

/**
 * `value` is the real Order status enum. The old options were UI labels
 * ('Paid', 'Voided') that were lowercased into 'paid'/'voided' and matched
 * nothing against the backend's completed/cancelled values. Labels are kept in
 * step with the enum so the filter, the badges and the API never disagree.
 */
const STATUS_OPTIONS: { value: Order['status']; label: string }[] = [
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'cancelled', label: 'Cancelled' },
];

const ALL_STATUSES = 'all';

const STATUS_BADGE_CLASS: Record<Order['status'], string> = {
  completed: 'bg-emerald-500/15 text-emerald-400',
  pending: 'bg-blue-500/15 text-blue-400',
  refunded: 'bg-amber-500/15 text-amber-400',
  cancelled: 'bg-red-500/15 text-red-400',
};

const DATE_RANGES = {
  Today: () => ({ startDate: startOfDay(new Date()), endDate: endOfDay(new Date()) }),
  Yesterday: () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return { startDate: startOfDay(d), endDate: endOfDay(d) };
  },
  'This week': () => {
    const d = new Date();
    const start = new Date(d);
    start.setDate(d.getDate() - d.getDay());
    return { startDate: startOfDay(start), endDate: endOfDay(d) };
  },
  'This month': () => {
    const d = new Date();
    return {
      startDate: startOfDay(new Date(d.getFullYear(), d.getMonth(), 1)),
      endDate: endOfDay(d),
    };
  },
} as const;

type DateRangeKey = keyof typeof DATE_RANGES;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

/** Both of these put the goods back on the shelf at the selling location. */
const RESTOCKING_ACTIONS: { value: Order['status']; label: string; verb: string }[] = [
  { value: 'cancelled', label: 'Cancel', verb: 'cancel' },
  { value: 'refunded', label: 'Refund', verb: 'refund' },
];

export function OrdersScreen() {
  const [search, setSearch]   = useState('');
  const [statusF, setStatusF] = useState<string>(ALL_STATUSES);
  const [dateF, setDateF]     = useState<DateRangeKey | 'All'>('All');
  const [pendingAction, setPendingAction] = useState<{ order: Order; status: Order['status'] } | null>(null);
  const updateStatus = useUpdateOrderStatus();
  const { has } = useCan();
  const canManageOrders = has('orders:manage');

  const { startDate, endDate } = dateF === 'All'
    ? { startDate: undefined, endDate: undefined }
    : DATE_RANGES[dateF]();

  const { data: orders = [], isLoading } = useOrders({
    status: statusF !== ALL_STATUSES ? statusF : undefined,
    startDate: startDate ? startDate.toISOString() : undefined,
    // Full timestamp, not a bare date: truncating endOfDay() to YYYY-MM-DD
    // would resolve to midnight and silently drop the final day of the range.
    endDate: endDate ? endDate.toISOString() : undefined,
  });

  const filtered = orders.filter(o =>
    (statusF === ALL_STATUSES || o.status === statusF) &&
    (o.orderNumber.toLowerCase().includes(search.toLowerCase()) || (getOrderCustomerName(o) || 'Walk-in').toLowerCase().includes(search.toLowerCase()))
  );

  const revenue  = filtered.filter(o => o.status === 'completed').reduce((s, o) => s + o.total, 0);
  const refunded = filtered.filter(o => o.status === 'refunded').reduce((s, o) => s + o.total, 0);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'refunded': return 'Refunded';
      case 'cancelled': return 'Cancelled';
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
        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4">
          <div className="text-[10px] text-subtle font-bold uppercase tracking-widest mb-1.5">Revenue (today)</div>
          <div className="text-[22px] font-extrabold tabular-nums text-emerald-400">{isLoading ? '...' : `$${revenue.toFixed(2)}`}</div>
        </div>
        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4">
          <div className="text-[10px] text-subtle font-bold uppercase tracking-widest mb-1.5">Transactions</div>
          <div className="text-[22px] font-extrabold tabular-nums text-blue-400">{isLoading ? '...' : filtered.filter(o => o.status === 'completed').length}</div>
        </div>
        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4">
          <div className="text-[10px] text-subtle font-bold uppercase tracking-widest mb-1.5">Refunded</div>
          <div className="text-[22px] font-extrabold tabular-nums text-amber-400">{isLoading ? '...' : `$${refunded.toFixed(2)}`}</div>
        </div>
        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4">
          <div className="text-[10px] text-subtle font-bold uppercase tracking-widest mb-1.5">Voided</div>
          <div className="text-[22px] font-extrabold tabular-nums text-red-400">{isLoading ? '...' : filtered.filter(o => o.status === 'cancelled').length}</div>
        </div>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="px-4 py-3 flex items-center gap-2.5 border-b border-[var(--border)] flex-wrap">
          <div className="relative max-w-[260px]">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-subtle pointer-events-none"><IconSearch size={14} /></span>
            <input className="w-full h-9 pl-8 pr-3 bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-lg text-[var(--text)] text-[13px] placeholder:text-subtle outline-none focus:border-blue-500 transition-all" placeholder="Search order #, customer..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className={selectCls} value={statusF} onChange={e => setStatusF(e.target.value)}>
            <option value={ALL_STATUSES}>All Status</option>
            {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select className={selectCls} value={dateF} onChange={e => setDateF(e.target.value as DateRangeKey | 'All')}>
            <option value="All">All Dates</option>
            {(Object.keys(DATE_RANGES) as DateRangeKey[]).map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <div className="flex-1" />
          <button className="h-9 flex items-center gap-1.5 px-3.5 bg-[var(--surface-2)] border border-[var(--border-strong)] text-muted hover:text-[var(--text)] hover:bg-[var(--input-bg)] rounded-lg text-[13px] font-semibold transition-all">
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
                  {['Order ID', 'Customer', 'Cashier', 'Location', 'Items', 'Method', 'Total', 'Time', 'Status', ''].map(h => (
                    <th key={h} className="px-3.5 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-subtle border-b border-[var(--border)] bg-[var(--surface-2)] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} className="hover:bg-[var(--input-bg)] transition-colors">
                    <td className="px-3.5 py-3 border-b border-[var(--border)]">
                      <span className="font-mono text-[12px] text-blue-400 font-bold">{o.orderNumber}</span>
                    </td>
                    <td className="px-3.5 py-3 border-b border-[var(--border)] text-[var(--text)] font-medium text-sm">{getOrderCustomerName(o) || 'Walk-in'}</td>
                    <td className="px-3.5 py-3 border-b border-[var(--border)] text-muted text-xs">{getOrderStaffName(o) || '-'}</td>
                    <td className="px-3.5 py-3 border-b border-[var(--border)] text-muted text-xs">
                      <span className="inline-flex items-center gap-1">
                        <IconStore size={11} className="text-subtle" />
                        {getOrderBranchName(o) ?? '-'}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 border-b border-[var(--border)]">
                      <span className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-full bg-[var(--surface-2)] text-[11px] font-bold text-muted">{o.items.length}</span>
                    </td>
                    <td className="px-3.5 py-3 border-b border-[var(--border)]">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${o.paymentMethod === 'cash' ? 'bg-[var(--input-bg)] text-muted' : 'bg-blue-500/15 text-blue-400'}`}>{o.paymentMethod || '-'}</span>
                    </td>
                    <td className="px-3.5 py-3 border-b border-[var(--border)] font-bold tabular-nums text-sm text-[var(--text)]">${o.total.toFixed(2)}</td>
                    <td className="px-3.5 py-3 border-b border-[var(--border)] text-xs text-subtle">{formatTime(o.createdAt)}</td>
                    <td className="px-3.5 py-3 border-b border-[var(--border)]">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_BADGE_CLASS[o.status] ?? 'bg-[var(--input-bg)] text-muted'}`}>{getStatusLabel(o.status)}</span>
                    </td>
                    <td className="px-3.5 py-3 border-b border-[var(--border)]">
                      <div className="flex items-center gap-1">
                        <button
                          className="w-7 h-7 flex items-center justify-center rounded-md bg-[var(--surface-2)] border border-[var(--border-strong)] text-muted hover:text-[var(--text)] transition-all"
                          title="View receipt"
                          aria-label={`View receipt for ${o.orderNumber}`}
                        >
                          <IconReceipt size={11} />
                        </button>
                        {/* Only an order that actually moved stock can be
                            reversed; re-reversing would double-count. */}
                        {(o.status === 'completed' || o.status === 'pending') && canManageOrders &&
                          RESTOCKING_ACTIONS.map(action => (
                            <button
                              key={action.value}
                              onClick={() => setPendingAction({ order: o, status: action.value })}
                              className={`w-7 h-7 flex items-center justify-center rounded-md border transition-all ${
                                action.value === 'refunded'
                                  ? 'bg-[var(--surface-2)] border-[var(--border-strong)] text-muted hover:text-amber-400 hover:bg-amber-500/10'
                                  : 'bg-[var(--surface-2)] border-[var(--border-strong)] text-muted hover:text-red-400 hover:bg-red-500/10'
                              }`}
                              title={`${action.label} this order and return its stock`}
                              aria-label={`${action.label} order ${o.orderNumber}`}
                            >
                              {action.value === 'refunded' ? <IconRefresh size={11} /> : <IconX size={11} />}
                            </button>
                          ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-4 py-2.5 border-t border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-between">
          <span className="text-xs text-subtle">Showing {filtered.length} of {orders.length} orders</span>
          <div className="flex gap-1">
            {['← Prev', '1', '2', '3', 'Next →'].map((p, i) => (
              <button key={p} className={`h-7 min-w-[32px] px-2 flex items-center justify-center rounded-md text-xs font-semibold transition-all ${i === 1 ? 'bg-blue-500 text-white' : 'bg-[var(--input-bg)] border border-[var(--border-strong)] text-muted hover:text-[var(--text)]'}`}>{p}</button>
            ))}
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!pendingAction}
        onClose={() => setPendingAction(null)}
        title={pendingAction ? `${pendingAction.status === 'refunded' ? 'Refund' : 'Cancel'} order ${pendingAction.order.orderNumber}?` : ''}
        width="sm"
        footer={
          <>
            <button
              onClick={() => setPendingAction(null)}
              className="h-9 px-4 bg-[var(--surface-2)] border border-[var(--border-strong)] text-muted hover:text-[var(--text)] rounded-lg text-[13px] font-semibold transition-all"
            >
              Keep Order
            </button>
            <button
              onClick={() => {
                if (!pendingAction) return;
                updateStatus.mutate(
                  { orderId: pendingAction.order.id, status: pendingAction.status },
                  { onSettled: () => setPendingAction(null) }
                );
              }}
              disabled={updateStatus.isPending}
              className={`h-9 px-4 text-white rounded-lg text-[13px] font-semibold transition-all disabled:opacity-40 ${
                pendingAction?.status === 'refunded' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {pendingAction?.status === 'refunded' ? 'Refund' : 'Cancel Order'}
            </button>
          </>
        }
      >
        {pendingAction && (
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
              <IconAlertTriangle size={24} className="text-amber-400" />
            </div>
            <p className="text-[13px] text-muted">
              This will return every item on the order to stock at{' '}
              <span className="font-semibold text-[var(--text)]">
                {getOrderBranchName(pendingAction.order) ?? 'its original location'}
              </span>.
            </p>
            <ul className="w-full flex flex-col gap-1 text-left">
              {pendingAction.order.items.map((item, i) => (
                <li key={`${item.productId}-${i}`} className="flex items-center justify-between text-[12px] px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'var(--input-bg)' }}>
                  <span className="text-[var(--text)] font-medium">{item.productName}</span>
                  <span className="text-subtle tabular-nums">×{item.quantity}</span>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-subtle">
              The stock is returned once. This cannot be applied again to the same order.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}

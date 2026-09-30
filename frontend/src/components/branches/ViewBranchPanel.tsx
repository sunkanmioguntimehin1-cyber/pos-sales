'use client';
import { ReactNode } from 'react';
import { SidePanel } from '@/components/ui/SidePanel';
import {
  IconMapPin, IconPhone, IconUser, IconStore, IconXCircle, IconPackage, IconReceipt, IconAlertTriangle,
} from '@/components/ui/Icons';
import { Branch } from '@/lib/api/branches';
import { useCan } from '@/lib/auth/can';
import { useStaff, useProducts, useOrders, getOrderStaffName } from '@/lib/hooks';

interface ViewBranchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  branch: Branch | null;
}

const currency = (value: number) =>
  `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const orderStatusCls: Record<string, string> = {
  completed: 'bg-emerald-500/15 text-emerald-400',
  pending: 'bg-amber-500/15 text-amber-400',
  cancelled: 'bg-[var(--input-bg)] text-muted',
  refunded: 'bg-red-500/15 text-red-400',
};

const stockBadge = (status: string) => {
  if (status === 'low') return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400">Low</span>;
  if (status === 'critical') return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400">Critical</span>;
  if (status === 'out') return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400">Out</span>;
  return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400">In Stock</span>;
};

const initials = (name: string) =>
  name.split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase();

function SectionHeader({ icon, label, count }: { icon: ReactNode; label: string; count?: string }) {
  return (
    <div className="text-[10px] font-bold uppercase tracking-widest text-subtle mb-3 flex items-center justify-between">
      <span className="flex items-center gap-1.5">
        <span className="text-subtle flex items-center">{icon}</span>
        {label}
      </span>
      {count !== undefined && <span className="px-1.5 py-0.5 rounded-md bg-[var(--card)] border border-[var(--border)] text-[10px] font-bold tabular-nums">{count}</span>}
    </div>
  );
}

function NoAccess({ what }: { what: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-4 bg-[var(--card)] border border-[var(--border)] rounded-lg text-subtle text-[12px]">
      <IconAlertTriangle size={13} />
      You do not have permission to view {what} for this location.
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="px-3 py-6 bg-[var(--card)] border border-[var(--border)] rounded-lg text-center text-subtle text-[12px]">
      {text}
    </div>
  );
}

export function ViewBranchPanel({ isOpen, onClose, branch }: ViewBranchPanelProps) {
  const { has } = useCan();
  const canViewStaff = has('staff:view');
  const canViewStock = has('products:view');
  const canViewOrders = has('orders:view');

  // Hooks must run unconditionally; the queries are disabled below so nothing
  // is fetched while the panel is closed or the section's permission is absent.
  const open = !!branch && isOpen;
  const branchId = open ? branch!.id : undefined;

  const { data: staff = [] } = useStaff({ branchId, enabled: open && canViewStaff });
  const { data: products = [] } = useProducts({ branchId, enabled: open && canViewStock });
  const { data: orders = [] } = useOrders({ branchId, enabled: open && canViewOrders });

  if (!branch) return null;

  const recentOrders = orders.slice(0, 10);
  const salesVolume = orders.reduce((sum, order) => sum + (order.total || 0), 0);

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      title="Branch Details"
      width="560px"
    >
      <div className="flex flex-col gap-5">
        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="min-w-0">
              <h3 className="text-[15px] font-bold text-[var(--text)] truncate">{branch.name}</h3>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {branch.type === 'head_office' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/15 text-violet-400">
                    <IconStore size={10} /> Head Office
                  </span>
                )}
                {/* Status and default are separate facts: the head office is
                    always the default, and any branch can be inactive. */}
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  branch.status === 'active'
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-[var(--input-bg)] text-muted'
                }`}>
                  {branch.status === 'active' ? 'Active' : (
                    <><IconXCircle size={10} /> Inactive</>
                  )}
                </span>
                {branch.isDefault && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400">
                    Default Location
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-subtle">
            <IconMapPin size={14} />
            <span className="text-[13px]">{branch.address || '-'}</span>
          </div>
        </div>

        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-subtle mb-3">Contact Information</div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <IconUser size={14} />
              </div>
              <div>
                <div className="text-[10px] text-subtle uppercase">Manager</div>
                <div className="text-[13px] text-[var(--text)]">{branch.manager || '-'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                <IconPhone size={14} />
              </div>
              <div>
                <div className="text-[10px] text-subtle uppercase">Phone</div>
                <div className="text-[13px] text-[var(--text)]">{branch.phone || '-'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4">
          <SectionHeader icon={<IconUser size={12} />} label="Staff at this location" count={String(staff.length)} />
          {!canViewStaff ? (
            <NoAccess what="staff" />
          ) : staff.length === 0 ? (
            <Empty text="No staff assigned to this location yet." />
          ) : (
            <div className="flex flex-col gap-2">
              {staff.map(s => (
                <div key={s.id} className="flex items-center gap-3 px-3 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                    {initials(s.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[13px] font-semibold text-[var(--text)] truncate">{s.name}</span>
                      {s.role === 'manager' && (
                        <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[9px] font-bold whitespace-nowrap">
                          Manager
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-subtle">{s.email || s.phone || s.id.slice(-6)}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${s.roleColor ?? 'bg-[var(--input-bg)] text-muted'}`}>
                      {s.roleName ?? s.role}
                    </span>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'active' ? 'bg-emerald-400' : 'bg-muted/40'}`} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4">
          <SectionHeader icon={<IconPackage size={12} />} label="Stock at this location" count={String(products.length)} />
          {!canViewStock ? (
            <NoAccess what="stock" />
          ) : products.length === 0 ? (
            <Empty text="No stock at this location yet." />
          ) : (
            <div className="flex flex-col gap-2">
              {products.map(p => {
                const onHand = p.stock || 0;
                const reorder = p.minQuantity ?? p.lowStockThreshold ?? 0;
                let status = 'ok';
                if (onHand === 0) status = 'out';
                else if (onHand <= reorder * 0.25) status = 'critical';
                else if (onHand <= reorder) status = 'low';

                return (
                  <div key={p.id} className="flex items-center gap-3 px-3 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-[var(--text)] truncate">{p.name}</div>
                      <div className="text-[11px] text-subtle">{p.sku || p.id.slice(-6)}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-sm font-extrabold tabular-nums ${status !== 'ok' ? 'text-amber-400' : 'text-[var(--text)]'}`}>{onHand}</div>
                      <div className="text-[10px] text-subtle">/ {p.totalStock ?? onHand} company-wide</div>
                    </div>
                    <div className="flex-shrink-0">{stockBadge(status)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4 mb-1">
          <SectionHeader icon={<IconReceipt size={12} />} label="Sales history" count={String(orders.length)} />
          {!canViewOrders ? (
            <NoAccess what="sales" />
          ) : orders.length === 0 ? (
            <Empty text="No sales recorded at this location yet." />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="text-center p-3 bg-[var(--card)] rounded-lg border border-[var(--border)]">
                  <div className="text-lg font-extrabold text-[var(--text)] tabular-nums">{orders.length}</div>
                  <div className="text-[10px] text-subtle">Orders</div>
                </div>
                <div className="text-center p-3 bg-[var(--card)] rounded-lg border border-[var(--border)]">
                  <div className="text-lg font-extrabold text-emerald-400 tabular-nums">{currency(salesVolume)}</div>
                  <div className="text-[10px] text-subtle">Sales volume</div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {recentOrders.map(o => (
                  <div key={o.id} className="flex items-center gap-3 px-3 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] font-semibold text-[var(--text)] font-mono truncate">{o.orderNumber}</span>
                        <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-bold capitalize ${orderStatusCls[o.status] ?? orderStatusCls.completed}`}>
                          {o.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-subtle">
                        {getOrderStaffName(o) ?? '—'} · {new Date(o.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <div className="text-[13px] font-extrabold tabular-nums flex-shrink-0">{currency(o.total || 0)}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </SidePanel>
  );
}
'use client';
import { useMemo } from 'react';
import {
  IconPackage,
  IconReceipt,
  IconDollar,
  IconCustomers,
  IconDownload,
  IconAlertTriangle,
  IconPOS,
} from '@/components/ui/Icons';
import { SectionCard, StatCard, EmptyState } from '@/components/ui/Card';
import { AreaChart, BarList } from '@/components/ui/Chart';
import { useOrders, useProducts, useStaff, useCustomers, getOrderCustomerName } from '@/lib/hooks';
import type { Order } from '@/lib/api/orders';

const currency = (value: number) =>
  `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const statusTone: Record<Order['status'], string> = {
  completed: 'badge-success',
  pending: 'badge-warning',
  cancelled: 'badge-danger',
  refunded: 'badge-neutral',
};

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function DashboardScreen() {
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: staff = [] } = useStaff();
  const { data: customers = [], isLoading: customersLoading } = useCustomers();

  const completed = useMemo(() => orders.filter((o) => o.status === 'completed'), [orders]);
  const totalSales = completed.reduce((sum, o) => sum + o.total, 0);
  const averageOrder = completed.length ? totalSales / completed.length : 0;
  const activeProducts = products.filter((p) => p.isActive).length;
  const activeStaff = staff.filter((s) => s.status === 'active').length;
  const lowStock = useMemo(
    () => products.filter((p) => p.isActive && p.stock <= (p.lowStockThreshold ?? 0)),
    [products]
  );

  /** Revenue for the trailing 14 days, bucketed per day. */
  const revenueSeries = useMemo(() => {
    const buckets = new Map<string, number>();
    const days: { key: string; label: string }[] = [];
    const today = new Date();

    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = dayKey(d);
      buckets.set(key, 0);
      days.push({ key, label: d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) });
    }

    completed.forEach((o) => {
      const key = dayKey(new Date(o.createdAt));
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + o.total);
    });

    return days.map((d) => ({ label: d.label, value: buckets.get(d.key) ?? 0 }));
  }, [completed]);

  const weekOverWeek = useMemo(() => {
    const thisWeek = revenueSeries.slice(7).reduce((s, d) => s + d.value, 0);
    const lastWeek = revenueSeries.slice(0, 7).reduce((s, d) => s + d.value, 0);
    if (!lastWeek) return null;
    const pct = ((thisWeek - lastWeek) / lastWeek) * 100;
    return {
      value: `${Math.abs(pct).toFixed(1)}%`,
      direction: (pct >= 0 ? 'up' : 'down') as 'up' | 'down',
    };
  }, [revenueSeries]);

  const topProducts = useMemo(() => {
    const totals = new Map<string, { revenue: number; qty: number }>();
    completed.forEach((o) =>
      o.items?.forEach((item) => {
        const entry = totals.get(item.productName) ?? { revenue: 0, qty: 0 };
        entry.revenue += item.totalPrice;
        entry.qty += item.quantity;
        totals.set(item.productName, entry);
      })
    );
    return [...totals.entries()]
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 5)
      .map(([label, v]) => ({ label, value: v.revenue, hint: `${v.qty} sold` }));
  }, [completed]);

  const recentOrders = orders.slice(0, 6);
  const hasRevenue = revenueSeries.some((d) => d.value > 0);

  return (
    <div className="flex flex-col gap-5">
      {/* Hero */}
      <section
        className="relative overflow-hidden rounded-2xl p-6 sm:p-7"
        style={{
          background:
            'linear-gradient(120deg, color-mix(in srgb, var(--primary) 88%, #000), color-mix(in srgb, var(--accent) 45%, #0b1020))',
        }}
      >
        <span
          className="animate-float-slow pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full opacity-35 blur-3xl"
          style={{ background: 'radial-gradient(circle, #fff7, transparent 65%)' }}
        />
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
              Revenue · last 14 days
            </span>
            <div className="mt-2 text-[34px] font-bold leading-none tracking-tight text-white tabular-nums">
              {currency(revenueSeries.reduce((s, d) => s + d.value, 0))}
            </div>
            <p className="mt-2 text-[13px] text-white/75">
              {completed.length} completed orders · {currency(averageOrder)} average basket
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-sm bg-white/15 text-white backdrop-blur hover:bg-white/25">
              <IconPOS size={14} /> Open register
            </button>
            <button className="btn btn-sm bg-white text-[color:var(--primary)] hover:bg-white/90">
              <IconDownload size={14} /> Export
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total sales"
          value={currency(totalSales)}
          hint={`${orders.length} transactions`}
          tone="success"
          trend={weekOverWeek ?? undefined}
          icon={<IconDollar size={19} />}
          loading={ordersLoading}
        />
        <StatCard
          label="Orders"
          value={orders.length}
          hint={`${orders.filter((o) => o.status === 'pending').length} pending`}
          tone="primary"
          icon={<IconReceipt size={19} />}
          loading={ordersLoading}
        />
        <StatCard
          label="Products"
          value={products.length}
          hint={`${activeProducts} active`}
          tone="warning"
          icon={<IconPackage size={19} />}
          loading={productsLoading}
        />
        <StatCard
          label="Customers"
          value={customers.length}
          hint={`${activeStaff} staff on duty`}
          tone="primary"
          icon={<IconCustomers size={19} />}
          loading={customersLoading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <SectionCard
          title="Sales trend"
          description="Completed order revenue per day"
          className="xl:col-span-2"
          bodyClassName="px-3 pb-3 pt-4"
        >
          {hasRevenue ? (
            <AreaChart data={revenueSeries} formatValue={currency} />
          ) : (
            <EmptyState title="No sales yet" description="Completed orders will appear here as revenue." />
          )}
        </SectionCard>

        <SectionCard title="Top products" description="By revenue" bodyClassName="p-5">
          {topProducts.length ? (
            <BarList items={topProducts} formatValue={currency} />
          ) : (
            <EmptyState title="Nothing sold yet" description="Your best sellers will be ranked here." />
          )}
        </SectionCard>
      </div>

      {/* Orders + low stock */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <SectionCard
          title="Recent orders"
          description="Latest activity across your branches"
          className="xl:col-span-2"
        >
          {recentOrders.length ? (
            <div className="scroll-area overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Status</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <div className="font-semibold">#{order.orderNumber}</div>
                        <div className="text-[11.5px] text-subtle">
                          {new Date(order.createdAt).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <span
                            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[10.5px] font-bold"
                            style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}
                          >
                            {(getOrderCustomerName(order) ?? 'W').slice(0, 2).toUpperCase()}
                          </span>
                          <span className="truncate">{getOrderCustomerName(order) ?? 'Walk-in'}</span>
                        </div>
                      </td>
                      <td className="text-muted">{order.items?.length ?? 0}</td>
                      <td>
                        <span className={`badge ${statusTone[order.status]}`}>{order.status}</span>
                      </td>
                      <td className="text-right font-semibold tabular-nums">{currency(order.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={<IconReceipt size={22} />}
              title="No orders yet"
              description="Ring up your first sale from the POS terminal and it will show up here."
            />
          )}
        </SectionCard>

        <SectionCard title="Low stock" description="Items at or below threshold" bodyClassName="p-3">
          {lowStock.length ? (
            <ul className="flex flex-col gap-1">
              {lowStock.slice(0, 6).map((product) => (
                <li
                  key={product.id}
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[var(--input-bg)]"
                >
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-medium">{product.name}</div>
                    <div className="text-[11.5px] text-subtle">{product.sku ?? 'No SKU'}</div>
                  </div>
                  <span className={`badge ${product.stock === 0 ? 'badge-danger' : 'badge-warning'}`}>
                    {product.stock} left
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={<IconAlertTriangle size={22} />}
              title="Stock looks healthy"
              description="No products have dipped below their low-stock threshold."
            />
          )}
        </SectionCard>
      </div>
    </div>
  );
}

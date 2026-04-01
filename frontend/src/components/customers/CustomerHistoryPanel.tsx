'use client';
import { IconReceipt, IconCreditCard, IconStore, IconUser } from '@/components/ui/Icons';
import { Customer } from '@/lib/api/customers';

interface CustomerHistoryPanelProps {
  customer: Customer | null;
}

interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface OrderData {
  id: string;
  orderId: string;
  date: string;
  time: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  cashier: string;
  branch: string;
}

export function CustomerHistoryPanel({ customer }: CustomerHistoryPanelProps) {
  if (!customer) return null;

  const mockOrders: OrderData[] = [];

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl p-4">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Customer Summary</div>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-[#161B27] rounded-lg border border-white/[0.07]">
            <div className="text-[10px] text-slate-500 mb-1">Total Orders</div>
            <div className="text-lg font-extrabold text-slate-100">{customer.visitCount || 0}</div>
          </div>
          <div className="text-center p-3 bg-[#161B27] rounded-lg border border-white/[0.07]">
            <div className="text-[10px] text-slate-500 mb-1">Total Spent</div>
            <div className="text-lg font-extrabold text-emerald-400">${(customer.totalSpent || 0).toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
          <IconReceipt size={12} />
          Purchase History
        </div>
        {mockOrders.length === 0 ? (
          <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl p-8 text-center">
            <div className="text-slate-500 text-[13px]">No purchase history found</div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {mockOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: OrderData }) {
  return (
    <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.07] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-blue-400 font-semibold">{order.orderId}</span>
          <span className="text-[10px] text-slate-500">·</span>
          <span className="text-[11px] text-slate-400">{order.date} at {order.time}</span>
        </div>
        <span className="text-[13px] font-bold text-emerald-400">${order.total.toFixed(2)}</span>
      </div>
      
      <div className="px-4 py-3 border-b border-white/[0.07]">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Items Purchased</div>
        <div className="flex flex-col gap-1.5">
          {order.items.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-slate-300">{item.name}</span>
                <span className="text-[10px] text-slate-500">x{item.quantity}</span>
              </div>
              <span className="text-[12px] text-slate-400">${item.total.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-3 flex items-center justify-between bg-[#161B27]/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <IconCreditCard size={12} />
            <span>{order.paymentMethod}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <IconUser size={12} />
            <span>{order.cashier}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <IconStore size={12} />
            <span>{order.branch}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          {order.discount > 0 && <span className="text-amber-400">-${order.discount.toFixed(2)}</span>}
          <span>Tax: ${order.tax.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

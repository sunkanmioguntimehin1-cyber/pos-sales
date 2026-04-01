'use client';
import { useState } from 'react';
import { IconSearch, IconEye, IconHistory } from '@/components/ui/Icons';
import { SidePanel } from '@/components/ui/SidePanel';
import { CustomerHistoryPanel } from './CustomerHistoryPanel';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { useCustomers, Customer } from '@/lib/hooks';

const tierBadge: Record<string, string> = {
  platinum: 'bg-violet-500/15 text-violet-400',
  gold: 'bg-amber-500/15 text-amber-400',
  silver: 'bg-slate-500/15 text-slate-400',
  bronze: 'bg-orange-500/15 text-orange-400',
};

const selectCls = "w-full h-9 px-3 bg-[#1E2535] border border-white/[0.12] rounded-lg text-slate-300 text-[13px] outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer pr-7 bg-[image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748B%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-no-repeat bg-[position:right_10px_center]";

export function CustomersScreen() {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('All');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const { data: customers = [], isLoading } = useCustomers({
    tier: tierFilter !== 'All' ? tierFilter : undefined,
    search: search || undefined,
  });

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      (customer.email?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (customer.phone?.includes(search) ?? false);
    return matchesSearch;
  });

  const handleViewHistory = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsHistoryOpen(true);
  };

  const totalCustomers = customers.length;
  const loyaltyMembers = customers.filter(c => c.tier !== 'bronze').length;
  const totalSpent = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">Total Customers</div>
          <div className="text-[24px] font-extrabold text-blue-400">{isLoading ? '...' : totalCustomers.toLocaleString()}</div>
        </div>
        <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">Active (30d)</div>
          <div className="text-[24px] font-extrabold text-emerald-400">{isLoading ? '...' : '312'}</div>
        </div>
        <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">Avg. Lifetime Value</div>
          <div className="text-[24px] font-extrabold text-slate-100">{isLoading ? '...' : `$${(totalSpent / totalCustomers || 0).toFixed(0)}`}</div>
        </div>
        <div className="bg-[#1E2535] border border-white/[0.07] rounded-xl p-4">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">Loyalty Members</div>
          <div className="text-[24px] font-extrabold text-violet-400">{isLoading ? '...' : loyaltyMembers.toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-[#161B27] border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="px-4 py-3 flex items-center gap-2.5 border-b border-white/[0.07] flex-wrap">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
              <IconSearch size={14} />
            </span>
            <input
              className="w-full h-9 pl-8 pr-3 bg-[#1E2535] border border-white/[0.12] rounded-lg text-slate-100 text-[13px] placeholder:text-slate-500 outline-none focus:border-blue-500 transition-all"
              placeholder="Search customers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className={selectCls} value={tierFilter} onChange={e => setTierFilter(e.target.value)}>
            <option value="All">All Tiers</option>
            <option value="Platinum">Platinum</option>
            <option value="Gold">Gold</option>
            <option value="Silver">Silver</option>
            <option value="Bronze">Bronze</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-4">
              <SkeletonTable rows={5} cols={7} />
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {['Customer', 'Phone', 'Tier', 'Visits', 'Total Spent', 'Last Visit', 'Actions'].map(h => (
                    <th key={h} className="px-3.5 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-white/[0.07] bg-[#1E2535] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(customer => (
                  <tr key={customer.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-3.5 py-3 border-b border-white/[0.07]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-[10px] font-extrabold text-white flex-shrink-0">
                          {customer.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-100 text-[13px]">{customer.name}</div>
                          <div className="text-[10px] text-slate-500">{customer.email || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3.5 py-3 border-b border-white/[0.07] text-slate-400 text-xs">{customer.phone}</td>
                    <td className="px-3.5 py-3 border-b border-white/[0.07]">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${tierBadge[customer.tier]}`}>
                        ★ {customer.tier.charAt(0).toUpperCase() + customer.tier.slice(1)}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 border-b border-white/[0.07] tabular-nums text-slate-200 text-xs">{customer.visitCount || 0}</td>
                    <td className="px-3.5 py-3 border-b border-white/[0.07] font-bold text-emerald-400 tabular-nums text-xs">${(customer.totalSpent || 0).toLocaleString()}</td>
                    <td className="px-3.5 py-3 border-b border-white/[0.07] text-xs text-slate-500">{customer.lastVisit || '-'}</td>
                    <td className="px-3.5 py-3 border-b border-white/[0.07]">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleViewHistory(customer)}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                          title="View Purchase History"
                        >
                          <IconHistory size={14} />
                        </button>
                        <button
                          className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
                          title="View Details"
                        >
                          <IconEye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-4 py-2.5 border-t border-white/[0.07] bg-[#1E2535]">
          <span className="text-xs text-slate-500">
            Showing {filteredCustomers.length} of {customers.length} customers
          </span>
        </div>
      </div>

      <SidePanel
        isOpen={isHistoryOpen}
        onClose={() => {
          setIsHistoryOpen(false);
          setSelectedCustomer(null);
        }}
        title={`Purchase History — ${selectedCustomer?.name || ''}`}
        width="520px"
      >
        <CustomerHistoryPanel customer={selectedCustomer} />
      </SidePanel>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { UsersAndRoles } from '@/components/settings/UsersAndRoles';
import { PaymentMethodSettings } from '@/components/settings/PaymentMethodSettings';
import { Staff } from '@/components/staff/types';
import { useCustomers, useStaff } from '@/lib/hooks';
import { Skeleton } from '@/components/ui/Skeleton';

export function CustomersScreen() {
  const { data: customers = [], isLoading } = useCustomers();
  const tierColor: Record<string, string> = {
    platinum: 'text-violet-400',
    gold:     'text-amber-400',
    silver:   'text-slate-400',
    bronze:   'text-orange-400',
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-[72px] rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    );
  }

  const totalSpent = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const avgSpent = customers.length > 0 ? Math.round(totalSpent / customers.length) : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Customers',     value: customers.length.toLocaleString(), color: 'text-blue-400'    },
          { label: 'Active (30d)',         value: '-', color: 'text-emerald-400' },
          { label: 'Avg. Lifetime Value',  value: `$${avgSpent.toLocaleString()}`, color: 'text-slate-100'   },
          { label: 'Loyalty Members',      value: '-', color: 'text-violet-400'  },
        ].map(c => (
          <div key={c.label} className="bg-[#1E2535] border border-white/[0.07] rounded-xl p-4">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">{c.label}</div>
            <div className={`text-[24px] font-extrabold tabular-nums ${c.color}`}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-[#161B27] border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="px-4 py-3.5 border-b border-white/[0.07] font-bold text-[13px] text-slate-100">Customer Database</div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['Customer', 'Phone', 'Tier', 'Visits', 'Total Spent', 'Last Visit'].map(h => (
                <th key={h} className="px-3.5 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-white/[0.07] bg-[#1E2535] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-3.5 py-3 border-b border-white/[0.07]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-[10px] font-extrabold text-white flex-shrink-0">
                      {c.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-100 text-[13px]">{c.name}</div>
                      <div className="text-[10px] text-slate-500">{c.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3.5 py-3 border-b border-white/[0.07] text-slate-400 text-xs">{c.phone || '-'}</td>
                <td className="px-3.5 py-3 border-b border-white/[0.07]">
                  <span className={`text-xs font-extrabold ${tierColor[c.tier] || ''}`}>★ {c.tier}</span>
                </td>
                <td className="px-3.5 py-3 border-b border-white/[0.07] tabular-nums text-slate-200">{c.visitCount || 0}</td>
                <td className="px-3.5 py-3 border-b border-white/[0.07] font-bold text-emerald-400 tabular-nums">${(c.totalSpent || 0).toLocaleString()}</td>
                <td className="px-3.5 py-3 border-b border-white/[0.07] text-xs text-slate-500">{c.lastVisit || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ReportsScreen() {
  const reports = [
    { name: 'Daily Sales Summary',    desc: 'Revenue, transactions, avg basket by day',  icon: '📊' },
    { name: 'Product Performance',    desc: 'Top sellers, slow movers, margin analysis', icon: '📦' },
    { name: 'Staff Performance',      desc: 'Sales per cashier, hours, conversions',     icon: '👥' },
    { name: 'Inventory Valuation',    desc: 'Stock value at cost and retail price',      icon: '🏪' },
    { name: 'Cash Drawer Report',     desc: 'Opening/closing balances per session',      icon: '💰' },
    { name: 'Customer Analytics',     desc: 'Retention, lifetime value, frequency',      icon: '📈' },
  ];
  return (
    <div className="grid grid-cols-3 gap-3">
      {reports.map(r => (
        <div key={r.name} className="bg-[#161B27] border border-white/[0.07] hover:border-white/[0.12] rounded-xl p-5 cursor-pointer transition-all hover:-translate-y-px">
          <div className="text-[32px] mb-3">{r.icon}</div>
          <div className="font-bold text-[13px] text-slate-100 mb-1.5">{r.name}</div>
          <div className="text-[11px] text-slate-500 leading-relaxed mb-3.5">{r.desc}</div>
          <button className="h-7 px-3 bg-[#1E2535] border border-white/[0.12] text-slate-400 hover:text-slate-200 rounded-lg text-[11px] font-semibold transition-all">
            Generate Report →
          </button>
        </div>
      ))}
    </div>
  );
}

export function SettingsScreen() {
  const [activeTab, setActiveTab] = useState('store');
  const { data: staff = [] } = useStaff();

  const tabs = [
    { id: 'store', label: 'Store Info' },
    { id: 'tax', label: 'Tax Settings' },
    { id: 'payment', label: 'Payment Methods' },
    { id: 'receipts', label: 'Receipts' },
    { id: 'users', label: 'Users & Roles' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'backup', label: 'Backup & Export' },
  ];

  return (
    <div className="grid grid-cols-[220px_1fr] gap-4">
      <div className="bg-[#161B27] border border-white/[0.07] rounded-xl p-2 h-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2 my-0.5 rounded-lg text-xs font-semibold transition-all text-left border ${
              activeTab === tab.id
                ? 'text-blue-400 bg-blue-500/15 border-blue-500/20'
                : 'text-slate-500 bg-transparent border-transparent hover:text-slate-400 hover:bg-[#1E2535]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-[#161B27] border border-white/[0.07] rounded-xl p-6">
        {activeTab === 'store' && (
          <>
            <div className="font-extrabold text-base text-slate-100 mb-0.5">Store Information</div>
            <div className="text-slate-500 text-xs mb-5">Configure your store details and operating information</div>
            <div className="grid grid-cols-2 gap-3.5 mb-5">
              {[
                { label: 'Store Name', value: 'RetailCore Main Store' },
                { label: 'Store ID',   value: 'STR-001' },
                { label: 'Address',    value: 'Kalverstraat 1, Amsterdam' },
                { label: 'Phone',      value: '+31 20 123 4567' },
                { label: 'Email',      value: 'store@retailcore.com' },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">{f.label}</label>
                  <input defaultValue={f.value} className="w-full h-9 px-3 bg-[#1E2535] border border-white/[0.12] rounded-lg text-slate-100 text-[13px] outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] transition-all" />
                </div>
              ))}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Currency</label>
                <select className="w-full h-9 px-3 bg-[#1E2535] border border-white/[0.12] rounded-lg text-slate-300 text-[13px] outline-none focus:border-blue-500 transition-all appearance-none">
                  <option>EUR (€)</option><option>USD ($)</option><option>GBP (£)</option>
                </select>
              </div>
            </div>
            <div className="pt-4 border-t border-white/[0.07] flex justify-end gap-2.5">
              <button className="h-9 px-4 bg-[#1E2535] border border-white/[0.12] text-slate-400 hover:text-slate-200 hover:bg-[#252D3D] rounded-lg text-[13px] font-semibold transition-all">Cancel</button>
              <button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[13px] font-semibold shadow-[0_2px_8px_rgba(59,130,246,0.3)] transition-all">Save Changes</button>
            </div>
          </>
        )}

        {activeTab === 'tax' && (
          <>
            <div className="font-extrabold text-base text-slate-100 mb-0.5">Tax Settings</div>
            <div className="text-slate-500 text-xs mb-5">Configure tax rates and calculations</div>
            <div className="grid grid-cols-2 gap-3.5 mb-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Default Tax Rate (%)</label>
                <input type="number" defaultValue="21" className="w-full h-9 px-3 bg-[#1E2535] border border-white/[0.12] rounded-lg text-slate-100 text-[13px] outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Tax Number</label>
                <input type="text" defaultValue="NL123456789B01" className="w-full h-9 px-3 bg-[#1E2535] border border-white/[0.12] rounded-lg text-slate-100 text-[13px] outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Tax Included in Price</label>
                <select className="w-full h-9 px-3 bg-[#1E2535] border border-white/[0.12] rounded-lg text-slate-300 text-[13px] outline-none focus:border-blue-500">
                  <option>Yes</option><option>No</option>
                </select>
              </div>
            </div>
            <div className="pt-4 border-t border-white/[0.07] flex justify-end gap-2.5">
              <button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[13px] font-semibold shadow-[0_2px_8px_rgba(59,130,246,0.3)] transition-all">Save Changes</button>
            </div>
          </>
        )}

        {activeTab === 'payment' && <PaymentMethodSettings />}

        {activeTab === 'receipts' && (
          <>
            <div className="font-extrabold text-base text-slate-100 mb-0.5">Receipt Settings</div>
            <div className="text-slate-500 text-xs mb-5">Configure receipt header, footer and email settings</div>
            <div className="grid grid-cols-1 gap-3.5 mb-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Receipt Header</label>
                <input defaultValue="RetailCore Main Store" className="w-full h-9 px-3 bg-[#1E2535] border border-white/[0.12] rounded-lg text-slate-100 text-[13px] outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Receipt Footer Message</label>
                <input defaultValue="Thank you for shopping with us!" className="w-full h-9 px-3 bg-[#1E2535] border border-white/[0.12] rounded-lg text-slate-100 text-[13px] outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Store Email for Receipts</label>
                <input type="email" defaultValue="receipts@retailcore.com" className="w-full h-9 px-3 bg-[#1E2535] border border-white/[0.12] rounded-lg text-slate-100 text-[13px] outline-none focus:border-blue-500" />
              </div>
            </div>
            <div className="pt-4 border-t border-white/[0.07] flex justify-end gap-2.5">
              <button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[13px] font-semibold shadow-[0_2px_8px_rgba(59,130,246,0.3)] transition-all">Save Changes</button>
            </div>
          </>
        )}

        {activeTab === 'users' && <div className="text-slate-400">User management is available in the Staff section.</div>}

        {activeTab === 'integrations' && (
          <>
            <div className="font-extrabold text-base text-slate-100 mb-0.5">Integrations</div>
            <div className="text-slate-500 text-xs mb-5">Connect with third-party services</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'QuickBooks', desc: 'Sync sales and inventory', icon: '📒' },
                { name: 'Xero', desc: 'Accounting integration', icon: '📊' },
                { name: 'Shopify', desc: 'E-commerce sync', icon: '🛍️' },
                { name: 'Square', desc: 'Payment processor', icon: '◼️' },
              ].map(int => (
                <div key={int.name} className="bg-[#1E2535] border border-white/[0.07] rounded-xl p-4 hover:border-white/[0.15] transition-all">
                  <div className="text-2xl mb-2">{int.icon}</div>
                  <div className="text-[13px] font-semibold text-slate-100">{int.name}</div>
                  <div className="text-[11px] text-slate-500 mb-3">{int.desc}</div>
                  <button className="h-7 px-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 rounded-lg text-[11px] font-semibold transition-all">
                    Connect
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'backup' && (
          <>
            <div className="font-extrabold text-base text-slate-100 mb-0.5">Backup & Export</div>
            <div className="text-slate-500 text-xs mb-5">Manage data backups and exports</div>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Export All Data', desc: 'Download complete backup of all data', action: 'Export Now' },
                { label: 'Daily Auto-Backup', desc: 'Automatically backup data every day at midnight', action: 'Configure' },
                { label: 'Import Data', desc: 'Restore from a previous backup file', action: 'Import' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between bg-[#1E2535] border border-white/[0.07] rounded-xl p-4">
                  <div>
                    <div className="text-[13px] font-semibold text-slate-100">{item.label}</div>
                    <div className="text-[11px] text-slate-500">{item.desc}</div>
                  </div>
                  <button className="h-8 px-4 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 rounded-lg text-[12px] font-semibold transition-all">
                    {item.action}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

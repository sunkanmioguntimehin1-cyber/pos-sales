// 'use client';
// import { useState, useEffect } from 'react';
// import { UsersAndRoles } from '@/components/settings/UsersAndRoles';
// import { PaymentMethodSettings } from '@/components/settings/PaymentMethodSettings';
// import { Staff } from '@/components/staff/types';
// import { useCustomers, useStaff, useStore, useUpdateStore } from '@/lib/hooks';
// import { Skeleton } from '@/components/ui/Skeleton';

// export function CustomersScreen() {
//   const { data: customers = [], isLoading } = useCustomers();
//   const tierColor: Record<string, string> = {
//     platinum: 'text-violet-400',
//     gold:     'text-amber-400',
//     silver:   'text-muted',
//     bronze:   'text-orange-400',
//   };

//   if (isLoading) {
//     return (
//       <div className="flex flex-col gap-4">
//         <div className="grid grid-cols-4 gap-3">
//           {[1, 2, 3, 4].map(i => (
//             <Skeleton key={i} className="h-[72px] rounded-xl" />
//           ))}
//         </div>
//         <Skeleton className="h-[400px] rounded-xl" />
//       </div>
//     );
//   }

//   const totalSpent = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
//   const avgSpent = customers.length > 0 ? Math.round(totalSpent / customers.length) : 0;

//   return (
//     <div className="flex flex-col gap-4">
//       <div className="grid grid-cols-4 gap-3">
//         {[
//           { label: 'Total Customers',     value: customers.length.toLocaleString(), color: 'text-blue-400'    },
//           { label: 'Active (30d)',         value: '-', color: 'text-emerald-400' },
//           { label: 'Avg. Lifetime Value',  value: `$${avgSpent.toLocaleString()}`, color: 'text-[var(--text)]'   },
//           { label: 'Loyalty Members',      value: '-', color: 'text-violet-400'  },
//         ].map(c => (
//           <div key={c.label} className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4">
//             <div className="text-[10px] text-subtle font-bold uppercase tracking-widest mb-1.5">{c.label}</div>
//             <div className={`text-[24px] font-extrabold tabular-nums ${c.color}`}>{c.value}</div>
//           </div>
//         ))}
//       </div>

//       <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
//         <div className="px-4 py-3.5 border-b border-[var(--border)] font-bold text-[13px] text-[var(--text)]">Customer Database</div>
//         <table className="w-full border-collapse">
//           <thead>
//             <tr>
//               {['Customer', 'Phone', 'Tier', 'Visits', 'Total Spent', 'Last Visit'].map(h => (
//                 <th key={h} className="px-3.5 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-subtle border-b border-[var(--border)] bg-[var(--surface-2)] whitespace-nowrap">{h}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {customers.map(c => (
//               <tr key={c.id} className="hover:bg-[var(--input-bg)] transition-colors">
//                 <td className="px-3.5 py-3 border-b border-[var(--border)]">
//                   <div className="flex items-center gap-2.5">
//                     <div className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-[10px] font-extrabold text-white flex-shrink-0">
//                       {c.name.split(' ').map(n => n[0]).join('')}
//                     </div>
//                     <div>
//                       <div className="font-semibold text-[var(--text)] text-[13px]">{c.name}</div>
//                       <div className="text-[10px] text-subtle">{c.email}</div>
//                     </div>
//                   </div>
//                 </td>
//                 <td className="px-3.5 py-3 border-b border-[var(--border)] text-muted text-xs">{c.phone || '-'}</td>
//                 <td className="px-3.5 py-3 border-b border-[var(--border)]">
//                   <span className={`text-xs font-extrabold ${tierColor[c.tier] || ''}`}>★ {c.tier}</span>
//                 </td>
//                 <td className="px-3.5 py-3 border-b border-[var(--border)] tabular-nums text-[var(--text)]">{c.visitCount || 0}</td>
//                 <td className="px-3.5 py-3 border-b border-[var(--border)] font-bold text-emerald-400 tabular-nums">${(c.totalSpent || 0).toLocaleString()}</td>
//                 <td className="px-3.5 py-3 border-b border-[var(--border)] text-xs text-subtle">{c.lastVisit || '-'}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// export function ReportsScreen() {
//   const reports = [
//     { name: 'Daily Sales Summary',    desc: 'Revenue, transactions, avg basket by day',  icon: '📊' },
//     { name: 'Product Performance',    desc: 'Top sellers, slow movers, margin analysis', icon: '📦' },
//     { name: 'Staff Performance',      desc: 'Sales per cashier, hours, conversions',     icon: '👥' },
//     { name: 'Inventory Valuation',    desc: 'Stock value at cost and retail price',      icon: '🏪' },
//     { name: 'Cash Drawer Report',     desc: 'Opening/closing balances per session',      icon: '💰' },
//     { name: 'Customer Analytics',     desc: 'Retention, lifetime value, frequency',      icon: '📈' },
//   ];
//   return (
//     <div className="grid grid-cols-3 gap-3">
//       {reports.map(r => (
//         <div key={r.name} className="bg-[var(--card)] border border-[var(--border)] hover:border-[var(--border-strong)] rounded-xl p-5 cursor-pointer transition-all hover:-translate-y-px">
//           <div className="text-[32px] mb-3">{r.icon}</div>
//           <div className="font-bold text-[13px] text-[var(--text)] mb-1.5">{r.name}</div>
//           <div className="text-[11px] text-subtle leading-relaxed mb-3.5">{r.desc}</div>
//           <button className="h-7 px-3 bg-[var(--surface-2)] border border-[var(--border-strong)] text-muted hover:text-[var(--text)] rounded-lg text-[11px] font-semibold transition-all">
//             Generate Report →
//           </button>
//         </div>
//       ))}
//     </div>
//   );
// }

// export function SettingsScreen() {
//   const [activeTab, setActiveTab] = useState('store');
//   const { data: store, isLoading: storeLoading } = useStore();
//   const updateStore = useUpdateStore();
//   const [storeName, setStoreName] = useState('');
//   const [storeDesc, setStoreDesc] = useState('');
//   const { data: staff = [] } = useStaff();

//   useEffect(() => {
//     if (store) {
//       setStoreNameOverride(store.name);
//       setStoreDescOverride(store.description || '');
//     }
//   }, [store]);

//   const handleSaveStore = () => {
//     updateStore.mutate({ name: storeName, description: storeDesc });
//   };

//   const tabs = [
//     { id: 'store', label: 'Store Info' },
//     { id: 'tax', label: 'Tax Settings' },
//     { id: 'payment', label: 'Payment Methods' },
//     { id: 'receipts', label: 'Receipts' },
//     { id: 'users', label: 'Users & Roles' },
//     { id: 'integrations', label: 'Integrations' },
//     { id: 'backup', label: 'Backup & Export' },
//   ];

//   return (
//     <div className="grid grid-cols-[220px_1fr] gap-4">
//       <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-2 h-fit">
//         {tabs.map(tab => (
//           <button
//             key={tab.id}
//             onClick={() => setActiveTab(tab.id)}
//             className={`w-full flex items-center gap-2.5 px-3.5 py-2 my-0.5 rounded-lg text-xs font-semibold transition-all text-left border ${
//               activeTab === tab.id
//                 ? 'text-blue-400 bg-blue-500/15 border-blue-500/20'
//                 : 'text-subtle bg-transparent border-transparent hover:text-muted hover:bg-[var(--surface-2)]'
//             }`}
//           >
//             {tab.label}
//           </button>
//         ))}
//       </div>

//       <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
//         {activeTab === 'store' && (
//           <>
//             <div className="font-extrabold text-base text-[var(--text)] mb-0.5">Store Information</div>
//             <div className="text-subtle text-xs mb-5">Configure your store details and operating information</div>
//             {storeLoading ? (
//               <div className="text-subtle text-sm">Loading...</div>
//             ) : (
//               <>
//                 <div className="grid grid-cols-2 gap-3.5 mb-5">
//                   <div>
//                     <label className="block text-[10px] font-bold uppercase tracking-widest text-subtle mb-1.5">Store Name</label>
//                     <input
//                       value={storeName}
//                       onChange={e => setStoreNameOverride(e.target.value)}
//                       className="w-full h-9 px-3 bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-lg text-[var(--text)] text-[13px] outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] transition-all"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-[10px] font-bold uppercase tracking-widest text-subtle mb-1.5">Description</label>
//                     <input
//                       value={storeDesc}
//                       onChange={e => setStoreDescOverride(e.target.value)}
//                       className="w-full h-9 px-3 bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-lg text-[var(--text)] text-[13px] outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] transition-all"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-[10px] font-bold uppercase tracking-widest text-subtle mb-1.5">Currency</label>
//                     <select className="w-full h-9 px-3 bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-lg text-muted text-[13px] outline-none focus:border-blue-500 transition-all appearance-none">
//                       <option>EUR (€)</option><option>USD ($)</option><option>GBP (£)</option>
//                     </select>
//                   </div>
//                 </div>
//                 <div className="pt-4 border-t border-[var(--border)] flex justify-end gap-2.5">
//                   <button
//                     onClick={handleSaveStore}
//                     disabled={updateStore.isPending}
//                     className="h-9 px-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white rounded-lg text-[13px] font-semibold shadow-[0_2px_8px_rgba(59,130,246,0.3)] transition-all"
//                   >
//                     {updateStore.isPending ? 'Saving...' : 'Save Changes'}
//                   </button>
//                 </div>
//               </>
//             )}
//           </>
//         )}

//         {activeTab === 'tax' && (
//           <>
//             <div className="font-extrabold text-base text-[var(--text)] mb-0.5">Tax Settings</div>
//             <div className="text-subtle text-xs mb-5">Configure tax rates and calculations</div>
//             <div className="grid grid-cols-2 gap-3.5 mb-5">
//               <div>
//                 <label className="block text-[10px] font-bold uppercase tracking-widest text-subtle mb-1.5">Default Tax Rate (%)</label>
//                 <input type="number" defaultValue="21" className="w-full h-9 px-3 bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-lg text-[var(--text)] text-[13px] outline-none focus:border-blue-500" />
//               </div>
//               <div>
//                 <label className="block text-[10px] font-bold uppercase tracking-widest text-subtle mb-1.5">Tax Number</label>
//                 <input type="text" defaultValue="NL123456789B01" className="w-full h-9 px-3 bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-lg text-[var(--text)] text-[13px] outline-none focus:border-blue-500" />
//               </div>
//               <div>
//                 <label className="block text-[10px] font-bold uppercase tracking-widest text-subtle mb-1.5">Tax Included in Price</label>
//                 <select className="w-full h-9 px-3 bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-lg text-muted text-[13px] outline-none focus:border-blue-500">
//                   <option>Yes</option><option>No</option>
//                 </select>
//               </div>
//             </div>
//             <div className="pt-4 border-t border-[var(--border)] flex justify-end gap-2.5">
//               <button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[13px] font-semibold shadow-[0_2px_8px_rgba(59,130,246,0.3)] transition-all">Save Changes</button>
//             </div>
//           </>
//         )}

//         {activeTab === 'payment' && <PaymentMethodSettings />}

//         {activeTab === 'receipts' && (
//           <>
//             <div className="font-extrabold text-base text-[var(--text)] mb-0.5">Receipt Settings</div>
//             <div className="text-subtle text-xs mb-5">Configure receipt header, footer and email settings</div>
//             <div className="grid grid-cols-1 gap-3.5 mb-5">
//               <div>
//                 <label className="block text-[10px] font-bold uppercase tracking-widest text-subtle mb-1.5">Receipt Header</label>
//                 <input defaultValue="RetailCore Main Store" className="w-full h-9 px-3 bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-lg text-[var(--text)] text-[13px] outline-none focus:border-blue-500" />
//               </div>
//               <div>
//                 <label className="block text-[10px] font-bold uppercase tracking-widest text-subtle mb-1.5">Receipt Footer Message</label>
//                 <input defaultValue="Thank you for shopping with us!" className="w-full h-9 px-3 bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-lg text-[var(--text)] text-[13px] outline-none focus:border-blue-500" />
//               </div>
//               <div>
//                 <label className="block text-[10px] font-bold uppercase tracking-widest text-subtle mb-1.5">Store Email for Receipts</label>
//                 <input type="email" defaultValue="receipts@retailcore.com" className="w-full h-9 px-3 bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-lg text-[var(--text)] text-[13px] outline-none focus:border-blue-500" />
//               </div>
//             </div>
//             <div className="pt-4 border-t border-[var(--border)] flex justify-end gap-2.5">
//               <button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[13px] font-semibold shadow-[0_2px_8px_rgba(59,130,246,0.3)] transition-all">Save Changes</button>
//             </div>
//           </>
//         )}

//         {activeTab === 'users' && <div className="text-muted">User management is available in the Staff section.</div>}

//         {activeTab === 'integrations' && (
//           <>
//             <div className="font-extrabold text-base text-[var(--text)] mb-0.5">Integrations</div>
//             <div className="text-subtle text-xs mb-5">Connect with third-party services</div>
//             <div className="grid grid-cols-2 gap-3">
//               {[
//                 { name: 'QuickBooks', desc: 'Sync sales and inventory', icon: '📒' },
//                 { name: 'Xero', desc: 'Accounting integration', icon: '📊' },
//                 { name: 'Shopify', desc: 'E-commerce sync', icon: '🛍️' },
//                 { name: 'Square', desc: 'Payment processor', icon: '◼️' },
//               ].map(int => (
//                 <div key={int.name} className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4 hover:border-[var(--border-strong)] transition-all">
//                   <div className="text-2xl mb-2">{int.icon}</div>
//                   <div className="text-[13px] font-semibold text-[var(--text)]">{int.name}</div>
//                   <div className="text-[11px] text-subtle mb-3">{int.desc}</div>
//                   <button className="h-7 px-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 rounded-lg text-[11px] font-semibold transition-all">
//                     Connect
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </>
//         )}

//         {activeTab === 'backup' && (
//           <>
//             <div className="font-extrabold text-base text-[var(--text)] mb-0.5">Backup & Export</div>
//             <div className="text-subtle text-xs mb-5">Manage data backups and exports</div>
//             <div className="flex flex-col gap-3">
//               {[
//                 { label: 'Export All Data', desc: 'Download complete backup of all data', action: 'Export Now' },
//                 { label: 'Daily Auto-Backup', desc: 'Automatically backup data every day at midnight', action: 'Configure' },
//                 { label: 'Import Data', desc: 'Restore from a previous backup file', action: 'Import' },
//               ].map(item => (
//                 <div key={item.label} className="flex items-center justify-between bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4">
//                   <div>
//                     <div className="text-[13px] font-semibold text-[var(--text)]">{item.label}</div>
//                     <div className="text-[11px] text-subtle">{item.desc}</div>
//                   </div>
//                   <button className="h-8 px-4 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 rounded-lg text-[12px] font-semibold transition-all">
//                     {item.action}
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";
import { useState, useEffect } from "react";
import { PaymentMethodSettings } from "@/components/settings/PaymentMethodSettings";
import { useStaff, useStore, useUpdateStore } from "@/lib/hooks";
import { useCan } from "@/lib/auth/can";
import { Skeleton } from "@/components/ui/Skeleton";

// Note: CustomersScreen has been REMOVED from this file.
// Use the full-featured version from @/components/customers/CustomersScreen instead.

export function ReportsScreen() {
  const reports = [
    {
      name: "Daily Sales Summary",
      desc: "Revenue, transactions, avg basket by day",
      icon: "📊",
    },
    {
      name: "Product Performance",
      desc: "Top sellers, slow movers, margin analysis",
      icon: "📦",
    },
    {
      name: "Staff Performance",
      desc: "Sales per cashier, hours, conversions",
      icon: "👥",
    },
    {
      name: "Inventory Valuation",
      desc: "Stock value at cost and retail price",
      icon: "🏪",
    },
    {
      name: "Cash Drawer Report",
      desc: "Opening/closing balances per session",
      icon: "💰",
    },
    {
      name: "Customer Analytics",
      desc: "Retention, lifetime value, frequency",
      icon: "📈",
    },
  ];
  return (
    <div className="grid grid-cols-3 gap-3">
      {reports.map((r) => (
        <div
          key={r.name}
          className="border rounded-xl p-5 cursor-pointer transition-all hover:-translate-y-px"
          style={{
            backgroundColor: "var(--color-card)",
            borderColor: "var(--color-border)",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLDivElement).style.borderColor =
              "var(--color-border-hover)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLDivElement).style.borderColor =
              "var(--color-border)")
          }
        >
          <div className="text-[32px] mb-3">{r.icon}</div>
          <div
            className="font-bold text-[13px] mb-1.5"
            style={{ color: "var(--color-text)" }}
          >
            {r.name}
          </div>
          <div
            className="text-[11px] leading-relaxed mb-3.5"
            style={{ color: "var(--color-text-muted)" }}
          >
            {r.desc}
          </div>
          <button
            className="h-7 px-3 rounded-lg text-[11px] font-semibold transition-all border"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
              color: "var(--color-text-muted)",
            }}
          >
            Generate Report →
          </button>
        </div>
      ))}
    </div>
  );
}

export function SettingsScreen() {
  const [activeTab, setActiveTab] = useState("store");
  const { data: store, isLoading: storeLoading } = useStore();
  const updateStore = useUpdateStore();
  const { has } = useCan();
  const canManageSettings = has("settings:manage");
  // Uncontrolled-with-seed: `null` means "still showing the server value".
  // The old useEffect-to-setState pair caused an extra render on every load.
  const [storeNameOverride, setStoreNameOverride] = useState<string | null>(null);
  const [storeDescOverride, setStoreDescOverride] = useState<string | null>(null);
  const storeName = storeNameOverride ?? store?.name ?? "";
  const storeDesc = storeDescOverride ?? store?.description ?? "";

  const handleSaveStore = () => {
    updateStore.mutate({ name: storeName, description: storeDesc });
  };

  const inputCls =
    "w-full h-9 px-3 rounded-lg text-[13px] outline-none transition-all";
  const inputStyle = {
    backgroundColor: "var(--color-input-bg)",
    border: "1px solid var(--color-border)",
    color: "var(--color-text)",
  };
  const selectStyle = { ...inputStyle, appearance: "none" as const };

  const tabs = [
    { id: "store", label: "Store Info" },
    { id: "tax", label: "Tax Settings" },
    { id: "payment", label: "Payment Methods" },
    { id: "receipts", label: "Receipts" },
    { id: "integrations", label: "Integrations" },
    { id: "backup", label: "Backup & Export" },
  ];

  return (
    <div className="grid grid-cols-[220px_1fr] gap-4">
      {/* Sidebar nav */}
      <div
        className="rounded-xl p-2 h-fit border"
        style={{
          backgroundColor: "var(--color-card)",
          borderColor: "var(--color-border)",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 my-0.5 rounded-lg text-xs font-semibold transition-all text-left border"
            style={{
              color:
                activeTab === tab.id
                  ? "var(--color-primary)"
                  : "var(--color-text-muted)",
              backgroundColor:
                activeTab === tab.id ? "var(--color-primary)1a" : "transparent",
              borderColor:
                activeTab === tab.id ? "var(--color-primary)33" : "transparent",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content panel */}
      <div
        className="rounded-xl p-6 border"
        style={{
          backgroundColor: "var(--color-card)",
          borderColor: "var(--color-border)",
        }}
      >
        {activeTab === "store" && (
          <>
            <div
              className="font-extrabold text-base mb-0.5"
              style={{ color: "var(--color-text)" }}
            >
              Store Information
            </div>
            <div
              className="text-xs mb-5"
              style={{ color: "var(--color-text-muted)" }}
            >
              Configure your store details and operating information
            </div>
            {storeLoading ? (
              <div
                className="text-sm"
                style={{ color: "var(--color-text-muted)" }}
              >
                Loading...
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3.5 mb-5">
                  <div>
                    <label
                      className="block text-[10px] font-bold uppercase tracking-widest mb-1.5"
                      style={{ color: "var(--color-text-subtle)" }}
                    >
                      Store Name
                    </label>
                    <input
                      value={storeName}
                      onChange={(e) => setStoreNameOverride(e.target.value)}
                      className={inputCls}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-[10px] font-bold uppercase tracking-widest mb-1.5"
                      style={{ color: "var(--color-text-subtle)" }}
                    >
                      Description
                    </label>
                    <input
                      value={storeDesc}
                      onChange={(e) => setStoreDescOverride(e.target.value)}
                      className={inputCls}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-[10px] font-bold uppercase tracking-widest mb-1.5"
                      style={{ color: "var(--color-text-subtle)" }}
                    >
                      Currency
                    </label>
                    <select className={inputCls} style={selectStyle}>
                      <option>EUR (€)</option>
                      <option>USD ($)</option>
                      <option>GBP (£)</option>
                    </select>
                  </div>
                </div>
                <div
                  className="pt-4 border-t flex justify-end"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <button
                    onClick={handleSaveStore}
                    disabled={updateStore.isPending || !canManageSettings}
                    className="h-9 px-4 text-white rounded-lg text-[13px] font-semibold transition-all shadow-[0_2px_8px_rgba(59,130,246,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: updateStore.isPending
                        ? "var(--color-primary)80"
                        : "var(--color-primary)",
                    }}
                    title={canManageSettings ? undefined : "Your role doesn't include permission to edit store settings"}
                  >
                    {updateStore.isPending ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {activeTab === "tax" && (
          <>
            <div
              className="font-extrabold text-base mb-0.5"
              style={{ color: "var(--color-text)" }}
            >
              Tax Settings
            </div>
            <div
              className="text-xs mb-5"
              style={{ color: "var(--color-text-muted)" }}
            >
              Configure tax rates and calculations
            </div>
            <div className="grid grid-cols-2 gap-3.5 mb-5">
              <div>
                <label
                  className="block text-[10px] font-bold uppercase tracking-widest mb-1.5"
                  style={{ color: "var(--color-text-subtle)" }}
                >
                  Default Tax Rate (%)
                </label>
                <input
                  type="number"
                  defaultValue="21"
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
              <div>
                <label
                  className="block text-[10px] font-bold uppercase tracking-widest mb-1.5"
                  style={{ color: "var(--color-text-subtle)" }}
                >
                  Tax Number
                </label>
                <input
                  type="text"
                  defaultValue="NL123456789B01"
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
              <div>
                <label
                  className="block text-[10px] font-bold uppercase tracking-widest mb-1.5"
                  style={{ color: "var(--color-text-subtle)" }}
                >
                  Tax Included in Price
                </label>
                <select className={inputCls} style={selectStyle}>
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </div>
            </div>
            <div
              className="pt-4 border-t flex justify-end"
              style={{ borderColor: "var(--color-border)" }}
            >
              <button
                className="h-9 px-4 text-white rounded-lg text-[13px] font-semibold shadow-[0_2px_8px_rgba(59,130,246,0.3)]"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                Save Changes
              </button>
            </div>
          </>
        )}

        {activeTab === "payment" && <PaymentMethodSettings />}

        {activeTab === "receipts" && (
          <>
            <div
              className="font-extrabold text-base mb-0.5"
              style={{ color: "var(--color-text)" }}
            >
              Receipt Settings
            </div>
            <div
              className="text-xs mb-5"
              style={{ color: "var(--color-text-muted)" }}
            >
              Configure receipt header, footer and email settings
            </div>
            <div className="grid grid-cols-1 gap-3.5 mb-5">
              <div>
                <label
                  className="block text-[10px] font-bold uppercase tracking-widest mb-1.5"
                  style={{ color: "var(--color-text-subtle)" }}
                >
                  Receipt Header
                </label>
                <input
                  defaultValue="RetailCore Main Store"
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
              <div>
                <label
                  className="block text-[10px] font-bold uppercase tracking-widest mb-1.5"
                  style={{ color: "var(--color-text-subtle)" }}
                >
                  Receipt Footer Message
                </label>
                <input
                  defaultValue="Thank you for shopping with us!"
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
              <div>
                <label
                  className="block text-[10px] font-bold uppercase tracking-widest mb-1.5"
                  style={{ color: "var(--color-text-subtle)" }}
                >
                  Store Email for Receipts
                </label>
                <input
                  type="email"
                  defaultValue="receipts@retailcore.com"
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
            </div>
            <div
              className="pt-4 border-t flex justify-end"
              style={{ borderColor: "var(--color-border)" }}
            >
              <button
                className="h-9 px-4 text-white rounded-lg text-[13px] font-semibold"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                Save Changes
              </button>
            </div>
          </>
        )}

        {activeTab === "integrations" && (
          <>
            <div
              className="font-extrabold text-base mb-0.5"
              style={{ color: "var(--color-text)" }}
            >
              Integrations
            </div>
            <div
              className="text-xs mb-5"
              style={{ color: "var(--color-text-muted)" }}
            >
              Connect with third-party services
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  name: "QuickBooks",
                  desc: "Sync sales and inventory",
                  icon: "📒",
                },
                { name: "Xero", desc: "Accounting integration", icon: "📊" },
                { name: "Shopify", desc: "E-commerce sync", icon: "🛍️" },
                { name: "Square", desc: "Payment processor", icon: "◼️" },
              ].map((int) => (
                <div
                  key={int.name}
                  className="border rounded-xl p-4 transition-all"
                  style={{
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <div className="text-2xl mb-2">{int.icon}</div>
                  <div
                    className="text-[13px] font-semibold mb-0.5"
                    style={{ color: "var(--color-text)" }}
                  >
                    {int.name}
                  </div>
                  <div
                    className="text-[11px] mb-3"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {int.desc}
                  </div>
                  <button
                    className="h-7 px-3 rounded-lg text-[11px] font-semibold transition-all border"
                    style={{
                      backgroundColor: "var(--color-primary)1a",
                      borderColor: "var(--color-primary)4d",
                      color: "var(--color-primary)",
                    }}
                  >
                    Connect
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "backup" && (
          <>
            <div
              className="font-extrabold text-base mb-0.5"
              style={{ color: "var(--color-text)" }}
            >
              Backup & Export
            </div>
            <div
              className="text-xs mb-5"
              style={{ color: "var(--color-text-muted)" }}
            >
              Manage data backups and exports
            </div>
            <div className="flex flex-col gap-3">
              {[
                {
                  label: "Export All Data",
                  desc: "Download complete backup of all data",
                  action: "Export Now",
                },
                {
                  label: "Daily Auto-Backup",
                  desc: "Automatically backup data every day at midnight",
                  action: "Configure",
                },
                {
                  label: "Import Data",
                  desc: "Restore from a previous backup file",
                  action: "Import",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between border rounded-xl p-4"
                  style={{
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <div>
                    <div
                      className="text-[13px] font-semibold"
                      style={{ color: "var(--color-text)" }}
                    >
                      {item.label}
                    </div>
                    <div
                      className="text-[11px]"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {item.desc}
                    </div>
                  </div>
                  <button
                    className="h-8 px-4 rounded-lg text-[12px] font-semibold transition-all border"
                    style={{
                      backgroundColor: "var(--color-primary)1a",
                      borderColor: "var(--color-primary)4d",
                      color: "var(--color-primary)",
                    }}
                  >
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
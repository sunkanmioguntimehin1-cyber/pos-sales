// 'use client';
// import { useState } from 'react';
// import { IconTrendUp, IconTrendDown } from '@/components/ui/Icons';
// import { useOrders, useProducts, useStaff, useCustomers } from '@/lib/hooks';

// const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// export function DashboardScreen() {
//   const [selectedMonth, setSelectedMonth] = useState('October');
//   const [dropdownOpen, setDropdownOpen]   = useState(false);

//   const { data: orders = [] } = useOrders();
//   const { data: products = [] } = useProducts();
//   const { data: staff = [] } = useStaff();
//   const { data: customers = [] } = useCustomers();

//   const totalSales = orders
//     .filter(o => o.status === 'completed')
//     .reduce((sum, o) => sum + o.total, 0);

//   const pendingOrders = orders.filter(o => o.status === 'pending').length;
//   const activeProducts = products.filter(p => p.isActive).length;
//   const activeStaff = staff.filter(s => s.status === 'active').length;

//   const recentOrders = orders.slice(0, 5);

//   return (
//     <div className="min-h-full bg-gray-100 p-6 font-sans">

//       {/* Page header */}
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
//         <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-[0_2px_8px_rgba(59,130,246,0.35)] transition-all">
//           Generate Report
//         </button>
//       </div>

//       {/* Stat cards */}
//       <div className="grid grid-cols-4 gap-4 mb-6">
//         <div className="bg-white rounded-2xl p-5 shadow-sm flex items-start justify-between gap-3">
//           <div className="flex-1 min-w-0">
//             <p className="text-[13px] text-gray-400 font-medium mb-2">Total Products</p>
//             <p className="text-3xl font-extrabold text-gray-900 tracking-tight tabular-nums leading-none mb-2.5">
//               {products.length}
//             </p>
//             <div className="flex items-center gap-1.5 text-xs font-semibold flex-wrap">
//               <IconTrendUp size={13} className="text-emerald-500 flex-shrink-0" />
//               <span className="text-emerald-500">{activeProducts}</span>
//               <span className="text-gray-400 font-normal">active listings</span>
//             </div>
//           </div>
//           <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-100 text-amber-500">
//             <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
//               <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
//               <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
//               <line x1="12" y1="22.08" x2="12" y2="12"/>
//             </svg>
//           </div>
//         </div>

//         <div className="bg-white rounded-2xl p-5 shadow-sm flex items-start justify-between gap-3">
//           <div className="flex-1 min-w-0">
//             <p className="text-[13px] text-gray-400 font-medium mb-2">Total Orders</p>
//             <p className="text-3xl font-extrabold text-gray-900 tracking-tight tabular-nums leading-none mb-2.5">
//               {orders.length}
//             </p>
//             <div className="flex items-center gap-1.5 text-xs font-semibold flex-wrap">
//               <IconTrendUp size={13} className="text-emerald-500 flex-shrink-0" />
//               <span className="text-emerald-500">{orders.filter(o => o.status === 'completed').length}</span>
//               <span className="text-gray-400 font-normal">completed</span>
//             </div>
//           </div>
//           <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-100 text-amber-500">
//             <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
//               <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
//               <line x1="3" y1="6" x2="21" y2="6"/>
//               <path d="M16 10a4 4 0 0 1-8 0"/>
//             </svg>
//           </div>
//         </div>

//         <div className="bg-white rounded-2xl p-5 shadow-sm flex items-start justify-between gap-3">
//           <div className="flex-1 min-w-0">
//             <p className="text-[13px] text-gray-400 font-medium mb-2">Total Sales</p>
//             <p className="text-3xl font-extrabold text-gray-900 tracking-tight tabular-nums leading-none mb-2.5">
//               ${totalSales.toFixed(2)}
//             </p>
//             <div className="flex items-center gap-1.5 text-xs font-semibold flex-wrap">
//               <IconTrendUp size={13} className="text-emerald-500 flex-shrink-0" />
//               <span className="text-emerald-500">{orders.length}</span>
//               <span className="text-gray-400 font-normal">transactions</span>
//             </div>
//           </div>
//           <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-100 text-emerald-500">
//             <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
//               <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
//               <polyline points="17 6 23 6 23 12"/>
//             </svg>
//           </div>
//         </div>

//         <div className="bg-white rounded-2xl p-5 shadow-sm flex items-start justify-between gap-3">
//           <div className="flex-1 min-w-0">
//             <p className="text-[13px] text-gray-400 font-medium mb-2">Total Customers</p>
//             <p className="text-3xl font-extrabold text-gray-900 tracking-tight tabular-nums leading-none mb-2.5">
//               {customers.length}
//             </p>
//             <div className="flex items-center gap-1.5 text-xs font-semibold flex-wrap">
//               <IconTrendUp size={13} className="text-emerald-500 flex-shrink-0" />
//               <span className="text-emerald-500">{activeStaff}</span>
//               <span className="text-gray-400 font-normal">active staff</span>
//             </div>
//           </div>
//           <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-violet-100 text-violet-500">
//             <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
//               <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
//               <circle cx="9" cy="7" r="4"/>
//               <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
//             </svg>
//           </div>
//         </div>
//       </div>

//       {/* Recent Sales */}
//       <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

//         {/* Table toolbar */}
//         <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
//           <h2 className="text-base font-bold text-gray-900 tracking-tight">Recent Orders</h2>

//           {/* Month picker */}
//           <div className="relative">
//             <button
//               onClick={() => setDropdownOpen(!dropdownOpen)}
//               className="flex items-center gap-2 px-3.5 py-1.5 bg-white border border-gray-200 hover:border-gray-300 rounded-lg text-sm font-semibold text-gray-700 transition-all"
//             >
//               {selectedMonth}
//               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//                 <path d="M6 9l6 6 6-6"/>
//               </svg>
//             </button>

//             {dropdownOpen && (
//               <div className="absolute top-[calc(100%+6px)] right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden min-w-[140px]">
//                 {months.map(m => (
//                   <button
//                     key={m}
//                     onClick={() => { setSelectedMonth(m); setDropdownOpen(false); }}
//                     className={`block w-full px-4 py-2 text-left text-[13px] transition-colors ${
//                       m === selectedMonth
//                         ? 'bg-blue-50 text-blue-600 font-semibold'
//                         : 'text-gray-700 hover:bg-gray-50 font-normal'
//                     }`}
//                   >
//                     {m}
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Table */}
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="bg-gray-50">
//                 {['ORDER #', 'CUSTOMER', 'STAFF', 'TOTAL', 'STATUS'].map(col => (
//                   <th key={col} className="px-6 py-3 text-left text-[11px] font-bold tracking-widest text-gray-400 uppercase border-b border-gray-100 whitespace-nowrap">
//                     {col}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {recentOrders.length === 0 ? (
//                 <tr>
//                   <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
//                     No orders yet
//                   </td>
//                 </tr>
//               ) : (
//                 recentOrders.map((order, i) => (
//                   <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
//                     <td className="px-6 py-5 text-sm text-gray-600 tabular-nums border-b border-gray-100">
//                       {order.orderNumber}
//                     </td>
//                     <td className="px-6 py-5 text-sm text-gray-700 border-b border-gray-100 whitespace-nowrap">
//                       {order.customer?.name || 'Walk-in'}
//                     </td>
//                     <td className="px-6 py-5 text-sm text-gray-700 border-b border-gray-100 whitespace-nowrap">
//                       {order.staff?.name || '-'}
//                     </td>
//                     <td className="px-6 py-5 text-sm font-semibold text-gray-900 border-b border-gray-100 tabular-nums">
//                       ${order.total.toFixed(2)}
//                     </td>
//                     <td className="px-6 py-5 border-b border-gray-100">
//                       <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
//                         order.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
//                         order.status === 'pending' ? 'bg-amber-100 text-amber-600' :
//                         order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
//                         'bg-gray-100 text-gray-600'
//                       }`}>
//                         {order.status}
//                       </span>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
import { useState } from "react";
import { IconTrendUp } from "@/components/ui/Icons";
import { useOrders, useProducts, useStaff, useCustomers } from "@/lib/hooks";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function DashboardScreen() {
  const [selectedMonth, setSelectedMonth] = useState("October");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { data: orders = [] } = useOrders();
  const { data: products = [] } = useProducts();
  const { data: staff = [] } = useStaff();
  const { data: customers = [] } = useCustomers();

  const totalSales = orders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + o.total, 0);

  const activeProducts = products.filter((p) => p.isActive).length;
  const activeStaff = staff.filter((s) => s.status === "active").length;
  const recentOrders = orders.slice(0, 5);

  const statCards = [
    {
      label: "Total Products",
      value: products.length,
      sub: `${activeProducts} active listings`,
      color: "text-amber-400",
      iconColor: "bg-amber-500/15 text-amber-400",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
    },
    {
      label: "Total Orders",
      value: orders.length,
      sub: `${orders.filter((o) => o.status === "completed").length} completed`,
      color: "text-blue-400",
      iconColor: "bg-blue-500/15 text-blue-400",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
    {
      label: "Total Sales",
      value: `$${totalSales.toFixed(2)}`,
      sub: `${orders.length} transactions`,
      color: "text-emerald-400",
      iconColor: "bg-emerald-500/15 text-emerald-400",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      ),
    },
    {
      label: "Total Customers",
      value: customers.length,
      sub: `${activeStaff} active staff`,
      color: "text-violet-400",
      iconColor: "bg-violet-500/15 text-violet-400",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-full flex flex-col gap-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-xl font-extrabold tracking-tight"
            style={{ color: "var(--color-text)" }}
          >
            Dashboard
          </h1>
          <p
            className="text-xs mt-0.5"
            style={{ color: "var(--color-text-subtle)" }}
          >
            Live overview of your store performance
          </p>
        </div>
        <button
          className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all active:scale-95 shadow-[0_2px_8px_rgba(59,130,246,0.3)]"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          Generate Report
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl p-5 flex items-start justify-between gap-3 border"
            style={{
              backgroundColor: "var(--color-card)",
              borderColor: "var(--color-border)",
            }}
          >
            <div className="flex-1 min-w-0">
              <p
                className="text-[12px] font-medium mb-2"
                style={{ color: "var(--color-text-muted)" }}
              >
                {card.label}
              </p>
              <p
                className={`text-3xl font-extrabold tracking-tight tabular-nums leading-none mb-2.5 ${card.color}`}
              >
                {card.value}
              </p>
              <div className="flex items-center gap-1.5 text-xs font-semibold flex-wrap">
                <IconTrendUp
                  size={13}
                  className="text-emerald-400 flex-shrink-0"
                />
                <span className="text-emerald-400">
                  {card.sub.split(" ")[0]}
                </span>
                <span
                  className="font-normal"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {card.sub.split(" ").slice(1).join(" ")}
                </span>
              </div>
            </div>
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${card.iconColor}`}
            >
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div
        className="rounded-2xl border overflow-hidden flex-1"
        style={{
          backgroundColor: "var(--color-card)",
          borderColor: "var(--color-border)",
        }}
      >
        {/* Table toolbar */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "var(--color-border)" }}
        >
          <h2
            className="text-sm font-bold tracking-tight"
            style={{ color: "var(--color-text)" }}
          >
            Recent Orders
          </h2>

          {/* Month picker */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-1.5 border rounded-lg text-sm font-semibold transition-all"
              style={{
                backgroundColor: "var(--color-input-bg)",
                borderColor: "var(--color-border)",
                color: "var(--color-text)",
              }}
            >
              {selectedMonth}
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {dropdownOpen && (
              <div
                className="absolute top-[calc(100%+6px)] right-0 rounded-xl shadow-xl z-50 overflow-hidden min-w-[140px] border"
                style={{
                  backgroundColor: "var(--color-card)",
                  borderColor: "var(--color-border)",
                }}
              >
                {months.map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setSelectedMonth(m);
                      setDropdownOpen(false);
                    }}
                    className="block w-full px-4 py-2 text-left text-[13px] transition-colors"
                    style={{
                      color:
                        m === selectedMonth
                          ? "var(--color-primary)"
                          : "var(--color-text-muted)",
                      backgroundColor:
                        m === selectedMonth
                          ? "var(--color-primary)1a"
                          : "transparent",
                      fontWeight: m === selectedMonth ? 600 : 400,
                    }}
                    onMouseEnter={(e) => {
                      if (m !== selectedMonth)
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.backgroundColor = "var(--color-surface)";
                    }}
                    onMouseLeave={(e) => {
                      if (m !== selectedMonth)
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.backgroundColor = "transparent";
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "var(--color-surface)" }}>
                {["ORDER #", "CUSTOMER", "STAFF", "TOTAL", "STATUS"].map(
                  (col) => (
                    <th
                      key={col}
                      className="px-5 py-3 text-left text-[10px] font-bold tracking-widest uppercase border-b whitespace-nowrap"
                      style={{
                        borderColor: "var(--color-border)",
                        color: "var(--color-text-subtle)",
                      }}
                    >
                      {col}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-sm"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    No orders yet
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="transition-colors border-b"
                    style={{ borderColor: "var(--color-border)" }}
                    onMouseEnter={(e) =>
                      ((
                        e.currentTarget as HTMLTableRowElement
                      ).style.backgroundColor = "var(--color-surface)")
                    }
                    onMouseLeave={(e) =>
                      ((
                        e.currentTarget as HTMLTableRowElement
                      ).style.backgroundColor = "transparent")
                    }
                  >
                    <td
                      className="px-5 py-4 text-sm tabular-nums"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {order.orderNumber}
                    </td>
                    <td
                      className="px-5 py-4 text-sm font-medium whitespace-nowrap"
                      style={{ color: "var(--color-text)" }}
                    >
                      {order.customer?.name || "Walk-in"}
                    </td>
                    <td
                      className="px-5 py-4 text-sm whitespace-nowrap"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {order.staff?.name || "-"}
                    </td>
                    <td
                      className="px-5 py-4 text-sm font-semibold tabular-nums"
                      style={{ color: "var(--color-text)" }}
                    >
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          order.status === "completed"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : order.status === "pending"
                              ? "bg-amber-500/15 text-amber-400"
                              : order.status === "cancelled"
                                ? "bg-red-500/15 text-red-400"
                                : "bg-slate-500/15 text-slate-400"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
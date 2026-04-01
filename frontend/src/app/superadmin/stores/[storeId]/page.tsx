// frontend/src/app/superadmin/stores/[storeId]/page.tsx
"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore, useUpdateStore } from "@/lib/hooks";
import { useQuery } from "@tanstack/react-query";
import { staffApi } from "@/lib/api/staff";
import { productsApi } from "@/lib/api/products";
import { ordersApi } from "@/lib/api/orders";
import api from "@/lib/api/axios";

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
      <span className="text-[12px] text-slate-500">{label}</span>
      <span className="text-[12px] text-slate-200 font-medium">{value}</span>
    </div>
  );
}

const roleColors: Record<string, string> = {
  admin: "bg-red-500/15 text-red-400",
  manager: "bg-blue-500/15 text-blue-400",
  cashier: "bg-emerald-500/15 text-emerald-400",
};

export default function StoreDetailPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeId as string;
  const [activeTab, setActiveTab] = useState<
    "overview" | "staff" | "products" | "orders"
  >("overview");

  const { data: storeData, isLoading: storeLoading } = useStore(storeId);
  const updateStore = useUpdateStore();

  // Fetch store-scoped data — pass X-Tenant-Id header on behalf of superadmin
  const { data: staff = [], isLoading: staffLoading } = useQuery({
    queryKey: ["superadmin-staff", storeId],
    queryFn: () => staffApi.getAll(),
    enabled: !!storeId,
    // The axios instance will pick up X-Tenant-Id from localStorage;
    // we set it temporarily here via a direct call
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["superadmin-products", storeId],
    queryFn: async () => {
      const res = await api.get<{ products: any[] }>("/api/products", {
        headers: { "X-Tenant-Id": storeId },
      });
      return res.data.products;
    },
    enabled: !!storeId && activeTab === "products",
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["superadmin-orders", storeId],
    queryFn: async () => {
      const res = await api.get<{ orders: any[] }>("/api/orders", {
        headers: { "X-Tenant-Id": storeId },
      });
      return res.data.orders;
    },
    enabled: !!storeId && activeTab === "orders",
  });

  const { data: storeStaff = [] } = useQuery({
    queryKey: ["superadmin-staff-list", storeId],
    queryFn: async () => {
      const res = await api.get<{ staff: any[] }>("/api/staff", {
        headers: { "X-Tenant-Id": storeId },
      });
      return res.data.staff;
    },
    enabled: !!storeId && activeTab === "staff",
  });

  if (storeLoading) {
    return (
      <div className="p-6 min-h-screen bg-[#080C14] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!storeData) {
    return (
      <div className="p-6 min-h-screen bg-[#080C14]">
        <p className="text-slate-500">Store not found.</p>
      </div>
    );
  }

  const store = storeData;
  const totalRevenue = orders
    .filter((o: any) => o.status === "completed")
    .reduce((sum: number, o: any) => sum + o.total, 0);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "staff", label: "Staff" },
    { id: "products", label: "Products" },
    { id: "orders", label: "Orders" },
  ] as const;

  return (
    <div className="p-6 min-h-screen bg-[#080C14]">
      {/* Breadcrumb + Header */}
      <div className="flex items-center gap-2 text-[12px] text-slate-500 mb-5">
        <button
          onClick={() => router.push("/superadmin/stores")}
          className="hover:text-slate-300 transition-colors"
        >
          Stores
        </button>
        <span>/</span>
        <span className="text-slate-300">{store.name}</span>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-[18px] font-bold text-white"
            style={{
              backgroundColor:
                (store.settings?.primaryColor || "#3B82F6") + "25",
              border: `1px solid ${store.settings?.primaryColor || "#3B82F6"}40`,
            }}
          >
            {store.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-[20px] font-bold text-white">{store.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[12px] text-slate-500 font-mono">
                {store.subdomain}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${store.isActive ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${store.isActive ? "bg-emerald-400" : "bg-red-400"}`}
                />
                {store.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() =>
              updateStore.mutate({
                storeId: store.id,
                data: { isActive: !store.isActive },
              })
            }
            className={`h-8 px-3 rounded-lg text-[12px] font-semibold border transition-all ${
              store.isActive
                ? "bg-amber-500/15 text-amber-400 border-amber-500/20 hover:bg-amber-500/25"
                : "bg-emerald-500/15 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/25"
            }`}
          >
            {store.isActive ? "Suspend Store" : "Activate Store"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 bg-[#0F1829] border border-white/[0.06] rounded-xl p-1 w-fit mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`h-8 px-4 rounded-lg text-[12px] font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-blue-500 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Total Staff",
                  value: store.stats?.staffCount ?? staff.length,
                  color: "text-blue-400",
                },
                {
                  label: "Branches",
                  value: store.stats?.branchCount ?? 0,
                  color: "text-violet-400",
                },
                {
                  label: "Total Orders",
                  value: orders.length,
                  color: "text-emerald-400",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-[#0F1829] border border-white/[0.06] rounded-xl p-4"
                >
                  <div
                    className={`text-[24px] font-bold tabular-nums ${s.color}`}
                  >
                    {s.value}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Store Info */}
            <div className="bg-[#0F1829] border border-white/[0.06] rounded-xl p-5">
              <h3 className="text-[13px] font-semibold text-white mb-4">
                Store Information
              </h3>
              <InfoRow label="Store Name" value={store.name} />
              <InfoRow
                label="Subdomain"
                value={
                  <span className="font-mono text-slate-300">
                    {store.subdomain}
                  </span>
                }
              />
              <InfoRow
                label="Description"
                value={
                  store.description || (
                    <span className="text-slate-600 italic">None</span>
                  )
                }
              />
              <InfoRow
                label="Created"
                value={new Date(store.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              />
              <InfoRow label="Theme" value={store.settings?.theme || "dark"} />
              <InfoRow
                label="Primary Color"
                value={
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: store.settings?.primaryColor }}
                    />
                    <span className="font-mono text-slate-300">
                      {store.settings?.primaryColor}
                    </span>
                  </div>
                }
              />
            </div>
          </div>

          {/* Owner Card */}
          <div className="space-y-4">
            <div className="bg-[#0F1829] border border-white/[0.06] rounded-xl p-5">
              <h3 className="text-[13px] font-semibold text-white mb-4">
                Store Owner
              </h3>
              {store.admin ? (
                <div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[16px] font-bold mb-3">
                    {store.admin.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="text-[14px] font-semibold text-slate-100 mb-0.5">
                    {store.admin.name}
                  </div>
                  <div className="text-[12px] text-slate-400">
                    {store.admin.email}
                  </div>
                </div>
              ) : (
                <div className="text-[12px] text-slate-600 italic">
                  No owner assigned
                </div>
              )}
            </div>

            <div className="bg-[#0F1829] border border-white/[0.06] rounded-xl p-5">
              <h3 className="text-[13px] font-semibold text-white mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab("staff")}
                  className="w-full flex items-center justify-between h-8 px-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] rounded-lg text-[12px] text-slate-400 hover:text-slate-200 transition-all"
                >
                  View Staff <span className="text-slate-600">→</span>
                </button>
                <button
                  onClick={() => setActiveTab("products")}
                  className="w-full flex items-center justify-between h-8 px-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] rounded-lg text-[12px] text-slate-400 hover:text-slate-200 transition-all"
                >
                  View Products <span className="text-slate-600">→</span>
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="w-full flex items-center justify-between h-8 px-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] rounded-lg text-[12px] text-slate-400 hover:text-slate-200 transition-all"
                >
                  View Orders <span className="text-slate-600">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Staff Tab */}
      {activeTab === "staff" && (
        <div className="bg-[#0F1829] border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.05]">
            <h3 className="text-[14px] font-semibold text-white">
              Staff Members
            </h3>
          </div>
          {staffLoading ? (
            <div className="p-8 text-center">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {["Name", "Email", "Role", "Status"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-600 bg-[#0B1120]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {storeStaff.map((s: any) => (
                  <tr
                    key={s.id}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
                          {s.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="text-[13px] text-slate-200 font-medium">
                          {s.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[12px] text-slate-400">
                      {s.email || "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${roleColors[s.role] || "bg-slate-500/15 text-slate-400"}`}
                      >
                        {s.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.status === "active" ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-500/15 text-slate-400"}`}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {storeStaff.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-10 text-center text-slate-600 text-[13px]"
                    >
                      No staff members found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Products Tab */}
      {activeTab === "products" && (
        <div className="bg-[#0F1829] border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.05]">
            <h3 className="text-[14px] font-semibold text-white">
              Products{" "}
              <span className="text-slate-500 font-normal text-[12px]">
                ({products.length})
              </span>
            </h3>
          </div>
          {productsLoading ? (
            <div className="p-8 text-center">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {["Product", "SKU", "Price", "Stock", "Status"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-600 bg-[#0B1120]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p: any) => (
                  <tr
                    key={p._id || p.id}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-3 text-[13px] text-slate-200 font-medium">
                      {p.name}
                    </td>
                    <td className="px-5 py-3 text-[11px] text-slate-500 font-mono">
                      {p.sku || "—"}
                    </td>
                    <td className="px-5 py-3 text-[13px] text-slate-200 font-semibold tabular-nums">
                      ${p.price?.toFixed(2)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-[13px] font-semibold tabular-nums ${p.stock === 0 ? "text-red-400" : p.stock < 10 ? "text-amber-400" : "text-slate-200"}`}
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.isActive ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-500/15 text-slate-400"}`}
                      >
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-10 text-center text-slate-600 text-[13px]"
                    >
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="bg-[#0F1829] border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between">
            <h3 className="text-[14px] font-semibold text-white">
              Orders{" "}
              <span className="text-slate-500 font-normal text-[12px]">
                ({orders.length})
              </span>
            </h3>
            {orders.length > 0 && (
              <span className="text-[12px] text-emerald-400 font-semibold">
                ${totalRevenue.toFixed(2)} total revenue
              </span>
            )}
          </div>
          {ordersLoading ? (
            <div className="p-8 text-center">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {[
                    "Order #",
                    "Customer",
                    "Total",
                    "Payment",
                    "Status",
                    "Date",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-600 bg-[#0B1120]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 50).map((o: any) => (
                  <tr
                    key={o._id || o.id}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-3 text-[11px] font-mono text-blue-400 font-semibold">
                      {o.orderNumber}
                    </td>
                    <td className="px-5 py-3 text-[12px] text-slate-300">
                      {o.customerId?.name || o.customer?.name || "Walk-in"}
                    </td>
                    <td className="px-5 py-3 text-[13px] text-slate-200 font-semibold tabular-nums">
                      ${o.total?.toFixed(2)}
                    </td>
                    <td className="px-5 py-3 text-[11px] text-slate-400 capitalize">
                      {o.paymentMethod || "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          o.status === "completed"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : o.status === "pending"
                              ? "bg-amber-500/15 text-amber-400"
                              : o.status === "cancelled"
                                ? "bg-red-500/15 text-red-400"
                                : "bg-slate-500/15 text-slate-400"
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[11px] text-slate-500">
                      {new Date(o.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-slate-600 text-[13px]"
                    >
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

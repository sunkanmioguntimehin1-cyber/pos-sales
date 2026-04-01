// frontend/src/app/superadmin/dashboard/page.tsx
"use client";
import { useStores } from "@/lib/hooks";
import { useRouter } from "next/navigation";
import { Store } from "@/lib/api/stores";

function StatCard({
  label,
  value,
  sub,
  color,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-[#0F1829] border border-white/[0.06] rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}
        >
          {icon}
        </div>
      </div>
      <div className="text-[28px] font-bold text-white tracking-tight tabular-nums">
        {value}
      </div>
      <div className="text-[12px] text-slate-500 mt-0.5">{label}</div>
      {sub && <div className="text-[11px] text-slate-600 mt-1">{sub}</div>}
    </div>
  );
}

function ActivityDot({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-block w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-400" : "bg-slate-600"}`}
    />
  );
}

export default function SuperadminDashboard() {
  const { data: stores = [], isLoading } = useStores();
  const router = useRouter();

  const activeStores = stores.filter((s) => s.isActive).length;
  const inactiveStores = stores.filter((s) => !s.isActive).length;
  const totalStaff = stores.reduce((sum, s) => sum + (s.staffCount || 0), 0);
  const recentStores = [...stores]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 6);

  return (
    <div className="p-6 min-h-screen bg-[#080C14]">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-[22px] font-bold text-white tracking-tight">
            Platform Overview
          </h1>
          <p className="text-[13px] text-slate-500 mt-0.5">
            Monitor all stores and platform health
          </p>
        </div>
        <button
          onClick={() => router.push("/superadmin/stores/new")}
          className="flex items-center gap-2 h-9 px-4 bg-blue-500 hover:bg-blue-600 text-white text-[13px] font-semibold rounded-lg transition-all shadow-[0_2px_12px_rgba(59,130,246,0.35)]"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Store
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-7">
        <StatCard
          label="Total Stores"
          value={isLoading ? "—" : stores.length}
          sub={`${activeStores} active`}
          color="bg-blue-500/15 text-blue-400"
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          }
        />
        <StatCard
          label="Active Stores"
          value={isLoading ? "—" : activeStores}
          color="bg-emerald-500/15 text-emerald-400"
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          }
        />
        <StatCard
          label="Total Staff"
          value={isLoading ? "—" : totalStaff}
          sub="across all stores"
          color="bg-violet-500/15 text-violet-400"
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
        <StatCard
          label="Inactive Stores"
          value={isLoading ? "—" : inactiveStores}
          color="bg-amber-500/15 text-amber-400"
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          }
        />
      </div>

      {/* Recent Stores Table */}
      <div className="bg-[#0F1829] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h2 className="text-[14px] font-semibold text-white">
              Recent Stores
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Latest created tenant stores
            </p>
          </div>
          <button
            onClick={() => router.push("/superadmin/stores")}
            className="text-[12px] text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            View all →
          </button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.05]">
                {["Store", "Owner", "Staff", "Status", "Created", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-600 bg-[#0B1120]"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {recentStores.map((store) => (
                <tr
                  key={store.id}
                  className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0"
                        style={{
                          backgroundColor:
                            (store.settings?.primaryColor || "#3B82F6") + "30",
                          border: `1px solid ${store.settings?.primaryColor || "#3B82F6"}40`,
                        }}
                      >
                        {store.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold text-slate-100">
                          {store.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {store.subdomain}.pos
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="text-[12px] text-slate-300">
                      {store.admin?.name || "—"}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {store.admin?.email || ""}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[13px] font-semibold text-slate-200 tabular-nums">
                      {store.staffCount || 0}
                    </span>
                    <span className="text-[11px] text-slate-500 ml-1">
                      members
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${store.isActive ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}
                    >
                      <ActivityDot active={store.isActive} />
                      {store.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[12px] text-slate-500">
                    {new Date(store.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() =>
                        router.push(`/superadmin/stores/${store.id}`)
                      }
                      className="h-7 px-3 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-slate-400 hover:text-slate-200 rounded-md text-[11px] font-medium transition-all"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {recentStores.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-slate-600 text-[13px]"
                  >
                    No stores created yet.{" "}
                    <button
                      onClick={() => router.push("/superadmin/stores/new")}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Create your first store →
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

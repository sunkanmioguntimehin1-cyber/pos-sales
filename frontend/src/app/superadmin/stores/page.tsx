// frontend/src/app/superadmin/stores/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStores, useUpdateStore, useDeleteStore } from "@/lib/hooks";
import { Store } from "@/lib/api/stores";

const themeLabels: Record<string, string> = {
  dark: "Dark",
  light: "Light",
  gold: "Gold",
};

function StoreRow({
  store,
  onView,
  onToggle,
  onDelete,
}: {
  store: Store;
  onView: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <tr className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[14px] font-bold text-white flex-shrink-0"
            style={{
              backgroundColor:
                (store.settings?.primaryColor || "#3B82F6") + "25",
              border: `1px solid ${store.settings?.primaryColor || "#3B82F6"}35`,
            }}
          >
            {store.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-[13px] font-semibold text-slate-100">
              {store.name}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-px">
              {store.subdomain}
            </div>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        {store.admin ? (
          <div>
            <div className="text-[12px] text-slate-200">{store.admin.name}</div>
            <div className="text-[11px] text-slate-500">
              {store.admin.email}
            </div>
          </div>
        ) : (
          <span className="text-[12px] text-slate-600 italic">
            No owner set
          </span>
        )}
      </td>
      <td className="px-5 py-4">
        <span className="text-[13px] font-semibold text-slate-200 tabular-nums">
          {store.staffCount || 0}
        </span>
      </td>
      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${store.isActive ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${store.isActive ? "bg-emerald-400" : "bg-red-400"}`}
          />
          {store.isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block border border-white/20 flex-shrink-0"
            style={{
              backgroundColor: store.settings?.primaryColor || "#3B82F6",
            }}
          />
          <span className="text-[11px] text-slate-400">
            {themeLabels[store.settings?.theme || "dark"]}
          </span>
        </div>
      </td>
      <td className="px-5 py-4 text-[12px] text-slate-500">
        {new Date(store.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onView}
            className="h-7 px-2.5 bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 rounded-md text-[11px] font-medium transition-all border border-blue-500/20"
          >
            View
          </button>
          <button
            onClick={onToggle}
            className={`h-7 px-2.5 rounded-md text-[11px] font-medium transition-all border ${
              store.isActive
                ? "bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border-amber-500/20"
                : "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border-emerald-500/20"
            }`}
          >
            {store.isActive ? "Suspend" : "Activate"}
          </button>
          <button
            onClick={onDelete}
            className="h-7 px-2.5 bg-red-500/15 hover:bg-red-500/25 text-red-400 rounded-md text-[11px] font-medium transition-all border border-red-500/20"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function StoresPage() {
  const router = useRouter();
  const { data: stores = [], isLoading } = useStores();
  const updateStore = useUpdateStore();
  const deleteStore = useDeleteStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [deleteConfirm, setDeleteConfirm] = useState<Store | null>(null);

  const filtered = stores.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.subdomain.toLowerCase().includes(search.toLowerCase()) ||
      (s.admin?.email || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" ? s.isActive : !s.isActive);
    return matchSearch && matchStatus;
  });

  const handleToggle = (store: Store) => {
    updateStore.mutate({
      storeId: store.id,
      data: { isActive: !store.isActive },
    });
  };

  const handleDelete = (store: Store) => {
    setDeleteConfirm(store);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteStore.mutate(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-[#080C14]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-white tracking-tight">
            All Stores
          </h1>
          <p className="text-[13px] text-slate-500 mt-0.5">
            {stores.length} tenant stores on the platform
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
          Create Store
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            className="w-full h-9 pl-9 pr-4 bg-[#0F1829] border border-white/[0.08] rounded-lg text-[13px] text-slate-100 placeholder:text-slate-600 outline-none focus:border-blue-500/50 transition-all"
            placeholder="Search by name, subdomain, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 p-1 bg-[#0F1829] border border-white/[0.08] rounded-lg">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`h-7 px-3 rounded-md text-[11px] font-semibold capitalize transition-all ${
                statusFilter === f
                  ? "bg-blue-500 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0F1829] border border-white/[0.06] rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {[
                  "Store",
                  "Owner",
                  "Staff",
                  "Status",
                  "Theme",
                  "Created",
                  "Actions",
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
              {filtered.map((store) => (
                <StoreRow
                  key={store.id}
                  store={store}
                  onView={() => router.push(`/superadmin/stores/${store.id}`)}
                  onToggle={() => handleToggle(store)}
                  onDelete={() => handleDelete(store)}
                />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-slate-600 text-[13px]"
                  >
                    {search
                      ? `No stores match "${search}"`
                      : "No stores found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
        <div className="px-5 py-3 border-t border-white/[0.05] bg-[#0B1120]">
          <span className="text-[11px] text-slate-600">
            Showing {filtered.length} of {stores.length} stores
          </span>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="relative bg-[#0F1829] border border-white/[0.1] rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center mb-4 mx-auto">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#f87171"
                strokeWidth="1.75"
                strokeLinecap="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h3 className="text-[16px] font-bold text-white text-center mb-2">
              Delete {deleteConfirm.name}?
            </h3>
            <p className="text-[13px] text-slate-400 text-center mb-6">
              This will permanently delete the store, its admin account, all
              staff, branches, products and categories. This action{" "}
              <strong className="text-red-400">cannot be undone</strong>.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 h-9 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.1] text-slate-300 rounded-lg text-[13px] font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 h-9 bg-red-500 hover:bg-red-600 text-white rounded-lg text-[13px] font-semibold transition-all shadow-[0_2px_12px_rgba(239,68,68,0.3)]"
              >
                Delete Store
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

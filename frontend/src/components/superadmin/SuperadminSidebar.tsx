// frontend/src/components/superadmin/SuperadminSidebar.tsx
"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useTenantsStore } from "@/store/tenantsStore";
import { useTenantStore } from "@/store/tenantStore";
import { useStores } from "@/lib/hooks";
import { storeToTenant } from "@/lib/api";

const nav = [
  {
    section: null,
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        path: "/superadmin/dashboard",
        icon: (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        ),
      },
    ],
  },
  {
    section: "Store Management",
    items: [
      {
        id: "stores",
        label: "All Stores",
        path: "/superadmin/stores",
        icon: (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        ),
      },
      {
        id: "create",
        label: "Create Store",
        path: "/superadmin/stores/new",
        icon: (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        ),
      },
    ],
  },
  {
    section: "Platform",
    items: [
      {
        id: "settings",
        label: "Settings",
        path: "/superadmin/settings",
        icon: (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        ),
      },
    ],
  },
];

export function SuperadminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { tenant: currentTenant, setTenant } = useTenantStore();
  const { setTenants } = useTenantsStore();
  const { data: stores = [] } = useStores();
  const [showTenantDropdown, setShowTenantDropdown] = useState(false);

  const tenants = stores.map(storeToTenant);

  const handleTenantSelect = (subdomain: string) => {
    const selectedStore = stores.find(s => s.subdomain === subdomain);
    if (selectedStore) {
      const tenant = storeToTenant(selectedStore);
      setTenant(tenant);
      document.cookie = `tenant-subdomain=${subdomain}; path=/; max-age=31536000`;
      const protocol = window.location.protocol;
      window.location.href = `${protocol}//${subdomain}.localhost:3000`;
    }
    setShowTenantDropdown(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tenantId");
    logout();
    router.push("/login");
  };

  const isActive = (path: string) => {
    if (path === "/superadmin/dashboard") return pathname === path;
    return pathname.startsWith(path);
  };

  return (
    <aside
      className="w-64 h-screen flex flex-col fixed left-0 top-0 z-50 border-r border-white/[0.06]"
      style={{ backgroundColor: "#0B1120" }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_2px_12px_rgba(59,130,246,0.5)]">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <div className="text-[13px] font-bold text-white tracking-tight">
              RetailCore
            </div>
            <div className="text-[10px] text-blue-400 font-semibold tracking-widest uppercase">
              Super Admin
            </div>
          </div>
        </div>

        {/* Tenant Selector */}
        <div className="mt-4 relative">
          <button
            onClick={() => setShowTenantDropdown(!showTenantDropdown)}
            className="w-full flex items-center gap-2 px-3 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg transition-all"
          >
            <div
              className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
              style={{
                backgroundColor: currentTenant?.settings?.primaryColor
                  ? currentTenant.settings.primaryColor + "30"
                  : "#3B82F630",
                border: `1px solid ${currentTenant?.settings?.primaryColor || "#3B82F6"}40`,
              }}
            >
              {currentTenant?.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-[11px] font-medium text-slate-300 truncate">
                {currentTenant?.name || "Select Store"}
              </div>
              <div className="text-[9px] text-slate-500 truncate">
                {currentTenant?.subdomain || "No store selected"}
              </div>
            </div>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`text-slate-500 transition-transform ${showTenantDropdown ? "rotate-180" : ""}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {showTenantDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#0B1120] border border-white/[0.1] rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
              {tenants.length === 0 ? (
                <div className="px-3 py-2 text-[11px] text-slate-500 text-center">
                  No stores available
                </div>
              ) : (
                tenants.map((tenant) => (
                  <button
                    key={tenant.id}
                    onClick={() => handleTenantSelect(tenant.subdomain)}
                    className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-white/[0.06] transition-colors ${
                      currentTenant?.id === tenant.id ? "bg-blue-500/10" : ""
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white"
                      style={{
                        backgroundColor: tenant.settings?.primaryColor || "#3B82F6",
                      }}
                    >
                      {tenant.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="text-[11px] font-medium text-slate-300 truncate">
                        {tenant.name}
                      </div>
                      <div className="text-[9px] text-slate-500 truncate">
                        {tenant.subdomain}.pos
                      </div>
                    </div>
                    {tenant.isActive ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {nav.map((group, gi) => (
          <div key={gi} className={gi > 0 ? "mt-4" : ""}>
            {group.section && (
              <div className="text-[9px] font-bold tracking-widest uppercase text-slate-600 px-2 py-1.5 mb-1">
                {group.section}
              </div>
            )}
            {group.items.map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.id}
                  onClick={() => router.push(item.path)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 text-left mb-0.5 ${
                    active
                      ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent"
                  }`}
                >
                  <span className={active ? "text-blue-400" : "text-slate-500"}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg mb-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || "S"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold text-slate-200 truncate">
              {user?.name}
            </div>
            <div className="text-[10px] text-slate-500 truncate">
              {user?.email}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
}

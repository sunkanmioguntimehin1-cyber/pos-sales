'use client';
import { useStore } from '@/lib/hooks';
import { useLogout } from '@/lib/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import {
  IconDashboard, IconOrders, IconProducts, IconCategories, IconInventory,
  IconCustomers, IconReports, IconSettings, IconPOS, IconStore, IconUser,
  IconChevronRight, IconX, IconUpload,
} from '@/components/ui/Icons';

type NavItem =
  | { section: string }
  | { id: string; label: string; Icon: React.ComponentType<{ size?: number; className?: string }>; live?: boolean };

const nav: NavItem[] = [
  { section: 'Overview' },
  { id: 'dashboard',  label: 'Dashboard',    Icon: IconDashboard },
  { id: 'pos',        label: 'POS Terminal', Icon: IconPOS, live: true },
  { id: 'orders',     label: 'Orders',       Icon: IconOrders },
  { id: 'products',   label: 'Products',     Icon: IconProducts },
  { id: 'categories', label: 'Categories',   Icon: IconCategories },
  { section: 'Operations' },
  { id: 'inventory',  label: 'Inventory',    Icon: IconInventory },
  { id: 'transfers',  label: 'Transfers',    Icon: IconUpload },
  { id: 'customers',  label: 'Customers',    Icon: IconCustomers },
  { id: 'reports',    label: 'Reports',      Icon: IconReports },
  { section: 'Configuration' },
  { id: 'branches',   label: 'Branches',     Icon: IconStore },
  { id: 'staff',      label: 'Staff',        Icon: IconUser },
  { id: 'settings',   label: 'Settings',     Icon: IconSettings },
];

function initials(name?: string) {
  if (!name) return 'U';
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
}

interface SidebarProps {
  active?: string;
  onChange?: (id: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  active = 'dashboard',
  onChange,
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const { data: store } = useStore();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  const brandName = store?.name || 'RetailCore';
  const width = collapsed ? 76 : 260;

  return (
    <>
      {/* Mobile scrim */}
      <div
        onClick={onCloseMobile}
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-200 ${
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        style={{ backgroundColor: 'var(--overlay)', backdropFilter: 'blur(2px)' }}
      />

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r transition-[width,transform] duration-250 ease-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          width,
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Brand */}
        <div
          className="flex h-16 flex-shrink-0 items-center gap-2.5 border-b px-4"
          style={{ borderColor: 'var(--border)' }}
        >
          <div
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
            style={{
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              boxShadow: '0 6px 18px -8px var(--primary)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.1" strokeLinecap="round">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4M6 9h.01M9 9h6" />
            </svg>
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-[15px] font-bold tracking-tight">{brandName}</div>
              <div className="eyebrow">Point of Sale</div>
            </div>
          )}

          {!collapsed && (
            <button onClick={onCloseMobile} className="icon-btn icon-btn-sm lg:hidden" aria-label="Close navigation">
              <IconX size={14} />
            </button>
          )}
        </div>

        {/* Store pill */}
        {!collapsed && (
          <div
            className="mx-3 mt-3 flex items-center gap-2.5 rounded-xl border px-3 py-2.5"
            style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border)' }}
          >
            <div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}
            >
              <IconStore size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12.5px] font-semibold">{store?.name || 'Main Store'}</div>
              <div className="truncate text-[11px] text-subtle">{store?.description || 'All systems operational'}</div>
            </div>
            <span
              className="h-2 w-2 flex-shrink-0 rounded-full animate-pulse-glow"
              style={{ backgroundColor: 'var(--success)' }}
            />
          </div>
        )}

        {/* Navigation */}
        <nav className="scroll-area flex-1 overflow-y-auto px-3 py-3">
          {nav.map((item, i) => {
            if ('section' in item) {
              if (collapsed) {
                return <div key={i} className="mx-auto my-3 h-px w-8" style={{ backgroundColor: 'var(--border)' }} />;
              }
              return (
                <div key={i} className="eyebrow px-3 pb-1.5 pt-4 first:pt-1">
                  {item.section}
                </div>
              );
            }

            const { id, label, Icon, live } = item;
            const isActive = active === id;

            return (
              <button
                key={id}
                onClick={() => { onChange?.(id); onCloseMobile?.(); }}
                title={collapsed ? label : undefined}
                className={`group relative mb-0.5 flex w-full items-center gap-3 rounded-xl py-2.5 text-[13px] font-medium transition-all duration-150 ${
                  collapsed ? 'justify-center px-0' : 'px-3'
                }`}
                style={{
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  backgroundColor: isActive ? 'var(--primary-soft)' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'var(--input-bg)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full"
                    style={{ backgroundColor: 'var(--primary)' }}
                  />
                )}
                <Icon size={17} />
                {!collapsed && <span className="truncate">{label}</span>}
                {!collapsed && live && (
                  <span
                    className="ml-auto rounded-md px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-white"
                    style={{ backgroundColor: 'var(--success)' }}
                  >
                    LIVE
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={onToggleCollapse}
          className="mx-3 mb-2 hidden h-9 items-center justify-center gap-2 rounded-xl border text-[12px] font-semibold transition-all lg:flex"
          style={{ borderColor: 'var(--border)', color: 'var(--text-subtle)' }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className={`transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`}>
            <IconChevronRight size={14} />
          </span>
          {!collapsed && <span>Collapse</span>}
        </button>

        {/* User */}
        <div
          className={`flex flex-shrink-0 items-center gap-2.5 border-t px-3 py-3 ${collapsed ? 'justify-center' : ''}`}
          style={{ borderColor: 'var(--border)' }}
        >
          <div
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
          >
            {initials(user?.name)}
          </div>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12.5px] font-semibold">{user?.name || 'Guest user'}</div>
                <div className="truncate text-[11px] capitalize text-subtle">{user?.role?.replace('_', ' ') || 'Not signed in'}</div>
              </div>
              <button
                onClick={() => logout.mutate()}
                className="icon-btn icon-btn-sm"
                title="Sign out"
                aria-label="Sign out"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </>
          )}
        </div>
      </aside>
    </>
  );
}

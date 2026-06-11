'use client';
import { useStore } from '@/lib/hooks';
import {
  IconDashboard, IconOrders, IconProducts, IconCategories, IconInventory,
  IconCustomers, IconReports, IconSettings, IconPOS, IconStore, IconUser,
} from '@/components/ui/Icons';

const nav = [
  { id: 'dashboard',  label: 'Dashboard',    Icon: IconDashboard },
  { id: 'pos',        label: 'POS Terminal',  Icon: IconPOS,        live: true },
  { id: 'orders',     label: 'Orders',        Icon: IconOrders },
  { id: 'products',   label: 'Products',      Icon: IconProducts },
  { id: 'categories', label: 'Categories',    Icon: IconCategories },
  { section: 'Operations' },
  { id: 'inventory', label: 'Inventory',     Icon: IconInventory },
  { id: 'customers', label: 'Customers',      Icon: IconCustomers },
  { id: 'reports',   label: 'Reports',        Icon: IconReports },
  { section: 'Config' },
  { id: 'branches',  label: 'Branches',      Icon: IconStore },
  { id: 'staff',     label: 'Staff',          Icon: IconUser },
  { id: 'settings',  label: 'Settings',      Icon: IconSettings },
] as const;

interface SidebarProps { active?: string; onChange?: (id: string) => void; }

export function Sidebar({ active = 'dashboard', onChange }: SidebarProps) {
  const { data: store } = useStore();

  const brandName = store?.name || 'My Store';
  const primaryColor = store?.settings.primaryColor || 'var(--color-primary)';

  return (
    <aside className="w-60 h-screen flex flex-col fixed left-0 top-0 z-50 border-r" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>

      {/* Logo */}
      <div className="px-4 py-3.5 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-[0_2px_8px_rgba(59,130,246,0.4)]"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <path d="M8 21h8M12 17v4M6 9h.01M9 9h6"/>
            </svg>
          </div>
          <div>
            <div className="font-extrabold text-sm tracking-tight" style={{ color: 'var(--color-text)' }}>{brandName}</div>
            <div className="text-[9px] font-semibold tracking-wider" style={{ color: 'var(--color-text-subtle)' }}>POS v2.0</div>
          </div>
        </div>
      </div>

      {/* Store pill */}
      <div className="mx-2 mt-2.5 mb-1 rounded-lg px-2.5 py-2 flex items-center gap-2 border" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
        <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
          <IconStore size={13} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold truncate" style={{ color: 'var(--color-text)' }}>{brandName}</div>
          <div className="text-[9px]" style={{ color: 'var(--color-text-subtle)' }}>{store?.description || 'Main Store'}</div>
        </div>
        <div className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse-glow" style={{ backgroundColor: 'var(--color-success)' }} />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-1">
        {nav.map((item, i) => {
          if ('section' in item) {
            return (
              <div key={i} className="text-[9px] font-extrabold tracking-widest uppercase px-5 pt-2.5 pb-1" style={{ color: 'var(--color-text-subtle)' }}>
                {item.section}
              </div>
            );
          }
          const { id, label, Icon } = item as { id: string; label: string; Icon: React.ComponentType<{ size?: number; className?: string }>; live?: boolean };
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange?.(id)}
              className={`w-[calc(100%-14px)] mx-[7px] flex items-center gap-2.5 px-3.5 py-2 my-[1px] rounded-lg text-xs font-semibold transition-all duration-150 border text-left ${
                isActive
                  ? 'border-blue-500/20'
                  : 'border-transparent hover:border-transparent'
              }`}
              style={{
                color: isActive ? primaryColor : 'var(--color-text-muted)',
                backgroundColor: isActive ? `${primaryColor}15` : 'transparent',
              }}
            >
              <Icon size={14} />
              <span>{label}</span>
              {(item as { live?: boolean }).live && (
                <span
                  className="ml-auto text-white text-[8px] font-extrabold px-1.5 py-px rounded tracking-wider"
                  style={{ backgroundColor: primaryColor }}
                >
                  LIVE
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-3 border-t flex items-center gap-2.5" style={{ borderColor: 'var(--color-border)' }}>
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white flex-shrink-0" style={{ background: `linear-gradient(135deg, ${primaryColor}, #8B5CF6)` }}>
          AM
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold truncate" style={{ color: 'var(--color-text)' }}>Admin Manager</div>
          <div className="text-[9px]" style={{ color: 'var(--color-text-subtle)' }}>Store Admin</div>
        </div>
        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--color-success)', boxShadow: '0 0 6px var(--color-success)' }} />
      </div>
    </aside>
  );
}

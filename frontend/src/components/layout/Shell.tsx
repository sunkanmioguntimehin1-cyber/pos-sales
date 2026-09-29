'use client';
import { useState, useSyncExternalStore } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface ShellProps {
  children: (activeTab: string) => React.ReactNode;
  defaultTab?: string;
}

const PAGE_META: Record<string, [string, string]> = {
  dashboard:  ['Dashboard',    'Live overview of your store performance'],
  pos:        ['POS Terminal', 'Process sales and manage transactions'],
  orders:     ['Orders',       'View and manage all transactions'],
  products:   ['Products',     'Manage your product catalog'],
  categories: ['Categories',   'Organize products into categories'],
  inventory:  ['Inventory',    'Track stock levels and movements'],
  transfers:  ['Transfers',    'Move stock between locations'],
  customers:  ['Customers',    'Customer database and purchase history'],
  reports:    ['Reports',      'Sales analytics and performance metrics'],
  branches:   ['Branches',     'Manage store locations and branches'],
  staff:      ['Staff',        'Manage staff members and roles'],
  roles:      ['Roles & Permissions', 'Define custom roles and what they can access'],
  settings:   ['Settings',     'Store configuration and preferences'],
};

const COLLAPSE_KEY = 'sidebar-collapsed';

/** Sidebar collapse preference, kept outside React so it survives navigation and stays SSR-safe. */
let collapsedState: boolean | null = null;
const collapseListeners = new Set<() => void>();

function subscribeCollapsed(listener: () => void) {
  collapseListeners.add(listener);
  return () => collapseListeners.delete(listener);
}

function getCollapsed() {
  if (collapsedState === null) collapsedState = localStorage.getItem(COLLAPSE_KEY) === 'true';
  return collapsedState;
}

function setCollapsed(value: boolean) {
  collapsedState = value;
  localStorage.setItem(COLLAPSE_KEY, String(value));
  collapseListeners.forEach((listener) => listener());
}

export function Shell({ children, defaultTab = 'dashboard' }: ShellProps) {
  const [active, setActive] = useState(defaultTab);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [title, subtitle] = PAGE_META[active] ?? [active, ''];
  const collapsed = useSyncExternalStore(subscribeCollapsed, getCollapsed, () => false);

  const toggleCollapse = () => setCollapsed(!collapsed);

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg)' }}>
      <Sidebar
        active={active}
        onChange={setActive}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <main
        className={`flex min-w-0 flex-1 flex-col overflow-hidden transition-[margin] duration-250 ease-out ${
          collapsed ? 'lg:ml-[76px]' : 'lg:ml-[260px]'
        }`}
      >
        <Topbar title={title} subtitle={subtitle} onOpenMobileNav={() => setMobileOpen(true)} />
        <div className="scroll-area flex-1 overflow-y-auto p-4 sm:p-6">
          <div key={active} className="animate-fade-up mx-auto w-full max-w-[1600px]">
            {children(active)}
          </div>
        </div>
      </main>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface ShellProps {
  children: (activeTab: string) => React.ReactNode;
  defaultTab?: string;
}

const PAGE_META: Record<string, [string, string]> = {
  dashboard:  ['Dashboard',     'Live overview of your store performance'],
  pos:        ['POS Terminal',   'Process sales and manage transactions'],
  orders:     ['Orders',         'View and manage all transactions'],
  products:   ['Products',       'Manage your product catalog'],
  categories: ['Categories',     'Organize products into categories'],
  inventory:  ['Inventory',      'Track stock levels and movements'],
  customers:  ['Customers',       'Customer database and purchase history'],
  reports:    ['Reports',         'Sales analytics and performance metrics'],
  branches:   ['Branches',        'Manage store locations and branches'],
  staff:      ['Staff',           'Manage staff members and roles'],
  settings:   ['Settings',        'Store configuration and preferences'],
};

export function Shell({ children, defaultTab = 'dashboard' }: ShellProps) {
  const [active, setActive] = useState(defaultTab);
  const [title, subtitle] = PAGE_META[active] ?? [active, ''];

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
      <Sidebar active={active} onChange={setActive} />
      <main className="ml-60 flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar title={title} subtitle={subtitle} />
        <div className="flex-1 overflow-y-auto p-5">
          <div className="animate-fade-up" key={active}>
            {children(active)}
          </div>
        </div>
      </main>
    </div>
  );
}

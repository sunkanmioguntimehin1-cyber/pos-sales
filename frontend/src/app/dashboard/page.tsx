'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shell } from '@/components/layout/Shell';
import { DashboardScreen } from '@/components/dashboard/DashboardScreen';
import { POSTerminalScreen } from '@/components/pos/POSTerminalScreen';
import { ProductsScreen } from '@/components/products/ProductsScreen';
import { CategoriesScreen } from '@/components/categories/CategoriesScreen';
import { InventoryScreen } from '@/components/inventory/InventoryScreen';
import { TransfersScreen } from '@/components/transfers/TransfersScreen';
import { OrdersScreen } from '@/components/orders/OrdersScreen';
import { CustomersScreen as BaseCustomersScreen } from '@/components/customers/CustomersScreen';
import { BranchesScreen } from '@/components/branches/BranchesScreen';
import { StaffScreen } from '@/components/staff/StaffScreen';
import { RolesScreen } from '@/components/roles/RolesScreen';
import { ReportsScreen, SettingsScreen } from '@/components/screens/OtherScreens';
import { useAuthStore } from '@/store/authStore';
import { can } from '@/lib/auth/can';
import type { PermissionKey } from '@/lib/api/roles';
import { IconShield } from '@/components/ui/Icons';

function CustomersScreen() {
  return <BaseCustomersScreen />;
}

/**
 * Minimum permission to open each section. The shell gating mirrors the
 * backend's `requirePermission`, so a denied user sees the card immediately
 * instead of a 403 toast once the request is in flight.
 */
const TAB_PERMISSION: Partial<Record<string, PermissionKey>> = {
  pos: 'pos',
  orders: 'orders:view',
  products: 'products:view',
  categories: 'products:view',
  inventory: 'stock:view',
  transfers: 'stock:view',
  customers: 'customers:view',
  reports: 'reports:view',
  branches: 'branches:view',
  staff: 'staff:view',
  roles: 'staff:view',
};

function AccessDenied({ tab }: { tab: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--card)] px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--input-bg)] text-subtle">
        <IconShield size={22} />
      </div>
      <div>
        <div className="text-[15px] font-bold text-[var(--text)]">No access to {tab}</div>
        <p className="mx-auto mt-1 max-w-sm text-[13px] text-muted">
          Your role doesn&apos;t include permission to view this section. Ask your store admin
          to update your role in Roles &amp; Permissions.
        </p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  // The auth store is persisted, so a refresh keeps `token`; only a genuinely
  // token-less visitor should be bounced to the login screen.
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!token) {
      router.replace('/');
    }
  }, [token, router]);

  if (!token) return null;

  return (
    <Shell defaultTab="dashboard">
      {(active) => {
        const permission = TAB_PERMISSION[active];
        if (permission && !can(user, permission)) {
          return <AccessDenied tab={active} />;
        }

        switch (active) {
          case 'dashboard':  return <DashboardScreen />;
          case 'pos':        return <POSTerminalScreen />;
          case 'products':   return <ProductsScreen />;
          case 'categories': return <CategoriesScreen />;
          case 'inventory':  return <InventoryScreen />;
          case 'transfers':  return <TransfersScreen />;
          case 'orders':     return <OrdersScreen />;
          case 'customers':  return <CustomersScreen />;
          case 'reports':    return <ReportsScreen />;
          case 'branches':   return <BranchesScreen />;
          case 'staff':      return <StaffScreen />;
          case 'roles':      return <RolesScreen />;
          case 'settings':   return <SettingsScreen />;
          default:           return <DashboardScreen />;
        }
      }}
    </Shell>
  );
}
'use client';
import { Shell } from '@/components/layout/Shell';
import { DashboardScreen } from '@/components/dashboard/DashboardScreen';
import { POSTerminalScreen } from '@/components/pos/POSTerminalScreen';
import { ProductsScreen } from '@/components/products/ProductsScreen';
import { CategoriesScreen } from '@/components/categories/CategoriesScreen';
import { InventoryScreen } from '@/components/inventory/InventoryScreen';
import { OrdersScreen } from '@/components/orders/OrdersScreen';
import { CustomersScreen as BaseCustomersScreen } from '@/components/customers/CustomersScreen';
import { BranchesScreen } from '@/components/branches/BranchesScreen';
import { StaffScreen } from '@/components/staff/StaffScreen';
import { ReportsScreen, SettingsScreen } from '@/components/screens/OtherScreens';

function CustomersScreen() {
  return <BaseCustomersScreen />;
}

export default function DashboardPage() {
  return (
    <Shell defaultTab="dashboard">
      {(active) => {
        switch (active) {
          case 'dashboard':  return <DashboardScreen />;
          case 'pos':        return <POSTerminalScreen />;
          case 'products':   return <ProductsScreen />;
          case 'categories': return <CategoriesScreen />;
          case 'inventory':  return <InventoryScreen />;
          case 'orders':     return <OrdersScreen />;
          case 'customers':  return <CustomersScreen />;
          case 'reports':    return <ReportsScreen />;
          case 'branches':   return <BranchesScreen />;
          case 'staff':      return <StaffScreen />;
          case 'settings':   return <SettingsScreen />;
          default:           return <DashboardScreen />;
        }
      }}
    </Shell>
  );
}

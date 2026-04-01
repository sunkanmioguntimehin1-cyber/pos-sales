'use client';
import { create } from 'zustand';
import type { Tenant } from '@/types/tenant';

interface TenantsState {
  tenants: Tenant[];
  selectedTenantId: string | null;
  isLoading: boolean;
  setTenants: (tenants: Tenant[]) => void;
  setSelectedTenant: (tenant: Tenant | null) => void;
  addTenant: (tenant: Tenant) => void;
  updateTenant: (id: string, updates: Partial<Tenant>) => void;
  removeTenant: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useTenantsStore = create<TenantsState>((set) => ({
  tenants: [],
  selectedTenantId: null,
  isLoading: false,

  setTenants: (tenants) => set({ tenants }),

  setSelectedTenant: (tenant) => set({ selectedTenantId: tenant?.id || null }),

  addTenant: (tenant) =>
    set((state) => ({ tenants: [...state.tenants, tenant] })),

  updateTenant: (id, updates) =>
    set((state) => ({
      tenants: state.tenants.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),

  removeTenant: (id) =>
    set((state) => ({
      tenants: state.tenants.filter((t) => t.id !== id),
      selectedTenantId:
        state.selectedTenantId === id ? null : state.selectedTenantId,
    })),

  setLoading: (isLoading) => set({ isLoading }),
}));

'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Tenant } from '@/types/tenant';

interface TenantState {
  tenant: Tenant | null;
  isLoading: boolean;
  error: string | null;
  setTenant: (tenant: Tenant | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearTenant: () => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      tenant: null,
      isLoading: false,
      error: null,
      
      setTenant: (tenant) => set({ tenant, error: null }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error, tenant: null }),
      clearTenant: () => set({ tenant: null, isLoading: false, error: null }),
    }),
    {
      name: 'tenant-storage',
    }
  )
);

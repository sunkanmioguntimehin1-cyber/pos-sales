import type { Theme } from '@/store/themeStore';

export interface TenantSettings {
  primaryColor: string;
  accentColor: string;
  theme: Theme;
}

export interface Tenant {
  id: string;
  subdomain: string;
  name: string;
  logo?: string;
  favicon?: string;
  description?: string;
  settings: TenantSettings;
  createdAt: string;
  isActive: boolean;
}

export interface TenantContext {
  tenant: Tenant | null;
  isLoading: boolean;
  error: string | null;
}

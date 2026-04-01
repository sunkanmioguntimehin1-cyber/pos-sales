import { Tenant } from '@/types/tenant';

export const tenants: Tenant[] = [
  {
    id: '1',
    subdomain: 'demo',
    name: 'Demo Store',
    description: 'RetailCore Demo Environment',
    logo: '/logo.svg',
    favicon: '/favicon.ico',
    settings: {
      primaryColor: '#3B82F6',
      accentColor: '#6366F1',
      theme: 'dark',
    },
    createdAt: '2024-01-01',
    isActive: true,
  },
  {
    id: '2',
    subdomain: 'luxury',
    name: 'Luxury Boutique',
    description: 'Premium fashion retailer',
    logo: '/logo-luxury.svg',
    favicon: '/favicon-luxury.ico',
    settings: {
      primaryColor: '#D4AF37',
      accentColor: '#C9A227',
      theme: 'gold',
    },
    createdAt: '2024-02-15',
    isActive: true,
  },
  {
    id: '3',
    subdomain: 'bright',
    name: 'Bright Retail',
    description: 'Modern retail experience',
    logo: '/logo-bright.svg',
    favicon: '/favicon-bright.ico',
    settings: {
      primaryColor: '#2563EB',
      accentColor: '#4F46E5',
      theme: 'light',
    },
    createdAt: '2024-03-01',
    isActive: true,
  },
];

export function getTenantBySubdomain(subdomain: string): Tenant | null {
  return tenants.find((t) => t.subdomain === subdomain && t.isActive) || null;
}

export function getTenantById(id: string): Tenant | null {
  return tenants.find((t) => t.id === id) || null;
}

export function getAllTenants(): Tenant[] {
  return tenants.filter((t) => t.isActive);
}

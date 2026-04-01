'use client';
import { useEffect, useState } from 'react';
import { useTenantStore } from '@/store/tenantStore';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { storesApi, storeToTenant } from '@/lib/api';

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { tenant, setTenant, setLoading, setError } = useTenantStore();
  const { setTheme } = useThemeStore();
  const { user, token } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeTenant = async () => {
      if (!token || !user) {
        setIsInitialized(true);
        return;
      }

      if (user.role === 'superadmin') {
        const subdomain = document.cookie
          .split('; ')
          .find((row) => row.startsWith('tenant-subdomain='))
          ?.split('=')[1];

        if (subdomain) {
          try {
            setLoading(true);
            const store = await storesApi.getBySubdomain(subdomain);
            const tenantData = storeToTenant(store);
            setTenant(tenantData);
            setTheme(tenantData.settings.theme);
          } catch (error) {
            console.error('Failed to fetch tenant by subdomain:', error);
            setError('Failed to load tenant');
          }
        }
        setIsInitialized(true);
        setLoading(false);
        return;
      }

      if (user.role === 'tenant_admin' || user.role === 'staff') {
        try {
          setLoading(true);
          const store = await storesApi.getCurrent();
          const tenantData = storeToTenant(store);
          setTenant(tenantData);
          setTheme(tenantData.settings.theme);
        } catch (error) {
          console.error('Failed to fetch current tenant:', error);
          setError('Failed to load tenant');
        }
      }
      setIsInitialized(true);
      setLoading(false);
    };

    initializeTenant();
  }, [token, user, setTenant, setTheme, setLoading, setError]);

  if (!isInitialized) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text)'
      }}>
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}

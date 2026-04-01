'use client';
import { QueryProvider } from '@/lib/providers/QueryProvider';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { TenantProvider } from '@/components/layout/TenantProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <TenantProvider>{children}</TenantProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}

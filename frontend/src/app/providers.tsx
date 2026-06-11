'use client';
import { QueryProvider } from '@/lib/providers/QueryProvider';
import { ThemeProvider } from '@/components/layout/ThemeProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </QueryProvider>
  );
}

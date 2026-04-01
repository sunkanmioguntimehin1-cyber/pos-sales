'use client';
import { useState, useRef, useEffect } from 'react';
import { useTenantStore } from '@/store/tenantStore';
import { useThemeStore } from '@/store/themeStore';
import { tenants } from '@/config/tenants';

export function TenantSwitcher() {
  const { tenant, setTenant } = useTenantStore();
  const { setTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingSubdomain, setPendingSubdomain] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (pendingSubdomain) {
      const expires = new Date();
      expires.setTime(expires.getTime() + 24 * 60 * 60 * 1000);
      document.cookie = `tenant-subdomain=${pendingSubdomain};expires=${expires.toUTCString()};path=/`;
      window.location.reload();
    }
  }, [pendingSubdomain]);

  const handleTenantSelect = (tenantId: string) => {
    const selected = tenants.find((t) => t.id === tenantId);
    if (selected) {
      setTenant(selected);
      setTheme(selected.settings.theme);
      setPendingSubdomain(selected.subdomain);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all hover:bg-white/[0.05]"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <span className="text-sm">🏪</span>
        <span className="text-xs font-medium hidden sm:inline">
          {tenant?.name || 'Select Store'}
        </span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-1 py-1 rounded-lg shadow-xl min-w-[180px] z-50 animate-scale-in"
          style={{
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div 
            className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest"
            style={{ color: 'var(--color-text-subtle)' }}
          >
            Switch Store
          </div>
          {tenants.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTenantSelect(t.id)}
              className="w-full flex items-center gap-2 px-3 py-2 text-left transition-all hover:bg-white/[0.05]"
              style={{
                color: tenant?.id === t.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
              }}
            >
              <span 
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: t.settings.primaryColor }}
              />
              <span className="text-xs font-medium">{t.name}</span>
              {tenant?.id === t.id && (
                <span className="ml-auto text-[10px]">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

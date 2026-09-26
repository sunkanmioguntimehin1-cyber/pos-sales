'use client';
import { useEffect, useRef, useState } from 'react';
import { IconSearch, IconBell, IconRefresh, IconMenu, IconX } from '@/components/ui/Icons';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useLogout } from '@/lib/hooks/useAuth';

interface TopbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  onOpenMobileNav?: () => void;
}

function initials(name?: string) {
  if (!name) return 'U';
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
}

export function Topbar({ title, subtitle, actions, onOpenMobileNav }: TopbarProps) {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onClickOutside);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <header
      className="glass sticky top-0 z-30 flex h-16 flex-shrink-0 items-center gap-3 border-b px-4 sm:px-6"
      style={{ borderColor: 'var(--border)' }}
    >
      <button onClick={onOpenMobileNav} className="icon-btn lg:hidden" aria-label="Open navigation">
        <IconMenu size={16} />
      </button>

      <div className="min-w-0 flex-shrink-0">
        <h1 className="truncate text-[15px] font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="hidden truncate text-[11.5px] text-subtle sm:block">{subtitle}</p>}
      </div>

      {/* Search */}
      <div className="relative ml-2 hidden max-w-sm flex-1 md:block">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle">
          <IconSearch size={15} />
        </span>
        <input
          ref={searchRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input h-10 pl-9 pr-16"
          placeholder="Search products, orders…"
        />
        {search ? (
          <button
            onClick={() => setSearch('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-subtle transition-colors hover:text-[var(--text)]"
            aria-label="Clear search"
          >
            <IconX size={13} />
          </button>
        ) : (
          <kbd
            className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold text-subtle lg:block"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-2)' }}
          >
            ⌘K
          </kbd>
        )}
      </div>

      {actions && <div className="flex items-center gap-2">{actions}</div>}

      <div className="ml-auto flex items-center gap-2">
        <ThemeSwitcher />

        <button onClick={refresh} className="icon-btn" title="Refresh data" aria-label="Refresh data">
          <span className={refreshing ? 'inline-block animate-spin' : 'inline-block'}>
            <IconRefresh size={15} />
          </span>
        </button>

        <button className="icon-btn relative" title="Notifications" aria-label="Notifications">
          <IconBell size={15} />
          <span
            className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold text-white"
            style={{ backgroundColor: 'var(--danger)', border: '2px solid var(--surface)' }}
          >
            3
          </span>
        </button>

        <div className="mx-1 hidden h-6 w-px sm:block" style={{ backgroundColor: 'var(--border)' }} />

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold text-white transition-transform hover:scale-105"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
            aria-label="Account menu"
          >
            {initials(user?.name)}
          </button>

          {menuOpen && (
            <div
              className="animate-scale-in absolute right-0 top-[calc(100%+10px)] z-50 w-56 overflow-hidden rounded-xl border"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div className="border-b px-4 py-3" style={{ borderColor: 'var(--border)' }}>
                <div className="truncate text-[13px] font-semibold">{user?.name || 'Guest user'}</div>
                <div className="truncate text-[11.5px] text-subtle">{user?.email || 'Not signed in'}</div>
              </div>
              <button
                onClick={() => { setMenuOpen(false); logout.mutate(); }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[13px] font-medium transition-colors"
                style={{ color: 'var(--danger)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--danger-soft)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

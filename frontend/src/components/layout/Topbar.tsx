'use client';
import { IconSearch, IconBell, IconRefresh } from '@/components/ui/Icons';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';

interface TopbarProps { title: string; subtitle?: string; actions?: React.ReactNode; }

export function Topbar({ title, subtitle, actions }: TopbarProps) {
  return (
    <header className="h-14 border-b flex items-center px-5 gap-3 flex-shrink-0" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>

      <div className="flex-shrink-0">
        <div className="text-sm font-extrabold tracking-tight" style={{ color: 'var(--color-text)' }}>{title}</div>
        {subtitle && <div className="text-[10px] mt-px" style={{ color: 'var(--color-text-subtle)' }}>{subtitle}</div>}
      </div>

      <div className="relative max-w-[280px] flex-1">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-text-subtle)' }}>
          <IconSearch size={14} />
        </span>
        <input
          className="w-full h-9 pl-8 pr-3 border rounded-lg text-[13px] placeholder:text-slate-500 outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] transition-all"
          style={{ backgroundColor: 'var(--color-input-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          placeholder="Search products, orders…"
        />
      </div>

      {actions && <div className="flex items-center gap-2">{actions}</div>}

      <div className="ml-auto flex items-center gap-2">
        <ThemeSwitcher />
        <button className="w-[34px] h-[34px] flex items-center justify-center rounded-lg border text-slate-400 hover:text-slate-200 transition-all" style={{ backgroundColor: 'var(--color-input-bg)', borderColor: 'var(--color-border)' }}>
          <IconRefresh size={14} />
        </button>
        <button className="relative w-[34px] h-[34px] flex items-center justify-center rounded-lg border text-slate-400 hover:text-slate-200 transition-all" style={{ backgroundColor: 'var(--color-input-bg)', borderColor: 'var(--color-border)' }}>
          <IconBell size={14} />
          <span className="absolute -top-[3px] -right-[3px] min-w-[16px] h-4 bg-red-500 border-2 rounded-full text-[9px] font-extrabold text-white flex items-center justify-center px-[3px]" style={{ borderColor: 'var(--color-surface)' }}>
            3
          </span>
        </button>
        <div className="w-px h-5" style={{ backgroundColor: 'var(--color-border)' }} />
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-[11px] font-extrabold text-white cursor-pointer">
          AM
        </div>
      </div>
    </header>
  );
}

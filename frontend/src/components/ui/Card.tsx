'use client';
import { ReactNode } from 'react';

interface SectionCardProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function SectionCard({
  title,
  description,
  actions,
  children,
  className = '',
  bodyClassName = '',
}: SectionCardProps) {
  return (
    <section className={`card overflow-hidden ${className}`}>
      {(title || actions) && (
        <header
          className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="min-w-0">
            {title && <h2 className="text-[14px] font-semibold tracking-tight">{title}</h2>}
            {description && <p className="mt-0.5 text-[12px] text-subtle">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

type Tone = 'primary' | 'success' | 'warning' | 'danger';

const toneVars: Record<Tone, { soft: string; solid: string }> = {
  primary: { soft: 'var(--primary-soft)', solid: 'var(--primary)' },
  success: { soft: 'var(--success-soft)', solid: 'var(--success)' },
  warning: { soft: 'var(--warning-soft)', solid: 'var(--warning)' },
  danger: { soft: 'var(--danger-soft)', solid: 'var(--danger)' },
};

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: Tone;
  trend?: { value: string; direction: 'up' | 'down' | 'flat' };
  loading?: boolean;
}

export function StatCard({ label, value, hint, icon, tone = 'primary', trend, loading }: StatCardProps) {
  const { soft, solid } = toneVars[tone];
  const trendColor =
    trend?.direction === 'down' ? 'var(--danger)' : trend?.direction === 'up' ? 'var(--success)' : 'var(--text-muted)';

  return (
    <article className="card card-interactive relative overflow-hidden p-5">
      <span
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-60 blur-2xl"
        style={{ background: soft }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="eyebrow">{label}</p>
          {loading ? (
            <div className="skeleton mt-3 h-8 w-24" />
          ) : (
            <p className="mt-2.5 text-[28px] font-bold leading-none tracking-tight tabular-nums">{value}</p>
          )}
          <div className="mt-3 flex items-center gap-2 text-[12px]">
            {trend && (
              <span className="inline-flex items-center gap-1 font-semibold" style={{ color: trendColor }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  {trend.direction === 'down' ? (
                    <>
                      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                      <polyline points="17 18 23 18 23 12" />
                    </>
                  ) : (
                    <>
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                      <polyline points="17 6 23 6 23 12" />
                    </>
                  )}
                </svg>
                {trend.value}
              </span>
            )}
            {hint && <span className="truncate text-subtle">{hint}</span>}
          </div>
        </div>

        {icon && (
          <div
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl"
            style={{ backgroundColor: soft, color: solid }}
          >
            {icon}
          </div>
        )}
      </div>
    </article>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center px-6 py-14 text-center ${className}`}>
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-subtle)' }}
      >
        {icon ?? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          </svg>
        )}
      </div>
      <h3 className="text-[14px] font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-[12.5px] text-subtle">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

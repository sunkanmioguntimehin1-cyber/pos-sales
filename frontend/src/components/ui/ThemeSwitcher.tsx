'use client';
import { useThemeStore, Theme } from '@/store/themeStore';

interface ThemeOption {
  id: Theme;
  label: string;
  icon: React.ReactNode;
}

const icon = (paths: React.ReactNode) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    {paths}
  </svg>
);

const themes: ThemeOption[] = [
  { id: 'dark', label: 'Dark', icon: icon(<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />) },
  {
    id: 'light',
    label: 'Light',
    icon: icon(
      <>
        <circle cx="12" cy="12" r="4.5" />
        <path d="M12 1.5v2M12 20.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1.5 12h2M20.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
      </>
    ),
  },
  {
    id: 'gold',
    label: 'Gold',
    icon: icon(<path d="M12 2l2.4 5.6 6.1.5-4.6 4 1.4 5.9L12 15l-5.3 3 1.4-5.9-4.6-4 6.1-.5L12 2z" />),
  },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useThemeStore();

  return (
    <div
      className="flex items-center gap-0.5 rounded-xl p-1"
      style={{ backgroundColor: 'var(--input-bg)' }}
      role="radiogroup"
      aria-label="Color theme"
    >
      {themes.map((t) => {
        const active = theme === t.id;
        return (
          <button
            key={t.id}
            role="radio"
            aria-checked={active}
            aria-label={`${t.label} theme`}
            title={`${t.label} theme`}
            onClick={() => setTheme(t.id)}
            className="flex h-7 items-center gap-1.5 rounded-lg px-2 text-[11.5px] font-semibold transition-all duration-150"
            style={{
              backgroundColor: active ? 'var(--card)' : 'transparent',
              color: active ? 'var(--primary)' : 'var(--text-subtle)',
              boxShadow: active ? 'var(--shadow-sm)' : 'none',
            }}
          >
            {t.icon}
            <span className="hidden lg:inline">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

'use client';
import { useState, useRef, useEffect } from 'react';
import { useThemeStore, Theme } from '@/store/themeStore';

const themes: { id: Theme; label: string; icon: string }[] = [
  { id: 'dark', label: 'Dark', icon: '🌙' },
  { id: 'light', label: 'Light', icon: '☀️' },
  { id: 'gold', label: 'Gold', icon: '✨' },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
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

  const currentTheme = themes.find((t) => t.id === theme) || themes[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all hover:bg-white/[0.05]"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <span className="text-sm">{currentTheme.icon}</span>
        <span className="text-xs font-medium hidden sm:inline">{currentTheme.label}</span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-1 py-1 rounded-lg shadow-xl min-w-[120px] z-50 animate-scale-in"
          style={{
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-border)',
          }}
        >
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTheme(t.id);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-left transition-all hover:bg-white/[0.05]"
              style={{
                color: theme === t.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
              }}
            >
              <span className="text-sm">{t.icon}</span>
              <span className="text-xs font-medium">{t.label}</span>
              {theme === t.id && (
                <span className="ml-auto text-[10px]">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

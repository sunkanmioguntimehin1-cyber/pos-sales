'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'dark' | 'light' | 'gold';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      
      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== 'undefined') {
          document.documentElement.className = theme;
        }
      },
      
      toggleTheme: () => {
        const currentTheme = get().theme;
        const themes: Theme[] = ['dark', 'light', 'gold'];
        const currentIndex = themes.indexOf(currentTheme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];
        set({ theme: nextTheme });
        if (typeof document !== 'undefined') {
          document.documentElement.className = nextTheme;
        }
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);

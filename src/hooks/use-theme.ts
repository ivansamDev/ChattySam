
"use client";

import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'chattysam-theme';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('light'); // Default to light
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    
    if (storedTheme) {
      setThemeState(storedTheme);
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    } else {
      setThemeState(preferredTheme);
      document.documentElement.classList.toggle('dark', preferredTheme === 'dark');
    }
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    if (!isMounted) return;
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  }, [isMounted]);

  const toggleTheme = useCallback(() => {
    if (!isMounted) return;
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme, isMounted]);

  return { theme: isMounted ? theme : 'light', setTheme, toggleTheme, isMounted };
}

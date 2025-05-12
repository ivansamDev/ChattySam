
"use client";

import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

const ThemeSwitcher: React.FC = () => {
  const { theme, toggleTheme, isMounted } = useTheme();

  if (!isMounted) {
    // Render a placeholder or null during SSR/hydration phase to avoid mismatch
    return (
        <div className="flex items-center space-x-2 h-6 w-[50px]"> {/* Placeholder size similar to switch */}
             <div className="w-4 h-4 bg-muted rounded-full animate-pulse"></div>
        </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="theme-switcher"
        checked={theme === 'dark'}
        onCheckedChange={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      />
      <Label htmlFor="theme-switcher" className="sr-only">
        Toggle theme
      </Label>
      {theme === 'light' ? <Sun className="h-5 w-5 text-muted-foreground" /> : <Moon className="h-5 w-5 text-muted-foreground" />}
    </div>
  );
};

export default ThemeSwitcher;

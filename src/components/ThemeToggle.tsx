'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'titan-theme';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as 'dark' | 'light' | null) ?? 'dark';
    setTheme(stored);
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <Button variant="outline" size="sm" onClick={toggle}>
      {theme === 'dark' ? 'Light' : 'Dark'}
    </Button>
  );
}

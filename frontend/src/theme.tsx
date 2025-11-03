import React, { useEffect, useState } from 'react';

const getInitialTheme = () => {
  const saved = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
  if (saved === 'light' || saved === 'dark') return saved;
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

const applyTheme = (theme: string) => {
  document.documentElement.setAttribute('data-theme', theme);
};

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<string>(getInitialTheme());

  useEffect(() => {
    applyTheme(theme);
    try { localStorage.setItem('theme', theme); } catch {}
  }, [theme]);

  const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme">
      {theme === 'dark' ? 'Light' : 'Dark'} mode
    </button>
  );
};

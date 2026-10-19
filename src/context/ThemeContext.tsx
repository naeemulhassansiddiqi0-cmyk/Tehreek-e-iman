import React, { createContext, useContext, useState, useEffect } from 'react';

export type PortalTheme = 'light' | 'dark' | 'parchment';

interface ThemeContextType {
  theme: PortalTheme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: PortalTheme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<PortalTheme>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('tehreek_theme') || localStorage.getItem('madrasa_theme');
        if (saved === 'dark' || saved === 'light' || saved === 'parchment') {
          return saved;
        }
        // Check system preference if no saved preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          return 'dark';
        }
      } catch {
        // ignore
      }
    }
    return 'light';
  });

  const isDark = theme === 'dark';

  const applyThemeClasses = (t: PortalTheme) => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (t === 'dark') {
        root.classList.add('dark');
        root.classList.remove('parchment-mode');
        root.style.colorScheme = 'dark';
      } else if (t === 'parchment') {
        root.classList.remove('dark');
        root.classList.add('parchment-mode');
        root.style.colorScheme = 'light';
      } else {
        root.classList.remove('dark');
        root.classList.remove('parchment-mode');
        root.style.colorScheme = 'light';
      }
    }
  };

  const setTheme = (t: PortalTheme) => {
    setThemeState(t);
    applyThemeClasses(t);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('tehreek_theme', t);
        localStorage.setItem('madrasa_theme', t);
      }
    } catch {}
  };

  const toggleTheme = () => {
    const nextTheme: PortalTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  useEffect(() => {
    applyThemeClasses(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const usePortalTheme = (): ThemeContextType => {
  return useContext(ThemeContext);
};

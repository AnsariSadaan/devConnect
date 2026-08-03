import React, { useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';

const ThemeProvider = ({ children }) => {
  const { currentTheme } = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let theme = currentTheme;
    if (theme === 'system') {
      theme = systemDark ? 'dark' : 'light';
    }
    
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;
  }, [currentTheme]);

  return <>{children}</>;
};

export default ThemeProvider;
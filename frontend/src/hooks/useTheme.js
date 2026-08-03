import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme } from '../utils/themeSlice';

export const useTheme = () => {
  const dispatch = useDispatch();
  const { currentTheme } = useSelector((state) => state.theme);

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

  const toggleTheme = () => {
    const themes = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    dispatch(setTheme(themes[nextIndex]));
  };

  return { currentTheme, toggleTheme };
};
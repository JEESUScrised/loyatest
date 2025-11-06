import { useState, useEffect, useCallback } from 'react';
import { Theme, ThemeName, themes } from '../themes/theme';

export interface UseThemeReturn {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (themeName: ThemeName) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

export const useTheme = (defaultTheme: ThemeName = 'light'): UseThemeReturn => {
  const [themeName, setThemeName] = useState<ThemeName>(defaultTheme);
  const [theme, setTheme] = useState<Theme>(themes[defaultTheme]);

  // Загрузка темы из localStorage при инициализации
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeName;
    if (savedTheme && themes[savedTheme]) {
      setThemeName(savedTheme);
      setTheme(themes[savedTheme]);
    }
  }, []);

  // Применение темы к документу
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('theme', themeName);
  }, [themeName]);

  // Функция для смены темы
  const setThemeHandler = useCallback((newThemeName: ThemeName) => {
    if (themes[newThemeName]) {
      setThemeName(newThemeName);
      setTheme(themes[newThemeName]);
    }
  }, []);

  // Функция для переключения между светлой и темной темой
  const toggleTheme = useCallback(() => {
    const newTheme = themeName === 'light' ? 'dark' : 'light';
    setThemeHandler(newTheme);
  }, [themeName, setThemeHandler]);

  // Проверка, является ли текущая тема темной
  const isDark = themeName === 'dark';

  return {
    theme,
    themeName,
    setTheme: setThemeHandler,
    toggleTheme,
    isDark,
  };
};

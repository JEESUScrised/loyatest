import { useState, useEffect, useCallback } from 'react';
import { themes } from '../themes/theme';
export const useTheme = (defaultTheme = 'light') => {
    const [themeName, setThemeName] = useState(defaultTheme);
    const [theme, setTheme] = useState(themes[defaultTheme]);
    // Загрузка темы из localStorage при инициализации
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
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
    const setThemeHandler = useCallback((newThemeName) => {
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

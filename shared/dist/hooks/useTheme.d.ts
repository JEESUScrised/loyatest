import { Theme, ThemeName } from '../themes/theme';
export interface UseThemeReturn {
    theme: Theme;
    themeName: ThemeName;
    setTheme: (themeName: ThemeName) => void;
    toggleTheme: () => void;
    isDark: boolean;
}
export declare const useTheme: (defaultTheme?: ThemeName) => UseThemeReturn;

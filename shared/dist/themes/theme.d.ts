export interface Theme {
    name: string;
    colors: {
        primary: string;
        secondary: string;
        success: string;
        danger: string;
        warning: string;
        info: string;
        light: string;
        dark: string;
        muted: string;
        border: string;
        background: string;
        surface: string;
        text: string;
        textSecondary: string;
    };
    spacing: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
    };
    borderRadius: {
        sm: string;
        md: string;
        lg: string;
        xl: string;
    };
    shadows: {
        sm: string;
        md: string;
        lg: string;
        xl: string;
    };
    typography: {
        fontFamily: string;
        fontSize: {
            xs: string;
            sm: string;
            md: string;
            lg: string;
            xl: string;
            xxl: string;
        };
        fontWeight: {
            normal: number;
            medium: number;
            semibold: number;
            bold: number;
        };
    };
    breakpoints: {
        sm: string;
        md: string;
        lg: string;
        xl: string;
    };
}
export declare const lightTheme: Theme;
export declare const darkTheme: Theme;
export declare const clientTheme: Theme;
export declare const cashierTheme: Theme;
export declare const venueAdminTheme: Theme;
export declare const techAdminTheme: Theme;
export declare const themes: {
    light: Theme;
    dark: Theme;
    client: Theme;
    cashier: Theme;
    'venue-admin': Theme;
    'tech-admin': Theme;
};
export type ThemeName = keyof typeof themes;

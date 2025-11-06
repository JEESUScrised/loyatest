// Система тем для всех фронтендов

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

// Светлая тема
export const lightTheme: Theme = {
  name: 'light',
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8',
    light: '#f8f9fa',
    dark: '#343a40',
    muted: '#6c757d',
    border: '#dee2e6',
    background: '#ffffff',
    surface: '#ffffff',
    text: '#212529',
    textSecondary: '#6c757d',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 2px 4px rgba(0, 0, 0, 0.1)',
    lg: '0 4px 8px rgba(0, 0, 0, 0.15)',
    xl: '0 8px 16px rgba(0, 0, 0, 0.2)',
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
      xxl: '24px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  breakpoints: {
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
  },
};

// Темная тема
export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    primary: '#0d6efd',
    secondary: '#6c757d',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    light: '#f8f9fa',
    dark: '#212529',
    muted: '#6c757d',
    border: '#495057',
    background: '#121212',
    surface: '#1e1e1e',
    text: '#ffffff',
    textSecondary: '#adb5bd',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.2)',
    md: '0 2px 4px rgba(0, 0, 0, 0.3)',
    lg: '0 4px 8px rgba(0, 0, 0, 0.4)',
    xl: '0 8px 16px rgba(0, 0, 0, 0.5)',
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
      xxl: '24px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  breakpoints: {
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
  },
};

// Тема для клиентского фронтенда (синяя)
export const clientTheme: Theme = {
  ...lightTheme,
  name: 'client',
  colors: {
    ...lightTheme.colors,
    primary: '#007bff',
    secondary: '#6c757d',
  },
};

// Тема для кассирского фронтенда (зеленая)
export const cashierTheme: Theme = {
  ...lightTheme,
  name: 'cashier',
  colors: {
    ...lightTheme.colors,
    primary: '#28a745',
    secondary: '#6c757d',
  },
};

// Тема для админского фронтенда (фиолетовая)
export const venueAdminTheme: Theme = {
  ...lightTheme,
  name: 'venue-admin',
  colors: {
    ...lightTheme.colors,
    primary: '#6f42c1',
    secondary: '#6c757d',
  },
};

// Тема для технической админки (серая)
export const techAdminTheme: Theme = {
  ...lightTheme,
  name: 'tech-admin',
  colors: {
    ...lightTheme.colors,
    primary: '#495057',
    secondary: '#6c757d',
  },
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,
  client: clientTheme,
  cashier: cashierTheme,
  'venue-admin': venueAdminTheme,
  'tech-admin': techAdminTheme,
};

export type ThemeName = keyof typeof themes;

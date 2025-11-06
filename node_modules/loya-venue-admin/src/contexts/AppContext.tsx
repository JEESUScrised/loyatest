import React, { createContext, useContext, ReactNode } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';

interface AppContextType {
  // Analytics
  isLoading: boolean;
  error: string | null;
  getVenueStats: (venueCode: string) => Promise<any>;
  getVenueBalance: (venueCode: string) => Promise<any>;
  getWeeklyReport: (venueCode: string) => Promise<any>;
  getHourlyReport: (venueCode: string) => Promise<any>;
  getVenueInfo: (venueCode: string) => Promise<any>;
  clearError: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const analytics = useAnalytics();

  const contextValue: AppContextType = {
    ...analytics
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

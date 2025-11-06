import React, { createContext, useContext, ReactNode } from 'react';
import { useCashier } from '../hooks/useCashier';

interface AppContextType {
  // Cashier
  isLoading: boolean;
  error: string | null;
  currentCode: string | null;
  venueCode: string;
  setVenueCode: (code: string) => void;
  generateCode: (amount: number) => Promise<any>;
  getCodeHistory: (params?: any) => Promise<any>;
  getSalesStats: (params?: any) => Promise<any>;
  authenticateCashier: (credentials: any) => Promise<any>;
  clearError: () => void;
  clearCurrentCode: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const cashier = useCashier();

  const contextValue: AppContextType = {
    ...cashier
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

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePoints } from '../hooks/usePoints';
import { useTelegram } from '../hooks/useTelegram';

interface AppContextType {
  // Auth
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  register: (telegramData: any) => Promise<void>;
  logout: () => void;
  refetch: () => Promise<void>;

  // Points
  useCode: (code: string) => Promise<any>;
  checkCode: (code: string) => Promise<any>;
  getPointsHistory: (params?: any) => Promise<any>;
  claimDailyBonus: () => Promise<any>;
  pointsLoading: boolean;
  pointsError: string | null;
  clearError: () => void;

  // Telegram
  telegramUser: any;
  isTelegramReady: boolean;
  isTelegram: boolean;
  getTelegramData: () => any;
  showMainButton: (text: string, onClick: () => void) => void;
  hideMainButton: () => void;
  showBackButton: (onClick: () => void) => void;
  hideBackButton: () => void;
  hapticFeedback: any;
  closeApp: () => void;
  theme: any;
  colorScheme: 'light' | 'dark';
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const auth = useAuth();
  const points = usePoints();
  const telegram = useTelegram();

  const contextValue: AppContextType = {
    // Auth
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    register: auth.register,
    logout: auth.logout,
    refetch: auth.refetch,

    // Points
    useCode: points.useCode,
    checkCode: points.checkCode,
    getPointsHistory: points.getPointsHistory,
    claimDailyBonus: points.claimDailyBonus,
    pointsLoading: points.isLoading,
    pointsError: points.error,
    clearError: points.clearError,

    // Telegram
    telegramUser: telegram.user,
    isTelegramReady: telegram.isReady,
    isTelegram: telegram.isTelegram,
    getTelegramData: telegram.getTelegramData,
    showMainButton: telegram.showMainButton,
    hideMainButton: telegram.hideMainButton,
    showBackButton: telegram.showBackButton,
    hideBackButton: telegram.hideBackButton,
    hapticFeedback: telegram.hapticFeedback,
    closeApp: telegram.closeApp,
    theme: telegram.theme,
    colorScheme: telegram.colorScheme
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

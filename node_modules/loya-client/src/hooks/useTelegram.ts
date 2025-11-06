import { useState, useEffect } from 'react';

// Типы для Telegram WebApp API
interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    auth_date: number;
    hash: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
    setParams: (params: {
      text?: string;
      color?: string;
      text_color?: string;
      is_active?: boolean;
      is_visible?: boolean;
    }) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  onEvent: (eventType: string, eventHandler: () => void) => void;
  offEvent: (eventType: string, eventHandler: () => void) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export const useTelegram = () => {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<TelegramWebApp['initDataUnsafe']['user'] | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Проверяем, что мы в Telegram WebApp
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      
      // Инициализируем WebApp
      tg.ready();
      tg.expand();
      
      setWebApp(tg);
      setUser(tg.initDataUnsafe.user || null);
      setIsReady(true);

      // Настраиваем тему
      document.body.style.backgroundColor = tg.backgroundColor;
      document.body.style.color = tg.themeParams.text_color || '#000000';

      // Обработчик закрытия приложения
      const handleClose = () => {
        tg.close();
      };

      // Добавляем обработчик
      tg.onEvent('backButtonClicked', handleClose);

      return () => {
        tg.offEvent('backButtonClicked', handleClose);
      };
    } else {
      // Для разработки - создаем мок данные
      const mockUser = {
        id: 123456789,
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser',
        language_code: 'ru'
      };
      
      setUser(mockUser);
      setIsReady(true);
    }
  }, []);

  // Получение данных пользователя для регистрации
  const getTelegramData = () => {
    if (user) {
      return {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name || '',
        username: user.username || ''
      };
    }
    return null;
  };

  // Показать главную кнопку
  const showMainButton = (text: string, onClick: () => void) => {
    if (webApp) {
      webApp.MainButton.setText(text);
      webApp.MainButton.onClick(onClick);
      webApp.MainButton.show();
    }
  };

  // Скрыть главную кнопку
  const hideMainButton = () => {
    if (webApp) {
      webApp.MainButton.hide();
    }
  };

  // Показать кнопку "Назад"
  const showBackButton = (onClick: () => void) => {
    if (webApp) {
      webApp.BackButton.onClick(onClick);
      webApp.BackButton.show();
    }
  };

  // Скрыть кнопку "Назад"
  const hideBackButton = () => {
    if (webApp) {
      webApp.BackButton.hide();
    }
  };

  // Тактильная обратная связь
  const hapticFeedback = {
    impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
      if (webApp) {
        webApp.HapticFeedback.impactOccurred(style);
      }
    },
    notification: (type: 'error' | 'success' | 'warning') => {
      if (webApp) {
        webApp.HapticFeedback.notificationOccurred(type);
      }
    },
    selection: () => {
      if (webApp) {
        webApp.HapticFeedback.selectionChanged();
      }
    }
  };

  // Закрыть приложение
  const closeApp = () => {
    if (webApp) {
      webApp.close();
    }
  };

  return {
    webApp,
    user,
    isReady,
    isTelegram: !!window.Telegram?.WebApp,
    getTelegramData,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    hapticFeedback,
    closeApp,
    theme: webApp?.themeParams || {},
    colorScheme: webApp?.colorScheme || 'light'
  };
};

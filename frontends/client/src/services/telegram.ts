// Сервис для работы с Telegram WebApp API
export class TelegramService {
  private static instance: TelegramService;
  private webApp: any = null;

  private constructor() {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      this.webApp = window.Telegram.WebApp;
    }
  }

  public static getInstance(): TelegramService {
    if (!TelegramService.instance) {
      TelegramService.instance = new TelegramService();
    }
    return TelegramService.instance;
  }

  // Инициализация WebApp
  public init(): void {
    if (this.webApp) {
      this.webApp.ready();
      this.webApp.expand();
    }
  }

  // Получение данных пользователя
  public getUserData(): any {
    if (this.webApp) {
      return this.webApp.initDataUnsafe.user;
    }
    return null;
  }

  // Получение данных для регистрации
  public getRegistrationData(): any {
    const user = this.getUserData();
    if (user) {
      return {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name || '',
        username: user.username || ''
      };
    }
    return null;
  }

  // Показать главную кнопку
  public showMainButton(text: string, onClick: () => void): void {
    if (this.webApp) {
      this.webApp.MainButton.setText(text);
      this.webApp.MainButton.onClick(onClick);
      this.webApp.MainButton.show();
    }
  }

  // Скрыть главную кнопку
  public hideMainButton(): void {
    if (this.webApp) {
      this.webApp.MainButton.hide();
    }
  }

  // Показать кнопку "Назад"
  public showBackButton(onClick: () => void): void {
    if (this.webApp) {
      this.webApp.BackButton.onClick(onClick);
      this.webApp.BackButton.show();
    }
  }

  // Скрыть кнопку "Назад"
  public hideBackButton(): void {
    if (this.webApp) {
      this.webApp.BackButton.hide();
    }
  }

  // Тактильная обратная связь
  public hapticFeedback(type: 'impact' | 'notification' | 'selection', style?: string): void {
    if (this.webApp) {
      switch (type) {
        case 'impact':
          this.webApp.HapticFeedback.impactOccurred(style || 'medium');
          break;
        case 'notification':
          this.webApp.HapticFeedback.notificationOccurred(style || 'success');
          break;
        case 'selection':
          this.webApp.HapticFeedback.selectionChanged();
          break;
      }
    }
  }

  // Закрыть приложение
  public close(): void {
    if (this.webApp) {
      this.webApp.close();
    }
  }

  // Получить тему
  public getTheme(): any {
    if (this.webApp) {
      return this.webApp.themeParams;
    }
    return {};
  }

  // Получить цветовую схему
  public getColorScheme(): 'light' | 'dark' {
    if (this.webApp) {
      return this.webApp.colorScheme;
    }
    return 'light';
  }

  // Проверить, что мы в Telegram
  public isTelegram(): boolean {
    return !!this.webApp;
  }

  // Получить версию WebApp
  public getVersion(): string {
    if (this.webApp) {
      return this.webApp.version;
    }
    return 'unknown';
  }

  // Получить платформу
  public getPlatform(): string {
    if (this.webApp) {
      return this.webApp.platform;
    }
    return 'unknown';
  }
}

// Экспорт синглтона
export const telegramService = TelegramService.getInstance();

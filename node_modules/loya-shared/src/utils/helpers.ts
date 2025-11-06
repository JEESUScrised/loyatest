// Вспомогательные функции

// Форматирование даты
export const formatDate = (date: string | Date, locale: string = 'ru-RU'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Форматирование времени
export const formatTime = (date: string | Date, locale: string = 'ru-RU'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Форматирование даты и времени
export const formatDateTime = (date: string | Date, locale: string = 'ru-RU'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Форматирование баллов
export const formatPoints = (points: number): string => {
  return new Intl.NumberFormat('ru-RU').format(points);
};

// Форматирование валюты
export const formatCurrency = (amount: number, currency: string = 'RUB'): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Валидация кода
export const validateCode = (code: string): boolean => {
  return /^[A-Z0-9]{6}$/.test(code);
};

// Валидация реферального кода
export const validateReferralCode = (code: string): boolean => {
  return /^[A-Z0-9]{8}$/.test(code);
};

// Валидация кода заведения
export const validateVenueCode = (code: string): boolean => {
  return /^[A-Z0-9]{3}$/.test(code);
};

// Валидация email
export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Валидация телефона
export const validatePhone = (phone: string): boolean => {
  return /^\+?[1-9]\d{1,14}$/.test(phone);
};

// Генерация случайного кода
export const generateRandomCode = (length: number = 6): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Вычисление дней до истечения
export const getDaysUntilExpiry = (expiryDate: string | Date): number => {
  const expiry = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Проверка, истек ли срок
export const isExpired = (expiryDate: string | Date): boolean => {
  const expiry = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
  return expiry.getTime() < Date.now();
};

// Форматирование времени до истечения
export const formatTimeUntilExpiry = (expiryDate: string | Date): string => {
  const days = getDaysUntilExpiry(expiryDate);
  if (days <= 0) return 'Истек';
  if (days === 1) return '1 день';
  if (days < 5) return `${days} дня`;
  return `${days} дней`;
};

// Дебаунс функция
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Троттлинг функция
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Копирование в буфер обмена
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
};

// Получение инициалов
export const getInitials = (firstName: string, lastName?: string): string => {
  const first = firstName.charAt(0).toUpperCase();
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  return first + last;
};

// Форматирование имени пользователя
export const formatUserName = (firstName: string, lastName?: string): string => {
  return lastName ? `${firstName} ${lastName}` : firstName;
};

// Проверка мобильного устройства
export const isMobile = (): boolean => {
  return window.innerWidth <= 768;
};

// Проверка темной темы
export const isDarkTheme = (): boolean => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

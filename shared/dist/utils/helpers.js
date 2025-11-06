// Вспомогательные функции
// Форматирование даты
export const formatDate = (date, locale = 'ru-RU') => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};
// Форматирование времени
export const formatTime = (date, locale = 'ru-RU') => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
    });
};
// Форматирование даты и времени
export const formatDateTime = (date, locale = 'ru-RU') => {
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
export const formatPoints = (points) => {
    return new Intl.NumberFormat('ru-RU').format(points);
};
// Форматирование валюты
export const formatCurrency = (amount, currency = 'RUB') => {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};
// Валидация кода
export const validateCode = (code) => {
    return /^[A-Z0-9]{6}$/.test(code);
};
// Валидация реферального кода
export const validateReferralCode = (code) => {
    return /^[A-Z0-9]{8}$/.test(code);
};
// Валидация кода заведения
export const validateVenueCode = (code) => {
    return /^[A-Z0-9]{3}$/.test(code);
};
// Валидация email
export const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
// Валидация телефона
export const validatePhone = (phone) => {
    return /^\+?[1-9]\d{1,14}$/.test(phone);
};
// Генерация случайного кода
export const generateRandomCode = (length = 6) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};
// Вычисление дней до истечения
export const getDaysUntilExpiry = (expiryDate) => {
    const expiry = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
// Проверка, истек ли срок
export const isExpired = (expiryDate) => {
    const expiry = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
    return expiry.getTime() < Date.now();
};
// Форматирование времени до истечения
export const formatTimeUntilExpiry = (expiryDate) => {
    const days = getDaysUntilExpiry(expiryDate);
    if (days <= 0)
        return 'Истек';
    if (days === 1)
        return '1 день';
    if (days < 5)
        return `${days} дня`;
    return `${days} дней`;
};
// Дебаунс функция
export const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};
// Троттлинг функция
export const throttle = (func, limit) => {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
};
// Копирование в буфер обмена
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    }
    catch (err) {
        console.error('Failed to copy text: ', err);
        return false;
    }
};
// Получение инициалов
export const getInitials = (firstName, lastName) => {
    const first = firstName.charAt(0).toUpperCase();
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return first + last;
};
// Форматирование имени пользователя
export const formatUserName = (firstName, lastName) => {
    return lastName ? `${firstName} ${lastName}` : firstName;
};
// Проверка мобильного устройства
export const isMobile = () => {
    return window.innerWidth <= 768;
};
// Проверка темной темы
export const isDarkTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

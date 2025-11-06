const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware для аутентификации пользователей Telegram
const authenticateUser = async (req, res, next) => {
  try {
    // Получаем токен из заголовка Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Токен доступа не предоставлен'
      });
    }

    const token = authHeader.substring(7); // Убираем "Bearer " из начала

    // Проверяем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Находим пользователя в базе данных
    const telegramId = decoded.telegramId?.telegramId || decoded.telegramId;
    console.log('🔍 Поиск пользователя с telegramId:', telegramId);
    const user = await User.findByTelegramId(telegramId);
    console.log('👤 Найден пользователь:', user ? 'да' : 'нет');
    if (user) {
      console.log('👤 Пользователь активен:', user.isActive);
    }
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    // Проверяем активность пользователя
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Аккаунт заблокирован'
      });
    }

    // Обновляем время последней активности
    // user.lastActivity = new Date();
    // await user.save();

    // Добавляем данные пользователя в запрос
    req.user = {
      telegramId: user.telegramId,
      userId: user._id
    };

    next();
  } catch (error) {
    console.error('Ошибка аутентификации:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Недействительный токен'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Токен истек'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
};

// Middleware для генерации JWT токена
const generateToken = (telegramId) => {
  return jwt.sign(
    { telegramId },
    process.env.JWT_SECRET,
    { expiresIn: '30d' } // Токен действует 30 дней
  );
};

// Middleware для валидации Telegram данных (для регистрации)
const validateTelegramData = (req, res, next) => {
  try {
    // В реальном приложении здесь должна быть проверка подписи Telegram
    // Пока что просто пропускаем
    next();
  } catch (error) {
    console.error('Ошибка валидации Telegram данных:', error);
    res.status(400).json({
      success: false,
      message: 'Неверные данные Telegram'
    });
  }
};

module.exports = {
  authenticateUser,
  generateToken,
  validateTelegramData
};

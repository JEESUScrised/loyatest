const User = require('../models/User');
const { generateToken } = require('./auth');

/**
 * Middleware для тестового режима
 * Позволяет работать с приложением без Telegram
 */
const testModeMiddleware = async (req, res, next) => {
  // Проверяем, включен ли тестовый режим
  if (process.env.TEST_MODE !== 'true') {
    return next();
  }

  try {
    // Получаем тестовый ID пользователя из переменных окружения
    const testUserId = parseInt(process.env.TEST_USER_ID) || 123456789;
    
    // Ищем или создаем тестового пользователя
    let user = await User.findByTelegramId(testUserId);
    
    if (!user) {
      // Создаем тестового пользователя
      user = await User.createWithReferralCode({
        telegramId: testUserId,
        username: 'testuser',
        firstName: 'Тестовый',
        lastName: 'Пользователь'
      });
      console.log('🧪 Создан тестовый пользователь:', user.firstName, user.lastName);
    }

    // Генерируем токен для тестового пользователя
    const token = generateToken({ telegramId: user.telegramId });
    
    // Добавляем пользователя в запрос
    req.user = {
      telegramId: user.telegramId,
      userId: user._id
    };
    
    // Добавляем токен в заголовки для удобства тестирования
    req.headers.authorization = `Bearer ${token}`;
    
    console.log('🧪 Тестовый режим: пользователь', user.firstName, user.lastName, '(ID:', user.telegramId, ')');
    
    next();
  } catch (error) {
    console.error('❌ Ошибка в тестовом режиме:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка тестового режима',
      error: error.message
    });
  }
};

/**
 * Middleware для автоматической аутентификации в тестовом режиме
 */
const autoAuthMiddleware = (req, res, next) => {
  console.log('🔍 autoAuthMiddleware:', {
    testMode: process.env.TEST_MODE,
    url: req.url,
    method: req.method
  });
  
  if (process.env.TEST_MODE === 'true') {
    // В тестовом режиме автоматически аутентифицируем пользователя
    return testModeMiddleware(req, res, next);
  }
  next();
};

/**
 * Middleware для создания тестового пользователя по запросу
 */
const createTestUser = async (req, res, next) => {
  if (process.env.TEST_MODE !== 'true') {
    return res.status(404).json({
      success: false,
      message: 'Тестовый режим не включен'
    });
  }

  try {
    const { telegramId, username, firstName, lastName } = req.body;
    
    const testUserId = telegramId || parseInt(process.env.TEST_USER_ID) || 123456789;
    
    // Создаем или обновляем тестового пользователя
    let user = await User.findByTelegramId(testUserId);
    
    if (user) {
      // Обновляем существующего пользователя
      user.username = username || user.username;
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      await user.save();
    } else {
      // Создаем нового пользователя
      user = await User.createWithReferralCode({
        telegramId: testUserId,
        username: username || 'testuser',
        firstName: firstName || 'Тестовый',
        lastName: lastName || 'Пользователь'
      });
    }

    const token = generateToken({ telegramId: user.telegramId });
    
    res.json({
      success: true,
      message: 'Тестовый пользователь создан/обновлен',
      data: {
        user: {
          telegramId: user.telegramId,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          pointsBalance: user.pointsBalance
        },
        token: token
      }
    });
  } catch (error) {
    console.error('❌ Ошибка создания тестового пользователя:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка создания тестового пользователя',
      error: error.message
    });
  }
};

module.exports = {
  testModeMiddleware,
  autoAuthMiddleware,
  createTestUser
};

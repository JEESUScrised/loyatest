const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Referral = require('../models/Referral');
const QRService = require('../services/QRService');
const Joi = require('joi');
const { generateToken, authenticateUser } = require('../middleware/auth');

// Валидация данных
const userValidation = {
  // Валидация Telegram данных
  telegramData: Joi.object({
    id: Joi.number().required(),
    username: Joi.string().allow(null),
    first_name: Joi.string().required(),
    last_name: Joi.string().allow(null)
  }),
  
  // Валидация 6-значного кода
  useCode: Joi.object({
    code: Joi.string().length(6).pattern(/^[A-Z0-9]{6}$/).required()
  }),
  
  // Валидация QR-кода
  scanQR: Joi.object({
    transactionId: Joi.string().required()
  }),
  
  // Регистрация с реферальным кодом
  registerWithReferral: Joi.object({
    telegramId: Joi.number().required(),
    firstName: Joi.string().min(1).max(100).required(),
    lastName: Joi.string().max(100).allow(''),
    username: Joi.string().max(100).allow(''),
    referralCode: Joi.string().length(8).allow(null)
  }),
  
  // Завершение регистрации
  completeRegistration: Joi.object({
    firstName: Joi.string().min(1).max(100).required(),
    birthDate: Joi.date().required(),
    city: Joi.string().min(1).max(100).required()
  })
};

// GET /api/user/profile - Получить профиль пользователя
router.get('/profile', process.env.TEST_MODE !== 'true' ? authenticateUser : (req, res, next) => next(), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Пользователь не аутентифицирован'
      });
    }
    const { telegramId } = req.user; // Получаем из middleware аутентификации
    
    const user = await User.findByTelegramId(telegramId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    // Получаем информацию о ближайшем сгорании (пока упрощенная версия)
    const nextExpiry = null; // user.getNextExpiry();
    const totalExpiringPoints = 0; // user.getTotalExpiringPoints();

    res.json({
      success: true,
      data: {
        user: {
          telegramId: user.telegramId,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          birthDate: user.birthDate,
          city: user.city,
          isRegistrationComplete: user.isRegistrationComplete,
          pointsBalance: user.pointsBalance,
          totalPointsEarned: user.totalPointsEarned,
          totalPointsSpent: user.totalPointsSpent,
          registrationDate: user.registrationDate,
          referralCode: user.referralCode,
          referralStats: { totalReferrals: 0, totalEarned: 0 }
        },
        pointsInfo: {
          balance: user.pointsBalance,
          nextExpiry: nextExpiry ? {
            points: nextExpiry.points,
            expiryDate: nextExpiry.expiryDate,
            daysLeft: Math.ceil((nextExpiry.expiryDate - new Date()) / (1000 * 60 * 60 * 24))
          } : null,
          totalExpiringPoints
        }
      }
    });
  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// POST /api/user/register - Регистрация нового пользователя
router.post('/register', async (req, res) => {
  try {
    const { error, value } = userValidation.telegramData.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Неверные данные',
        details: error.details[0].message
      });
    }

    const { id: telegramId, username, first_name: firstName, last_name: lastName } = value;

    // Проверяем, существует ли пользователь
    const existingUser = await User.findOne({ telegramId });
    if (existingUser) {
      // Генерируем токен для существующего пользователя
      const token = generateToken(existingUser.telegramId);
      return res.json({
        success: true,
        message: 'Пользователь уже зарегистрирован',
        data: { 
          userId: existingUser._id,
          token: token
        }
      });
    }

    // Создаем нового пользователя
    const newUser = await User.create({
      telegramId,
      username,
      firstName,
      lastName,
      isRegistrationComplete: false
    });

    // Генерируем токен
    const token = generateToken(newUser.telegramId);

    res.status(201).json({
      success: true,
      message: 'Пользователь успешно зарегистрирован',
      data: { 
        userId: newUser.id,
        referralCode: newUser.referralCode,
        token: token
      }
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// POST /api/user/use-code - Использование 6-значного кода
router.post('/use-code', async (req, res) => {
  try {
    console.log('🔍 use-code запрос:', {
      hasUser: !!req.user,
      user: req.user,
      body: req.body,
      testMode: process.env.TEST_MODE
    });
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Пользователь не аутентифицирован'
      });
    }

    const { error, value } = userValidation.useCode.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Неверный формат кода',
        details: error.details[0].message
      });
    }

    const { telegramId } = req.user;
    const { code } = value;

    const user = await User.findByTelegramId(telegramId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    // Используем сервис для обработки кода
    const CodeService = require('../services/CodeService');
    const result = await CodeService.usePurchaseCode(code, user._id);

    res.json({
      success: true,
      message: 'Код успешно использован',
      data: result
    });
  } catch (error) {
    console.error('Ошибка использования кода:', error);
    
    // Определяем тип ошибки для более точного ответа
    if (error.message.includes('не найден') || error.message.includes('недействителен')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message.includes('использован') || error.message.includes('истек')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// POST /api/user/scan-qr - Сканирование QR-кода транзакции
router.post('/scan-qr', process.env.TEST_MODE !== 'true' ? authenticateUser : (req, res, next) => next(), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Пользователь не аутентифицирован'
      });
    }

    const { error, value } = userValidation.scanQR.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Неверный формат QR-кода',
        details: error.details[0].message
      });
    }

    const { telegramId } = req.user;
    const { transactionId } = value;

    const user = await User.findByTelegramId(telegramId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    // Используем сервис для обработки QR-кода
    const result = await QRService.scanQRCode(transactionId, user._id);

    res.json({
      success: true,
      message: 'Баллы успешно начислены',
      data: {
        pointsEarned: result.pointsEarned,
        newBalance: result.newBalance,
        venueName: result.venueName,
        transactionId: result.transactionId,
        isDoublePoints: result.isDoublePoints
      }
    });
  } catch (error) {
    console.error('Ошибка сканирования QR-кода:', error);
    
    if (error.message.includes('не найден') || error.message.includes('недействителен')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message.includes('уже использован') || error.message.includes('истек')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// GET /api/user/check-code - Проверка статуса кода
router.get('/check-code/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    if (!code || code.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Код должен содержать 6 символов'
      });
    }

    const CodeService = require('../services/CodeService');
    const result = await CodeService.checkCodeStatus(code.toUpperCase());

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Ошибка проверки кода:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// GET /api/user/points-history - История операций с баллами
router.get('/points-history', async (req, res) => {
  try {
    const { telegramId } = req.user;
    const { 
      page = 1, 
      limit = 20, 
      venueCode = null, 
      type = null,
      startDate = null,
      endDate = null
    } = req.query;

    const user = await User.findOne({ telegramId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    // Получаем историю транзакций
    const PointsTransaction = require('../models/PointsTransaction');
    const result = await PointsTransaction.getUserHistory(user._id, {
      venueCode,
      type,
      startDate,
      endDate,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    // Форматируем данные для ответа
    const formattedHistory = result.transactions.map(transaction => ({
      id: transaction._id,
      type: transaction.type,
      points: transaction.points,
      balanceAfter: transaction.balanceAfter,
      description: transaction.description,
      venue: transaction.venue ? {
        name: transaction.venue.name,
        code: transaction.venue.venueCode
      } : null,
      venueCode: transaction.venueCode,
      purchaseAmount: transaction.purchaseAmount,
      pointsMultiplier: transaction.pointsMultiplier,
      transactionDate: transaction.transactionDate,
      metadata: transaction.metadata
    }));

    res.json({
      success: true,
      data: {
        history: formattedHistory,
        pagination: result.pagination
      }
    });
  } catch (error) {
    console.error('Ошибка получения истории:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// POST /api/user/test-code - Тестирование кода без аутентификации
router.post('/test-code', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code || code.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Неверный формат кода'
      });
    }

    // Используем сервис для обработки кода
    const CodeService = require('../services/CodeService');
    const result = await CodeService.usePurchaseCode(1, code); // Используем ID тестового пользователя

    res.json({
      success: true,
      message: 'Код успешно использован',
      data: result.data
    });
  } catch (error) {
    console.error('Ошибка использования кода:', error);
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/user/register-with-referral - Регистрация с реферальным кодом
router.post('/register-with-referral', async (req, res) => {
  try {
    const { error, value } = userValidation.registerWithReferral.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Неверные данные',
        details: error.details[0].message
      });
    }

    // Проверяем, существует ли пользователь
    const existingUser = await User.findOne({ telegramId: value.telegramId });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Пользователь уже зарегистрирован'
      });
    }

    // Создаем пользователя с реферальным кодом
    const user = await User.createWithReferralCode({
      telegramId: value.telegramId,
      firstName: value.firstName,
      lastName: value.lastName || '',
      username: value.username || ''
    }, value.referralCode);

    res.status(201).json({
      success: true,
      message: 'Пользователь успешно зарегистрирован',
      data: {
        userId: user._id,
        telegramId: user.telegramId,
        firstName: user.firstName,
        pointsBalance: user.pointsBalance,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        referralCodeUsed: user.referralCodeUsed
      }
    });
  } catch (error) {
    console.error('Ошибка регистрации с реферальным кодом:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// POST /api/user/claim-daily-bonus - Получить ежедневный бонус
router.post('/claim-daily-bonus', async (req, res) => {
  try {
    const { telegramId } = req.user;

    const user = await User.findOne({ telegramId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    const result = await user.claimDailyBonus();

    res.json({
      success: true,
      message: 'Ежедневный бонус получен',
      data: {
        bonus: result.bonus,
        streak: result.streak,
        totalClaimed: result.totalClaimed,
        newBalance: user.pointsBalance
      }
    });
  } catch (error) {
    console.error('Ошибка получения ежедневного бонуса:', error);
    
    if (error.message.includes('уже получен')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// GET /api/user/referral-stats - Получить статистику рефералов
router.get('/referral-stats', async (req, res) => {
  try {
    const { telegramId } = req.user;

    const user = await User.findOne({ telegramId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    const referralStats = await Referral.getReferralStats(user._id);
    const recentReferrals = await Referral.getRecentReferrals(user._id, 10);

    res.json({
      success: true,
      data: {
        user: {
          referralCode: user.referralCode,
          referredBy: user.referredBy,
          referralCodeUsed: user.referralCodeUsed
        },
        stats: referralStats,
        recentReferrals: recentReferrals.map(ref => ({
          id: ref._id,
          referredUser: {
            firstName: ref.referredUser.firstName,
            lastName: ref.referredUser.lastName,
            username: ref.referredUser.username
          },
          usedAt: ref.usedAt,
          status: ref.status,
          bonusAwarded: ref.bonusAwarded
        }))
      }
    });
  } catch (error) {
    console.error('Ошибка получения статистики рефералов:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// PUT /api/user/complete-registration - Завершение регистрации
router.put('/complete-registration', process.env.TEST_MODE !== 'true' ? authenticateUser : (req, res, next) => next(), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Пользователь не аутентифицирован'
      });
    }

    const { error, value } = userValidation.completeRegistration.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Неверные данные',
        details: error.details[0].message
      });
    }

    const { telegramId } = req.user;
    const user = await User.findOne({ telegramId });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    // Обновляем данные пользователя
    user.firstName = value.firstName;
    user.birthDate = new Date(value.birthDate);
    user.city = value.city;
    user.isRegistrationComplete = true;
    
    await user.save();

    res.json({
      success: true,
      message: 'Регистрация успешно завершена',
      data: {
        user: {
          telegramId: user.telegramId,
          firstName: user.firstName,
          birthDate: user.birthDate,
          city: user.city,
          isRegistrationComplete: user.isRegistrationComplete
        }
      }
    });
  } catch (error) {
    console.error('Ошибка завершения регистрации:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

module.exports = router;

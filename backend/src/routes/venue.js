const express = require('express');
const router = express.Router();
const Venue = require('../models/Venue');
const VenueBalance = require('../models/VenueBalance');
const CodeService = require('../services/CodeService');
const QRService = require('../services/QRService');
const Joi = require('joi');

// Валидация данных
const venueValidation = {
  // Создание заведения
  createVenue: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500).allow(''),
    address: Joi.string().max(200).allow(''),
    phone: Joi.string().max(20).allow(''),
    email: Joi.string().email().allow(''),
    pointsPerPurchase: Joi.number().min(1).max(1000).default(10),
    pointsMultiplier: Joi.number().min(0.1).max(10).default(1.0),
    pointsLifetime: Joi.object({
      weeks: Joi.number().min(2).max(104).default(12),
      autoExpire: Joi.boolean().default(true),
      expiryNotifications: Joi.object({
        enabled: Joi.boolean().default(true),
        daysBefore: Joi.number().min(1).max(30).default(7)
      }).default({})
    }).default({}),
    doublePointsHours: Joi.array().items(
      Joi.object({
        dayOfWeek: Joi.number().min(0).max(6).required(),
        startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
        endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
        multiplier: Joi.number().min(1.0).default(2.0)
      })
    ).default([])
  }),
  
  // Генерация кода
  generateCode: Joi.object({
    purchaseAmount: Joi.number().min(0).required()
  }),
  
  // Генерация QR-кода
  generateQR: Joi.object({
    purchaseAmount: Joi.number().min(0).required()
  })
};

// POST /api/venue/create - Создание нового заведения
router.post('/create', async (req, res) => {
  try {
    const { error, value } = venueValidation.createVenue.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Неверные данные',
        details: error.details[0].message
      });
    }

    // Создаем заведение с уникальным кодом
    const venue = await Venue.createWithUniqueCode(value);

    // Создаем баланс для нового заведения
    await VenueBalance.createForVenue(venue._id, venue.venueCode);

    res.status(201).json({
      success: true,
      message: 'Заведение успешно создано',
      data: {
        venueId: venue._id,
        venueCode: venue.venueCode,
        name: venue.name
      }
    });
  } catch (error) {
    console.error('Ошибка создания заведения:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// POST /api/venue/generate-code - Генерация кода покупки (для кассира)
router.post('/generate-code', async (req, res) => {
  try {
    const { error, value } = venueValidation.generateCode.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Неверные данные',
        details: error.details[0].message
      });
    }

    const { venueCode, purchaseAmount } = req.body;

    if (!venueCode || venueCode.length !== 3) {
      return res.status(400).json({
        success: false,
        message: 'Код заведения должен содержать 3 символа'
      });
    }

    // Генерируем код покупки
    const result = await CodeService.generatePurchaseCode(venueCode.toUpperCase(), purchaseAmount);

    res.json({
      success: true,
      message: 'Код успешно сгенерирован',
      data: result.data
    });
  } catch (error) {
    console.error('Ошибка генерации кода:', error);
    
    if (error.message.includes('не найдено')) {
      return res.status(404).json({
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

// POST /api/venue/generate-qr - Генерация QR-кода транзакции (для кассира)
router.post('/generate-qr', async (req, res) => {
  try {
    const { error, value } = venueValidation.generateQR.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Неверные данные',
        details: error.details[0].message
      });
    }

    const { venueCode, purchaseAmount } = req.body;

    if (!venueCode || venueCode.length !== 3) {
      return res.status(400).json({
        success: false,
        message: 'Код заведения должен содержать 3 символа'
      });
    }

    // Генерируем QR-транзакцию
    const result = await QRService.generateQRTransaction(
      venueCode.toUpperCase(), 
      purchaseAmount,
      {
        cashierId: req.user?._id || null,
        cashierName: req.user?.firstName || null,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    );

    res.json({
      success: true,
      message: 'QR-код успешно сгенерирован',
      data: result.data
    });
  } catch (error) {
    console.error('Ошибка генерации QR-кода:', error);
    
    if (error.message.includes('не найдено') || error.message.includes('неактивно')) {
      return res.status(404).json({
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

// GET /api/venue/:venueCode - Получить информацию о заведении
router.get('/:venueCode', async (req, res) => {
  try {
    const { venueCode } = req.params;

    if (!venueCode || venueCode.length !== 3) {
      return res.status(400).json({
        success: false,
        message: 'Код заведения должен содержать 3 символа'
      });
    }

    const venue = await Venue.findOne({ 
      venueCode: venueCode.toUpperCase(), 
      isActive: true 
    });

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Заведение не найдено'
      });
    }

    // Проверяем, действуют ли удвоенные баллы сейчас
    const doublePointsInfo = venue.isDoublePointsTime();

    res.json({
      success: true,
      data: {
        venueId: venue._id,
        venueCode: venue.venueCode,
        name: venue.name,
        description: venue.description,
        address: venue.address,
        phone: venue.phone,
        email: venue.email,
        pointsPerPurchase: venue.pointsPerPurchase,
        pointsMultiplier: venue.pointsMultiplier,
        pointsLifetime: venue.pointsLifetime,
        doublePointsHours: venue.doublePointsHours,
        currentDoublePoints: doublePointsInfo,
        totalCustomers: venue.totalCustomers,
        totalPointsAwarded: venue.totalPointsAwarded
      }
    });
  } catch (error) {
    console.error('Ошибка получения информации о заведении:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// GET /api/venue/:venueCode/balance - Получить баланс заведения
router.get('/:venueCode/balance', async (req, res) => {
  try {
    const { venueCode } = req.params;

    if (!venueCode || venueCode.length !== 3) {
      return res.status(400).json({
        success: false,
        message: 'Код заведения должен содержать 3 символа'
      });
    }

    const venue = await Venue.findOne({ 
      venueCode: venueCode.toUpperCase(), 
      isActive: true 
    });

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Заведение не найдено'
      });
    }

    const balance = await VenueBalance.findOne({ venue: venue._id });
    if (!balance) {
      return res.status(404).json({
        success: false,
        message: 'Баланс заведения не найден'
      });
    }

    res.json({
      success: true,
      data: balance.getBalanceSummary()
    });
  } catch (error) {
    console.error('Ошибка получения баланса заведения:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// GET /api/venue/:venueCode/balance/weekly - Еженедельный отчет по балансу
router.get('/:venueCode/balance/weekly', async (req, res) => {
  try {
    const { venueCode } = req.params;

    if (!venueCode || venueCode.length !== 3) {
      return res.status(400).json({
        success: false,
        message: 'Код заведения должен содержать 3 символа'
      });
    }

    const venue = await Venue.findOne({ 
      venueCode: venueCode.toUpperCase(), 
      isActive: true 
    });

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Заведение не найдено'
      });
    }

    const balance = await VenueBalance.findOne({ venue: venue._id });
    if (!balance) {
      return res.status(404).json({
        success: false,
        message: 'Баланс заведения не найден'
      });
    }

    res.json({
      success: true,
      data: {
        venueCode: venue.venueCode,
        venueName: venue.name,
        weeklyReport: balance.getWeeklyReport()
      }
    });
  } catch (error) {
    console.error('Ошибка получения еженедельного отчета:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// GET /api/venue/:venueCode/balance/hourly - Почасовой отчет по балансу
router.get('/:venueCode/balance/hourly', async (req, res) => {
  try {
    const { venueCode } = req.params;

    if (!venueCode || venueCode.length !== 3) {
      return res.status(400).json({
        success: false,
        message: 'Код заведения должен содержать 3 символа'
      });
    }

    const venue = await Venue.findOne({ 
      venueCode: venueCode.toUpperCase(), 
      isActive: true 
    });

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Заведение не найдено'
      });
    }

    const balance = await VenueBalance.findOne({ venue: venue._id });
    if (!balance) {
      return res.status(404).json({
        success: false,
        message: 'Баланс заведения не найдено'
      });
    }

    res.json({
      success: true,
      data: {
        venueCode: venue.venueCode,
        venueName: venue.name,
        hourlyReport: balance.getHourlyReport()
      }
    });
  } catch (error) {
    console.error('Ошибка получения почасового отчета:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// GET /api/venue/:venueCode/stats - Статистика заведения
router.get('/:venueCode/stats', async (req, res) => {
  try {
    const { venueCode } = req.params;

    if (!venueCode || venueCode.length !== 3) {
      return res.status(400).json({
        success: false,
        message: 'Код заведения должен содержать 3 символа'
      });
    }

    const venue = await Venue.findOne({ 
      venueCode: venueCode.toUpperCase(), 
      isActive: true 
    });

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Заведение не найдено'
      });
    }

    const balance = await VenueBalance.findOne({ venue: venue._id });

    res.json({
      success: true,
      data: {
        venueCode: venue.venueCode,
        name: venue.name,
        totalCodesGenerated: venue.totalCodesGenerated,
        totalPointsAwarded: venue.totalPointsAwarded,
        totalCustomers: venue.totalCustomers,
        registrationDate: venue.registrationDate,
        lastActivity: venue.lastActivity,
        balance: balance ? balance.getBalanceSummary() : null
      }
    });
  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

module.exports = router;
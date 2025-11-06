const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const Discount = require('../models/Discount');
const Venue = require('../models/Venue');
const Joi = require('joi');

// Валидация данных
const notificationValidation = {
  // Создание уведомления
  createNotification: Joi.object({
    type: Joi.string().valid('discount', 'promotion', 'new_item', 'venue_news', 'system').required(),
    title: Joi.string().min(2).max(100).required(),
    message: Joi.string().min(10).max(1000).required(),
    venueCode: Joi.string().length(3).allow(null),
    discountId: Joi.string().allow(null),
    imageUrl: Joi.string().uri().allow(null),
    buttons: Joi.array().items(
      Joi.object({
        text: Joi.string().max(50).required(),
        url: Joi.string().uri().allow(null),
        action: Joi.string().allow(null)
      })
    ).default([]),
    targetAudience: Joi.object({
      clientStatus: Joi.array().items(Joi.string().valid('new', 'regular', 'vip')).default([]),
      minVisits: Joi.number().min(0).default(0),
      minBalance: Joi.number().min(0).default(0),
      lastVisitAfter: Joi.date().allow(null)
    }).default({}),
    scheduledAt: Joi.date().allow(null)
  }),
  
  // Создание скидки
  createDiscount: Joi.object({
    title: Joi.string().min(2).max(100).required(),
    description: Joi.string().min(10).max(500).required(),
    type: Joi.string().valid('percentage', 'fixed_amount', 'buy_x_get_y', 'free_item', 'double_points').required(),
    value: Joi.number().min(0).required(),
    parameters: Joi.object({
      buyQuantity: Joi.number().min(1).allow(null),
      getQuantity: Joi.number().min(1).allow(null),
      freeItemId: Joi.string().allow(null),
      minOrderAmount: Joi.number().min(0).default(0),
      maxDiscountAmount: Joi.number().min(0).allow(null)
    }).default({}),
    applicableItems: Joi.array().items(Joi.string()).default([]),
    applicableCategories: Joi.array().items(Joi.string().max(50)).default([]),
    validFrom: Joi.date().required(),
    validTo: Joi.date().required(),
    usageLimit: Joi.object({
      totalLimit: Joi.number().min(1).allow(null),
      perUserLimit: Joi.number().min(1).allow(null)
    }).default({}),
    imageUrl: Joi.string().uri().allow(null)
  })
};

// POST /api/notifications/create - Создать уведомление
router.post('/create', async (req, res) => {
  try {
    const { error, value } = notificationValidation.createNotification.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Неверные данные',
        details: error.details[0].message
      });
    }

    // Проверяем заведение, если указано
    let venue = null;
    if (value.venueCode) {
      venue = await Venue.findOne({ 
        venueCode: value.venueCode.toUpperCase(), 
        isActive: true 
      });
      if (!venue) {
        return res.status(404).json({
          success: false,
          message: 'Заведение не найдено'
        });
      }
    }

    // Проверяем скидку, если указана
    if (value.discountId) {
      const discount = await Discount.findById(value.discountId);
      if (!discount) {
        return res.status(404).json({
          success: false,
          message: 'Скидка не найдена'
        });
      }
    }

    // Создаем уведомление
    const notification = await Notification.createNotification({
      ...value,
      venue: venue ? venue._id : null,
      venueCode: venue ? venue.venueCode : null
    });

    // Если указано время отправки, планируем уведомление
    if (value.scheduledAt) {
      await notification.schedule(value.scheduledAt);
    }

    res.status(201).json({
      success: true,
      message: 'Уведомление успешно создано',
      data: {
        notificationId: notification._id,
        type: notification.type,
        title: notification.title,
        status: notification.status,
        scheduledAt: notification.scheduledAt
      }
    });
  } catch (error) {
    console.error('Ошибка создания уведомления:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// POST /api/notifications/send/:notificationId - Отправить уведомление
router.post('/send/:notificationId', async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Уведомление не найдено'
      });
    }

    if (notification.status !== 'scheduled' && notification.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Уведомление уже отправлено или отменено'
      });
    }

    // Отправляем уведомление
    const result = await Notification.sendNotification(notificationId);

    res.json({
      success: true,
      message: 'Уведомление успешно отправлено',
      data: {
        notificationId: result._id,
        stats: result.stats
      }
    });
  } catch (error) {
    console.error('Ошибка отправки уведомления:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// GET /api/notifications - Получить список уведомлений
router.get('/', async (req, res) => {
  try {
    const { 
      type = null, 
      status = null, 
      venueCode = null,
      page = 1, 
      limit = 20 
    } = req.query;

    const query = {};

    if (type) {
      query.type = type;
    }

    if (status) {
      query.status = status;
    }

    if (venueCode) {
      query.venueCode = venueCode.toUpperCase();
    }

    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .populate('venue', 'name venueCode')
        .populate('discount', 'title type value')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Ошибка получения уведомлений:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// POST /api/notifications/discounts/create - Создать скидку
router.post('/discounts/create', async (req, res) => {
  try {
    const { venueCode, ...discountData } = req.body;
    const { error, value } = notificationValidation.createDiscount.validate(discountData);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Неверные данные',
        details: error.details[0].message
      });
    }

    if (!venueCode || venueCode.length !== 3) {
      return res.status(400).json({
        success: false,
        message: 'Код заведения должен содержать 3 символа'
      });
    }

    // Проверяем заведение
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

    // Создаем скидку
    const discount = new Discount({
      ...value,
      venue: venue._id,
      venueCode: venue.venueCode
    });

    await discount.save();

    res.status(201).json({
      success: true,
      message: 'Скидка успешно создана',
      data: {
        discountId: discount._id,
        title: discount.title,
        type: discount.type,
        value: discount.value,
        validFrom: discount.validFrom,
        validTo: discount.validTo
      }
    });
  } catch (error) {
    console.error('Ошибка создания скидки:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// GET /api/notifications/discounts/:venueCode - Получить активные скидки заведения
router.get('/discounts/:venueCode', async (req, res) => {
  try {
    const { venueCode } = req.params;
    const { category = null } = req.query;

    if (!venueCode || venueCode.length !== 3) {
      return res.status(400).json({
        success: false,
        message: 'Код заведения должен содержать 3 символа'
      });
    }

    const discounts = await Discount.getActiveDiscounts(venueCode, { category });

    res.json({
      success: true,
      data: {
        venueCode: venueCode.toUpperCase(),
        discounts: discounts.map(discount => ({
          id: discount._id,
          title: discount.title,
          description: discount.description,
          type: discount.type,
          value: discount.value,
          parameters: discount.parameters,
          validFrom: discount.validFrom,
          validTo: discount.validTo,
          imageUrl: discount.imageUrl
        }))
      }
    });
  } catch (error) {
    console.error('Ошибка получения скидок:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// PUT /api/notifications/:notificationId/cancel - Отменить уведомление
router.put('/:notificationId/cancel', async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Уведомление не найдено'
      });
    }

    if (notification.status === 'sent') {
      return res.status(400).json({
        success: false,
        message: 'Нельзя отменить уже отправленное уведомление'
      });
    }

    await notification.cancel();

    res.json({
      success: true,
      message: 'Уведомление отменено'
    });
  } catch (error) {
    console.error('Ошибка отмены уведомления:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

module.exports = router;

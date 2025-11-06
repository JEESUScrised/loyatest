const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const UserVenueBalance = require('../models/UserVenueBalance');
const Venue = require('../models/Venue');
const Joi = require('joi');

// Валидация данных
const orderValidation = {
  // Создание заказа
  createOrder: Joi.object({
    items: Joi.array().items(
      Joi.object({
        menuItemId: Joi.string().required(),
        quantity: Joi.number().min(1).max(10).required(),
        selectedOptions: Joi.array().items(
          Joi.object({
            optionName: Joi.string().required(),
            choiceName: Joi.string().required(),
            pointsModifier: Joi.number().default(0)
          })
        ).default([])
      })
    ).min(1).required(),
    customerName: Joi.string().min(2).max(100).required(),
    paymentType: Joi.string().valid('general_balance', 'venue_balance').required(),
    comment: Joi.string().max(500).allow('')
  }),
  
  // Обновление статуса заказа
  updateStatus: Joi.object({
    status: Joi.string().valid('confirmed', 'preparing', 'ready', 'completed', 'cancelled').required(),
    reason: Joi.string().max(200).allow('')
  })
};

// POST /api/orders/create - Создать заказ
router.post('/create', async (req, res) => {
  try {
    const { telegramId } = req.user;
    const { venueCode } = req.body;
    const { error, value } = orderValidation.createOrder.validate(req.body);

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

    // Находим пользователя
    const User = require('../models/User');
    const user = await User.findOne({ telegramId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    // Проверяем существование заведения
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

    // Создаем заказ
    const order = await Order.createOrder(
      user._id,
      venue._id,
      venue.venueCode,
      value.items,
      value.customerName,
      value.paymentType,
      value.comment
    );

    // Отправляем уведомление кассиру о новом заказе
    const TelegramService = require('../services/TelegramService');
    await TelegramService.sendOrderNotificationToVenue(venue, order);

    res.status(201).json({
      success: true,
      message: 'Заказ успешно создан',
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        totalCost: order.totalCost,
        paymentType: order.paymentType,
        status: order.status,
        orderDate: order.orderDate,
        items: order.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          totalPrice: item.totalPrice
        }))
      }
    });
  } catch (error) {
    console.error('Ошибка создания заказа:', error);
    
    if (error.message.includes('не найден') || error.message.includes('недоступен')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message.includes('Недостаточно')) {
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

// GET /api/orders/venue/:venueCode - Получить заказы заведения (для кассира)
router.get('/venue/:venueCode', async (req, res) => {
  try {
    const { venueCode } = req.params;
    const { 
      status = null, 
      startDate = null, 
      endDate = null,
      page = 1, 
      limit = 20 
    } = req.query;

    if (!venueCode || venueCode.length !== 3) {
      return res.status(400).json({
        success: false,
        message: 'Код заведения должен содержать 3 символа'
      });
    }

    // Проверяем существование заведения
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

    // Получаем заказы
    const result = await Order.getVenueOrders(venueCode, {
      status,
      startDate,
      endDate,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    // Форматируем данные для кассира
    const formattedOrders = result.orders.map(order => ({
      id: order._id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      status: order.status,
      totalCost: order.totalCost,
      paymentType: order.paymentType,
      comment: order.comment,
      orderDate: order.orderDate,
      confirmedDate: order.confirmedDate,
      preparingDate: order.preparingDate,
      readyDate: order.readyDate,
      completedDate: order.completedDate,
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        selectedOptions: item.selectedOptions
      })),
      customer: {
        firstName: order.user.firstName,
        lastName: order.user.lastName,
        username: order.user.username
      }
    }));

    res.json({
      success: true,
      data: {
        venue: {
          name: venue.name,
          code: venue.venueCode
        },
        orders: formattedOrders,
        pagination: result.pagination
      }
    });
  } catch (error) {
    console.error('Ошибка получения заказов заведения:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// PUT /api/orders/:orderId/status - Обновить статус заказа (для кассира)
router.put('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { error, value } = orderValidation.updateStatus.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Неверные данные',
        details: error.details[0].message
      });
    }

    const order = await Order.findById(orderId)
      .populate('venue', 'name venueCode')
      .populate('user', 'firstName lastName');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Заказ не найден'
      });
    }

    // Обновляем статус в зависимости от действия
    switch (value.status) {
      case 'confirmed':
        await order.confirm();
        break;
      case 'preparing':
        await order.startPreparing();
        break;
      case 'ready':
        await order.markReady();
        // Отправляем уведомление пользователю о готовности заказа
        const TelegramService = require('../services/TelegramService');
        const User = require('../models/User');
        const user = await User.findById(order.user);
        if (user) {
          await TelegramService.sendOrderReadyNotification(user, order);
        }
        break;
      case 'completed':
        await order.complete();
        break;
      case 'cancelled':
        await order.cancel(value.reason);
        break;
      default:
        throw new Error('Неизвестный статус');
    }

    res.json({
      success: true,
      message: 'Статус заказа обновлен',
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        status: order.status,
        updatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Ошибка обновления статуса заказа:', error);
    
    if (error.message.includes('не найден') || error.message.includes('нельзя')) {
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

// GET /api/orders/my - Мои заказы (для пользователя)
router.get('/my', async (req, res) => {
  try {
    const { telegramId } = req.user;
    const { 
      venueCode = null, 
      status = null, 
      startDate = null, 
      endDate = null,
      page = 1, 
      limit = 20 
    } = req.query;

    // Находим пользователя
    const User = require('../models/User');
    const user = await User.findOne({ telegramId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    const query = { user: user._id };

    if (venueCode) {
      query.venueCode = venueCode.toUpperCase();
    }

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.orderDate = {};
      if (startDate) query.orderDate.$gte = new Date(startDate);
      if (endDate) query.orderDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('venue', 'name venueCode')
        .sort({ orderDate: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query)
    ]);

    // Форматируем данные
    const formattedOrders = orders.map(order => ({
      id: order._id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      status: order.status,
      totalCost: order.totalCost,
      paymentType: order.paymentType,
      comment: order.comment,
      orderDate: order.orderDate,
      confirmedDate: order.confirmedDate,
      preparingDate: order.preparingDate,
      readyDate: order.readyDate,
      completedDate: order.completedDate,
      cancelledDate: order.cancelledDate,
      cancellationReason: order.cancellationReason,
      venue: {
        name: order.venue.name,
        code: order.venue.venueCode
      },
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        selectedOptions: item.selectedOptions
      }))
    }));

    res.json({
      success: true,
      data: {
        orders: formattedOrders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Ошибка получения заказов пользователя:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// GET /api/orders/venue-balances - Получить индивидуальные балансы пользователя по заведениям
router.get('/venue-balances', async (req, res) => {
  try {
    const { telegramId } = req.user;

    // Находим пользователя
    const User = require('../models/User');
    const user = await User.findOne({ telegramId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    // Получаем индивидуальные балансы
    const venueBalances = await UserVenueBalance.getUserBalances(user._id);

    // Форматируем данные
    const formattedBalances = venueBalances.map(balance => ({
      venue: {
        id: balance.venue._id,
        name: balance.venue.name,
        code: balance.venue.venueCode
      },
      balance: balance.balance,
      totalEarned: balance.totalEarned,
      totalSpent: balance.totalSpent,
      visitsCount: balance.visitsCount,
      status: balance.status,
      statusInfo: balance.getStatusInfo(),
      nextStatusInfo: balance.getNextStatusInfo(),
      firstVisitDate: balance.firstVisitDate,
      lastVisitDate: balance.lastVisitDate
    }));

    res.json({
      success: true,
      data: {
        generalBalance: user.pointsBalance,
        venueBalances: formattedBalances
      }
    });
  } catch (error) {
    console.error('Ошибка получения балансов по заведениям:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

module.exports = router;

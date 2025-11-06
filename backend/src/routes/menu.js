const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const Purchase = require('../models/Purchase');
const Venue = require('../models/Venue');
const Joi = require('joi');

// Валидация данных
const menuValidation = {
  // Создание товара меню
  createMenuItem: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500).allow(''),
    pointsCost: Joi.number().min(1).required(),
    category: Joi.string().max(50).required(),
    imageUrl: Joi.string().uri().allow(null),
    stockQuantity: Joi.number().min(0).allow(null),
    displayOrder: Joi.number().default(0),
    tags: Joi.array().items(Joi.string().max(30)).default([]),
    options: Joi.array().items(
      Joi.object({
        name: Joi.string().max(50).required(),
        choices: Joi.array().items(
          Joi.object({
            name: Joi.string().max(50).required(),
            pointsModifier: Joi.number().default(0)
          })
        ).min(1).required()
      })
    ).default([])
  }),
  
  // Покупка товара
  purchaseItem: Joi.object({
    quantity: Joi.number().min(1).max(10).required(),
    selectedOptions: Joi.array().items(
      Joi.object({
        optionName: Joi.string().required(),
        choiceName: Joi.string().required(),
        pointsModifier: Joi.number().default(0)
      })
    ).default([]),
    comment: Joi.string().max(500).allow('')
  })
};

// GET /api/menu/:venueCode - Получить меню заведения
router.get('/:venueCode', async (req, res) => {
  try {
    const { venueCode } = req.params;
    const { category, sortBy = 'displayOrder', sortOrder = 'asc' } = req.query;

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

    // Получаем меню
    const menuItems = await MenuItem.getMenuByVenue(venueCode, {
      category,
      sortBy,
      sortOrder
    });

    // Получаем категории
    const categories = await MenuItem.getCategoriesByVenue(venueCode);

    // Форматируем данные
    const formattedMenu = menuItems.map(item => item.toPublicJSON());

    res.json({
      success: true,
      data: {
        venue: {
          id: venue._id,
          name: venue.name,
          code: venue.venueCode
        },
        categories,
        menu: formattedMenu
      }
    });
  } catch (error) {
    console.error('Ошибка получения меню:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// GET /api/menu/:venueCode/categories - Получить категории меню
router.get('/:venueCode/categories', async (req, res) => {
  try {
    const { venueCode } = req.params;

    if (!venueCode || venueCode.length !== 3) {
      return res.status(400).json({
        success: false,
        message: 'Код заведения должен содержать 3 символа'
      });
    }

    const categories = await MenuItem.getCategoriesByVenue(venueCode);

    res.json({
      success: true,
      data: {
        venueCode: venueCode.toUpperCase(),
        categories
      }
    });
  } catch (error) {
    console.error('Ошибка получения категорий:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// POST /api/menu/:venueCode/item - Создать товар в меню (для заведения)
router.post('/:venueCode/item', async (req, res) => {
  try {
    const { venueCode } = req.params;
    const { error, value } = menuValidation.createMenuItem.validate(req.body);

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

    // Создаем товар
    const menuItem = new MenuItem({
      ...value,
      venue: venue._id,
      venueCode: venue.venueCode
    });

    await menuItem.save();

    res.status(201).json({
      success: true,
      message: 'Товар успешно добавлен в меню',
      data: {
        itemId: menuItem._id,
        name: menuItem.name,
        pointsCost: menuItem.pointsCost,
        category: menuItem.category
      }
    });
  } catch (error) {
    console.error('Ошибка создания товара:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// PUT /api/menu/item/:itemId - Обновить товар в меню
router.put('/item/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { error, value } = menuValidation.createMenuItem.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Неверные данные',
        details: error.details[0].message
      });
    }

    const menuItem = await MenuItem.findById(itemId);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Товар не найден'
      });
    }

    // Обновляем товар
    Object.assign(menuItem, value);
    await menuItem.save();

    res.json({
      success: true,
      message: 'Товар успешно обновлен',
      data: menuItem.toPublicJSON()
    });
  } catch (error) {
    console.error('Ошибка обновления товара:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// DELETE /api/menu/item/:itemId - Удалить товар из меню
router.delete('/item/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;

    const menuItem = await MenuItem.findById(itemId);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Товар не найден'
      });
    }

    // Деактивируем товар вместо удаления
    menuItem.isActive = false;
    await menuItem.save();

    res.json({
      success: true,
      message: 'Товар успешно удален из меню'
    });
  } catch (error) {
    console.error('Ошибка удаления товара:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// POST /api/menu/item/:itemId/purchase - Купить товар за баллы
router.post('/item/:itemId/purchase', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { telegramId } = req.user; // Получаем из middleware аутентификации
    const { error, value } = menuValidation.purchaseItem.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Неверные данные',
        details: error.details[0].message
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

    // Создаем покупку
    const purchase = await Purchase.createPurchase(
      user._id,
      itemId,
      value.quantity,
      value.selectedOptions,
      value.comment
    );

    res.status(201).json({
      success: true,
      message: 'Покупка успешно оформлена',
      data: {
        purchaseId: purchase._id,
        itemName: purchase.itemSnapshot.name,
        quantity: purchase.quantity,
        totalCost: purchase.totalCost,
        status: purchase.status,
        purchaseDate: purchase.purchaseDate
      }
    });
  } catch (error) {
    console.error('Ошибка покупки товара:', error);
    
    if (error.message.includes('не найден') || error.message.includes('недоступен')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message.includes('Недостаточно баллов')) {
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

// GET /api/menu/purchases - История покупок пользователя
router.get('/purchases', async (req, res) => {
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

    // Получаем историю покупок
    const result = await Purchase.getUserPurchases(user._id, {
      venueCode,
      status,
      startDate,
      endDate,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    // Форматируем данные
    const formattedPurchases = result.purchases.map(purchase => ({
      id: purchase._id,
      item: purchase.itemSnapshot,
      quantity: purchase.quantity,
      unitPrice: purchase.unitPrice,
      totalCost: purchase.totalCost,
      status: purchase.status,
      selectedOptions: purchase.selectedOptions,
      comment: purchase.comment,
      venue: {
        name: purchase.venue.name,
        code: purchase.venue.venueCode
      },
      purchaseDate: purchase.purchaseDate,
      confirmedDate: purchase.confirmedDate,
      completedDate: purchase.completedDate
    }));

    res.json({
      success: true,
      data: {
        purchases: formattedPurchases,
        pagination: result.pagination
      }
    });
  } catch (error) {
    console.error('Ошибка получения истории покупок:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

module.exports = router;

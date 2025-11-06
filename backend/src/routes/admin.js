const express = require('express');
const router = express.Router();
const Venue = require('../models/Venue');
const VenueBalance = require('../models/VenueBalance');
const PointsTransaction = require('../models/PointsTransaction');
const User = require('../models/User');
const axios = require('axios');

// GET /api/admin/dashboard - Админ панель с общей статистикой
router.get('/dashboard', async (req, res) => {
  try {
    // Получаем общую статистику
    const [
      totalUsers,
      totalVenues,
      totalTransactions,
      activeUsers,
      activeVenues
    ] = await Promise.all([
      User.countDocuments(),
      Venue.countDocuments(),
      PointsTransaction.countDocuments(),
      User.countDocuments({ isActive: true }),
      Venue.countDocuments({ isActive: true })
    ]);

    // Получаем статистику за последние 30 дней
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      newUsersLast30Days,
      newVenuesLast30Days,
      transactionsLast30Days
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Venue.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      PointsTransaction.countDocuments({ transactionDate: { $gte: thirtyDaysAgo } })
    ]);

    // Получаем статистику по типам транзакций
    const [
      earnedTransactions,
      spentTransactions,
      expiredTransactions
    ] = await Promise.all([
      PointsTransaction.countDocuments({ type: 'earned' }),
      PointsTransaction.countDocuments({ type: 'spent' }),
      PointsTransaction.countDocuments({ type: 'expired' })
    ]);

    // Получаем общую сумму баллов
    const [
      totalPointsEarned,
      totalPointsSpent,
      totalPointsExpired
    ] = await Promise.all([
      PointsTransaction.aggregate([
        { $match: { type: 'earned' } },
        { $group: { _id: null, total: { $sum: '$points' } } }
      ]),
      PointsTransaction.aggregate([
        { $match: { type: 'spent' } },
        { $group: { _id: null, total: { $sum: { $abs: '$points' } } } }
      ]),
      PointsTransaction.aggregate([
        { $match: { type: 'expired' } },
        { $group: { _id: null, total: { $sum: { $abs: '$points' } } } }
      ])
    ]);

    // Получаем топ заведений
    const topVenues = await VenueBalance.find()
      .populate('venue', 'name venueCode')
      .sort({ totalPointsIssued: -1 })
      .limit(5);

    const formattedTopVenues = topVenues.map(balance => ({
      name: balance.venue.name,
      code: balance.venue.venueCode,
      pointsIssued: balance.totalPointsIssued,
      customers: balance.uniqueCustomers
    }));

    res.json({
      success: true,
      data: {
        overview: {
          users: {
            total: totalUsers,
            active: activeUsers,
            newLast30Days: newUsersLast30Days
          },
          venues: {
            total: totalVenues,
            active: activeVenues,
            newLast30Days: newVenuesLast30Days
          },
          transactions: {
            total: totalTransactions,
            last30Days: transactionsLast30Days,
            earned: earnedTransactions,
            spent: spentTransactions,
            expired: expiredTransactions
          }
        },
        points: {
          totalEarned: totalPointsEarned[0]?.total || 0,
          totalSpent: totalPointsSpent[0]?.total || 0,
          totalExpired: totalPointsExpired[0]?.total || 0,
          netBalance: (totalPointsEarned[0]?.total || 0) - (totalPointsSpent[0]?.total || 0) - (totalPointsExpired[0]?.total || 0)
        },
        topVenues: formattedTopVenues,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Ошибка получения статистики админ панели:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// GET /api/admin/venues/balance - Общий баланс всех заведений
router.get('/venues/balance', async (req, res) => {
  try {
    const { page = 1, limit = 20, sortBy = 'currentBalance', sortOrder = 'desc' } = req.query;

    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [balances, total] = await Promise.all([
      VenueBalance.find()
        .populate('venue', 'name venueCode isActive')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      VenueBalance.countDocuments()
    ]);

    const formattedBalances = balances.map(balance => ({
      venue: {
        id: balance.venue._id,
        name: balance.venue.name,
        code: balance.venue.venueCode,
        isActive: balance.venue.isActive
      },
      balance: balance.getBalanceSummary()
    }));

    res.json({
      success: true,
      data: {
        venues: formattedBalances,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Ошибка получения баланса заведений:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// GET /api/admin/venues/top-earners - Топ заведений по выданным баллам
router.get('/venues/top-earners', async (req, res) => {
  try {
    const { limit = 10, period = 'all' } = req.query;

    let dateFilter = {};
    if (period !== 'all') {
      const now = new Date();
      if (period === 'week') {
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
      } else if (period === 'month') {
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
      }
    }

    const topVenues = await VenueBalance.find(dateFilter)
      .populate('venue', 'name venueCode')
      .sort({ totalPointsIssued: -1 })
      .limit(parseInt(limit));

    const formattedTopVenues = topVenues.map(balance => ({
      venue: {
        name: balance.venue.name,
        code: balance.venue.venueCode
      },
      totalPointsIssued: balance.totalPointsIssued,
      uniqueCustomers: balance.uniqueCustomers,
      totalTransactions: balance.totalTransactions
    }));

    res.json({
      success: true,
      data: {
        period,
        topVenues: formattedTopVenues
      }
    });
  } catch (error) {
    console.error('Ошибка получения топа заведений:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// GET /api/admin/venues/top-spenders - Топ заведений по потраченным баллам
router.get('/venues/top-spenders', async (req, res) => {
  try {
    const { limit = 10, period = 'all' } = req.query;

    let dateFilter = {};
    if (period !== 'all') {
      const now = new Date();
      if (period === 'week') {
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
      } else if (period === 'month') {
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
      }
    }

    const topSpenders = await VenueBalance.find(dateFilter)
      .populate('venue', 'name venueCode')
      .sort({ totalPointsSpent: -1 })
      .limit(parseInt(limit));

    const formattedTopSpenders = topSpenders.map(balance => ({
      venue: {
        name: balance.venue.name,
        code: balance.venue.venueCode
      },
      totalPointsSpent: balance.totalPointsSpent,
      uniqueCustomers: balance.uniqueCustomers,
      totalTransactions: balance.totalTransactions
    }));

    res.json({
      success: true,
      data: {
        period,
        topSpenders: formattedTopSpenders
      }
    });
  } catch (error) {
    console.error('Ошибка получения топа трат:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// GET /api/admin/transactions/summary - Общая статистика транзакций
router.get('/transactions/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.transactionDate = {};
      if (startDate) dateFilter.transactionDate.$gte = new Date(startDate);
      if (endDate) dateFilter.transactionDate.$lte = new Date(endDate);
    }

    const [
      totalTransactions,
      earnedTransactions,
      spentTransactions,
      expiredTransactions,
      bonusTransactions
    ] = await Promise.all([
      PointsTransaction.countDocuments(dateFilter),
      PointsTransaction.countDocuments({ ...dateFilter, type: 'earned' }),
      PointsTransaction.countDocuments({ ...dateFilter, type: 'spent' }),
      PointsTransaction.countDocuments({ ...dateFilter, type: 'expired' }),
      PointsTransaction.countDocuments({ ...dateFilter, type: 'bonus' })
    ]);

    const [
      totalPointsEarned,
      totalPointsSpent,
      totalPointsExpired,
      totalPointsBonus
    ] = await Promise.all([
      PointsTransaction.aggregate([
        { $match: { ...dateFilter, type: 'earned' } },
        { $group: { _id: null, total: { $sum: '$points' } } }
      ]),
      PointsTransaction.aggregate([
        { $match: { ...dateFilter, type: 'spent' } },
        { $group: { _id: null, total: { $sum: { $abs: '$points' } } } }
      ]),
      PointsTransaction.aggregate([
        { $match: { ...dateFilter, type: 'expired' } },
        { $group: { _id: null, total: { $sum: { $abs: '$points' } } } }
      ]),
      PointsTransaction.aggregate([
        { $match: { ...dateFilter, type: 'bonus' } },
        { $group: { _id: null, total: { $sum: '$points' } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        period: {
          startDate: startDate || null,
          endDate: endDate || null
        },
        summary: {
          totalTransactions,
          totalPointsEarned: totalPointsEarned[0]?.total || 0,
          totalPointsSpent: totalPointsSpent[0]?.total || 0,
          totalPointsExpired: totalPointsExpired[0]?.total || 0,
          totalPointsBonus: totalPointsBonus[0]?.total || 0,
          netPoints: (totalPointsEarned[0]?.total || 0) + (totalPointsBonus[0]?.total || 0) - (totalPointsSpent[0]?.total || 0) - (totalPointsExpired[0]?.total || 0)
        },
        breakdown: {
          earned: {
            count: earnedTransactions,
            points: totalPointsEarned[0]?.total || 0
          },
          spent: {
            count: spentTransactions,
            points: totalPointsSpent[0]?.total || 0
          },
          expired: {
            count: expiredTransactions,
            points: totalPointsExpired[0]?.total || 0
          },
          bonus: {
            count: bonusTransactions,
            points: totalPointsBonus[0]?.total || 0
          }
        }
      }
    });
  } catch (error) {
    console.error('Ошибка получения статистики транзакций:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// Юкасса API маршруты
const YOOKASSA_API_KEY = 'test__UW59qNHWI_40gv3XfJTubp_5zQtFKft2UOLRSy8oxI';
const YOOKASSA_SHOP_ID = '1184633';
const YOOKASSA_BASE_URL = 'https://api.yookassa.ru/v3';

// POST /api/admin/payments/create - Создание платежа через Юкассу
router.post('/payments/create', async (req, res) => {
  try {
    const { amount, currency, description, returnUrl, metadata } = req.body;
    
    const idempotenceKey = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    const requestBody = {
      amount: {
        value: amount.toFixed(2),
        currency: currency || 'RUB'
      },
      capture: true,
      confirmation: {
        type: 'redirect',
        return_url: returnUrl
      },
      description: description,
      metadata: metadata || {}
    };

    const response = await axios.post(`${YOOKASSA_BASE_URL}/payments`, requestBody, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_API_KEY}`).toString('base64')}`,
        'Idempotence-Key': idempotenceKey,
        'Content-Type': 'application/json'
      }
    });

    res.json({
      success: true,
      data: {
        id: response.data.id,
        status: response.data.status,
        confirmation: {
          type: response.data.confirmation.type,
          confirmation_url: response.data.confirmation.confirmation_url
        }
      }
    });
  } catch (error) {
    console.error('Ошибка создания платежа Юкассы:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Ошибка создания платежа',
      error: error.response?.data || error.message
    });
  }
});

// GET /api/admin/payments/:id/status - Получение статуса платежа
router.get('/payments/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    
    const response = await axios.get(`${YOOKASSA_BASE_URL}/payments/${id}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_API_KEY}`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Ошибка получения статуса платежа:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения статуса платежа',
      error: error.response?.data || error.message
    });
  }
});

module.exports = router;

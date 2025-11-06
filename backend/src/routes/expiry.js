const express = require('express');
const router = express.Router();
const PointsExpiryService = require('../services/PointsExpiryService');
const User = require('../models/User');

// POST /api/expiry/process - Запустить процесс сгорания баллов (для cron job)
router.post('/process', async (req, res) => {
  try {
    const result = await PointsExpiryService.expirePoints();
    
    res.json({
      success: true,
      message: 'Процесс сгорания баллов завершен',
      data: result
    });
  } catch (error) {
    console.error('Ошибка обработки сгорания баллов:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// GET /api/expiry/stats - Получить статистику сгорания баллов
router.get('/stats', async (req, res) => {
  try {
    const { venueCode = null } = req.query;
    
    const stats = await PointsExpiryService.getExpiryStats(venueCode);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Ошибка получения статистики сгорания:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// GET /api/expiry/user/:userId - Получить информацию о сгорающих баллах пользователя
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }
    
    const expiringPoints = user.getExpiringPointsByVenue();
    const nextExpiry = user.getNextExpiry();
    const totalExpiring = user.getTotalExpiringPoints();
    
    res.json({
      success: true,
      data: {
        userId: user._id,
        totalExpiringPoints: totalExpiring,
        nextExpiry: nextExpiry ? {
          points: nextExpiry.points,
          expiryDate: nextExpiry.expiryDate,
          venueCode: nextExpiry.venueCode,
          daysLeft: Math.ceil((nextExpiry.expiryDate - new Date()) / (1000 * 60 * 60 * 24))
        } : null,
        expiringByVenue: expiringPoints
      }
    });
  } catch (error) {
    console.error('Ошибка получения информации о сгорании:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    });
  }
});

// POST /api/expiry/manual/:userId - Ручное сгорание баллов пользователя
router.post('/manual/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { venueCode = null } = req.body;
    
    const result = await PointsExpiryService.manuallyExpireUserPoints(userId, venueCode);
    
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Ошибка ручного сгорания баллов:', error);
    
    if (error.message.includes('не найден')) {
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

module.exports = router;

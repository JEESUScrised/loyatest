const User = require('../models/User');
const PointsTransaction = require('../models/PointsTransaction');
const UserVenueBalance = require('../models/UserVenueBalance');
const VenueBalance = require('../models/VenueBalance');
const Notification = require('../models/Notification');
const telegramService = require('./TelegramService');

class PointsExpiryService {
  /**
   * Основной метод для обработки истечения баллов
   */
  static async expirePoints() {
    try {
      console.log('🔄 Начинаем обработку истечения баллов...');
      
      const result = await this.processExpiredPoints();
      await this.sendExpiryNotifications();
      
      console.log('✅ Обработка истечения баллов завершена:', result);
      return result;
    } catch (error) {
      console.error('❌ Ошибка обработки истечения баллов:', error);
      throw error;
    }
  }

  /**
   * Обрабатывает истекшие баллы
   */
  static async processExpiredPoints() {
    try {
      const now = new Date();
      const stats = {
        totalUsersProcessed: 0,
        totalPointsExpired: 0,
        totalTransactionsCreated: 0,
        venuesAffected: new Set()
      };

      // Находим пользователей с истекшими баллами
      const usersWithExpiredPoints = await User.find({
        'pointsExpiry.status': 'active',
        'pointsExpiry.expiryDate': { $lte: now }
      });

      console.log(`Найдено пользователей с истекшими баллами: ${usersWithExpiredPoints.length}`);

      for (const user of usersWithExpiredPoints) {
        const userResult = await this.processUserExpiredPoints(user);
        
        stats.totalUsersProcessed += 1;
        stats.totalPointsExpired += userResult.expiredPoints;
        stats.totalTransactionsCreated += userResult.transactionsCreated;
        
        userResult.venuesAffected.forEach(venueId => {
          stats.venuesAffected.add(venueId.toString());
        });
      }

      stats.venuesAffected = Array.from(stats.venuesAffected);
      
      return stats;
    } catch (error) {
      console.error('Ошибка обработки истекших баллов:', error);
      throw error;
    }
  }

  /**
   * Обрабатывает истекшие баллы для конкретного пользователя
   */
  static async processUserExpiredPoints(user) {
    try {
      const now = new Date();
      const result = {
        expiredPoints: 0,
        transactionsCreated: 0,
        venuesAffected: new Set()
      };

      // Находим истекшие баллы
      const expiredEntries = user.pointsExpiry.filter(entry => 
        entry.status === 'active' && entry.expiryDate <= now
      );

      if (expiredEntries.length === 0) {
        return result;
      }

      // Группируем по заведениям
      const venueGroups = {};
      expiredEntries.forEach(entry => {
        const venueId = entry.venue.toString();
        if (!venueGroups[venueId]) {
          venueGroups[venueId] = {
            venueId: entry.venue,
            venueCode: entry.venueCode,
            totalPoints: 0,
            entries: []
          };
        }
        venueGroups[venueId].totalPoints += entry.points;
        venueGroups[venueId].entries.push(entry);
        result.venuesAffected.add(venueId);
      });

      // Обрабатываем каждое заведение
      for (const [venueId, group] of Object.entries(venueGroups)) {
        const venueResult = await this.expireUserVenuePoints(
          user._id,
          group.venueId,
          group.venueCode,
          group.totalPoints,
          group.entries
        );
        
        result.expiredPoints += venueResult.expiredPoints;
        result.transactionsCreated += venueResult.transactionsCreated;
      }

      // Обновляем статус истекших записей
      expiredEntries.forEach(entry => {
        entry.status = 'expired';
      });

      // Обновляем общий баланс пользователя
      user.pointsBalance = Math.max(0, user.pointsBalance - result.expiredPoints);
      user.totalPointsSpent += result.expiredPoints;

      await user.save();

      return result;
    } catch (error) {
      console.error(`Ошибка обработки истекших баллов для пользователя ${user._id}:`, error);
      throw error;
    }
  }

  /**
   * Обрабатывает истекшие баллы пользователя в конкретном заведении
   */
  static async expireUserVenuePoints(userId, venueId, venueCode, totalExpiredPoints, entries) {
    try {
      const result = {
        expiredPoints: 0,
        transactionsCreated: 0
      };

      // Обновляем баланс пользователя в заведении
      const userVenueBalance = await UserVenueBalance.findOne({ userId, venueId });
      if (userVenueBalance) {
        const actualExpired = await userVenueBalance.expirePoints(totalExpiredPoints);
        result.expiredPoints = actualExpired;
      }

      // Обновляем общий баланс заведения
      if (result.expiredPoints > 0) {
        await VenueBalance.updateFromTransaction(venueId, {
          venueCode,
          type: 'expired',
          points: result.expiredPoints,
          purchaseAmount: 0
        });
      }

      // Создаем транзакцию для каждого истекшего входа
      for (const entry of entries) {
        const transaction = await PointsTransaction.createTransaction({
          userId,
          venueId,
          venueCode,
          type: 'expired',
          points: -entry.points,
          balanceAfter: 0, // Будет обновлено после сохранения пользователя
          description: `Истечение баллов в ${venueCode}`,
          metadata: {
            venueSpecific: true,
            expiryDate: entry.expiryDate,
            originalTransactionId: entry._id
          }
        });
        
        result.transactionsCreated += 1;
      }

      return result;
    } catch (error) {
      console.error(`Ошибка обработки истекших баллов для пользователя ${userId} в заведении ${venueId}:`, error);
      throw error;
    }
  }

  /**
   * Отправляет уведомления об истечении баллов
   */
  static async sendExpiryNotifications() {
    try {
      const now = new Date();
      const warningDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 дней

      // Находим пользователей с баллами, которые истекают в ближайшие 7 дней
      const usersWithExpiringPoints = await User.find({
        'pointsExpiry.status': 'active',
        'pointsExpiry.expiryDate': { 
          $gt: now, 
          $lte: warningDate 
        }
      });

      console.log(`Найдено пользователей с истекающими баллами: ${usersWithExpiringPoints.length}`);

      for (const user of usersWithExpiringPoints) {
        await this.sendUserExpiryNotification(user);
      }

      return {
        notificationsSent: usersWithExpiringPoints.length
      };
    } catch (error) {
      console.error('Ошибка отправки уведомлений об истечении:', error);
      throw error;
    }
  }

  /**
   * Отправляет уведомление об истечении баллов конкретному пользователю
   */
  static async sendUserExpiryNotification(user) {
    try {
      const now = new Date();
      const warningDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Группируем истекающие баллы по заведениям
      const expiringByVenue = {};
      
      user.pointsExpiry
        .filter(entry => 
          entry.status === 'active' && 
          entry.expiryDate > now && 
          entry.expiryDate <= warningDate
        )
        .forEach(entry => {
          const venueCode = entry.venueCode;
          if (!expiringByVenue[venueCode]) {
            expiringByVenue[venueCode] = {
              venueCode,
              totalPoints: 0,
              nearestExpiry: entry.expiryDate
            };
          }
          expiringByVenue[venueCode].totalPoints += entry.points;
          
          if (entry.expiryDate < expiringByVenue[venueCode].nearestExpiry) {
            expiringByVenue[venueCode].nearestExpiry = entry.expiryDate;
          }
        });

      // Отправляем уведомления для каждого заведения
      for (const [venueCode, data] of Object.entries(expiringByVenue)) {
        await telegramService.sendExpiryNotification(
          user._id,
          data.totalPoints,
          venueCode,
          data.nearestExpiry
        );

        // Создаем уведомление в системе
        await Notification.createNotification({
          userId: user._id,
          title: 'Баллы скоро истекут',
          message: `У вас истекает ${data.totalPoints} баллов в ${venueCode}`,
          type: 'warning',
          category: 'expiry',
          metadata: {
            venueCode,
            pointsAmount: data.totalPoints,
            expiryDate: data.nearestExpiry
          }
        });
      }
    } catch (error) {
      console.error(`Ошибка отправки уведомления пользователю ${user._id}:`, error);
    }
  }

  /**
   * Получает статистику истечения баллов
   */
  static async getExpiryStats(startDate, endDate) {
    try {
      const matchStage = {
        type: 'expired'
      };

      if (startDate || endDate) {
        matchStage.transactionDate = {};
        if (startDate) matchStage.transactionDate.$gte = new Date(startDate);
        if (endDate) matchStage.transactionDate.$lte = new Date(endDate);
      }

      const stats = await PointsTransaction.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalExpiredPoints: { $sum: { $abs: '$points' } },
            totalTransactions: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' },
            uniqueVenues: { $addToSet: '$venueId' }
          }
        },
        {
          $project: {
            totalExpiredPoints: 1,
            totalTransactions: 1,
            uniqueUsersCount: { $size: '$uniqueUsers' },
            uniqueVenuesCount: { $size: '$uniqueVenues' }
          }
        }
      ]);

      return stats[0] || {
        totalExpiredPoints: 0,
        totalTransactions: 0,
        uniqueUsersCount: 0,
        uniqueVenuesCount: 0
      };
    } catch (error) {
      console.error('Ошибка получения статистики истечения:', error);
      throw error;
    }
  }

  /**
   * Получает информацию об истечении баллов для пользователя
   */
  static async getUserExpiryInfo(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Пользователь не найден');
      }

      const now = new Date();
      const activeExpiries = user.pointsExpiry.filter(entry => entry.status === 'active');
      
      const expiringSoon = activeExpiries.filter(entry => {
        const daysUntilExpiry = Math.ceil((entry.expiryDate - now) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
      });

      const totalExpiringPoints = activeExpiries.reduce((sum, entry) => sum + entry.points, 0);
      const soonExpiringPoints = expiringSoon.reduce((sum, entry) => sum + entry.points, 0);

      return {
        totalExpiringPoints,
        soonExpiringPoints,
        expiringEntries: expiringSoon.map(entry => ({
          venueCode: entry.venueCode,
          points: entry.points,
          expiryDate: entry.expiryDate,
          daysUntilExpiry: Math.ceil((entry.expiryDate - now) / (1000 * 60 * 60 * 24))
        })),
        nextExpiry: user.getNextExpiry()
      };
    } catch (error) {
      console.error('Ошибка получения информации об истечении:', error);
      throw error;
    }
  }

  /**
   * Принудительно истекает баллы пользователя
   */
  static async manualExpireUserPoints(userId, venueId = null) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Пользователь не найден');
      }

      const now = new Date();
      let expiredPoints = 0;
      let transactionsCreated = 0;

      // Находим активные баллы для истечения
      const entriesToExpire = user.pointsExpiry.filter(entry => {
        if (entry.status !== 'active') return false;
        if (venueId && entry.venue.toString() !== venueId.toString()) return false;
        return true;
      });

      for (const entry of entriesToExpire) {
        // Обновляем баланс пользователя в заведении
        const userVenueBalance = await UserVenueBalance.findOne({ 
          userId, 
          venueId: entry.venue 
        });
        
        if (userVenueBalance) {
          const actualExpired = await userVenueBalance.expirePoints(entry.points);
          expiredPoints += actualExpired;
        }

        // Создаем транзакцию
        await PointsTransaction.createTransaction({
          userId,
          venueId: entry.venue,
          venueCode: entry.venueCode,
          type: 'expired',
          points: -entry.points,
          balanceAfter: 0,
          description: `Принудительное истечение баллов в ${entry.venueCode}`,
          metadata: {
            venueSpecific: true,
            expiryDate: entry.expiryDate,
            originalTransactionId: entry._id,
            reason: 'manual_expiry'
          }
        });

        transactionsCreated += 1;
        entry.status = 'expired';
      }

      // Обновляем общий баланс пользователя
      user.pointsBalance = Math.max(0, user.pointsBalance - expiredPoints);
      user.totalPointsSpent += expiredPoints;

      await user.save();

      return {
        expiredPoints,
        transactionsCreated,
        entriesProcessed: entriesToExpire.length
      };
    } catch (error) {
      console.error('Ошибка принудительного истечения баллов:', error);
      throw error;
    }
  }
}

module.exports = PointsExpiryService;
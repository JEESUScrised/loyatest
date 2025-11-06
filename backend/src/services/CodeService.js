const PurchaseCode = require('../models/PurchaseCode');
const User = require('../models/User');
const Venue = require('../models/Venue');
const PointsTransaction = require('../models/PointsTransaction');
const UserVenueBalance = require('../models/UserVenueBalance');
const VenueBalance = require('../models/VenueBalance');
const Notification = require('../models/Notification');

class CodeService {
  /**
   * Генерирует код покупки для заведения
   */
  static async generatePurchaseCode(venueId, venueCode, purchaseAmount, options = {}) {
    try {
      // Находим заведение
      const venue = await Venue.findById(venueId);
      if (!venue) {
        throw new Error('Заведение не найдено');
      }

      if (!venue.isActive) {
        throw new Error('Заведение неактивно');
      }

      // Вычисляем количество баллов
      const pointsValue = Math.floor(purchaseAmount * venue.pointsMultiplier);
      
      if (pointsValue <= 0) {
        throw new Error('Сумма покупки слишком мала для начисления баллов');
      }

      // Создаем код
      const purchaseCode = await PurchaseCode.createCode(
        venueId,
        venueCode,
        pointsValue,
        purchaseAmount,
        venue.pointsMultiplier,
        options
      );

      return {
        success: true,
        code: purchaseCode.code,
        pointsValue,
        purchaseAmount,
        expiresAt: purchaseCode.expiresAt,
        venueName: venue.name
      };
    } catch (error) {
      console.error('Ошибка генерации кода:', error);
      throw error;
    }
  }

  /**
   * Использует код покупки
   */
  static async usePurchaseCode(code, userId) {
    try {
      // Находим код
      const purchaseCode = await PurchaseCode.findValidByCode(code);
      if (!purchaseCode) {
        throw new Error('Код не найден или недействителен');
      }

      // Находим пользователя
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Пользователь не найден');
      }

      // Находим заведение
      const venue = await Venue.findById(purchaseCode.venueId);
      if (!venue) {
        throw new Error('Заведение не найдено');
      }

      // Используем код
      await purchaseCode.use(userId);

      // Начисляем баллы пользователю
      user.pointsBalance += purchaseCode.pointsValue;
      user.totalPointsEarned += purchaseCode.pointsValue;

      // Добавляем информацию об истечении баллов
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 365); // Баллы действуют 1 год

      user.pointsExpiry.push({
        venue: venue._id,
        venueCode: venue.venueCode,
        points: purchaseCode.pointsValue,
        expiryDate,
        status: 'active',
        earnedAt: new Date()
      });

      await user.save();

      // Обновляем баланс пользователя в заведении
      const userVenueBalance = await UserVenueBalance.getOrCreate(
        userId,
        purchaseCode.venueId,
        venue.venueCode
      );
      await userVenueBalance.addPoints(purchaseCode.pointsValue, 'earned');

      // Обновляем общий баланс заведения
      await VenueBalance.updateFromTransaction(purchaseCode.venueId, {
        venueCode: venue.venueCode,
        type: 'earned',
        points: purchaseCode.pointsValue,
        purchaseAmount: purchaseCode.purchaseAmount
      });

      // Создаем транзакцию
      const transaction = await PointsTransaction.createTransaction({
        userId,
        venueId: purchaseCode.venueId,
        venueCode: venue.venueCode,
        type: 'earned',
        points: purchaseCode.pointsValue,
        balanceAfter: user.pointsBalance,
        description: `Начисление баллов за покупку в ${venue.name}`,
        purchaseAmount: purchaseCode.purchaseAmount,
        pointsMultiplier: purchaseCode.pointsMultiplier,
        purchaseCode: purchaseCode._id
      });

      // Создаем уведомление
      await Notification.createNotification({
        userId,
        title: 'Баллы начислены!',
        message: `Вам начислено ${purchaseCode.pointsValue} баллов за покупку в ${venue.name}`,
        type: 'success',
        category: 'points',
        metadata: {
          venueId: purchaseCode.venueId,
          pointsAmount: purchaseCode.pointsValue,
          purchaseCode: purchaseCode._id
        }
      });

      return {
        success: true,
        pointsEarned: purchaseCode.pointsValue,
        newBalance: user.pointsBalance,
        venueName: venue.name,
        transactionId: transaction._id
      };
    } catch (error) {
      console.error('Ошибка использования кода:', error);
      throw error;
    }
  }

  /**
   * Проверяет статус кода
   */
  static async checkCodeStatus(code) {
    try {
      const purchaseCode = await PurchaseCode.findByCode(code);
      
      if (!purchaseCode) {
        return {
          valid: false,
          reason: 'Код не найден'
        };
      }

      if (purchaseCode.isUsed) {
        return {
          valid: false,
          reason: 'Код уже использован',
          usedAt: purchaseCode.usedAt,
          usedBy: purchaseCode.usedBy
        };
      }

      if (purchaseCode.isExpired()) {
        return {
          valid: false,
          reason: 'Код истек',
          expiresAt: purchaseCode.expiresAt
        };
      }

      // Получаем информацию о заведении
      const venue = await Venue.findById(purchaseCode.venueId);
      
      return {
        valid: true,
        code: purchaseCode.code,
        pointsValue: purchaseCode.pointsValue,
        purchaseAmount: purchaseCode.purchaseAmount,
        expiresAt: purchaseCode.expiresAt,
        venueName: venue?.name || 'Неизвестное заведение',
        venueCode: purchaseCode.venueCode
      };
    } catch (error) {
      console.error('Ошибка проверки кода:', error);
      throw error;
    }
  }

  /**
   * Очищает истекшие коды
   */
  static async cleanupExpiredCodes() {
    try {
      const cleanedCount = await PurchaseCode.cleanupExpired();
      
      console.log(`Очищено истекших кодов: ${cleanedCount}`);
      
      return {
        success: true,
        cleanedCount
      };
    } catch (error) {
      console.error('Ошибка очистки кодов:', error);
      throw error;
    }
  }

  /**
   * Получает статистику кодов для заведения
   */
  static async getVenueCodeStats(venueId, startDate, endDate) {
    try {
      const stats = await PurchaseCode.getVenueStats(venueId, startDate, endDate);
      
      if (stats.length === 0) {
        return {
          totalCodes: 0,
          usedCodes: 0,
          expiredCodes: 0,
          totalPointsIssued: 0,
          totalRevenue: 0
        };
      }

      return stats[0];
    } catch (error) {
      console.error('Ошибка получения статистики кодов:', error);
      throw error;
    }
  }

  /**
   * Получает историю использования кодов пользователем
   */
  static async getUserCodeHistory(userId, options = {}) {
    try {
      const {
        limit = 20,
        offset = 0,
        startDate = null,
        endDate = null
      } = options;

      const matchStage = { usedBy: userId };
      
      if (startDate || endDate) {
        matchStage.usedAt = {};
        if (startDate) matchStage.usedAt.$gte = new Date(startDate);
        if (endDate) matchStage.usedAt.$lte = new Date(endDate);
      }

      const codes = await PurchaseCode.find(matchStage)
        .populate('venueId', 'name venueCode')
        .sort({ usedAt: -1 })
        .skip(offset)
        .limit(limit);

      return codes;
    } catch (error) {
      console.error('Ошибка получения истории кодов:', error);
      throw error;
    }
  }

  /**
   * Получает активные коды для заведения
   */
  static async getVenueActiveCodes(venueId, options = {}) {
    try {
      const {
        limit = 50,
        offset = 0
      } = options;

      const codes = await PurchaseCode.find({
        venueId,
        isUsed: false,
        expiresAt: { $gt: new Date() }
      })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

      return codes;
    } catch (error) {
      console.error('Ошибка получения активных кодов:', error);
      throw error;
    }
  }

  /**
   * Валидирует код перед использованием
   */
  static async validateCode(code, userId) {
    try {
      const status = await this.checkCodeStatus(code);
      
      if (!status.valid) {
        return {
          valid: false,
          error: status.reason
        };
      }

      // Проверяем, не использовал ли пользователь уже этот код
      const existingUsage = await PurchaseCode.findOne({
        code: code.toUpperCase(),
        usedBy: userId
      });

      if (existingUsage) {
        return {
          valid: false,
          error: 'Вы уже использовали этот код'
        };
      }

      return {
        valid: true,
        code: status.code,
        pointsValue: status.pointsValue,
        venueName: status.venueName
      };
    } catch (error) {
      console.error('Ошибка валидации кода:', error);
      return {
        valid: false,
        error: 'Ошибка проверки кода'
      };
    }
  }
}

module.exports = CodeService;
module.exports = CodeService;
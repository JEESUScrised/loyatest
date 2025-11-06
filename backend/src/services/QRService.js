const QRTransaction = require('../models/QRTransaction');
const Venue = require('../models/Venue');
const User = require('../models/User');
const PointsTransaction = require('../models/PointsTransaction');
const UserVenueBalance = require('../models/UserVenueBalance');
const VenueBalance = require('../models/VenueBalance');
const Notification = require('../models/Notification');

class QRService {
  /**
   * Проверяет, действуют ли удвоенные баллы для заведения в текущее время
   */
  static isDoublePointsTime(venue) {
    if (!venue.doublePointsHours || venue.doublePointsHours.length === 0) {
      return { isActive: false, multiplier: 1.0 };
    }

    const now = new Date();
    const currentDay = now.getDay(); // 0 = воскресенье, 1 = понедельник, ..., 6 = суббота
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM

    // Преобразуем день недели: 0 = воскресенье -> 6, 1 = понедельник -> 0, и т.д.
    const dayMap = { 0: 6, 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5 };
    const mappedDay = dayMap[currentDay];

    // Ищем активные часы удвоения для текущего дня
    for (const hours of venue.doublePointsHours) {
      const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const dayIndex = dayNames.indexOf(hours.day);
      
      if (dayIndex === mappedDay) {
        if (currentTime >= hours.start && currentTime <= hours.end) {
          return { 
            isActive: true, 
            multiplier: hours.multiplier || 2.0,
            start: hours.start,
            end: hours.end
          };
        }
      }
    }

    return { isActive: false, multiplier: 1.0 };
  }

  /**
   * Генерирует QR-код транзакции для заведения
   */
  static async generateQRTransaction(venueCode, purchaseAmount, options = {}) {
    try {
      // Находим заведение
      const venue = await Venue.findByCode(venueCode);
      if (!venue) {
        throw new Error('Заведение не найдено');
      }

      if (!venue.isActive) {
        throw new Error('Заведение неактивно');
      }

      // Проверяем, действуют ли удвоенные баллы
      const doublePointsInfo = this.isDoublePointsTime(venue);
      const multiplier = doublePointsInfo.isActive ? doublePointsInfo.multiplier : 1.0;

      // Вычисляем количество баллов
      // Если сумма покупки не указана (0), используем pointsPerPurchase
      // Иначе вычисляем на основе суммы
      let basePoints;
      if (purchaseAmount > 0) {
        basePoints = venue.pointsPerPurchase || Math.floor(purchaseAmount * (venue.pointsMultiplier || 0.1));
      } else {
        // Если сумма не указана, используем базовое количество баллов за покупку
        basePoints = venue.pointsPerPurchase || 5; // По умолчанию 5 баллов
      }
      const pointsValue = Math.floor(basePoints * multiplier);

      if (pointsValue <= 0) {
        throw new Error('Не удалось вычислить количество баллов');
      }

      // Создаем QR-транзакцию
      const qrTransaction = await QRTransaction.createTransaction({
        venueId: venue._id,
        venueCode: venue.venueCode,
        purchaseAmount,
        pointsValue,
        pointsMultiplier: multiplier,
        isDoublePoints: doublePointsInfo.isActive,
        metadata: {
          cashierId: options.cashierId || null,
          cashierName: options.cashierName || null,
          ipAddress: options.ipAddress || null,
          userAgent: options.userAgent || null
        }
      });

      return {
        success: true,
        data: {
          transactionId: qrTransaction.transactionId,
          qrData: qrTransaction.transactionId, // Данные для QR-кода
          pointsValue,
          purchaseAmount,
          multiplier,
          isDoublePoints: doublePointsInfo.isActive,
          expiresAt: qrTransaction.expiresAt,
          venueName: venue.name,
          venueCode: venue.venueCode
        }
      };
    } catch (error) {
      console.error('Ошибка генерации QR-транзакции:', error);
      throw error;
    }
  }

  /**
   * Обрабатывает отсканированный QR-код и начисляет баллы
   */
  static async scanQRCode(transactionId, userId) {
    try {
      // Находим QR-транзакцию
      const qrTransaction = await QRTransaction.findValidByTransactionId(transactionId);
      if (!qrTransaction) {
        throw new Error('QR-код не найден, истек или уже использован');
      }

      // Находим пользователя
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Пользователь не найден');
      }

      // Находим заведение
      const venue = await Venue.findById(qrTransaction.venueId);
      if (!venue) {
        throw new Error('Заведение не найдено');
      }

      // Используем QR-транзакцию
      await qrTransaction.use(userId);

      // Начисляем баллы пользователю
      user.pointsBalance += qrTransaction.pointsValue;
      user.totalPointsEarned += qrTransaction.pointsValue;

      // Добавляем информацию об истечении баллов
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 365); // Баллы действуют 1 год

      user.pointsExpiry.push({
        venue: venue._id,
        venueCode: venue.venueCode,
        points: qrTransaction.pointsValue,
        expiryDate,
        status: 'active',
        earnedAt: new Date()
      });

      await user.save();

      // Обновляем баланс пользователя в заведении
      const userVenueBalance = await UserVenueBalance.getOrCreate(
        userId,
        qrTransaction.venueId,
        venue.venueCode
      );
      await userVenueBalance.addPoints(qrTransaction.pointsValue, 'earned');

      // Обновляем общий баланс заведения
      await VenueBalance.updateFromTransaction(qrTransaction.venueId, {
        venueCode: venue.venueCode,
        type: 'earned',
        points: qrTransaction.pointsValue,
        purchaseAmount: qrTransaction.purchaseAmount
      });

      // Создаем транзакцию
      const transaction = await PointsTransaction.createTransaction({
        userId,
        venueId: qrTransaction.venueId,
        venueCode: venue.venueCode,
        type: 'earned',
        points: qrTransaction.pointsValue,
        balanceAfter: user.pointsBalance,
        description: `Начисление баллов за покупку в ${venue.name}${qrTransaction.isDoublePoints ? ' (удвоенные баллы!)' : ''}`,
        purchaseAmount: qrTransaction.purchaseAmount,
        pointsMultiplier: qrTransaction.pointsMultiplier,
        metadata: {
          qrTransactionId: qrTransaction._id,
          isDoublePoints: qrTransaction.isDoublePoints
        }
      });

      // Создаем уведомление
      await Notification.createNotification({
        userId,
        title: 'Баллы начислены!',
        message: `Вам начислено ${qrTransaction.pointsValue} баллов за покупку в ${venue.name}${qrTransaction.isDoublePoints ? ' (удвоенные баллы!)' : ''}`,
        type: 'success',
        category: 'points',
        metadata: {
          venueId: qrTransaction.venueId,
          pointsAmount: qrTransaction.pointsValue,
          qrTransactionId: qrTransaction._id,
          isDoublePoints: qrTransaction.isDoublePoints
        }
      });

      return {
        success: true,
        pointsEarned: qrTransaction.pointsValue,
        newBalance: user.pointsBalance,
        venueName: venue.name,
        transactionId: transaction._id,
        isDoublePoints: qrTransaction.isDoublePoints
      };
    } catch (error) {
      console.error('Ошибка обработки QR-кода:', error);
      throw error;
    }
  }

  /**
   * Проверяет статус QR-кода
   */
  static async checkQRStatus(transactionId) {
    try {
      const qrTransaction = await QRTransaction.findByTransactionId(transactionId);
      
      if (!qrTransaction) {
        return {
          valid: false,
          reason: 'QR-код не найден'
        };
      }

      if (qrTransaction.isUsed) {
        return {
          valid: false,
          reason: 'QR-код уже использован',
          usedAt: qrTransaction.usedAt
        };
      }

      if (qrTransaction.isExpired()) {
        return {
          valid: false,
          reason: 'QR-код истек',
          expiresAt: qrTransaction.expiresAt
        };
      }

      const venue = await Venue.findById(qrTransaction.venueId);
      
      return {
        valid: true,
        transactionId: qrTransaction.transactionId,
        pointsValue: qrTransaction.pointsValue,
        purchaseAmount: qrTransaction.purchaseAmount,
        isDoublePoints: qrTransaction.isDoublePoints,
        expiresAt: qrTransaction.expiresAt,
        venueName: venue?.name || 'Неизвестное заведение',
        venueCode: qrTransaction.venueCode
      };
    } catch (error) {
      console.error('Ошибка проверки QR-кода:', error);
      throw error;
    }
  }
}

module.exports = QRService;


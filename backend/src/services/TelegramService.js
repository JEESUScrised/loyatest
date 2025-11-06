const TelegramBot = require('node-telegram-bot-api');
const User = require('../models/User');
const Venue = require('../models/Venue');
const Order = require('../models/Order');
const Notification = require('../models/Notification');

class TelegramService {
  constructor() {
    this.bot = null;
    this.isInitialized = false;
  }

  /**
   * Инициализирует Telegram бота
   */
  async initialize() {
    try {
      const token = process.env.TELEGRAM_BOT_TOKEN;
      if (!token) {
        console.warn('TELEGRAM_BOT_TOKEN не установлен, Telegram бот отключен');
        return;
      }

      this.bot = new TelegramBot(token, { polling: false });
      this.isInitialized = true;
      
      console.log('✅ Telegram бот инициализирован');
    } catch (error) {
      console.error('❌ Ошибка инициализации Telegram бота:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Отправляет уведомление пользователю
   */
  async sendNotification(userId, message, options = {}) {
    try {
      if (!this.isInitialized) {
        console.warn('Telegram бот не инициализирован');
        return { success: false, error: 'Бот не инициализирован' };
      }

      const user = await User.findById(userId);
      if (!user || !user.telegramId) {
        return { success: false, error: 'Пользователь не найден или не привязан к Telegram' };
      }

      const {
        parseMode = 'HTML',
        disableWebPagePreview = true,
        disableNotification = false
      } = options;

      const result = await this.bot.sendMessage(user.telegramId, message, {
        parse_mode: parseMode,
        disable_web_page_preview: disableWebPagePreview,
        disable_notification: disableNotification
      });

      return {
        success: true,
        messageId: result.message_id,
        chatId: result.chat.id
      };
    } catch (error) {
      console.error('Ошибка отправки уведомления:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Отправляет уведомление группе/каналу
   */
  async sendToGroup(chatId, message, options = {}) {
    try {
      if (!this.isInitialized) {
        console.warn('Telegram бот не инициализирован');
        return { success: false, error: 'Бот не инициализирован' };
      }

      const {
        parseMode = 'HTML',
        disableWebPagePreview = true,
        disableNotification = false
      } = options;

      const result = await this.bot.sendMessage(chatId, message, {
        parse_mode: parseMode,
        disable_web_page_preview: disableWebPagePreview,
        disable_notification: disableNotification
      });

      return {
        success: true,
        messageId: result.message_id,
        chatId: result.chat.id
      };
    } catch (error) {
      console.error('Ошибка отправки в группу:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Отправляет уведомление о новом заказе персоналу заведения
   */
  async sendOrderNotification(venueId, orderId) {
    try {
      const venue = await Venue.findById(venueId);
      if (!venue) {
        throw new Error('Заведение не найдено');
      }

      const order = await Order.findById(orderId)
        .populate('userId', 'firstName lastName telegramId')
        .populate('items.menuItemId', 'name price');

      if (!order) {
        throw new Error('Заказ не найден');
      }

      const message = this.formatOrderMessage(order, venue);
      
      // Отправляем в группу заведения, если настроена
      if (venue.telegramGroupId) {
        const result = await this.sendToGroup(venue.telegramGroupId, message);
        
        if (result.success) {
          // Создаем уведомление в системе
          await Notification.createNotification({
            userId: order.userId,
            title: 'Заказ принят',
            message: `Ваш заказ #${order.orderNumber} принят в ${venue.name}`,
            type: 'info',
            category: 'order',
            metadata: {
              venueId,
              orderId
            }
          });
        }
        
        return result;
      }

      return { success: false, error: 'Группа заведения не настроена' };
    } catch (error) {
      console.error('Ошибка отправки уведомления о заказе:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Отправляет уведомление о статусе заказа
   */
  async sendOrderStatusUpdate(userId, orderId, newStatus) {
    try {
      const order = await Order.findById(orderId)
        .populate('venueId', 'name venueCode');

      if (!order) {
        throw new Error('Заказ не найден');
      }

      const statusMessages = {
        confirmed: 'подтвержден',
        preparing: 'готовится',
        ready: 'готов к получению',
        completed: 'завершен',
        cancelled: 'отменен'
      };

      const statusMessage = statusMessages[newStatus] || newStatus;
      const message = `🔄 <b>Статус заказа обновлен</b>\n\n` +
        `Заказ #${order.orderNumber} в ${order.venueId.name} ${statusMessage}`;

      const result = await this.sendNotification(userId, message);
      
      if (result.success) {
        // Создаем уведомление в системе
        await Notification.createNotification({
          userId,
          title: 'Статус заказа обновлен',
          message: `Заказ #${order.orderNumber} ${statusMessage}`,
          type: 'info',
          category: 'order',
          metadata: {
            venueId: order.venueId,
            orderId
          }
        });
      }
      
      return result;
    } catch (error) {
      console.error('Ошибка отправки обновления статуса:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Отправляет уведомление о начислении баллов
   */
  async sendPointsNotification(userId, points, venueName, reason = 'покупка') {
    try {
      const message = `🎉 <b>Баллы начислены!</b>\n\n` +
        `Вам начислено <b>${points}</b> баллов за ${reason} в ${venueName}`;

      const result = await this.sendNotification(userId, message);
      
      if (result.success) {
        await Notification.createNotification({
          userId,
          title: 'Баллы начислены',
          message: `Вам начислено ${points} баллов за ${reason} в ${venueName}`,
          type: 'success',
          category: 'points',
          metadata: {
            pointsAmount: points
          }
        });
      }
      
      return result;
    } catch (error) {
      console.error('Ошибка отправки уведомления о баллах:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Отправляет уведомление об истечении баллов
   */
  async sendExpiryNotification(userId, expiringPoints, venueName, expiryDate) {
    try {
      const message = `⚠️ <b>Баллы скоро истекут!</b>\n\n` +
        `У вас истекает <b>${expiringPoints}</b> баллов в ${venueName}\n` +
        `Дата истечения: ${expiryDate.toLocaleDateString('ru-RU')}`;

      const result = await this.sendNotification(userId, message);
      
      if (result.success) {
        await Notification.createNotification({
          userId,
          title: 'Баллы скоро истекут',
          message: `У вас истекает ${expiringPoints} баллов в ${venueName}`,
          type: 'warning',
          category: 'expiry',
          metadata: {
            pointsAmount: expiringPoints,
            expiryDate
          }
        });
      }
      
      return result;
    } catch (error) {
      console.error('Ошибка отправки уведомления об истечении:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Отправляет уведомление о реферале
   */
  async sendReferralNotification(userId, referralCode, bonus) {
    try {
      const message = `👥 <b>Реферальная программа</b>\n\n` +
        `Ваш реферальный код: <code>${referralCode}</code>\n` +
        `За каждого приглашенного друга вы получите <b>${bonus}</b> баллов!`;

      const result = await this.sendNotification(userId, message);
      
      if (result.success) {
        await Notification.createNotification({
          userId,
          title: 'Реферальная программа',
          message: `Ваш реферальный код: ${referralCode}`,
          type: 'info',
          category: 'referral',
          metadata: {
            referralCode,
            bonus
          }
        });
      }
      
      return result;
    } catch (error) {
      console.error('Ошибка отправки уведомления о реферале:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Форматирует сообщение о заказе
   */
  formatOrderMessage(order, venue) {
    const items = order.items.map(item => 
      `• ${item.name} x${item.quantity} - ${item.price * item.quantity}₽`
    ).join('\n');

    const message = `🆕 <b>Новый заказ!</b>\n\n` +
      `Заказ #${order.orderNumber}\n` +
      `Клиент: ${order.userId.firstName} ${order.userId.lastName || ''}\n` +
      `Телефон: ${order.customerInfo.phone || 'Не указан'}\n\n` +
      `<b>Заказ:</b>\n${items}\n\n` +
      `<b>Итого:</b> ${order.totalAmount}₽\n` +
      `<b>Баллов к начислению:</b> ${order.pointsEarned}\n` +
      `<b>Время заказа:</b> ${order.orderDate.toLocaleString('ru-RU')}`;

    return message;
  }

  /**
   * Отправляет массовое уведомление
   */
  async sendBulkNotification(userIds, message, options = {}) {
    try {
      const results = [];
      
      for (const userId of userIds) {
        const result = await this.sendNotification(userId, message, options);
        results.push({ userId, ...result });
        
        // Небольшая задержка между отправками
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      return {
        success: true,
        results,
        totalSent: results.filter(r => r.success).length,
        totalFailed: results.filter(r => !r.success).length
      };
    } catch (error) {
      console.error('Ошибка массовой отправки:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Устанавливает webhook
   */
  async setWebhook(webhookUrl) {
    try {
      if (!this.isInitialized) {
        throw new Error('Бот не инициализирован');
      }

      await this.bot.setWebHook(webhookUrl);
      console.log(`Webhook установлен: ${webhookUrl}`);
      
      return { success: true };
    } catch (error) {
      console.error('Ошибка установки webhook:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Удаляет webhook
   */
  async deleteWebhook() {
    try {
      if (!this.isInitialized) {
        throw new Error('Бот не инициализирован');
      }

      await this.bot.deleteWebHook();
      console.log('Webhook удален');
      
      return { success: true };
    } catch (error) {
      console.error('Ошибка удаления webhook:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Получает информацию о боте
   */
  async getBotInfo() {
    try {
      if (!this.isInitialized) {
        throw new Error('Бот не инициализирован');
      }

      const info = await this.bot.getMe();
      return { success: true, info };
    } catch (error) {
      console.error('Ошибка получения информации о боте:', error);
      return { success: false, error: error.message };
    }
  }
}

// Создаем единственный экземпляр сервиса
const telegramService = new TelegramService();

module.exports = telegramService;
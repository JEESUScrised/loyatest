require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const YooKassaService = require('./services/yookassaService');

// Инициализация бота
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const app = express();
const yooKassaService = new YooKassaService();

// Middleware для парсинга JSON
app.use(express.json());

// Константы для тарифов
const TARIFFS = {
  CONNECTION: {
    id: 'connection',
    name: 'Подключение',
    price: 10000,
    description: 'Подключение к системе Loya'
  },
  START: {
    id: 'start',
    name: 'Тариф Start',
    price: 3000,
    description: 'Базовый функционал системы'
  },
  PREMIUM: {
    id: 'premium',
    name: 'Тариф Premium',
    price: 5000,
    description: 'Расширенный функционал с дополнительными возможностями'
  }
};

// Хранилище активных платежей (в продакшене использовать Redis или БД)
const activePayments = new Map();

// Главное меню
const mainMenu = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: '💳 Подключение - 10,000₽', callback_data: 'tariff_connection' },
        { text: '🚀 Тариф Start - 3,000₽', callback_data: 'tariff_start' }
      ],
      [
        { text: '⭐ Тариф Premium - 5,000₽', callback_data: 'tariff_premium' }
      ],
      [
        { text: '📋 Мои покупки', callback_data: 'my_purchases' },
        { text: 'ℹ️ Помощь', callback_data: 'help' }
      ]
    ]
  }
};

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name;
  
  const welcomeMessage = `👋 Привет, ${firstName}!\n\n` +
    `Добро пожаловать в Loya! 🎉\n\n` +
    `Выберите тариф для подключения к нашей системе:\n\n` +
    `💳 **Подключение** - 10,000₽\n` +
    `🚀 **Тариф Start** - 3,000₽\n` +
    `⭐ **Тариф Premium** - 5,000₽\n\n` +
    `Нажмите на кнопку ниже для выбора тарифа:`;
  
  bot.sendMessage(chatId, welcomeMessage, {
    parse_mode: 'Markdown',
    reply_markup: mainMenu.reply_markup
  });
});

// Обработчик callback запросов
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  const messageId = callbackQuery.message.message_id;
  
  try {
    await bot.answerCallbackQuery(callbackQuery.id);
    
    if (data.startsWith('tariff_')) {
      const tariffType = data.replace('tariff_', '');
      const tariff = TARIFFS[tariffType.toUpperCase()];
      
      if (tariff) {
        await handleTariffSelection(chatId, messageId, tariff);
      }
    } else if (data === 'my_purchases') {
      await handleMyPurchases(chatId, messageId);
    } else if (data === 'help') {
      await handleHelp(chatId, messageId);
    } else if (data.startsWith('pay_')) {
      const paymentId = data.replace('pay_', '');
      await handlePaymentConfirmation(chatId, messageId, paymentId);
    } else if (data === 'back_to_menu') {
      await bot.editMessageText(
        'Выберите тариф для подключения к системе Loya:',
        {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: 'Markdown',
          reply_markup: mainMenu.reply_markup
        }
      );
    }
  } catch (error) {
    console.error('Ошибка обработки callback:', error);
    bot.sendMessage(chatId, 'Произошла ошибка. Попробуйте еще раз.');
  }
});

// Обработка выбора тарифа
async function handleTariffSelection(chatId, messageId, tariff) {
  const paymentId = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const paymentData = {
    amount: tariff.price,
    description: `Оплата ${tariff.name} - ${tariff.description}`,
    returnUrl: `${process.env.PAYMENT_SUCCESS_URL}?payment_id=${paymentId}`,
    metadata: {
      telegram_user_id: chatId,
      tariff_type: tariff.id,
      tariff_name: tariff.name
    }
  };
  
  // Создаем платеж в ЮKassa
  const paymentResult = await yooKassaService.createPayment(paymentData);
  
  if (paymentResult.success) {
    // Сохраняем информацию о платеже
    activePayments.set(paymentId, {
      chatId,
      tariff,
      yooKassaId: paymentResult.data.id,
      status: 'pending',
      createdAt: new Date()
    });
    
    const paymentMessage = `💳 **${tariff.name}**\n\n` +
      `💰 Сумма: ${tariff.price.toLocaleString()}₽\n` +
      `📝 Описание: ${tariff.description}\n\n` +
      `Нажмите кнопку ниже для перехода к оплате:`;
    
    const paymentKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            { 
              text: '💳 Оплатить', 
              url: paymentResult.data.confirmation.confirmation_url 
            }
          ],
          [
            { text: '🔄 Проверить статус', callback_data: `check_${paymentId}` },
            { text: '❌ Отменить', callback_data: `cancel_${paymentId}` }
          ],
          [
            { text: '⬅️ Назад к меню', callback_data: 'back_to_menu' }
          ]
        ]
      }
    };
    
    await bot.editMessageText(paymentMessage, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'Markdown',
      reply_markup: paymentKeyboard.reply_markup
    });
  } else {
    await bot.editMessageText(
      '❌ Ошибка создания платежа. Попробуйте еще раз.',
      {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: {
          inline_keyboard: [
            [{ text: '⬅️ Назад к меню', callback_data: 'back_to_menu' }]
          ]
        }
      }
    );
  }
}

// Обработка проверки статуса платежа
async function handlePaymentStatusCheck(chatId, messageId, paymentId) {
  const payment = activePayments.get(paymentId);
  
  if (!payment) {
    await bot.editMessageText(
      '❌ Платеж не найден.',
      {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: {
          inline_keyboard: [
            [{ text: '⬅️ Назад к меню', callback_data: 'back_to_menu' }]
          ]
        }
      }
    );
    return;
  }
  
  // Проверяем статус в ЮKassa
  const statusResult = await yooKassaService.getPaymentStatus(payment.yooKassaId);
  
  if (statusResult.success) {
    const status = statusResult.data.status;
    
    if (status === 'succeeded') {
      // Платеж успешен
      payment.status = 'completed';
      activePayments.set(paymentId, payment);
      
      await bot.editMessageText(
        `✅ **Платеж успешно завершен!**\n\n` +
        `💳 Тариф: ${payment.tariff.name}\n` +
        `💰 Сумма: ${payment.tariff.price.toLocaleString()}₽\n` +
        `📅 Дата: ${new Date().toLocaleString('ru-RU')}\n\n` +
        `Спасибо за покупку! 🎉`,
        {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '⬅️ Назад к меню', callback_data: 'back_to_menu' }]
            ]
          }
        }
      );
    } else if (status === 'canceled') {
      // Платеж отменен
      payment.status = 'canceled';
      activePayments.set(paymentId, payment);
      
      await bot.editMessageText(
        '❌ Платеж был отменен.',
        {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: {
            inline_keyboard: [
              [{ text: '⬅️ Назад к меню', callback_data: 'back_to_menu' }]
            ]
          }
        }
      );
    } else {
      // Платеж в процессе
      await bot.editMessageText(
        `⏳ Платеж в обработке...\n\n` +
        `Статус: ${status}\n` +
        `Попробуйте проверить еще раз через несколько минут.`,
        {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: {
            inline_keyboard: [
              [
                { text: '🔄 Проверить еще раз', callback_data: `check_${paymentId}` },
                { text: '❌ Отменить', callback_data: `cancel_${paymentId}` }
              ],
              [
                { text: '⬅️ Назад к меню', callback_data: 'back_to_menu' }
              ]
            ]
          }
        }
      );
    }
  } else {
    await bot.editMessageText(
      '❌ Ошибка проверки статуса платежа.',
      {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: {
          inline_keyboard: [
            [{ text: '⬅️ Назад к меню', callback_data: 'back_to_menu' }]
          ]
        }
      }
    );
  }
}

// Обработка моих покупок
async function handleMyPurchases(chatId, messageId) {
  const userPayments = Array.from(activePayments.values())
    .filter(payment => payment.chatId === chatId && payment.status === 'completed');
  
  if (userPayments.length === 0) {
    await bot.editMessageText(
      '📋 У вас пока нет завершенных покупок.',
      {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: {
          inline_keyboard: [
            [{ text: '⬅️ Назад к меню', callback_data: 'back_to_menu' }]
          ]
        }
      }
    );
    return;
  }
  
  let message = '📋 **Ваши покупки:**\n\n';
  
  userPayments.forEach((payment, index) => {
    message += `${index + 1}. **${payment.tariff.name}**\n`;
    message += `   💰 ${payment.tariff.price.toLocaleString()}₽\n`;
    message += `   📅 ${payment.createdAt.toLocaleString('ru-RU')}\n\n`;
  });
  
  await bot.editMessageText(message, {
    chat_id: chatId,
    message_id: messageId,
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '⬅️ Назад к меню', callback_data: 'back_to_menu' }]
      ]
    }
  });
}

// Обработка помощи
async function handleHelp(chatId, messageId) {
  const helpMessage = `ℹ️ **Помощь**\n\n` +
    `**Доступные тарифы:**\n\n` +
    `💳 **Подключение** - 10,000₽\n` +
    `   Подключение к системе Loya\n\n` +
    `🚀 **Тариф Start** - 3,000₽\n` +
    `   Базовый функционал системы\n\n` +
    `⭐ **Тариф Premium** - 5,000₽\n` +
    `   Расширенный функционал с дополнительными возможностями\n\n` +
    `**Как оплатить:**\n` +
    `1. Выберите нужный тариф\n` +
    `2. Нажмите "Оплатить"\n` +
    `3. Следуйте инструкциям на странице оплаты\n` +
    `4. После оплаты нажмите "Проверить статус"\n\n` +
    `**Поддержка:**\n` +
    `Если у вас возникли вопросы, обратитесь к администратору.`;
  
  await bot.editMessageText(helpMessage, {
    chat_id: chatId,
    message_id: messageId,
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '⬅️ Назад к меню', callback_data: 'back_to_menu' }]
      ]
    }
  });
}

// Обработка callback для проверки статуса и отмены
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  const messageId = callbackQuery.message.message_id;
  
  if (data.startsWith('check_')) {
    const paymentId = data.replace('check_', '');
    await handlePaymentStatusCheck(chatId, messageId, paymentId);
  } else if (data.startsWith('cancel_')) {
    const paymentId = data.replace('cancel_', '');
    activePayments.delete(paymentId);
    
    await bot.editMessageText(
      '❌ Платеж отменен.',
      {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: {
          inline_keyboard: [
            [{ text: '⬅️ Назад к меню', callback_data: 'back_to_menu' }]
          ]
        }
      }
    );
  }
});

// Webhook для обработки уведомлений от ЮKassa
app.post('/webhook', (req, res) => {
  console.log('Получено уведомление от ЮKassa:', req.body);
  
  // Здесь можно добавить обработку уведомлений о статусе платежей
  // и автоматически обновлять статусы в боте
  
  res.status(200).send('OK');
});

// Запуск сервера
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Telegram бот запущен на порту ${PORT}`);
  console.log(`📱 Бот готов к работе!`);
});

// Обработка ошибок
bot.on('error', (error) => {
  console.error('Ошибка бота:', error);
});

bot.on('polling_error', (error) => {
  console.error('Ошибка polling:', error);
});

console.log('🤖 Loya Telegram Bot запущен!');
console.log('💳 Интеграция с ЮKassa активна');
console.log('📊 Доступные тарифы:');
console.log('   - Подключение: 10,000₽');
console.log('   - Тариф Start: 3,000₽');
console.log('   - Тариф Premium: 5,000₽');

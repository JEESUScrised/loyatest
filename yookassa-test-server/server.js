const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3001;

// Конфигурация Юкассы
const YOOKASSA_API_KEY = 'test__UW59qNHWI_40gv3XfJTubp_5zQtFKft2UOLRSy8oxI';
const YOOKASSA_SHOP_ID = '1184633';
const YOOKASSA_BASE_URL = 'https://api.yookassa.ru/v3';

// Middleware
app.use(cors());
app.use(express.json());

// Логирование запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Генерация уникального ключа для идемпотентности
function generateIdempotenceKey() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// POST /api/admin/payments/create - Создание платежа через Юкассу
app.post('/api/admin/payments/create', async (req, res) => {
  try {
    console.log('📤 Получен запрос на создание платежа:', req.body);
    
    const { amount, currency, description, returnUrl, metadata } = req.body;
    
    // Валидация данных
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Неверная сумма платежа'
      });
    }
    
    const idempotenceKey = generateIdempotenceKey();
    
    const requestBody = {
      amount: {
        value: amount.toFixed(2),
        currency: currency || 'RUB'
      },
      capture: true,
      confirmation: {
        type: 'redirect',
        return_url: returnUrl || 'https://example.com/return'
      },
      description: description || 'Платеж через Loya',
      metadata: metadata || {}
    };

    console.log('📤 Отправка запроса в Юкассу:', JSON.stringify(requestBody, null, 2));

    const response = await axios.post(`${YOOKASSA_BASE_URL}/payments`, requestBody, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_API_KEY}`).toString('base64')}`,
        'Idempotence-Key': idempotenceKey,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Платеж успешно создан в Юкассе:', response.data);

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
    console.error('❌ Ошибка создания платежа Юкассы:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Ошибка создания платежа',
      error: error.response?.data || error.message
    });
  }
});

// GET /api/admin/payments/:id/status - Получение статуса платежа
app.get('/api/admin/payments/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📤 Получение статуса платежа:', id);
    
    const response = await axios.get(`${YOOKASSA_BASE_URL}/payments/${id}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_API_KEY}`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Статус платежа получен:', response.data);

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('❌ Ошибка получения статуса платежа:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения статуса платежа',
      error: error.response?.data || error.message
    });
  }
});

// GET /health - Проверка здоровья сервера
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'yookassa-test-server',
    version: '1.0.0'
  });
});

// GET / - Информация о сервере
app.get('/', (req, res) => {
  res.json({
    message: 'YooKassa Test Server',
    version: '1.0.0',
    endpoints: {
      'POST /api/admin/payments/create': 'Создание платежа',
      'GET /api/admin/payments/:id/status': 'Получение статуса платежа',
      'GET /health': 'Проверка здоровья сервера'
    },
    yookassa: {
      shopId: YOOKASSA_SHOP_ID,
      apiKey: YOOKASSA_API_KEY.substring(0, 10) + '...',
      baseUrl: YOOKASSA_BASE_URL
    }
  });
});

// Обработка 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Эндпоинт не найден',
    path: req.originalUrl
  });
});

// Обработка ошибок
app.use((error, req, res, next) => {
  console.error('💥 Необработанная ошибка:', error);
  res.status(500).json({
    success: false,
    message: 'Внутренняя ошибка сервера',
    error: error.message
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log('🚀 YooKassa Test Server запущен!');
  console.log(`📡 Сервер доступен по адресу: http://localhost:${PORT}`);
  console.log(`🔗 API эндпоинты:`);
  console.log(`   POST http://localhost:${PORT}/api/admin/payments/create`);
  console.log(`   GET  http://localhost:${PORT}/api/admin/payments/:id/status`);
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`💰 YooKassa Shop ID: ${YOOKASSA_SHOP_ID}`);
  console.log(`🔑 API Key: ${YOOKASSA_API_KEY.substring(0, 10)}...`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

module.exports = app;

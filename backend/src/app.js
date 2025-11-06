const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');
require('dotenv').config();

// Импорт маршрутов
const userRoutes = require('./routes/user');
const venueRoutes = require('./routes/venue');
const adminRoutes = require('./routes/admin');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');
const notificationRoutes = require('./routes/notifications');
const expiryRoutes = require('./routes/expiry');

// Импорт middleware
const { authenticateUser } = require('./middleware/auth');
const { autoAuthMiddleware, createTestUser } = require('./middleware/testMode');

const app = express();
const PORT = process.env.PORT || 3000;
const API_PORT = process.env.API_PORT || 3002;

console.log('Environment variables:');
console.log('PORT from env:', process.env.PORT);
console.log('PORT used:', PORT);

// Middleware
// CORS настройки для работы с Telegram Mini Apps
app.use(cors({
  origin: [
    'https://web.telegram.org',
    'https://telegram.org',
    /^https:\/\/.*\.telegram\.org$/,
    process.env.FRONTEND_URL || 'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Подключение к MongoDB
testConnection();

// Базовый маршрут
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Loya Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Тестовые маршруты (только в тестовом режиме)
if (process.env.TEST_MODE === 'true') {
  app.post('/api/test/create-user', createTestUser);
  app.get('/api/test/status', (req, res) => {
    res.json({
      success: true,
      message: 'Тестовый режим активен',
      testMode: true,
      testUserId: process.env.TEST_USER_ID
    });
  });
}

// Автоматическая аутентификация в тестовом режиме
app.use(autoAuthMiddleware);

// Маршруты API
app.use('/api/user', userRoutes);
app.use('/api/venue', venueRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/expiry', expiryRoutes);

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Ошибка сервера:', err);
  res.status(500).json({
    success: false,
    message: 'Внутренняя ошибка сервера',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Обработка 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Маршрут не найден'
  });
});

// Запуск основного сервера
app.listen(PORT, () => {
  console.log(`🚀 Основной сервер запущен на порту ${PORT}`);
  console.log(`📱 API доступно по адресу: http://localhost:${API_PORT}`);
  
  if (process.env.TEST_MODE === 'true') {
    console.log(`🧪 ТЕСТОВЫЙ РЕЖИМ АКТИВЕН`);
    console.log(`🧪 Тестовый пользователь ID: ${process.env.TEST_USER_ID}`);
    console.log(`🧪 Тестовые маршруты доступны:`);
    console.log(`   - GET  /api/test/status`);
    console.log(`   - POST /api/test/create-user`);
  } else {
    console.log(`🔗 Telegram Mini App готов к работе!`);
  }
});

// Запуск API сервера на отдельном порту
const apiApp = express();
apiApp.use(cors());
apiApp.use(express.json());
apiApp.use(express.urlencoded({ extended: true }));

// Тестовые маршруты для API сервера (только в тестовом режиме)
if (process.env.TEST_MODE === 'true') {
  apiApp.post('/api/test/create-user', createTestUser);
  apiApp.get('/api/test/status', (req, res) => {
    res.json({
      success: true,
      message: 'Тестовый режим активен',
      testMode: true,
      testUserId: process.env.TEST_USER_ID
    });
  });
}

// Автоматическая аутентификация в тестовом режиме для API сервера
apiApp.use(autoAuthMiddleware);

// Копируем все API маршруты на API сервер
apiApp.use('/api/user', userRoutes);
apiApp.use('/api/venue', venueRoutes);
apiApp.use('/api/admin', adminRoutes);
apiApp.use('/api/menu', menuRoutes);
apiApp.use('/api/orders', orderRoutes);
apiApp.use('/api/notifications', notificationRoutes);
apiApp.use('/api/expiry', expiryRoutes);

// Защищенные маршруты для API сервера (только если не в тестовом режиме)
if (process.env.TEST_MODE !== 'true') {
  apiApp.use('/api/user/profile', authenticateUser);
  apiApp.use('/api/user/use-code', authenticateUser);
  apiApp.use('/api/user/scan-qr', authenticateUser);
  apiApp.use('/api/user/points-history', authenticateUser);
  apiApp.use('/api/menu/item/*/purchase', authenticateUser);
  apiApp.use('/api/menu/purchases', authenticateUser);
  apiApp.use('/api/orders/create', authenticateUser);
  apiApp.use('/api/orders/my', authenticateUser);
  apiApp.use('/api/orders/venue-balances', authenticateUser);
  apiApp.use('/api/user/claim-daily-bonus', authenticateUser);
  apiApp.use('/api/user/referral-stats', authenticateUser);
}

// Базовый маршрут для API
apiApp.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Loya API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Обработка ошибок для API сервера
apiApp.use((err, req, res, next) => {
  console.error('API Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Внутренняя ошибка API сервера',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Обработка 404 для API сервера
apiApp.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API маршрут не найден'
  });
});

apiApp.listen(API_PORT, () => {
  console.log(`🔌 API сервер запущен на порту ${API_PORT}`);
  console.log(`📡 API доступно по адресу: http://localhost:${API_PORT}`);
});

module.exports = app;

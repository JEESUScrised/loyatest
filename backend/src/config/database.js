const mongoose = require('mongoose');
require('dotenv').config();

// Конфигурация подключения к MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/loya';
const DB_NAME = process.env.MONGODB_DB_NAME || 'loya';

// Настройки подключения
const mongooseOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferCommands: false
};

// Тестирование подключения
const testConnection = async () => {
  try {
    await mongoose.connect(MONGODB_URI, mongooseOptions);
    console.log('✅ Подключение к MongoDB успешно');
    console.log(`📊 База данных: ${DB_NAME}`);
  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB:', error);
    process.exit(1);
  }
};

// Обработка событий подключения
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose подключен к MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Ошибка Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose отключен от MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🔌 MongoDB соединение закрыто через app termination');
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка при закрытии MongoDB соединения:', error);
    process.exit(1);
  }
});

module.exports = {
  mongoose,
  testConnection,
  DB_NAME
};

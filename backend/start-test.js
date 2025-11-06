#!/usr/bin/env node

/**
 * Скрипт для запуска приложения в тестовом режиме
 * Автоматически устанавливает переменные окружения для тестирования
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Запуск Loya в тестовом режиме...\n');

// Устанавливаем переменные окружения для тестового режима
const env = {
  ...process.env,
  TEST_MODE: 'true',
  TEST_USER_ID: '999888777',
  NODE_ENV: 'development',
  PORT: '3000',
  API_PORT: '3002',
  MONGODB_URI: 'mongodb://localhost:27017/loya',
  JWT_SECRET: 'test-jwt-secret-key-for-development'
};

console.log('📋 Настройки тестового режима:');
console.log(`   - TEST_MODE: ${env.TEST_MODE}`);
console.log(`   - TEST_USER_ID: ${env.TEST_USER_ID}`);
console.log(`   - PORT: ${env.PORT}`);
console.log(`   - API_PORT: ${env.API_PORT}`);
console.log(`   - MONGODB_URI: ${env.MONGODB_URI}\n`);

// Запускаем приложение
const child = spawn('node', ['src/app.js'], {
  env: env,
  stdio: 'inherit',
  cwd: __dirname
});

child.on('error', (error) => {
  console.error('❌ Ошибка запуска:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Приложение завершилось с кодом ${code}`);
    process.exit(code);
  }
  console.log('✅ Приложение завершено');
});

// Обработка сигналов для корректного завершения
process.on('SIGINT', () => {
  console.log('\n🛑 Получен сигнал SIGINT, завершение работы...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Получен сигнал SIGTERM, завершение работы...');
  child.kill('SIGTERM');
});

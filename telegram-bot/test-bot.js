require('dotenv').config();
const YooKassaService = require('./services/yookassaService');

// Тестирование сервиса ЮKassa
async function testYooKassaService() {
  console.log('🧪 Тестирование сервиса ЮKassa...\n');
  
  const yooKassaService = new YooKassaService();
  
  try {
    // Тест создания платежа
    console.log('📤 Создание тестового платежа...');
    
    const paymentData = {
      amount: 1000,
      description: 'Тестовый платеж для Telegram бота Loya',
      returnUrl: 'https://example.com/success',
      metadata: {
        test: 'true',
        source: 'telegram_bot',
        user_id: 'test_user_123'
      }
    };
    
    const result = await yooKassaService.createPayment(paymentData);
    
    if (result.success) {
      console.log('✅ Платеж успешно создан!');
      console.log('ID платежа:', result.data.id);
      console.log('Статус:', result.data.status);
      console.log('URL для оплаты:', result.data.confirmation.confirmation_url);
      
      // Тест получения статуса платежа
      console.log('\n📊 Проверка статуса платежа...');
      const statusResult = await yooKassaService.getPaymentStatus(result.data.id);
      
      if (statusResult.success) {
        console.log('✅ Статус получен успешно!');
        console.log('Статус:', statusResult.data.status);
        console.log('Сумма:', statusResult.data.amount);
      } else {
        console.log('❌ Ошибка получения статуса:', statusResult.error);
      }
      
    } else {
      console.log('❌ Ошибка создания платежа:', result.error);
    }
    
  } catch (error) {
    console.error('💥 Ошибка тестирования:', error.message);
  }
}

// Тестирование конфигурации
function testConfiguration() {
  console.log('🔧 Проверка конфигурации...\n');
  
  const requiredEnvVars = [
    'TELEGRAM_BOT_TOKEN',
    'YOOKASSA_API_KEY',
    'YOOKASSA_SHOP_ID',
    'YOOKASSA_BASE_URL'
  ];
  
  let allConfigured = true;
  
  requiredEnvVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName}: настроен`);
    } else {
      console.log(`❌ ${varName}: не настроен`);
      allConfigured = false;
    }
  });
  
  if (allConfigured) {
    console.log('\n🎉 Все переменные окружения настроены!');
  } else {
    console.log('\n⚠️ Некоторые переменные окружения не настроены.');
    console.log('Скопируйте .env.example в .env и заполните необходимые значения.');
  }
  
  return allConfigured;
}

// Главная функция тестирования
async function runTests() {
  console.log('🤖 Тестирование Loya Telegram Bot\n');
  console.log('=' .repeat(50));
  
  // Проверка конфигурации
  const configOk = testConfiguration();
  
  if (!configOk) {
    console.log('\n❌ Тестирование прервано из-за неправильной конфигурации.');
    return;
  }
  
  console.log('\n' + '='.repeat(50));
  
  // Тестирование ЮKassa
  await testYooKassaService();
  
  console.log('\n' + '='.repeat(50));
  console.log('🏁 Тестирование завершено!');
}

// Запуск тестов
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testYooKassaService,
  testConfiguration,
  runTests
};

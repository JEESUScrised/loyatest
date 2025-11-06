const mongoose = require('mongoose');
require('dotenv').config();

// Импорт моделей
const User = require('../src/models/User');
const Venue = require('../src/models/Venue');
const MenuItem = require('../src/models/MenuItem');
const PurchaseCode = require('../src/models/PurchaseCode');
const PointsTransaction = require('../src/models/PointsTransaction');
const Order = require('../src/models/Order');
const OrderItem = require('../src/models/OrderItem');
const Purchase = require('../src/models/Purchase');
const Referral = require('../src/models/Referral');
const Notification = require('../src/models/Notification');
const VenueBalance = require('../src/models/VenueBalance');
const UserVenueBalance = require('../src/models/UserVenueBalance');
const Discount = require('../src/models/Discount');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/loya';

async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Подключение к MongoDB успешно');
  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB:', error);
    process.exit(1);
  }
}

async function createIndexes() {
  try {
    console.log('📊 Создание индексов...');
    
    // Индексы создаются автоматически при определении схем
    // Mongoose создаст их при первом сохранении документов
    console.log('✅ Индексы будут созданы автоматически');
  } catch (error) {
    console.error('❌ Ошибка создания индексов:', error);
    throw error;
  }
}

async function seedInitialData() {
  try {
    console.log('🌱 Заполнение начальными данными...');
    
    // Проверяем, есть ли уже данные
    const existingVenues = await Venue.countDocuments();
    if (existingVenues > 0) {
      console.log('📋 Данные уже существуют, пропускаем заполнение');
      return;
    }
    
    // Создаем тестовое заведение
    const testVenue = new Venue({
      name: 'Тестовое кафе',
      venueCode: 'TEST01',
      description: 'Тестовое заведение для разработки',
      address: 'Тестовая улица, 1',
      phone: '+7 (999) 123-45-67',
      email: 'test@example.com',
      pointsMultiplier: 1.0,
      isActive: true,
      settings: {
        allowOrders: true,
        allowMenu: true,
        allowPurchaseCodes: true,
        workingHours: {
          monday: { open: '09:00', close: '21:00', isOpen: true },
          tuesday: { open: '09:00', close: '21:00', isOpen: true },
          wednesday: { open: '09:00', close: '21:00', isOpen: true },
          thursday: { open: '09:00', close: '21:00', isOpen: true },
          friday: { open: '09:00', close: '21:00', isOpen: true },
          saturday: { open: '10:00', close: '22:00', isOpen: true },
          sunday: { open: '10:00', close: '20:00', isOpen: true }
        }
      }
    });
    
    await testVenue.save();
    console.log('✅ Тестовое заведение создано');
    
    // Создаем тестовые позиции меню
    const menuItems = [
      {
        venueId: testVenue._id,
        venueCode: 'TEST01',
        name: 'Капучино',
        description: 'Классический капучино с молочной пенкой',
        price: 150,
        pointsCost: 0,
        pointsReward: 15,
        category: 'Напитки',
        isAvailable: true,
        isPopular: true
      },
      {
        venueId: testVenue._id,
        venueCode: 'TEST01',
        name: 'Латте',
        description: 'Нежный латте с молоком',
        price: 180,
        pointsCost: 0,
        pointsReward: 18,
        category: 'Напитки',
        isAvailable: true,
        isPopular: true
      },
      {
        venueId: testVenue._id,
        venueCode: 'TEST01',
        name: 'Круассан',
        description: 'Свежий круассан с маслом',
        price: 120,
        pointsCost: 0,
        pointsReward: 12,
        category: 'Выпечка',
        isAvailable: true,
        isPopular: false
      },
      {
        venueId: testVenue._id,
        venueCode: 'TEST01',
        name: 'Сэндвич с курицей',
        description: 'Сэндвич с куриной грудкой и овощами',
        price: 250,
        pointsCost: 0,
        pointsReward: 25,
        category: 'Еда',
        isAvailable: true,
        isPopular: true
      }
    ];
    
    await MenuItem.insertMany(menuItems);
    console.log('✅ Тестовые позиции меню созданы');
    
    // Создаем тестового пользователя
    const testUser = await User.createWithReferralCode({
      telegramId: 123456789,
      username: 'testuser',
      firstName: 'Тестовый',
      lastName: 'Пользователь',
      pointsBalance: 100,
      totalPointsEarned: 100,
      isActive: true
    });
    
    console.log('✅ Тестовый пользователь создан');
    
    // Создаем тестовые коды покупки
    const testCodes = [];
    for (let i = 0; i < 5; i++) {
      const code = await PurchaseCode.createCode(
        testVenue._id,
        'TEST01',
        50 + i * 10, // 50, 60, 70, 80, 90 баллов
        500 + i * 100, // 500, 600, 700, 800, 900 рублей
        1.0
      );
      testCodes.push(code);
    }
    
    console.log('✅ Тестовые коды покупки созданы');
    
    // Создаем баланс заведения
    const venueBalance = new VenueBalance({
      venueId: testVenue._id,
      venueCode: 'TEST01',
      totalPointsIssued: 0,
      totalPointsRedeemed: 0,
      totalRevenue: 0,
      totalOrders: 0,
      totalUsers: 1
    });
    
    await venueBalance.save();
    console.log('✅ Баланс заведения создан');
    
    // Создаем баланс пользователя в заведении
    const userVenueBalance = new UserVenueBalance({
      userId: testUser._id,
      venueId: testVenue._id,
      venueCode: 'TEST01',
      pointsBalance: 100,
      totalEarned: 100,
      totalSpent: 0,
      visitCount: 1,
      firstVisitDate: new Date(),
      lastVisitDate: new Date()
    });
    
    await userVenueBalance.save();
    console.log('✅ Баланс пользователя в заведении создан');
    
    console.log('🎉 Начальные данные успешно созданы!');
    console.log('\n📋 Созданные данные:');
    console.log(`- Заведение: ${testVenue.name} (${testVenue.venueCode})`);
    console.log(`- Пользователь: ${testUser.firstName} ${testUser.lastName} (ID: ${testUser.telegramId})`);
    console.log(`- Позиций меню: ${menuItems.length}`);
    console.log(`- Кодов покупки: ${testCodes.length}`);
    console.log(`- Реферальный код пользователя: ${testUser.referralCode}`);
    
  } catch (error) {
    console.error('❌ Ошибка заполнения данными:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Инициализация MongoDB для Loya...\n');
    
    await connectToDatabase();
    await createIndexes();
    await seedInitialData();
    
    console.log('\n✅ Инициализация завершена успешно!');
    console.log('\n🔗 Подключение к базе данных:');
    console.log(`MongoDB URI: ${MONGODB_URI}`);
    console.log('\n📚 Доступные коллекции:');
    console.log('- users (пользователи)');
    console.log('- venues (заведения)');
    console.log('- menu_items (позиции меню)');
    console.log('- purchase_codes (коды покупки)');
    console.log('- points_transactions (транзакции баллов)');
    console.log('- orders (заказы)');
    console.log('- order_items (позиции заказов)');
    console.log('- purchases (покупки)');
    console.log('- referrals (рефералы)');
    console.log('- notifications (уведомления)');
    console.log('- venue_balances (балансы заведений)');
    console.log('- user_venue_balances (балансы пользователей в заведениях)');
    console.log('- discounts (скидки)');
    
  } catch (error) {
    console.error('❌ Ошибка инициализации:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Соединение с MongoDB закрыто');
  }
}

// Запускаем инициализацию
if (require.main === module) {
  main();
}

module.exports = {
  connectToDatabase,
  createIndexes,
  seedInitialData
};

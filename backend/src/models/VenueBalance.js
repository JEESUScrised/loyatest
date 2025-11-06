const mongoose = require('mongoose');

const venueBalanceSchema = new mongoose.Schema({
  venueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: true,
    unique: true,
    index: true
  },
  venueCode: {
    type: String,
    required: true,
    maxlength: 10,
    uppercase: true
  },
  totalPointsIssued: {
    type: Number,
    default: 0,
    min: 0
  },
  totalPointsRedeemed: {
    type: Number,
    default: 0,
    min: 0
  },
  totalRevenue: {
    type: Number,
    default: 0,
    min: 0
  },
  totalOrders: {
    type: Number,
    default: 0,
    min: 0
  },
  totalUsers: {
    type: Number,
    default: 0,
    min: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  dailyStats: [{
    date: {
      type: Date,
      required: true
    },
    pointsIssued: {
      type: Number,
      default: 0,
      min: 0
    },
    pointsRedeemed: {
      type: Number,
      default: 0,
      min: 0
    },
    revenue: {
      type: Number,
      default: 0,
      min: 0
    },
    orders: {
      type: Number,
      default: 0,
      min: 0
    },
    newUsers: {
      type: Number,
      default: 0,
      min: 0
    }
  }],
  monthlyStats: [{
    year: {
      type: Number,
      required: true
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    pointsIssued: {
      type: Number,
      default: 0,
      min: 0
    },
    pointsRedeemed: {
      type: Number,
      default: 0,
      min: 0
    },
    revenue: {
      type: Number,
      default: 0,
      min: 0
    },
    orders: {
      type: Number,
      default: 0,
      min: 0
    },
    newUsers: {
      type: Number,
      default: 0,
      min: 0
    }
  }]
}, {
  timestamps: true,
  collection: 'venue_balances'
});

// Индексы
venueBalanceSchema.index({ venueId: 1 });
venueBalanceSchema.index({ venueCode: 1 });
venueBalanceSchema.index({ lastUpdated: -1 });
venueBalanceSchema.index({ 'dailyStats.date': -1 });
venueBalanceSchema.index({ 'monthlyStats.year': -1, 'monthlyStats.month': -1 });

// Методы экземпляра
venueBalanceSchema.methods.getNetPoints = function() {
  return this.totalPointsIssued - this.totalPointsRedeemed;
};

venueBalanceSchema.methods.getPointsUtilizationRate = function() {
  if (this.totalPointsIssued === 0) return 0;
  return (this.totalPointsRedeemed / this.totalPointsIssued) * 100;
};

venueBalanceSchema.methods.getAverageOrderValue = function() {
  if (this.totalOrders === 0) return 0;
  return this.totalRevenue / this.totalOrders;
};

venueBalanceSchema.methods.getAveragePointsPerUser = function() {
  if (this.totalUsers === 0) return 0;
  return this.totalPointsIssued / this.totalUsers;
};

venueBalanceSchema.methods.updateDailyStats = async function(date, stats) {
  const dateStr = new Date(date).toISOString().slice(0, 10);
  
  const existingDayIndex = this.dailyStats.findIndex(
    day => day.date.toISOString().slice(0, 10) === dateStr
  );
  
  if (existingDayIndex >= 0) {
    // Обновляем существующий день
    this.dailyStats[existingDayIndex] = {
      ...this.dailyStats[existingDayIndex],
      ...stats
    };
  } else {
    // Добавляем новый день
    this.dailyStats.push({
      date: new Date(date),
      ...stats
    });
  }
  
  // Сортируем по дате
  this.dailyStats.sort((a, b) => a.date - b.date);
  
  // Ограничиваем количество дней (храним последние 365 дней)
  if (this.dailyStats.length > 365) {
    this.dailyStats = this.dailyStats.slice(-365);
  }
  
  await this.save();
};

venueBalanceSchema.methods.updateMonthlyStats = async function(year, month, stats) {
  const existingMonthIndex = this.monthlyStats.findIndex(
    monthStat => monthStat.year === year && monthStat.month === month
  );
  
  if (existingMonthIndex >= 0) {
    // Обновляем существующий месяц
    this.monthlyStats[existingMonthIndex] = {
      ...this.monthlyStats[existingMonthIndex],
      ...stats
    };
  } else {
    // Добавляем новый месяц
    this.monthlyStats.push({
      year,
      month,
      ...stats
    });
  }
  
  // Сортируем по году и месяцу
  this.monthlyStats.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });
  
  // Ограничиваем количество месяцев (храним последние 24 месяца)
  if (this.monthlyStats.length > 24) {
    this.monthlyStats = this.monthlyStats.slice(-24);
  }
  
  await this.save();
};

venueBalanceSchema.methods.getDailyStats = function(startDate, endDate) {
  return this.dailyStats.filter(day => {
    const dayDate = day.date;
    return (!startDate || dayDate >= startDate) && 
           (!endDate || dayDate <= endDate);
  });
};

venueBalanceSchema.methods.getMonthlyStats = function(startYear, startMonth, endYear, endMonth) {
  return this.monthlyStats.filter(month => {
    if (startYear && startMonth) {
      if (month.year < startYear || (month.year === startYear && month.month < startMonth)) {
        return false;
      }
    }
    if (endYear && endMonth) {
      if (month.year > endYear || (month.year === endYear && month.month > endMonth)) {
        return false;
      }
    }
    return true;
  });
};

// Статические методы
venueBalanceSchema.statics.getOrCreate = async function(venueId, venueCode) {
  let balance = await this.findOne({ venueId });
  
  if (!balance) {
    balance = new this({
      venueId,
      venueCode
    });
    await balance.save();
  }
  
  return balance;
};

venueBalanceSchema.statics.updateFromTransaction = async function(venueId, transactionData) {
  const balance = await this.getOrCreate(venueId, transactionData.venueCode);
  
  const isEarning = ['earned', 'bonus', 'referral'].includes(transactionData.type);
  const isSpending = ['spent', 'expired'].includes(transactionData.type);
  
  if (isEarning) {
    balance.totalPointsIssued += transactionData.points;
  }
  
  if (isSpending) {
    balance.totalPointsRedeemed += Math.abs(transactionData.points);
  }
  
  if (transactionData.purchaseAmount) {
    balance.totalRevenue += transactionData.purchaseAmount;
  }
  
  balance.lastUpdated = new Date();
  await balance.save();
  
  return balance;
};

venueBalanceSchema.statics.updateFromOrder = async function(venueId, orderData) {
  const balance = await this.getOrCreate(venueId, orderData.venueCode);
  
  balance.totalOrders += 1;
  balance.totalRevenue += orderData.totalAmount;
  balance.totalPointsIssued += orderData.pointsEarned;
  balance.totalPointsRedeemed += orderData.pointsSpent;
  
  balance.lastUpdated = new Date();
  await balance.save();
  
  return balance;
};

venueBalanceSchema.statics.getTopVenues = async function(limit = 10, sortBy = 'totalRevenue') {
  return await this.find()
    .populate('venueId', 'name venueCode')
    .sort({ [sortBy]: -1 })
    .limit(limit);
};

venueBalanceSchema.statics.getVenueStats = async function(venueId, startDate, endDate) {
  const balance = await this.findOne({ venueId });
  
  if (!balance) {
    return null;
  }
  
  const dailyStats = balance.getDailyStats(startDate, endDate);
  const monthlyStats = balance.getMonthlyStats(
    startDate ? startDate.getFullYear() : null,
    startDate ? startDate.getMonth() + 1 : null,
    endDate ? endDate.getFullYear() : null,
    endDate ? endDate.getMonth() + 1 : null
  );
  
  return {
    venueId: balance.venueId,
    venueCode: balance.venueCode,
    totalPointsIssued: balance.totalPointsIssued,
    totalPointsRedeemed: balance.totalPointsRedeemed,
    totalRevenue: balance.totalRevenue,
    totalOrders: balance.totalOrders,
    totalUsers: balance.totalUsers,
    netPoints: balance.getNetPoints(),
    pointsUtilizationRate: balance.getPointsUtilizationRate(),
    averageOrderValue: balance.getAverageOrderValue(),
    averagePointsPerUser: balance.getAveragePointsPerUser(),
    lastUpdated: balance.lastUpdated,
    dailyStats,
    monthlyStats
  };
};

const VenueBalance = mongoose.model('VenueBalance', venueBalanceSchema);

module.exports = VenueBalance;
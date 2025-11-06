const mongoose = require('mongoose');

const userVenueBalanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  venueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: true,
    index: true
  },
  venueCode: {
    type: String,
    required: true,
    maxlength: 10,
    uppercase: true
  },
  pointsBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  totalEarned: {
    type: Number,
    default: 0,
    min: 0
  },
  totalSpent: {
    type: Number,
    default: 0,
    min: 0
  },
  totalExpired: {
    type: Number,
    default: 0,
    min: 0
  },
  lastTransactionDate: {
    type: Date,
    default: null
  },
  firstVisitDate: {
    type: Date,
    default: Date.now
  },
  lastVisitDate: {
    type: Date,
    default: Date.now
  },
  visitCount: {
    type: Number,
    default: 1,
    min: 1
  },
  totalSpentAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  averageOrderValue: {
    type: Number,
    default: 0,
    min: 0
  },
  loyaltyTier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  },
  tierPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  nextTierPoints: {
    type: Number,
    default: 100
  },
  preferences: {
    favoriteCategories: [String],
    dietaryRestrictions: [String],
    notificationSettings: {
      pointsEarned: { type: Boolean, default: true },
      pointsExpiry: { type: Boolean, default: true },
      promotions: { type: Boolean, default: true },
      newMenuItems: { type: Boolean, default: false }
    }
  },
  statistics: {
    totalOrders: {
      type: Number,
      default: 0,
      min: 0
    },
    totalPurchases: {
      type: Number,
      default: 0,
      min: 0
    },
    averagePointsPerVisit: {
      type: Number,
      default: 0,
      min: 0
    },
    lastOrderDate: {
      type: Date,
      default: null
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: 0
    }
  }
}, {
  timestamps: true,
  collection: 'user_venue_balances'
});

// Индексы
userVenueBalanceSchema.index({ userId: 1, venueId: 1 }, { unique: true });
userVenueBalanceSchema.index({ userId: 1, pointsBalance: -1 });
userVenueBalanceSchema.index({ venueId: 1, pointsBalance: -1 });
userVenueBalanceSchema.index({ venueId: 1, totalEarned: -1 });
userVenueBalanceSchema.index({ lastTransactionDate: -1 });
userVenueBalanceSchema.index({ loyaltyTier: 1 });

// Методы экземпляра
userVenueBalanceSchema.methods.addPoints = async function(points, transactionType = 'earned') {
  if (points <= 0) {
    throw new Error('Количество баллов должно быть положительным');
  }
  
  this.pointsBalance += points;
  this.totalEarned += points;
  this.lastTransactionDate = new Date();
  this.lastVisitDate = new Date();
  this.visitCount += 1;
  
  // Обновляем тир баллы
  this.tierPoints += points;
  this.updateLoyaltyTier();
  
  await this.save();
  return this;
};

userVenueBalanceSchema.methods.spendPoints = async function(points, transactionType = 'spent') {
  if (points <= 0) {
    throw new Error('Количество баллов должно быть положительным');
  }
  
  if (this.pointsBalance < points) {
    throw new Error('Недостаточно баллов');
  }
  
  this.pointsBalance -= points;
  this.totalSpent += points;
  this.lastTransactionDate = new Date();
  this.lastVisitDate = new Date();
  
  await this.save();
  return this;
};

userVenueBalanceSchema.methods.expirePoints = async function(points) {
  if (points <= 0) {
    throw new Error('Количество баллов должно быть положительным');
  }
  
  const actualExpired = Math.min(points, this.pointsBalance);
  
  this.pointsBalance -= actualExpired;
  this.totalExpired += actualExpired;
  this.lastTransactionDate = new Date();
  
  await this.save();
  return actualExpired;
};

userVenueBalanceSchema.methods.updateLoyaltyTier = function() {
  const tierThresholds = {
    bronze: 0,
    silver: 100,
    gold: 500,
    platinum: 1000
  };
  
  let newTier = 'bronze';
  let nextTierPoints = 100;
  
  if (this.tierPoints >= 1000) {
    newTier = 'platinum';
    nextTierPoints = null;
  } else if (this.tierPoints >= 500) {
    newTier = 'gold';
    nextTierPoints = 1000;
  } else if (this.tierPoints >= 100) {
    newTier = 'silver';
    nextTierPoints = 500;
  }
  
  this.loyaltyTier = newTier;
  this.nextTierPoints = nextTierPoints;
};

userVenueBalanceSchema.methods.getTierProgress = function() {
  const tierThresholds = {
    bronze: 0,
    silver: 100,
    gold: 500,
    platinum: 1000
  };
  
  const currentTierPoints = tierThresholds[this.loyaltyTier];
  const nextTierPoints = this.nextTierPoints;
  
  if (!nextTierPoints) {
    return {
      currentTier: this.loyaltyTier,
      currentPoints: this.tierPoints,
      nextTier: null,
      nextTierPoints: null,
      progress: 100,
      pointsToNext: 0
    };
  }
  
  const progress = ((this.tierPoints - currentTierPoints) / (nextTierPoints - currentTierPoints)) * 100;
  const pointsToNext = nextTierPoints - this.tierPoints;
  
  return {
    currentTier: this.loyaltyTier,
    currentPoints: this.tierPoints,
    nextTier: this.getNextTier(),
    nextTierPoints,
    progress: Math.min(100, Math.max(0, progress)),
    pointsToNext: Math.max(0, pointsToNext)
  };
};

userVenueBalanceSchema.methods.getNextTier = function() {
  const tierOrder = ['bronze', 'silver', 'gold', 'platinum'];
  const currentIndex = tierOrder.indexOf(this.loyaltyTier);
  
  if (currentIndex < tierOrder.length - 1) {
    return tierOrder[currentIndex + 1];
  }
  
  return null;
};

userVenueBalanceSchema.methods.updateStatistics = async function(orderData) {
  this.statistics.totalOrders += 1;
  this.statistics.totalPurchases += 1;
  this.statistics.lastOrderDate = new Date();
  
  if (orderData.totalAmount) {
    this.totalSpentAmount += orderData.totalAmount;
    this.averageOrderValue = this.totalSpentAmount / this.statistics.totalOrders;
  }
  
  // Обновляем средние баллы за посещение
  this.statistics.averagePointsPerVisit = this.totalEarned / this.visitCount;
  
  await this.save();
};

userVenueBalanceSchema.methods.getFormattedLastVisit = function() {
  if (!this.lastVisitDate) return 'Никогда';
  
  const now = new Date();
  const diffTime = Math.abs(now - this.lastVisitDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'Вчера';
  if (diffDays < 7) return `${diffDays} дней назад`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} недель назад`;
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} месяцев назад`;
  
  return `${Math.ceil(diffDays / 365)} лет назад`;
};

// Статические методы
userVenueBalanceSchema.statics.getOrCreate = async function(userId, venueId, venueCode) {
  let balance = await this.findOne({ userId, venueId });
  
  if (!balance) {
    balance = new this({
      userId,
      venueId,
      venueCode
    });
    await balance.save();
  }
  
  return balance;
};

userVenueBalanceSchema.statics.getUserBalances = async function(userId) {
  return await this.find({ userId })
    .populate('venueId', 'name venueCode')
    .sort({ pointsBalance: -1 });
};

userVenueBalanceSchema.statics.getVenueTopUsers = async function(venueId, limit = 10) {
  return await this.find({ venueId })
    .populate('userId', 'firstName lastName telegramId')
    .sort({ pointsBalance: -1 })
    .limit(limit);
};

userVenueBalanceSchema.statics.getVenueStats = async function(venueId) {
  const stats = await this.aggregate([
    { $match: { venueId } },
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        totalPointsIssued: { $sum: '$totalEarned' },
        totalPointsRedeemed: { $sum: '$totalSpent' },
        totalPointsExpired: { $sum: '$totalExpired' },
        totalRevenue: { $sum: '$totalSpentAmount' },
        averagePointsPerUser: { $avg: '$pointsBalance' },
        averageOrderValue: { $avg: '$averageOrderValue' },
        totalOrders: { $sum: '$statistics.totalOrders' }
      }
    }
  ]);
  
  return stats[0] || {
    totalUsers: 0,
    totalPointsIssued: 0,
    totalPointsRedeemed: 0,
    totalPointsExpired: 0,
    totalRevenue: 0,
    averagePointsPerUser: 0,
    averageOrderValue: 0,
    totalOrders: 0
  };
};

userVenueBalanceSchema.statics.getLoyaltyTierStats = async function(venueId) {
  return await this.aggregate([
    { $match: { venueId } },
    {
      $group: {
        _id: '$loyaltyTier',
        count: { $sum: 1 },
        totalPoints: { $sum: '$pointsBalance' },
        totalEarned: { $sum: '$totalEarned' },
        totalSpent: { $sum: '$totalSpent' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
};

const UserVenueBalance = mongoose.model('UserVenueBalance', userVenueBalanceSchema);

module.exports = UserVenueBalance;
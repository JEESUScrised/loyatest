const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  referrerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  referredUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  referralCode: {
    type: String,
    required: true,
    maxlength: 8,
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending',
    index: true
  },
  bonusAwarded: {
    type: Number,
    default: 0,
    min: 0
  },
  usedAt: {
    type: Date,
    default: null
  },
  bonusAwardedAt: {
    type: Date,
    default: null
  },
  minActivity: {
    type: Number,
    default: 1, // Минимальное количество покупок для активации
    min: 1
  },
  minTimeInSystem: {
    type: Number,
    default: 7, // Минимальное время в системе в днях
    min: 1
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    source: {
      type: String,
      enum: ['telegram', 'web', 'mobile', 'admin'],
      default: 'web'
    },
    campaign: String,
    utmSource: String,
    utmMedium: String,
    utmCampaign: String
  }
}, {
  timestamps: true,
  collection: 'referrals'
});

// Индексы
referralSchema.index({ referrerId: 1, status: 1 });
referralSchema.index({ referredUserId: 1 });
referralSchema.index({ referralCode: 1 });
referralSchema.index({ status: 1, createdAt: -1 });
referralSchema.index({ referrerId: 1, referredUserId: 1 }, { unique: true });

// Методы экземпляра
referralSchema.methods.isCompleted = function() {
  return this.status === 'completed';
};

referralSchema.methods.isPending = function() {
  return this.status === 'pending';
};

referralSchema.methods.isCancelled = function() {
  return this.status === 'cancelled';
};

referralSchema.methods.canBeCompleted = function() {
  return this.status === 'pending';
};

referralSchema.methods.markAsCompleted = async function(bonusAmount = 50) {
  if (!this.canBeCompleted()) {
    throw new Error('Реферал не может быть завершен в текущем статусе');
  }
  
  this.status = 'completed';
  this.bonusAwarded = bonusAmount;
  this.bonusAwardedAt = new Date();
  
  await this.save();
  return this;
};

referralSchema.methods.markAsCancelled = async function() {
  if (this.status === 'completed') {
    throw new Error('Завершенный реферал не может быть отменен');
  }
  
  this.status = 'cancelled';
  await this.save();
  return this;
};

referralSchema.methods.getDaysSinceCreation = function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Статические методы
referralSchema.statics.createReferral = async function(referrerId, referredUserId, referralCode, metadata = {}) {
  // Проверяем, что реферал не существует
  const existingReferral = await this.findOne({
    referrerId,
    referredUserId
  });
  
  if (existingReferral) {
    throw new Error('Реферал уже существует');
  }
  
  const referral = new this({
    referrerId,
    referredUserId,
    referralCode,
    metadata
  });
  
  await referral.save();
  return referral;
};

referralSchema.statics.getReferralStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { referrerId: userId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalBonus: { $sum: '$bonusAwarded' }
      }
    },
    {
      $group: {
        _id: null,
        statusBreakdown: {
          $push: {
            status: '$_id',
            count: '$count',
            totalBonus: '$totalBonus'
          }
        },
        totalReferrals: { $sum: '$count' },
        totalBonusEarned: { $sum: '$totalBonus' }
      }
    }
  ]);
  
  if (stats.length === 0) {
    return {
      totalReferrals: 0,
      totalBonusEarned: 0,
      activeReferrals: 0,
      completedReferrals: 0,
      cancelledReferrals: 0
    };
  }
  
  const result = stats[0];
  const statusBreakdown = result.statusBreakdown.reduce((acc, item) => {
    acc[item.status] = {
      count: item.count,
      totalBonus: item.totalBonus
    };
    return acc;
  }, {});
  
  return {
    totalReferrals: result.totalReferrals,
    totalBonusEarned: result.totalBonusEarned,
    activeReferrals: statusBreakdown.pending?.count || 0,
    completedReferrals: statusBreakdown.completed?.count || 0,
    cancelledReferrals: statusBreakdown.cancelled?.count || 0,
    statusBreakdown
  };
};

referralSchema.statics.getTopReferrers = async function(limit = 10, startDate = null, endDate = null) {
  const matchStage = {};
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }
  
  return await this.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: 'users',
        localField: 'referrerId',
        foreignField: '_id',
        as: 'referrer'
      }
    },
    {
      $unwind: '$referrer'
    },
    {
      $group: {
        _id: '$referrerId',
        referrerName: { $first: '$referrer.firstName' },
        referrerLastName: { $first: '$referrer.lastName' },
        referrerTelegramId: { $first: '$referrer.telegramId' },
        totalReferrals: { $sum: 1 },
        completedReferrals: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        totalBonusEarned: { $sum: '$bonusAwarded' }
      }
    },
    {
      $sort: { totalReferrals: -1 }
    },
    {
      $limit: limit
    }
  ]);
};

referralSchema.statics.getRecentReferrals = async function(limit = 20, startDate = null, endDate = null) {
  const matchStage = {};
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }
  
  return await this.find(matchStage)
    .populate('referrerId', 'firstName lastName telegramId')
    .populate('referredUserId', 'firstName lastName telegramId')
    .sort({ createdAt: -1 })
    .limit(limit);
};

referralSchema.statics.getReferralConversionRate = async function(startDate = null, endDate = null) {
  const matchStage = {};
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalReferrals: { $sum: 1 },
        completedReferrals: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        pendingReferrals: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        cancelledReferrals: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        }
      }
    }
  ]);
  
  if (stats.length === 0) {
    return {
      totalReferrals: 0,
      completedReferrals: 0,
      pendingReferrals: 0,
      cancelledReferrals: 0,
      conversionRate: 0
    };
  }
  
  const result = stats[0];
  const conversionRate = result.totalReferrals > 0 
    ? (result.completedReferrals / result.totalReferrals) * 100 
    : 0;
  
  return {
    totalReferrals: result.totalReferrals,
    completedReferrals: result.completedReferrals,
    pendingReferrals: result.pendingReferrals,
    cancelledReferrals: result.cancelledReferrals,
    conversionRate: Math.round(conversionRate * 100) / 100
  };
};

const Referral = mongoose.model('Referral', referralSchema);

module.exports = Referral;
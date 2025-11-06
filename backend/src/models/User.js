const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  telegramId: {
    type: Number,
    required: true,
    unique: true
  },
  username: {
    type: String,
    maxlength: 100,
    default: null
  },
  firstName: {
    type: String,
    required: true,
    maxlength: 100
  },
  lastName: {
    type: String,
    maxlength: 100,
    default: null
  },
  birthDate: {
    type: Date,
    default: null
  },
  city: {
    type: String,
    maxlength: 100,
    default: null
  },
  isRegistrationComplete: {
    type: Boolean,
    default: false
  },
  pointsBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  totalPointsEarned: {
    type: Number,
    default: 0,
    min: 0
  },
  totalPointsSpent: {
    type: Number,
    default: 0,
    min: 0
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true,
    maxlength: 8
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  referralCodeUsed: {
    type: String,
    maxlength: 8,
    default: null
  },
  lastDailyBonusDate: {
    type: Date,
    default: null
  },
  dailyBonusStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isCashier: {
    type: Boolean,
    default: false
  },
  notificationsEnabled: {
    type: Boolean,
    default: true
  },
  pointsExpiry: [{
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue'
    },
    venueCode: {
      type: String,
      maxlength: 10
    },
    points: {
      type: Number,
      required: true,
      min: 0
    },
    expiryDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'expired'],
      default: 'active'
    },
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  collection: 'users'
});

// Индексы
userSchema.index({ telegramId: 1 });
userSchema.index({ referralCode: 1 });
userSchema.index({ 'pointsExpiry.expiryDate': 1 });
userSchema.index({ 'pointsExpiry.status': 1 });

// Методы экземпляра
userSchema.methods.generateReferralCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

userSchema.methods.getNextExpiry = function() {
  const activeExpiries = this.pointsExpiry.filter(expiry => expiry.status === 'active');
  if (activeExpiries.length === 0) return null;
  
  const sortedExpiries = activeExpiries.sort((a, b) => a.expiryDate - b.expiryDate);
  return sortedExpiries[0];
};

userSchema.methods.getTotalExpiringPoints = function() {
  return this.pointsExpiry
    .filter(expiry => expiry.status === 'active')
    .reduce((total, expiry) => total + expiry.points, 0);
};

userSchema.methods.getExpiringPointsByVenue = function() {
  const activeExpiries = this.pointsExpiry.filter(expiry => expiry.status === 'active');
  const venueMap = {};
  
  activeExpiries.forEach(expiry => {
    const venueCode = expiry.venueCode;
    if (!venueMap[venueCode]) {
      venueMap[venueCode] = {
        venueCode,
        points: 0,
        nearestExpiry: null
      };
    }
    venueMap[venueCode].points += expiry.points;
    
    if (!venueMap[venueCode].nearestExpiry || expiry.expiryDate < venueMap[venueCode].nearestExpiry) {
      venueMap[venueCode].nearestExpiry = expiry.expiryDate;
    }
  });
  
  return Object.values(venueMap);
};

userSchema.methods.getReferralStats = async function() {
  const Referral = require('./Referral');
  const stats = await Referral.getReferralStats(this._id);
  return stats;
};

userSchema.methods.claimDailyBonus = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (this.lastDailyBonusDate) {
    const lastBonusDate = new Date(this.lastDailyBonusDate);
    lastBonusDate.setHours(0, 0, 0, 0);
    
    if (lastBonusDate.getTime() === today.getTime()) {
      throw new Error('Ежедневный бонус уже получен сегодня');
    }
  }
  
  let streak = 1;
  if (this.lastDailyBonusDate) {
    const lastBonusDate = new Date(this.lastDailyBonusDate);
    lastBonusDate.setHours(0, 0, 0, 0);
    
    if (lastBonusDate.getTime() === yesterday.getTime()) {
      streak = this.dailyBonusStreak + 1;
    }
  }
  
  const bonus = Math.min(streak * 5, 50); // Максимум 50 баллов
  
  this.pointsBalance += bonus;
  this.totalPointsEarned += bonus;
  this.lastDailyBonusDate = today;
  this.dailyBonusStreak = streak;
  
  await this.save();
  
  return {
    bonus,
    streak,
    totalClaimed: this.totalPointsEarned
  };
};

// Статические методы
userSchema.statics.createWithReferralCode = async function(userData, referralCode = null) {
  const user = new this(userData);
  
  // Генерируем уникальный реферальный код
  let code;
  do {
    code = user.generateReferralCode();
  } while (await this.findOne({ referralCode: code }));
  
  user.referralCode = code;
  
  // Если передан реферальный код, находим реферера
  if (referralCode) {
    const referrer = await this.findOne({ referralCode });
    if (referrer) {
      user.referredBy = referrer._id;
      user.referralCodeUsed = referralCode;
      
      // Начисляем бонус рефереру
      referrer.pointsBalance += 50;
      referrer.totalPointsEarned += 50;
      await referrer.save();
    }
  }
  
  await user.save();
  return user;
};

userSchema.statics.findByTelegramId = function(telegramId) {
  return this.findOne({ telegramId });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
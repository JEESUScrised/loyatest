const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
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
  name: {
    type: String,
    required: true,
    maxlength: 200,
    trim: true
  },
  description: {
    type: String,
    maxlength: 1000,
    default: null
  },
  discountType: {
    type: String,
    required: true,
    enum: ['percentage', 'fixed_amount', 'points', 'free_item'],
    default: 'percentage'
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  minPointsRequired: {
    type: Number,
    default: 0,
    min: 0
  },
  minOrderAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  maxDiscountAmount: {
    type: Number,
    default: null,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  validFrom: {
    type: Date,
    required: true,
    index: true
  },
  validUntil: {
    type: Date,
    required: true,
    index: true
  },
  usageLimit: {
    type: Number,
    default: null,
    min: 1
  },
  usageCount: {
    type: Number,
    default: 0,
    min: 0
  },
  usageLimitPerUser: {
    type: Number,
    default: 1,
    min: 1
  },
  applicableCategories: [{
    type: String,
    maxlength: 100
  }],
  applicableMenuItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem'
  }],
  excludedMenuItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem'
  }],
  applicableLoyaltyTiers: [{
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum']
  }],
  conditions: {
    minVisitCount: {
      type: Number,
      default: 0,
      min: 0
    },
    minTotalSpent: {
      type: Number,
      default: 0,
      min: 0
    },
    minDaysSinceRegistration: {
      type: Number,
      default: 0,
      min: 0
    },
    requiredReferrals: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  metadata: {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    campaignId: String,
    tags: [String],
    priority: {
      type: Number,
      default: 0
    },
    isPublic: {
      type: Boolean,
      default: true
    },
    notificationSent: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  collection: 'discounts'
});

// Индексы
discountSchema.index({ venueId: 1, isActive: 1 });
discountSchema.index({ validFrom: 1, validUntil: 1 });
discountSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });
discountSchema.index({ applicableLoyaltyTiers: 1 });
discountSchema.index({ 'metadata.campaignId': 1 });

// Методы экземпляра
discountSchema.methods.isValid = function() {
  const now = new Date();
  return this.isActive && 
         now >= this.validFrom && 
         now <= this.validUntil &&
         (this.usageLimit === null || this.usageCount < this.usageLimit);
};

discountSchema.methods.isExpired = function() {
  return new Date() > this.validUntil;
};

discountSchema.methods.isNotStarted = function() {
  return new Date() < this.validFrom;
};

discountSchema.methods.canBeUsed = function() {
  return this.isValid() && this.usageCount < (this.usageLimit || Infinity);
};

discountSchema.methods.calculateDiscount = function(orderAmount, userPoints = 0) {
  if (!this.isValid()) {
    return { discount: 0, reason: 'Скидка недействительна' };
  }
  
  if (userPoints < this.minPointsRequired) {
    return { 
      discount: 0, 
      reason: `Недостаточно баллов. Требуется: ${this.minPointsRequired}` 
    };
  }
  
  if (orderAmount < this.minOrderAmount) {
    return { 
      discount: 0, 
      reason: `Минимальная сумма заказа: ${this.minOrderAmount}` 
    };
  }
  
  let discount = 0;
  
  switch (this.discountType) {
    case 'percentage':
      discount = (orderAmount * this.discountValue) / 100;
      break;
    case 'fixed_amount':
      discount = this.discountValue;
      break;
    case 'points':
      discount = this.discountValue; // Скидка в баллах
      break;
    case 'free_item':
      discount = 0; // Логика для бесплатного товара обрабатывается отдельно
      break;
  }
  
  // Применяем максимальную скидку
  if (this.maxDiscountAmount && discount > this.maxDiscountAmount) {
    discount = this.maxDiscountAmount;
  }
  
  // Не превышаем сумму заказа
  if (discount > orderAmount) {
    discount = orderAmount;
  }
  
  return { discount, reason: null };
};

discountSchema.methods.incrementUsage = async function() {
  this.usageCount += 1;
  await this.save();
  return this;
};

discountSchema.methods.checkUserEligibility = async function(userId, venueId) {
  const UserVenueBalance = require('./UserVenueBalance');
  
  const userBalance = await UserVenueBalance.findOne({ userId, venueId });
  
  if (!userBalance) {
    return { eligible: false, reason: 'Пользователь не найден в этом заведении' };
  }
  
  // Проверяем условия
  if (userBalance.visitCount < this.conditions.minVisitCount) {
    return { 
      eligible: false, 
      reason: `Недостаточно посещений. Требуется: ${this.conditions.minVisitCount}` 
    };
  }
  
  if (userBalance.totalSpentAmount < this.conditions.minTotalSpent) {
    return { 
      eligible: false, 
      reason: `Недостаточно потрачено. Требуется: ${this.conditions.minTotalSpent}` 
    };
  }
  
  if (this.conditions.minDaysSinceRegistration > 0) {
    const daysSinceRegistration = Math.floor(
      (new Date() - userBalance.firstVisitDate) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceRegistration < this.conditions.minDaysSinceRegistration) {
      return { 
        eligible: false, 
        reason: `Недостаточно дней с регистрации. Требуется: ${this.conditions.minDaysSinceRegistration}` 
      };
    }
  }
  
  // Проверяем тир лояльности
  if (this.applicableLoyaltyTiers.length > 0) {
    if (!this.applicableLoyaltyTiers.includes(userBalance.loyaltyTier)) {
      return { 
        eligible: false, 
        reason: `Не подходящий тир лояльности. Требуется: ${this.applicableLoyaltyTiers.join(', ')}` 
      };
    }
  }
  
  return { eligible: true, reason: null };
};

discountSchema.methods.getFormattedValidPeriod = function() {
  const from = this.validFrom.toLocaleDateString('ru-RU');
  const until = this.validUntil.toLocaleDateString('ru-RU');
  return `с ${from} по ${until}`;
};

// Статические методы
discountSchema.statics.getActiveDiscounts = async function(venueId, options = {}) {
  const {
    loyaltyTier = null,
    userPoints = 0,
    orderAmount = 0,
    categories = [],
    menuItems = []
  } = options;
  
  const now = new Date();
  const matchStage = {
    venueId,
    isActive: true,
    validFrom: { $lte: now },
    validUntil: { $gte: now }
  };
  
  if (loyaltyTier) {
    matchStage.$or = [
      { applicableLoyaltyTiers: { $size: 0 } },
      { applicableLoyaltyTiers: loyaltyTier }
    ];
  }
  
  const discounts = await this.find(matchStage)
    .sort({ 'metadata.priority': -1, createdAt: -1 });
  
  // Фильтруем по дополнительным условиям
  return discounts.filter(discount => {
    if (discount.minPointsRequired > userPoints) return false;
    if (discount.minOrderAmount > orderAmount) return false;
    
    if (discount.applicableCategories.length > 0) {
      const hasMatchingCategory = categories.some(cat => 
        discount.applicableCategories.includes(cat)
      );
      if (!hasMatchingCategory) return false;
    }
    
    if (discount.applicableMenuItems.length > 0) {
      const hasMatchingMenuItem = menuItems.some(item => 
        discount.applicableMenuItems.includes(item)
      );
      if (!hasMatchingMenuItem) return false;
    }
    
    return true;
  });
};

discountSchema.statics.getVenueDiscounts = async function(venueId, options = {}) {
  const {
    isActive = null,
    startDate = null,
    endDate = null,
    limit = 50,
    offset = 0
  } = options;
  
  const matchStage = { venueId };
  
  if (isActive !== null) matchStage.isActive = isActive;
  
  if (startDate || endDate) {
    matchStage.validFrom = {};
    if (startDate) matchStage.validFrom.$gte = new Date(startDate);
    if (endDate) matchStage.validFrom.$lte = new Date(endDate);
  }
  
  return await this.find(matchStage)
    .populate('metadata.createdBy', 'firstName lastName')
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit);
};

discountSchema.statics.getDiscountStats = async function(venueId, startDate, endDate) {
  const matchStage = { venueId };
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }
  
  return await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalDiscounts: { $sum: 1 },
        activeDiscounts: {
          $sum: { $cond: ['$isActive', 1, 0] }
        },
        totalUsage: { $sum: '$usageCount' },
        totalValue: { $sum: '$discountValue' }
      }
    }
  ]);
};

const Discount = mongoose.model('Discount', discountSchema);

module.exports = Discount;
const mongoose = require('mongoose');

const purchaseCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    length: 6,
    uppercase: true,
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
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    default: null
  },
  pointsValue: {
    type: Number,
    required: true,
    min: 1
  },
  purchaseAmount: {
    type: Number,
    required: true,
    min: 0
  },
  pointsMultiplier: {
    type: Number,
    default: 1.00,
    min: 0.01,
    max: 10.00
  },
  isUsed: {
    type: Boolean,
    default: false,
    index: true
  },
  usedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  usedAt: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  metadata: {
    cashierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    cashierName: String,
    generatedAt: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String
  }
}, {
  timestamps: true,
  collection: 'purchase_codes'
});

// Индексы
purchaseCodeSchema.index({ code: 1 });
purchaseCodeSchema.index({ venueId: 1 });
purchaseCodeSchema.index({ isUsed: 1 });
purchaseCodeSchema.index({ expiresAt: 1 });
purchaseCodeSchema.index({ usedBy: 1 });
purchaseCodeSchema.index({ createdAt: -1 });

// Методы экземпляра
purchaseCodeSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

purchaseCodeSchema.methods.isValid = function() {
  return !this.isUsed && !this.isExpired();
};

purchaseCodeSchema.methods.use = async function(userId) {
  if (this.isUsed) {
    throw new Error('Код уже использован');
  }
  
  if (this.isExpired()) {
    throw new Error('Код истек');
  }
  
  this.isUsed = true;
  this.usedBy = userId;
  this.usedAt = new Date();
  
  await this.save();
  return this;
};

// Статические методы
purchaseCodeSchema.statics.generateCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

purchaseCodeSchema.statics.createCode = async function(venueId, venueCode, pointsValue, purchaseAmount, pointsMultiplier = 1.00, options = {}) {
  let code;
  let attempts = 0;
  const maxAttempts = 10;
  
  do {
    code = this.generateCode();
    attempts++;
    
    if (attempts > maxAttempts) {
      throw new Error('Не удалось сгенерировать уникальный код');
    }
  } while (await this.findOne({ code }));
  
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // Код действителен 24 часа
  
  const purchaseCode = new this({
    code,
    venueId,
    venueCode,
    pointsValue,
    purchaseAmount,
    pointsMultiplier,
    expiresAt,
    metadata: {
      ...options,
      generatedAt: new Date()
    }
  });
  
  await purchaseCode.save();
  return purchaseCode;
};

purchaseCodeSchema.statics.findByCode = function(code) {
  if (typeof code !== 'string') {
    throw new Error('Код должен быть строкой');
  }
  return this.findOne({ code: code.toUpperCase() });
};

purchaseCodeSchema.statics.findValidByCode = function(code) {
  if (typeof code !== 'string') {
    throw new Error('Код должен быть строкой');
  }
  return this.findOne({ 
    code: code.toUpperCase(),
    isUsed: false,
    expiresAt: { $gt: new Date() }
  });
};

purchaseCodeSchema.statics.cleanupExpired = async function() {
  const result = await this.updateMany(
    { 
      expiresAt: { $lt: new Date() },
      isUsed: false 
    },
    { 
      $set: { isUsed: true } 
    }
  );
  
  return result.modifiedCount;
};

purchaseCodeSchema.statics.getVenueStats = async function(venueId, startDate, endDate) {
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
        totalCodes: { $sum: 1 },
        usedCodes: { $sum: { $cond: ['$isUsed', 1, 0] } },
        expiredCodes: { 
          $sum: { 
            $cond: [
              { $and: [{ $not: '$isUsed' }, { $lt: ['$expiresAt', new Date()] }] }, 
              1, 
              0
            ] 
          } 
        },
        totalPointsIssued: { $sum: '$pointsValue' },
        totalRevenue: { $sum: '$purchaseAmount' }
      }
    }
  ]);
};

const PurchaseCode = mongoose.model('PurchaseCode', purchaseCodeSchema);

module.exports = PurchaseCode;
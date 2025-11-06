const mongoose = require('mongoose');
const crypto = require('crypto');

const qrTransactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
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
  purchaseAmount: {
    type: Number,
    required: true,
    min: 0
  },
  pointsValue: {
    type: Number,
    required: true,
    min: 1
  },
  pointsMultiplier: {
    type: Number,
    default: 1.00,
    min: 0.01,
    max: 10.00
  },
  isDoublePoints: {
    type: Boolean,
    default: false
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
  generatedAt: {
    type: Date,
    default: Date.now
  },
  metadata: {
    cashierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    cashierName: String,
    ipAddress: String,
    userAgent: String
  }
}, {
  timestamps: true,
  collection: 'qr_transactions'
});

// Индексы
qrTransactionSchema.index({ transactionId: 1 });
qrTransactionSchema.index({ venueId: 1 });
qrTransactionSchema.index({ isUsed: 1 });
qrTransactionSchema.index({ expiresAt: 1 });
qrTransactionSchema.index({ usedBy: 1 });
qrTransactionSchema.index({ createdAt: -1 });

// Методы экземпляра
qrTransactionSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

qrTransactionSchema.methods.isValid = function() {
  return !this.isUsed && !this.isExpired();
};

qrTransactionSchema.methods.use = async function(userId) {
  if (this.isUsed) {
    throw new Error('QR-код уже использован');
  }
  
  if (this.isExpired()) {
    throw new Error('QR-код истек');
  }
  
  this.isUsed = true;
  this.usedBy = userId;
  this.usedAt = new Date();
  
  await this.save();
  return this;
};

// Статические методы
qrTransactionSchema.statics.generateTransactionId = function() {
  // Генерируем уникальный ID транзакции
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(8).toString('hex');
  return `${timestamp}-${random}`.toUpperCase();
};

qrTransactionSchema.statics.createTransaction = async function(data) {
  let transactionId = this.generateTransactionId();
  
  // Проверяем уникальность (маловероятно, но на всякий случай)
  let attempts = 0;
  while (await this.findOne({ transactionId }) && attempts < 5) {
    transactionId = this.generateTransactionId();
    attempts++;
  }
  
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 30); // QR-код действителен 30 минут
  
  const qrTransaction = new this({
    transactionId,
    venueId: data.venueId,
    venueCode: data.venueCode,
    purchaseAmount: data.purchaseAmount,
    pointsValue: data.pointsValue,
    pointsMultiplier: data.pointsMultiplier,
    isDoublePoints: data.isDoublePoints || false,
    expiresAt,
    metadata: data.metadata || {}
  });
  
  await qrTransaction.save();
  return qrTransaction;
};

qrTransactionSchema.statics.findByTransactionId = function(transactionId) {
  return this.findOne({ transactionId: transactionId.toUpperCase() });
};

qrTransactionSchema.statics.findValidByTransactionId = function(transactionId) {
  return this.findOne({ 
    transactionId: transactionId.toUpperCase(),
    isUsed: false,
    expiresAt: { $gt: new Date() }
  });
};

const QRTransaction = mongoose.model('QRTransaction', qrTransactionSchema);

module.exports = QRTransaction;


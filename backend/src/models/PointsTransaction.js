const mongoose = require('mongoose');

const pointsTransactionSchema = new mongoose.Schema({
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
  type: {
    type: String,
    required: true,
    enum: ['earned', 'spent', 'expired', 'bonus', 'referral', 'admin_adjustment', 'refund'],
    index: true
  },
  points: {
    type: Number,
    required: true
  },
  balanceAfter: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  purchaseAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  pointsMultiplier: {
    type: Number,
    default: 1.00,
    min: 0.01,
    max: 10.00
  },
  transactionDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  relatedTransaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PointsTransaction',
    default: null
  },
  purchaseCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseCode',
    default: null
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    default: null
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    originalTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PointsTransaction'
    },
    expiryDate: Date,
    venueSpecific: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  collection: 'points_transactions'
});

// Индексы
pointsTransactionSchema.index({ userId: 1, transactionDate: -1 });
pointsTransactionSchema.index({ venueId: 1, transactionDate: -1 });
pointsTransactionSchema.index({ type: 1, transactionDate: -1 });
pointsTransactionSchema.index({ transactionDate: -1 });
pointsTransactionSchema.index({ purchaseCode: 1 });
pointsTransactionSchema.index({ orderId: 1 });

// Методы экземпляра
pointsTransactionSchema.methods.isEarning = function() {
  return ['earned', 'bonus', 'referral'].includes(this.type);
};

pointsTransactionSchema.methods.isSpending = function() {
  return ['spent', 'expired'].includes(this.type);
};

pointsTransactionSchema.methods.getFormattedDate = function() {
  return this.transactionDate.toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Статические методы
pointsTransactionSchema.statics.getUserHistory = async function(userId, options = {}) {
  const {
    limit = 50,
    offset = 0,
    type = null,
    venueId = null,
    startDate = null,
    endDate = null
  } = options;
  
  const matchStage = { userId };
  
  if (type) matchStage.type = type;
  if (venueId) matchStage.venueId = venueId;
  
  if (startDate || endDate) {
    matchStage.transactionDate = {};
    if (startDate) matchStage.transactionDate.$gte = new Date(startDate);
    if (endDate) matchStage.transactionDate.$lte = new Date(endDate);
  }
  
  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: 'venues',
        localField: 'venueId',
        foreignField: '_id',
        as: 'venue'
      }
    },
    {
      $lookup: {
        from: 'menu_items',
        localField: 'menuItemId',
        foreignField: '_id',
        as: 'menuItem'
      }
    },
    {
      $addFields: {
        venueName: { $arrayElemAt: ['$venue.name', 0] },
        menuItemName: { $arrayElemAt: ['$menuItem.name', 0] }
      }
    },
    {
      $project: {
        venue: 0,
        menuItem: 0
      }
    },
    { $sort: { transactionDate: -1 } },
    { $skip: offset },
    { $limit: limit }
  ];
  
  return await this.aggregate(pipeline);
};

pointsTransactionSchema.statics.getVenueStats = async function(venueId, startDate, endDate) {
  const matchStage = { venueId };
  
  if (startDate || endDate) {
    matchStage.transactionDate = {};
    if (startDate) matchStage.transactionDate.$gte = new Date(startDate);
    if (endDate) matchStage.transactionDate.$lte = new Date(endDate);
  }
  
  return await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalPoints: { $sum: '$points' },
        totalRevenue: { $sum: '$purchaseAmount' }
      }
    },
    {
      $group: {
        _id: null,
        transactions: {
          $push: {
            type: '$_id',
            count: '$count',
            totalPoints: '$totalPoints',
            totalRevenue: '$totalRevenue'
          }
        },
        totalTransactions: { $sum: '$count' },
        totalPointsIssued: {
          $sum: {
            $cond: [
              { $in: ['$_id', ['earned', 'bonus', 'referral']] },
              '$totalPoints',
              0
            ]
          }
        },
        totalPointsRedeemed: {
          $sum: {
            $cond: [
              { $in: ['$_id', ['spent', 'expired']] },
              { $abs: '$totalPoints' },
              0
            ]
          }
        },
        totalRevenue: { $sum: '$totalRevenue' }
      }
    }
  ]);
};

pointsTransactionSchema.statics.getUserBalance = async function(userId, venueId = null) {
  const matchStage = { userId };
  if (venueId) matchStage.venueId = venueId;
  
  const result = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalEarned: {
          $sum: {
            $cond: [
              { $in: ['$type', ['earned', 'bonus', 'referral']] },
              '$points',
              0
            ]
          }
        },
        totalSpent: {
          $sum: {
            $cond: [
              { $in: ['$type', ['spent', 'expired']] },
              { $abs: '$points' },
              0
            ]
          }
        },
        currentBalance: {
          $last: '$balanceAfter'
        }
      }
    }
  ]);
  
  return result[0] || { totalEarned: 0, totalSpent: 0, currentBalance: 0 };
};

pointsTransactionSchema.statics.createTransaction = async function(transactionData) {
  const transaction = new this(transactionData);
  await transaction.save();
  return transaction;
};

const PointsTransaction = mongoose.model('PointsTransaction', pointsTransactionSchema);

module.exports = PointsTransaction;
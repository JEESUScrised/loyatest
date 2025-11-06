const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
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
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true,
    index: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  totalCost: {
    type: Number,
    required: true,
    min: 0
  },
  pointsEarned: {
    type: Number,
    default: 0,
    min: 0
  },
  pointsSpent: {
    type: Number,
    default: 0,
    min: 0
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
    index: true
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
  metadata: {
    cashierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cashierName: String,
    ipAddress: String,
    userAgent: String,
    source: {
      type: String,
      enum: ['code', 'order', 'admin'],
      default: 'code'
    }
  }
}, {
  timestamps: true,
  collection: 'purchases'
});

// Индексы
purchaseSchema.index({ userId: 1, purchaseDate: -1 });
purchaseSchema.index({ venueId: 1, purchaseDate: -1 });
purchaseSchema.index({ menuItemId: 1, purchaseDate: -1 });
purchaseSchema.index({ purchaseCode: 1 });
purchaseSchema.index({ orderId: 1 });
purchaseSchema.index({ purchaseDate: -1 });

// Методы экземпляра
purchaseSchema.methods.getNetPoints = function() {
  return this.pointsEarned - this.pointsSpent;
};

purchaseSchema.methods.getFormattedDate = function() {
  return this.purchaseDate.toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Статические методы
purchaseSchema.statics.getUserPurchases = async function(userId, options = {}) {
  const {
    venueId = null,
    startDate = null,
    endDate = null,
    limit = 50,
    offset = 0
  } = options;
  
  const matchStage = { userId };
  
  if (venueId) matchStage.venueId = venueId;
  
  if (startDate || endDate) {
    matchStage.purchaseDate = {};
    if (startDate) matchStage.purchaseDate.$gte = new Date(startDate);
    if (endDate) matchStage.purchaseDate.$lte = new Date(endDate);
  }
  
  return await this.find(matchStage)
    .populate('venueId', 'name venueCode')
    .populate('menuItemId', 'name description category')
    .populate('purchaseCode', 'code')
    .populate('orderId', 'orderNumber')
    .sort({ purchaseDate: -1 })
    .skip(offset)
    .limit(limit);
};

purchaseSchema.statics.getVenuePurchases = async function(venueId, options = {}) {
  const {
    startDate = null,
    endDate = null,
    limit = 100,
    offset = 0
  } = options;
  
  const matchStage = { venueId };
  
  if (startDate || endDate) {
    matchStage.purchaseDate = {};
    if (startDate) matchStage.purchaseDate.$gte = new Date(startDate);
    if (endDate) matchStage.purchaseDate.$lte = new Date(endDate);
  }
  
  return await this.find(matchStage)
    .populate('userId', 'firstName lastName telegramId')
    .populate('menuItemId', 'name description category')
    .populate('purchaseCode', 'code')
    .populate('orderId', 'orderNumber')
    .sort({ purchaseDate: -1 })
    .skip(offset)
    .limit(limit);
};

purchaseSchema.statics.getVenueStats = async function(venueId, startDate, endDate) {
  const matchStage = { venueId };
  
  if (startDate || endDate) {
    matchStage.purchaseDate = {};
    if (startDate) matchStage.purchaseDate.$gte = new Date(startDate);
    if (endDate) matchStage.purchaseDate.$lte = new Date(endDate);
  }
  
  return await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalPurchases: { $sum: 1 },
        totalRevenue: { $sum: '$totalCost' },
        totalPointsEarned: { $sum: '$pointsEarned' },
        totalPointsSpent: { $sum: '$pointsSpent' },
        totalQuantity: { $sum: '$quantity' },
        uniqueUsers: { $addToSet: '$userId' },
        uniqueMenuItems: { $addToSet: '$menuItemId' }
      }
    },
    {
      $project: {
        totalPurchases: 1,
        totalRevenue: 1,
        totalPointsEarned: 1,
        totalPointsSpent: 1,
        totalQuantity: 1,
        uniqueUsersCount: { $size: '$uniqueUsers' },
        uniqueMenuItemsCount: { $size: '$uniqueMenuItems' }
      }
    }
  ]);
};

purchaseSchema.statics.getMenuItemStats = async function(menuItemId, startDate, endDate) {
  const matchStage = { menuItemId };
  
  if (startDate || endDate) {
    matchStage.purchaseDate = {};
    if (startDate) matchStage.purchaseDate.$gte = new Date(startDate);
    if (endDate) matchStage.purchaseDate.$lte = new Date(endDate);
  }
  
  return await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalPurchases: { $sum: 1 },
        totalRevenue: { $sum: '$totalCost' },
        totalQuantity: { $sum: '$quantity' },
        totalPointsEarned: { $sum: '$pointsEarned' },
        totalPointsSpent: { $sum: '$pointsSpent' },
        uniqueUsers: { $addToSet: '$userId' },
        uniqueVenues: { $addToSet: '$venueId' }
      }
    },
    {
      $project: {
        totalPurchases: 1,
        totalRevenue: 1,
        totalQuantity: 1,
        totalPointsEarned: 1,
        totalPointsSpent: 1,
        uniqueUsersCount: { $size: '$uniqueUsers' },
        uniqueVenuesCount: { $size: '$uniqueVenues' }
      }
    }
  ]);
};

purchaseSchema.statics.getTopMenuItems = async function(venueId, startDate, endDate, limit = 10) {
  const matchStage = { venueId };
  
  if (startDate || endDate) {
    matchStage.purchaseDate = {};
    if (startDate) matchStage.purchaseDate.$gte = new Date(startDate);
    if (endDate) matchStage.purchaseDate.$lte = new Date(endDate);
  }
  
  return await this.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: 'menu_items',
        localField: 'menuItemId',
        foreignField: '_id',
        as: 'menuItem'
      }
    },
    {
      $unwind: '$menuItem'
    },
    {
      $group: {
        _id: '$menuItemId',
        menuItemName: { $first: '$menuItem.name' },
        category: { $first: '$menuItem.category' },
        totalPurchases: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
        totalRevenue: { $sum: '$totalCost' },
        totalPointsEarned: { $sum: '$pointsEarned' }
      }
    },
    {
      $sort: { totalQuantity: -1 }
    },
    {
      $limit: limit
    }
  ]);
};

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;
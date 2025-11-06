const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
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
  price: {
    type: Number,
    required: true,
    min: 0
  },
  pointsCost: {
    type: Number,
    default: 0,
    min: 0
  },
  pointsReward: {
    type: Number,
    default: 0,
    min: 0
  },
  notes: {
    type: String,
    maxlength: 200,
    default: null
  },
  isReady: {
    type: Boolean,
    default: false
  },
  readyAt: {
    type: Date,
    default: null
  },
  preparedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true,
  collection: 'order_items'
});

// Индексы
orderItemSchema.index({ orderId: 1 });
orderItemSchema.index({ menuItemId: 1 });
orderItemSchema.index({ isReady: 1 });

// Методы экземпляра
orderItemSchema.methods.getTotalPrice = function() {
  return this.price * this.quantity;
};

orderItemSchema.methods.getTotalPointsCost = function() {
  return this.pointsCost * this.quantity;
};

orderItemSchema.methods.getTotalPointsReward = function() {
  return this.pointsReward * this.quantity;
};

orderItemSchema.methods.markAsReady = async function(preparedBy = null) {
  this.isReady = true;
  this.readyAt = new Date();
  if (preparedBy) {
    this.preparedBy = preparedBy;
  }
  await this.save();
  return this;
};

// Статические методы
orderItemSchema.statics.getOrderItems = async function(orderId) {
  return await this.find({ orderId })
    .populate('menuItemId', 'name description category')
    .populate('preparedBy', 'firstName lastName')
    .sort({ createdAt: 1 });
};

orderItemSchema.statics.getMenuItemStats = async function(menuItemId, startDate, endDate) {
  const matchStage = { menuItemId };
  
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
        totalQuantity: { $sum: '$quantity' },
        totalRevenue: { $sum: { $multiply: ['$price', '$quantity'] } },
        totalPointsCost: { $sum: { $multiply: ['$pointsCost', '$quantity'] } },
        totalPointsReward: { $sum: { $multiply: ['$pointsReward', '$quantity'] } },
        totalOrders: { $sum: 1 },
        lastOrdered: { $max: '$createdAt' }
      }
    }
  ]);
};

orderItemSchema.statics.getVenueItemStats = async function(venueId, startDate, endDate) {
  const matchStage = {};
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }
  
  return await this.aggregate([
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
      $match: {
        'menuItem.venueId': venueId,
        ...matchStage
      }
    },
    {
      $group: {
        _id: '$menuItemId',
        menuItemName: { $first: '$menuItem.name' },
        category: { $first: '$menuItem.category' },
        totalQuantity: { $sum: '$quantity' },
        totalRevenue: { $sum: { $multiply: ['$price', '$quantity'] } },
        totalOrders: { $sum: 1 },
        lastOrdered: { $max: '$createdAt' }
      }
    },
    {
      $sort: { totalQuantity: -1 }
    }
  ]);
};

const OrderItem = mongoose.model('OrderItem', orderItemSchema);

module.exports = OrderItem;
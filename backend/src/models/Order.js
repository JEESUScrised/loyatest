const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
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
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  totalAmount: {
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
  status: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled', 'refunded'],
    default: 'pending',
    index: true
  },
  orderDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  estimatedReadyTime: {
    type: Date,
    default: null
  },
  actualReadyTime: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  cancellationReason: {
    type: String,
    maxlength: 500,
    default: null
  },
  customerInfo: {
    name: String,
    phone: String,
    email: String,
    notes: String
  },
  deliveryInfo: {
    type: {
      type: String,
      enum: ['pickup', 'delivery'],
      default: 'pickup'
    },
    address: {
      street: String,
      building: String,
      apartment: String,
      entrance: String,
      floor: String,
      intercom: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: 0
    },
    estimatedDeliveryTime: Date,
    actualDeliveryTime: Date
  },
  paymentInfo: {
    method: {
      type: String,
      enum: ['cash', 'card', 'points', 'mixed'],
      default: 'cash'
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    pointsUsed: {
      type: Number,
      default: 0,
      min: 0
    },
    transactionId: String,
    isPaid: {
      type: Boolean,
      default: false
    },
    paidAt: Date
  },
  items: [{
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    name: {
      type: String,
      required: true
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
    readyAt: Date
  }],
  staffNotes: {
    type: String,
    maxlength: 1000,
    default: null
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    source: {
      type: String,
      enum: ['web', 'mobile', 'telegram', 'admin'],
      default: 'web'
    },
    version: String,
    deviceInfo: {
      type: String,
      platform: String,
      browser: String
    }
  }
}, {
  timestamps: true,
  collection: 'orders'
});

// Индексы
orderSchema.index({ userId: 1, orderDate: -1 });
orderSchema.index({ venueId: 1, orderDate: -1 });
orderSchema.index({ status: 1, orderDate: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ orderDate: -1 });

// Методы экземпляра
orderSchema.methods.calculateTotal = function() {
  const itemsTotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = this.deliveryInfo.deliveryFee || 0;
  return itemsTotal + deliveryFee;
};

orderSchema.methods.calculatePointsEarned = function() {
  return this.items.reduce((sum, item) => sum + (item.pointsReward * item.quantity), 0);
};

orderSchema.methods.calculatePointsSpent = function() {
  return this.items.reduce((sum, item) => sum + (item.pointsCost * item.quantity), 0);
};

orderSchema.methods.isReady = function() {
  return this.status === 'ready' || this.status === 'completed';
};

orderSchema.methods.isCompleted = function() {
  return this.status === 'completed';
};

orderSchema.methods.isCancelled = function() {
  return this.status === 'cancelled' || this.status === 'refunded';
};

orderSchema.methods.canBeCancelled = function() {
  return ['pending', 'confirmed', 'preparing'].includes(this.status);
};

orderSchema.methods.getEstimatedWaitTime = function() {
  if (this.estimatedReadyTime) {
    const now = new Date();
    const waitTime = this.estimatedReadyTime - now;
    return Math.max(0, Math.ceil(waitTime / (1000 * 60))); // в минутах
  }
  return null;
};

orderSchema.methods.updateStatus = async function(newStatus, notes = null) {
  const validTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['ready', 'cancelled'],
    ready: ['completed'],
    completed: ['refunded'],
    cancelled: [],
    refunded: []
  };
  
  if (!validTransitions[this.status].includes(newStatus)) {
    throw new Error(`Невозможно изменить статус с ${this.status} на ${newStatus}`);
  }
  
  this.status = newStatus;
  
  if (notes) {
    this.staffNotes = notes;
  }
  
  const now = new Date();
  
  switch (newStatus) {
    case 'ready':
      this.actualReadyTime = now;
      break;
    case 'completed':
      this.completedAt = now;
      break;
    case 'cancelled':
      this.cancelledAt = now;
      break;
  }
  
  await this.save();
  return this;
};

// Статические методы
orderSchema.statics.generateOrderNumber = async function(venueCode) {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const venuePrefix = venueCode.toUpperCase().slice(0, 3);
  
  let counter = 1;
  let orderNumber;
  
  do {
    orderNumber = `${venuePrefix}${dateStr}${counter.toString().padStart(3, '0')}`;
    counter++;
  } while (await this.findOne({ orderNumber }));
  
  return orderNumber;
};

orderSchema.statics.getVenueOrders = async function(venueId, options = {}) {
  const {
    status = null,
    startDate = null,
    endDate = null,
    limit = 50,
    offset = 0
  } = options;
  
  const matchStage = { venueId };
  
  if (status) matchStage.status = status;
  
  if (startDate || endDate) {
    matchStage.orderDate = {};
    if (startDate) matchStage.orderDate.$gte = new Date(startDate);
    if (endDate) matchStage.orderDate.$lte = new Date(endDate);
  }
  
  return await this.find(matchStage)
    .populate('userId', 'firstName lastName telegramId')
    .populate('items.menuItemId', 'name description')
    .sort({ orderDate: -1 })
    .skip(offset)
    .limit(limit);
};

orderSchema.statics.getUserOrders = async function(userId, options = {}) {
  const {
    status = null,
    startDate = null,
    endDate = null,
    limit = 20,
    offset = 0
  } = options;
  
  const matchStage = { userId };
  
  if (status) matchStage.status = status;
  
  if (startDate || endDate) {
    matchStage.orderDate = {};
    if (startDate) matchStage.orderDate.$gte = new Date(startDate);
    if (endDate) matchStage.orderDate.$lte = new Date(endDate);
  }
  
  return await this.find(matchStage)
    .populate('venueId', 'name venueCode')
    .populate('items.menuItemId', 'name description')
    .sort({ orderDate: -1 })
    .skip(offset)
    .limit(limit);
};

orderSchema.statics.getVenueStats = async function(venueId, startDate, endDate) {
  const matchStage = { venueId };
  
  if (startDate || endDate) {
    matchStage.orderDate = {};
    if (startDate) matchStage.orderDate.$gte = new Date(startDate);
    if (endDate) matchStage.orderDate.$lte = new Date(endDate);
  }
  
  return await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        totalPointsEarned: { $sum: '$pointsEarned' },
        totalPointsSpent: { $sum: '$pointsSpent' }
      }
    },
    {
      $group: {
        _id: null,
        statusBreakdown: {
          $push: {
            status: '$_id',
            count: '$count',
            totalAmount: '$totalAmount',
            totalPointsEarned: '$totalPointsEarned',
            totalPointsSpent: '$totalPointsSpent'
          }
        },
        totalOrders: { $sum: '$count' },
        totalRevenue: { $sum: '$totalAmount' },
        totalPointsIssued: { $sum: '$totalPointsEarned' },
        totalPointsRedeemed: { $sum: '$totalPointsSpent' }
      }
    }
  ]);
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
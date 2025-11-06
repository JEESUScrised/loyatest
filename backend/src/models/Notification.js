const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200,
    trim: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['info', 'success', 'warning', 'error', 'promotion', 'reminder', 'system'],
    default: 'info',
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: ['points', 'order', 'referral', 'promotion', 'system', 'expiry', 'bonus'],
    default: 'system',
    index: true
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date,
    default: null
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  scheduledFor: {
    type: Date,
    default: null,
    index: true
  },
  expiresAt: {
    type: Date,
    default: null,
    index: true
  },
  actionUrl: {
    type: String,
    maxlength: 500,
    default: null
  },
  actionText: {
    type: String,
    maxlength: 100,
    default: null
  },
  metadata: {
    venueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue'
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    pointsAmount: Number,
    referralCode: String,
    campaignId: String,
    templateId: String,
    variables: mongoose.Schema.Types.Mixed
  },
  deliveryStatus: {
    sent: {
      type: Boolean,
      default: false
    },
    sentAt: Date,
    failed: {
      type: Boolean,
      default: false
    },
    failedAt: Date,
    failureReason: String,
    retryCount: {
      type: Number,
      default: 0,
      max: 3
    }
  }
}, {
  timestamps: true,
  collection: 'notifications'
});

// Индексы
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, category: 1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ 'deliveryStatus.sent': 1, 'deliveryStatus.failed': 1 });

// Методы экземпляра
notificationSchema.methods.markAsRead = async function() {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    await this.save();
  }
  return this;
};

notificationSchema.methods.markAsUnread = async function() {
  this.isRead = false;
  this.readAt = null;
  await this.save();
  return this;
};

notificationSchema.methods.isExpired = function() {
  return this.expiresAt && new Date() > this.expiresAt;
};

notificationSchema.methods.isScheduled = function() {
  return this.scheduledFor && new Date() < this.scheduledFor;
};

notificationSchema.methods.canBeSent = function() {
  return !this.deliveryStatus.sent && 
         !this.deliveryStatus.failed && 
         !this.isExpired() && 
         !this.isScheduled();
};

notificationSchema.methods.markAsSent = async function() {
  this.deliveryStatus.sent = true;
  this.deliveryStatus.sentAt = new Date();
  await this.save();
  return this;
};

notificationSchema.methods.markAsFailed = async function(reason) {
  this.deliveryStatus.failed = true;
  this.deliveryStatus.failedAt = new Date();
  this.deliveryStatus.failureReason = reason;
  this.deliveryStatus.retryCount += 1;
  await this.save();
  return this;
};

notificationSchema.methods.getFormattedDate = function() {
  return this.createdAt.toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Статические методы
notificationSchema.statics.createNotification = async function(notificationData) {
  const notification = new this(notificationData);
  await notification.save();
  return notification;
};

notificationSchema.statics.getUserNotifications = async function(userId, options = {}) {
  const {
    isRead = null,
    type = null,
    category = null,
    limit = 50,
    offset = 0
  } = options;
  
  const matchStage = { userId };
  
  if (isRead !== null) matchStage.isRead = isRead;
  if (type) matchStage.type = type;
  if (category) matchStage.category = category;
  
  return await this.find(matchStage)
    .populate('metadata.venueId', 'name venueCode')
    .populate('metadata.orderId', 'orderNumber')
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit);
};

notificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({ userId, isRead: false });
};

notificationSchema.statics.markAllAsRead = async function(userId) {
  return await this.updateMany(
    { userId, isRead: false },
    { 
      $set: { 
        isRead: true, 
        readAt: new Date() 
      } 
    }
  );
};

notificationSchema.statics.getPendingNotifications = async function() {
  return await this.find({
    'deliveryStatus.sent': false,
    'deliveryStatus.failed': false,
    $or: [
      { scheduledFor: null },
      { scheduledFor: { $lte: new Date() } }
    ],
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ]
  })
  .populate('userId', 'telegramId firstName lastName')
  .sort({ priority: -1, createdAt: 1 });
};

notificationSchema.statics.getFailedNotifications = async function() {
  return await this.find({
    'deliveryStatus.failed': true,
    'deliveryStatus.retryCount': { $lt: 3 }
  })
  .populate('userId', 'telegramId firstName lastName')
  .sort({ 'deliveryStatus.failedAt': 1 });
};

notificationSchema.statics.cleanupExpired = async function() {
  return await this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

notificationSchema.statics.getNotificationStats = async function(startDate, endDate) {
  const matchStage = {};
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }
  
  return await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          type: '$type',
          category: '$category'
        },
        count: { $sum: 1 },
        readCount: { $sum: { $cond: ['$isRead', 1, 0] } },
        sentCount: { $sum: { $cond: ['$deliveryStatus.sent', 1, 0] } },
        failedCount: { $sum: { $cond: ['$deliveryStatus.failed', 1, 0] } }
      }
    },
    {
      $group: {
        _id: null,
        breakdown: {
          $push: {
            type: '$_id.type',
            category: '$_id.category',
            count: '$count',
            readCount: '$readCount',
            sentCount: '$sentCount',
            failedCount: '$failedCount'
          }
        },
        totalNotifications: { $sum: '$count' },
        totalRead: { $sum: '$readCount' },
        totalSent: { $sum: '$sentCount' },
        totalFailed: { $sum: '$failedCount' }
      }
    }
  ]);
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
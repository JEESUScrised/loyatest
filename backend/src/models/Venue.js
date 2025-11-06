const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 200,
    trim: true
  },
  venueCode: {
    type: String,
    required: true,
    unique: true,
    maxlength: 10,
    uppercase: true
  },
  description: {
    type: String,
    maxlength: 1000,
    default: null
  },
  address: {
    type: String,
    maxlength: 500,
    default: null
  },
  phone: {
    type: String,
    maxlength: 20,
    default: null
  },
  email: {
    type: String,
    maxlength: 100,
    default: null,
    lowercase: true
  },
  pointsMultiplier: {
    type: Number,
    default: 1.00,
    min: 0.01,
    max: 10.00
  },
  pointsPerPurchase: {
    type: Number,
    default: 10,
    min: 1
  },
  doublePointsHours: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    start: {
      type: String,
      pattern: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    end: {
      type: String,
      pattern: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    multiplier: {
      type: Number,
      default: 2.0,
      min: 1.0
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  settings: {
    allowOrders: {
      type: Boolean,
      default: true
    },
    allowMenu: {
      type: Boolean,
      default: true
    },
    allowPurchaseCodes: {
      type: Boolean,
      default: true
    },
    workingHours: {
      monday: { open: String, close: String, isOpen: Boolean },
      tuesday: { open: String, close: String, isOpen: Boolean },
      wednesday: { open: String, close: String, isOpen: Boolean },
      thursday: { open: String, close: String, isOpen: Boolean },
      friday: { open: String, close: String, isOpen: Boolean },
      saturday: { open: String, close: String, isOpen: Boolean },
      sunday: { open: String, close: String, isOpen: Boolean }
    },
    timezone: {
      type: String,
      default: 'Europe/Moscow'
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: null
    }
  },
  images: [{
    url: String,
    alt: String,
    isMain: {
      type: Boolean,
      default: false
    }
  }],
  socialLinks: {
    website: String,
    instagram: String,
    telegram: String,
    vk: String
  },
  statistics: {
    totalUsers: {
      type: Number,
      default: 0
    },
    totalOrders: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    totalPointsIssued: {
      type: Number,
      default: 0
    },
    totalPointsRedeemed: {
      type: Number,
      default: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true,
  collection: 'venues'
});

// Индексы
venueSchema.index({ venueCode: 1 });
venueSchema.index({ isActive: 1 });
venueSchema.index({ 'location.coordinates': '2dsphere' });
venueSchema.index({ name: 'text', description: 'text' });

// Методы экземпляра
venueSchema.methods.updateStatistics = async function() {
  const Order = require('./Order');
  const UserVenueBalance = require('./UserVenueBalance');
  
  const totalUsers = await UserVenueBalance.countDocuments({ venueId: this._id });
  const totalOrders = await Order.countDocuments({ venueId: this._id });
  
  const revenueResult = await Order.aggregate([
    { $match: { venueId: this._id } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);
  
  const pointsResult = await UserVenueBalance.aggregate([
    { $match: { venueId: this._id } },
    { 
      $group: { 
        _id: null, 
        totalEarned: { $sum: '$totalEarned' },
        totalSpent: { $sum: '$totalSpent' }
      } 
    }
  ]);
  
  this.statistics.totalUsers = totalUsers;
  this.statistics.totalOrders = totalOrders;
  this.statistics.totalRevenue = revenueResult[0]?.total || 0;
  this.statistics.totalPointsIssued = pointsResult[0]?.totalEarned || 0;
  this.statistics.totalPointsRedeemed = pointsResult[0]?.totalSpent || 0;
  this.statistics.lastActivity = new Date();
  
  await this.save();
};

// Статические методы
venueSchema.statics.findByCode = function(venueCode) {
  return this.findOne({ venueCode: venueCode.toUpperCase() });
};

venueSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ name: 1 });
};

venueSchema.statics.findNearby = function(longitude, latitude, maxDistance = 10000) {
  return this.find({
    isActive: true,
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    }
  });
};

const Venue = mongoose.model('Venue', venueSchema);

module.exports = Venue;
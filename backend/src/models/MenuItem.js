const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
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
  category: {
    type: String,
    required: true,
    maxlength: 100,
    index: true
  },
  subcategory: {
    type: String,
    maxlength: 100,
    default: null
  },
  isAvailable: {
    type: Boolean,
    default: true,
    index: true
  },
  isPopular: {
    type: Boolean,
    default: false,
    index: true
  },
  isNew: {
    type: Boolean,
    default: false
  },
  isVegetarian: {
    type: Boolean,
    default: false
  },
  isVegan: {
    type: Boolean,
    default: false
  },
  isGlutenFree: {
    type: Boolean,
    default: false
  },
  allergens: [{
    type: String,
    maxlength: 50
  }],
  ingredients: [{
    type: String,
    maxlength: 100
  }],
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number,
    sugar: Number,
    sodium: Number
  },
  images: [{
    url: String,
    alt: String,
    isMain: {
      type: Boolean,
      default: false
    }
  }],
  preparationTime: {
    type: Number, // в минутах
    default: null
  },
  servingSize: {
    type: String,
    maxlength: 50,
    default: null
  },
  tags: [{
    type: String,
    maxlength: 30
  }],
  sortOrder: {
    type: Number,
    default: 0
  },
  statistics: {
    totalOrders: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    lastOrdered: {
      type: Date,
      default: null
    }
  },
  availability: {
    always: {
      type: Boolean,
      default: true
    },
    timeRanges: [{
      dayOfWeek: {
        type: Number,
        min: 0,
        max: 6 // 0 = воскресенье, 1 = понедельник, и т.д.
      },
      startTime: String, // "09:00"
      endTime: String,   // "18:00"
      isActive: {
        type: Boolean,
        default: true
      }
    }],
    seasonal: {
      startDate: Date,
      endDate: Date,
      isActive: {
        type: Boolean,
        default: false
      }
    }
  }
}, {
  timestamps: true,
  collection: 'menu_items'
});

// Индексы
menuItemSchema.index({ venueId: 1, category: 1 });
menuItemSchema.index({ venueId: 1, isAvailable: 1 });
menuItemSchema.index({ venueId: 1, isPopular: 1 });
menuItemSchema.index({ venueId: 1, sortOrder: 1 });
menuItemSchema.index({ name: 'text', description: 'text' });
menuItemSchema.index({ tags: 1 });

// Методы экземпляра
menuItemSchema.methods.isCurrentlyAvailable = function() {
  if (!this.isAvailable) return false;
  
  if (this.availability.always) return true;
  
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"
  
  // Проверяем временные диапазоны
  for (const timeRange of this.availability.timeRanges) {
    if (timeRange.dayOfWeek === currentDay && timeRange.isActive) {
      if (currentTime >= timeRange.startTime && currentTime <= timeRange.endTime) {
        return true;
      }
    }
  }
  
  // Проверяем сезонность
  if (this.availability.seasonal.isActive) {
    const { startDate, endDate } = this.availability.seasonal;
    if (now >= startDate && now <= endDate) {
      return true;
    }
  }
  
  return false;
};

menuItemSchema.methods.updateStatistics = async function() {
  const OrderItem = require('./OrderItem');
  
  const stats = await OrderItem.aggregate([
    { $match: { menuItemId: this._id } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: '$quantity' },
        totalRevenue: { $sum: { $multiply: ['$price', '$quantity'] } },
        lastOrdered: { $max: '$createdAt' }
      }
    }
  ]);
  
  if (stats.length > 0) {
    this.statistics.totalOrders = stats[0].totalOrders;
    this.statistics.totalRevenue = stats[0].totalRevenue;
    this.statistics.lastOrdered = stats[0].lastOrdered;
  }
  
  await this.save();
};

// Статические методы
menuItemSchema.statics.getMenuByVenue = async function(venueId, options = {}) {
  const {
    category = null,
    includeUnavailable = false,
    sortBy = 'sortOrder',
    sortOrder = 1
  } = options;
  
  const matchStage = { venueId };
  
  if (!includeUnavailable) {
    matchStage.isAvailable = true;
  }
  
  if (category) {
    matchStage.category = category;
  }
  
  const pipeline = [
    { $match: matchStage },
    { $sort: { [sortBy]: sortOrder } }
  ];
  
  return await this.aggregate(pipeline);
};

menuItemSchema.statics.getCategoriesByVenue = async function(venueId) {
  return await this.distinct('category', { venueId, isAvailable: true });
};

menuItemSchema.statics.getPopularItems = async function(venueId, limit = 10) {
  return await this.find({
    venueId,
    isAvailable: true,
    isPopular: true
  })
  .sort({ 'statistics.totalOrders': -1 })
  .limit(limit);
};

menuItemSchema.statics.searchItems = async function(venueId, searchTerm, options = {}) {
  const {
    category = null,
    maxPrice = null,
    minPrice = null,
    tags = [],
    dietary = null
  } = options;
  
  const matchStage = {
    venueId,
    isAvailable: true,
    $text: { $search: searchTerm }
  };
  
  if (category) matchStage.category = category;
  if (maxPrice !== null) matchStage.price = { ...matchStage.price, $lte: maxPrice };
  if (minPrice !== null) matchStage.price = { ...matchStage.price, $gte: minPrice };
  if (tags.length > 0) matchStage.tags = { $in: tags };
  
  if (dietary) {
    switch (dietary) {
      case 'vegetarian':
        matchStage.isVegetarian = true;
        break;
      case 'vegan':
        matchStage.isVegan = true;
        break;
      case 'gluten-free':
        matchStage.isGlutenFree = true;
        break;
    }
  }
  
  return await this.find(matchStage)
    .sort({ score: { $meta: 'textScore' } })
    .limit(50);
};

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = MenuItem;
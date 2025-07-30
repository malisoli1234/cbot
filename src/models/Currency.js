const mongoose = require('mongoose');

const currencySchema = new mongoose.Schema({
  currencyName: {
    type: String,
    required: true,
    index: true
  },
  searchTerm: {
    type: String,
    required: true
  },
  results: [{
    site: {
      type: String,
      required: true
    },
    currency: {
      type: String,
      required: true
    },
    payout: {
      type: String,
      required: true
    },
    originalLabel: String,
    originalPayout: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  telegramMessageId: {
    type: Number,
    required: true
  },
  telegramChannelId: {
    type: String,
    required: true
  },
  messageInfo: {
    pattern: String,
    timeFrame: String,
    direction: String,
    network: String,
    messageType: String
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'deleted', 'edited', 'error'],
    default: 'pending'
  },
  // اطلاعات عملیات ربات
  botAction: {
    type: String,
    enum: ['none', 'deleted', 'edited', 'kept'],
    default: 'none'
  },
  // اطلاعات payout
  bestPayout: {
    type: String,
    default: 'N/A'
  },
  payoutReason: {
    type: String,
    default: ''
  },
  // اطلاعات زمان‌بندی
  searchDuration: {
    type: Number, // میلی‌ثانیه
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
currencySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Currency', currencySchema); 
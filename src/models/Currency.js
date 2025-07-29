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
    enum: ['pending', 'processed', 'deleted', 'edited'],
    default: 'pending'
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
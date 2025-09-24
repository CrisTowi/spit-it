const mongoose = require('mongoose');

const dailySummarySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: true
  },
  user: {
    type: String,
    default: 'anonymous',
    index: true
  },
  summary: {
    type: String,
    required: true
  },
  spitsCount: {
    type: Number,
    required: true
  },
  moodAnalysis: {
    type: Object,
    required: true
  },
  locationCount: {
    type: Number,
    default: 0
  },
  attachmentCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure only one summary per user per day
dailySummarySchema.index({ date: 1, user: 1 }, { unique: true });

// Static method to get today's summary for a user
dailySummarySchema.statics.getTodaysSummary = function (user = 'anonymous') {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return this.findOne({
    user,
    date: {
      $gte: today,
      $lt: tomorrow
    }
  });
};

// Static method to create today's summary
dailySummarySchema.statics.createTodaysSummary = function (summaryData) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return this.create({
    ...summaryData,
    date: today
  });
};

module.exports = mongoose.model('DailySummary', dailySummarySchema);

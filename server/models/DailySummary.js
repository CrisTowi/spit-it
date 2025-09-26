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
  summarizedSpits: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Spit'
  }],
  locations: [{
    lat: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    lng: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    },
    spitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Spit'
    }
  }],
  timezone: {
    type: String,
    default: 'UTC'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
dailySummarySchema.index({ date: 1, user: 1 });
dailySummarySchema.index({ createdAt: -1, user: 1 });

// Static method to get today's summary for a user
dailySummarySchema.statics.getTodaysSummary = function (user = 'anonymous', timezone = 'UTC') {
  // Get today's date in the user's timezone
  const now = new Date();
  const userToday = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
  userToday.setHours(0, 0, 0, 0);

  // Convert to UTC for database query
  const todayUTC = new Date(userToday.getTime() - (userToday.getTimezoneOffset() * 60000));
  const tomorrowUTC = new Date(todayUTC.getTime() + (24 * 60 * 60 * 1000));

  return this.findOne({
    user,
    date: {
      $gte: todayUTC,
      $lt: tomorrowUTC
    }
  });
};

// Static method to create today's summary
dailySummarySchema.statics.createTodaysSummary = function (summaryData) {
  const { timezone = 'UTC', ...data } = summaryData;

  // Get today's date in the user's timezone
  const now = new Date();
  const userToday = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
  userToday.setHours(0, 0, 0, 0);

  // Convert to UTC for database storage
  const todayUTC = new Date(userToday.getTime() - (userToday.getTimezoneOffset() * 60000));

  return this.create({
    ...data,
    date: todayUTC,
    timezone
  });
};

// Static method to get all summaries for a user (for timeline)
dailySummarySchema.statics.getAllSummaries = function (user = 'anonymous', limit = 30) {
  return this.find({ user })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('summarizedSpits', 'content mood timestamp location')
    .lean();
};

// Static method to get latest summary for a user
dailySummarySchema.statics.getLatestSummary = function (user = 'anonymous') {
  return this.findOne({ user })
    .sort({ createdAt: -1 })
    .populate('summarizedSpits', 'content mood timestamp location')
    .lean();
};

module.exports = mongoose.model('DailySummary', dailySummarySchema);

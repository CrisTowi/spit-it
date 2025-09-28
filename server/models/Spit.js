const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  data: {
    type: String, // Base64 encoded file data
    required: true
  }
});

const locationSchema = new mongoose.Schema({
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
  }
});

const spitSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    maxlength: 180,
    trim: true
  },
  mood: {
    type: String,
    required: true,
    enum: ['happy', 'neutral', 'frustrated', 'inspired'],
    default: 'neutral'
  },
  files: [fileSchema],
  location: locationSchema,
  timestamp: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isSummarized: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Index for better query performance
spitSchema.index({ timestamp: -1 });
spitSchema.index({ user: 1, timestamp: -1 });
spitSchema.index({ 'location.lat': 1, 'location.lng': 1 });

// Virtual for formatted date
spitSchema.virtual('formattedDate').get(function () {
  return this.timestamp.toISOString();
});

// Ensure virtual fields are serialized
spitSchema.set('toJSON', { virtuals: true });

// Static method to get unsummarized spits for a user
spitSchema.statics.getUnsummarizedSpits = function (userId, limit = 50) {
  return this.find({
    user: userId,
    isSummarized: false
  })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
};

// Static method to get unsummarized spits count
spitSchema.statics.getUnsummarizedSpitsCount = function (userId) {
  return this.countDocuments({
    user: userId,
    isSummarized: false
  });
};

module.exports = mongoose.model('Spit', spitSchema);

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
    type: String,
    default: 'anonymous' // For now, we'll use anonymous users
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

module.exports = mongoose.model('Spit', spitSchema);

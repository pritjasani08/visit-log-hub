const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required']
  },
  visitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'IndustrialVisit',
    required: [true, 'Visit ID is required']
  },
  // Star ratings
  starsContent: {
    type: Number,
    required: [true, 'Content rating is required'],
    min: 1,
    max: 5
  },
  starsDelivery: {
    type: Number,
    required: [true, 'Delivery rating is required'],
    min: 1,
    max: 5
  },
  starsRelevance: {
    type: Number,
    required: [true, 'Relevance rating is required'],
    min: 1,
    max: 5
  },
  // Overall recommendation
  recommend: {
    type: Boolean,
    required: [true, 'Recommendation is required']
  },
  // Text feedback
  shortAnswer: {
    type: String,
    required: [true, 'Short feedback is required'],
    trim: true,
    minlength: [10, 'Short feedback must be at least 10 characters'],
    maxlength: [200, 'Short feedback cannot exceed 200 characters']
  },
  longAnswer: {
    type: String,
    required: [true, 'Detailed feedback is required'],
    trim: true,
    minlength: [20, 'Detailed feedback must be at least 20 characters'],
    maxlength: [1000, 'Detailed feedback cannot exceed 1000 characters']
  },
  // Sentiment analysis
  sentiment: {
    score: {
      type: Number,
      min: -1,
      max: 1,
      default: 0
    },
    label: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      default: 'neutral'
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    }
  },
  // Extra questions responses (dynamic feedback questions)
  extraResponses: [{
    questionId: {
      type: String,
      required: true
    },
    questionLabel: {
      type: String,
      required: true
    },
    response: {
      type: mongoose.Schema.Types.Mixed, // Can be string, boolean, or array
      required: true
    },
    questionType: {
      type: String,
      enum: ['text', 'textarea', 'checkbox'],
      required: true
    }
  }],
  // Feedback metadata
  isAnonymous: {
    type: Boolean,
    default: false
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  // Admin review
  isReviewed: {
    type: Boolean,
    default: false
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Review notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
feedbackSchema.index({ studentId: 1, visitId: 1 }, { unique: true });
feedbackSchema.index({ visitId: 1, submittedAt: 1 });
feedbackSchema.index({ sentiment: 1 });
feedbackSchema.index({ starsContent: 1, starsDelivery: 1, starsRelevance: 1 });

// Virtual for average rating
feedbackSchema.virtual('averageRating').get(function() {
  return (this.starsContent + this.starsDelivery + this.starsRelevance) / 3;
});

// Virtual for overall rating category
feedbackSchema.virtual('ratingCategory').get(function() {
  const avg = this.averageRating;
  if (avg >= 4.5) return 'excellent';
  if (avg >= 3.5) return 'good';
  if (avg >= 2.5) return 'average';
  if (avg >= 1.5) return 'poor';
  return 'very_poor';
});

// Method to calculate sentiment
feedbackSchema.methods.calculateSentiment = function() {
  // Simple sentiment calculation based on ratings and text
  let score = 0;
  
  // Rating contribution (60% weight)
  const ratingScore = (this.starsContent + this.starsDelivery + this.starsRelevance) / 15; // Normalize to 0-1
  score += ratingScore * 0.6;
  
  // Recommendation contribution (20% weight)
  if (this.recommend) score += 0.2;
  
  // Text sentiment (20% weight) - simple keyword analysis
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'helpful', 'informative', 'useful'];
  const negativeWords = ['bad', 'terrible', 'awful', 'useless', 'boring', 'confusing', 'disappointing'];
  
  const text = `${this.shortAnswer} ${this.longAnswer}`.toLowerCase();
  let textScore = 0;
  
  positiveWords.forEach(word => {
    if (text.includes(word)) textScore += 0.1;
  });
  
  negativeWords.forEach(word => {
    if (text.includes(word)) textScore -= 0.1;
  });
  
  textScore = Math.max(-1, Math.min(1, textScore));
  score += textScore * 0.2;
  
  // Normalize final score to -1 to 1
  this.sentiment.score = Math.max(-1, Math.min(1, score));
  
  // Set label based on score
  if (this.sentiment.score >= 0.3) {
    this.sentiment.label = 'positive';
  } else if (this.sentiment.score <= -0.3) {
    this.sentiment.label = 'negative';
  } else {
    this.sentiment.label = 'neutral';
  }
  
  // Set confidence (simplified)
  this.sentiment.confidence = 0.8; // Could be enhanced with ML model
  
  return this.sentiment;
};

// Pre-save middleware to calculate sentiment
feedbackSchema.pre('save', function(next) {
  if (this.isModified('starsContent') || this.isModified('starsDelivery') || 
      this.isModified('starsRelevance') || this.isModified('recommend') ||
      this.isModified('shortAnswer') || this.isModified('longAnswer')) {
    this.calculateSentiment();
  }
  next();
});

module.exports = mongoose.model('Feedback', feedbackSchema);

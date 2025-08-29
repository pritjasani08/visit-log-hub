const mongoose = require('mongoose');

const industrialVisitSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required']
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  visitDate: {
    type: Date,
    required: [true, 'Visit date is required'],
    validate: {
      validator: function(value) {
        return value >= new Date().setHours(0, 0, 0, 0);
      },
      message: 'Visit date cannot be in the past'
    }
  },
  purpose: {
    type: String,
    required: [true, 'Purpose is required'],
    trim: true,
    minlength: [3, 'Purpose must be at least 3 characters'],
    maxlength: [500, 'Purpose cannot exceed 500 characters']
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required'],
    validate: {
      validator: function(value) {
        return value > this.startTime;
      },
      message: 'End time must be after start time'
    }
  },
  location: {
    address: {
      type: String,
      trim: true
    },
    coordinates: {
      lat: {
        type: Number,
        min: -90,
        max: 90
      },
      lng: {
        type: Number,
        min: -180,
        max: 180
      }
    },
    radius: {
      type: Number,
      default: 100, // meters
      min: 50,
      max: 10000
    }
  },
  qrCode: {
    token: {
      type: String,
      unique: true,
      sparse: true
    },
    expiresAt: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING'
  },
  attendanceCount: {
    type: Number,
    default: 0,
    min: 0
  },
  feedbackCount: {
    type: Number,
    default: 0,
    min: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  extraQuestions: [{
    id: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['text', 'textarea', 'checkbox'],
      default: 'text'
    },
    required: {
      type: Boolean,
      default: false
    },
    options: [String] // For checkbox type questions
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
industrialVisitSchema.index({ studentId: 1, status: 1 });
industrialVisitSchema.index({ companyName: 1 });
industrialVisitSchema.index({ visitDate: 1 });
industrialVisitSchema.index({ 'qrCode.token': 1 });
industrialVisitSchema.index({ status: 1, startTime: 1 });

// Virtual for duration
industrialVisitSchema.virtual('duration').get(function() {
  if (this.startTime && this.endTime) {
    return this.endTime - this.startTime;
  }
  return 0;
});

// Virtual for isActive
industrialVisitSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  return this.status === 'ACTIVE' && 
         now >= this.startTime && 
         now <= this.endTime;
});

// Method to generate QR token
industrialVisitSchema.methods.generateQRToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + (process.env.QR_EXPIRE_MINUTES || 15) * 60 * 1000);
  
  this.qrCode = {
    token,
    expiresAt,
    isActive: true
  };
  
  return token;
};

// Method to check if QR is valid
industrialVisitSchema.methods.isQRValid = function() {
  return this.qrCode.isActive && 
         this.qrCode.expiresAt > new Date() &&
         this.status === 'ACTIVE';
};

// Method to update status based on time
industrialVisitSchema.methods.updateStatus = function() {
  const now = new Date();
  
  if (now < this.startTime) {
    this.status = 'PENDING';
  } else if (now >= this.startTime && now <= this.endTime) {
    this.status = 'ACTIVE';
  } else {
    this.status = 'COMPLETED';
  }
  
  return this.status;
};

// Pre-save middleware to update status
industrialVisitSchema.pre('save', function(next) {
  this.updateStatus();
  next();
});

module.exports = mongoose.model('IndustrialVisit', industrialVisitSchema);

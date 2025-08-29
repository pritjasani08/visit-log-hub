const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
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
  checkInAt: {
    type: Date,
    required: [true, 'Check-in time is required'],
    default: Date.now
  },
  checkOutAt: {
    type: Date
  },
  gpsLocation: {
    lat: {
      type: Number,
      required: [true, 'GPS latitude is required'],
      min: -90,
      max: 90
    },
    lng: {
      type: Number,
      required: [true, 'GPS longitude is required'],
      min: -180,
      max: 180
    },
    accuracy: {
      type: Number,
      min: 0,
      max: 1000
    }
  },
  deviceInfo: {
    userAgent: String,
    platform: String,
    ipAddress: String
  },
  locationValidation: {
    isValid: {
      type: Boolean,
      default: false
    },
    distanceFromVisit: {
      type: Number, // in meters
      min: 0
    },
    isWithinRadius: {
      type: Boolean,
      default: false
    },
    validationMessage: String
  },
  status: {
    type: String,
    enum: ['PRESENT', 'LATE', 'ABSENT', 'LEFT_EARLY'],
    default: 'PRESENT'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verificationMethod: {
    type: String,
    enum: ['QR_SCAN', 'MANUAL', 'GPS_AUTO'],
    default: 'QR_SCAN'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
attendanceSchema.index({ studentId: 1, visitId: 1 }, { unique: true });
attendanceSchema.index({ visitId: 1, checkInAt: 1 });
attendanceSchema.index({ studentId: 1, checkInAt: 1 });
attendanceSchema.index({ status: 1 });

// Virtual for duration
attendanceSchema.virtual('duration').get(function() {
  if (this.checkInAt && this.checkOutAt) {
    return this.checkOutAt - this.checkInAt;
  }
  return null;
});

// Method to validate GPS location
attendanceSchema.methods.validateGPSLocation = function(visitLocation) {
  if (!visitLocation || !visitLocation.coordinates) {
    this.locationValidation = {
      isValid: false,
      distanceFromVisit: null,
      isWithinRadius: false,
      validationMessage: 'Visit location not available'
    };
    return false;
  }

  // Calculate distance using Haversine formula
  const R = 6371e3; // Earth's radius in meters
  const φ1 = this.gpsLocation.lat * Math.PI / 180;
  const φ2 = visitLocation.coordinates.lat * Math.PI / 180;
  const Δφ = (visitLocation.coordinates.lat - this.gpsLocation.lat) * Math.PI / 180;
  const Δλ = (visitLocation.coordinates.lng - this.gpsLocation.lng) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  const distance = R * c;
  const radius = visitLocation.radius || 100; // default 100 meters

  this.locationValidation = {
    isValid: true,
    distanceFromVisit: Math.round(distance),
    isWithinRadius: distance <= radius,
    validationMessage: distance <= radius ? 
      'Location verified' : 
      `Location ${Math.round(distance)}m away from visit location (max: ${radius}m)`
  };

  return this.locationValidation.isWithinRadius;
};

// Method to check out
attendanceSchema.methods.checkOut = function() {
  this.checkOutAt = new Date();
  
  // Update status based on duration
  if (this.duration) {
    const visit = this.visitId; // This would need to be populated
    if (visit && this.checkOutAt < visit.endTime) {
      this.status = 'LEFT_EARLY';
    }
  }
  
  return this;
};

// Pre-save middleware to validate location
attendanceSchema.pre('save', async function(next) {
  if (this.isModified('gpsLocation')) {
    try {
      const visit = await mongoose.model('IndustrialVisit').findById(this.visitId);
      if (visit && visit.location) {
        this.validateGPSLocation(visit.location);
      }
    } catch (error) {
      console.error('Error validating GPS location:', error);
    }
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);

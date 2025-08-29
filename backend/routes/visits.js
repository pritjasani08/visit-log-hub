const express = require('express');
const { body, validationResult } = require('express-validator');
const IndustrialVisit = require('../models/IndustrialVisit');
const { auth, authorizeStudent, authorizeCompanyOrAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/visits
// @desc    Create a new industrial visit
// @access  Private (Students only)
router.post('/', [
  auth,
  authorizeStudent,
  body('companyName', 'Company name is required').notEmpty().trim(),
  body('visitDate', 'Visit date is required').isISO8601(),
  body('purpose', 'Purpose must be at least 3 characters').isLength({ min: 3 }),
  body('startTime', 'Start time is required').isISO8601(),
  body('endTime', 'End time is required').isISO8601()
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errors.array()
      });
    }

    const { companyName, visitDate, purpose, startTime, endTime, location, extraQuestions } = req.body;

    // Validate that end time is after start time
    if (new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    // Validate that visit date is not in the past
    const visitDateObj = new Date(visitDate);
    if (visitDateObj < new Date().setHours(0, 0, 0, 0)) {
      return res.status(400).json({
        success: false,
        message: 'Visit date cannot be in the past'
      });
    }

    // Create new visit
    const visit = new IndustrialVisit({
      studentId: req.user.id,
      companyName,
      visitDate: visitDateObj,
      purpose,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      location,
      extraQuestions
    });

    // Generate QR token
    const qrToken = visit.generateQRToken();

    await visit.save();

    res.status(201).json({
      success: true,
      message: 'Industrial visit created successfully',
      data: {
        visit: {
          id: visit._id,
          companyName: visit.companyName,
          visitDate: visit.visitDate,
          purpose: visit.purpose,
          startTime: visit.startTime,
          endTime: visit.endTime,
          status: visit.status,
          qrCode: visit.qrCode,
          createdAt: visit.createdAt
        },
        qrToken
      }
    });

  } catch (error) {
    console.error('Create visit error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating visit'
    });
  }
});

// @route   GET /api/visits
// @desc    Get all visits for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, companyName } = req.query;
    const skip = (page - 1) * limit;

    // Build query based on user role
    let query = {};
    
    if (req.user.role === 'STUDENT') {
      query.studentId = req.user.id;
    } else if (req.user.role === 'COMPANY') {
      // Company users can see visits to their company
      if (companyName) {
        query.companyName = { $regex: companyName, $options: 'i' };
      }
    }

    if (status) {
      query.status = status;
    }

    const visits = await IndustrialVisit.find(query)
      .populate('studentId', 'firstName lastName email mobileNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await IndustrialVisit.countDocuments(query);

    res.json({
      success: true,
      data: {
        visits,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalVisits: total,
          hasNext: skip + visits.length < total,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get visits error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching visits'
    });
  }
});

// @route   GET /api/visits/:id
// @desc    Get a specific visit by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const visit = await IndustrialVisit.findById(req.params.id)
      .populate('studentId', 'firstName lastName email mobileNumber')
      .populate('extraQuestions');

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Visit not found'
      });
    }

    // Check if user has access to this visit
    if (req.user.role === 'STUDENT' && visit.studentId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this visit'
      });
    }

    res.json({
      success: true,
      data: { visit }
    });

  } catch (error) {
    console.error('Get visit error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching visit'
    });
  }
});

// @route   PUT /api/visits/:id
// @desc    Update a visit
// @access  Private (Visit owner only)
router.put('/:id', [
  auth,
  authorizeStudent,
  body('companyName', 'Company name is required').notEmpty().trim(),
  body('purpose', 'Purpose must be at least 3 characters').isLength({ min: 3 }),
  body('startTime', 'Start time is required').isISO8601(),
  body('endTime', 'End time is required').isISO8601()
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errors.array()
      });
    }

    const visit = await IndustrialVisit.findById(req.params.id);

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Visit not found'
      });
    }

    // Check if user owns this visit
    if (visit.studentId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this visit'
      });
    }

    // Check if visit can be updated (not completed)
    if (visit.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update completed visit'
      });
    }

    const { companyName, purpose, startTime, endTime, location, extraQuestions } = req.body;

    // Validate that end time is after start time
    if (new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    // Update visit
    const updatedVisit = await IndustrialVisit.findByIdAndUpdate(
      req.params.id,
      {
        companyName,
        purpose,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        location,
        extraQuestions
      },
      { new: true, runValidators: true }
    ).populate('studentId', 'firstName lastName email mobileNumber');

    res.json({
      success: true,
      message: 'Visit updated successfully',
      data: { visit: updatedVisit }
    });

  } catch (error) {
    console.error('Update visit error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating visit'
    });
  }
});

// @route   DELETE /api/visits/:id
// @desc    Delete a visit
// @access  Private (Visit owner only)
router.delete('/:id', [auth, authorizeStudent], async (req, res) => {
  try {
    const visit = await IndustrialVisit.findById(req.params.id);

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Visit not found'
      });
    }

    // Check if user owns this visit
    if (visit.studentId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this visit'
      });
    }

    // Check if visit can be deleted (not active or completed)
    if (visit.status === 'ACTIVE' || visit.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete active or completed visit'
      });
    }

    await IndustrialVisit.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Visit deleted successfully'
    });

  } catch (error) {
    console.error('Delete visit error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting visit'
    });
  }
});

// @route   POST /api/visits/:id/regenerate-qr
// @desc    Regenerate QR code for a visit
// @access  Private (Visit owner only)
router.post('/:id/regenerate-qr', [auth, authorizeStudent], async (req, res) => {
  try {
    const visit = await IndustrialVisit.findById(req.params.id);

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: 'Visit not found'
      });
    }

    // Check if user owns this visit
    if (visit.studentId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this visit'
      });
    }

    // Generate new QR token
    const qrToken = visit.generateQRToken();
    await visit.save();

    res.json({
      success: true,
      message: 'QR code regenerated successfully',
      data: {
        qrCode: visit.qrCode,
        qrToken
      }
    });

  } catch (error) {
    console.error('Regenerate QR error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while regenerating QR code'
    });
  }
});

module.exports = router;

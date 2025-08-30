const express = require('express');
const router = express.Router();
const {
  generateStyledQR,
  generateQRByType,
  generateMultipleStyles,
  generateQRWithLogo,
  validateQRData
} = require('../lib/qrGenerator');

/**
 * @route   GET /api/qr-demo/styles
 * @desc    Get all available QR code styles
 * @access  Public
 */
router.get('/styles', (req, res) => {
  const styles = [
    {
      name: 'default',
      description: 'Classic black and white QR code',
      colors: { dark: '#1F2937', light: '#FFFFFF' }
    },
    {
      name: 'rounded',
      description: 'Blue rounded style QR code',
      colors: { dark: '#3B82F6', light: '#F3F4F6' }
    },
    {
      name: 'gradient',
      description: 'Purple gradient style QR code',
      colors: { dark: '#8B5CF6', light: '#FEF3C7' }
    },
    {
      name: 'corporate',
      description: 'Professional green corporate style',
      colors: { dark: '#059669', light: '#ECFDF5' }
    },
    {
      name: 'dark',
      description: 'Dark theme with white QR code',
      colors: { dark: '#FFFFFF', light: '#1F2937' }
    },
    {
      name: 'colorful',
      description: 'Vibrant red and yellow style',
      colors: { dark: '#EF4444', light: '#FEF3C7' }
    }
  ];

  res.json({
    success: true,
    styles,
    totalStyles: styles.length
  });
});

/**
 * @route   POST /api/qr-demo/generate
 * @desc    Generate QR code with custom style
 * @access  Public
 */
router.post('/generate', async (req, res) => {
  try {
    const { data, style = 'default', options = {} } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        message: 'Data is required to generate QR code'
      });
    }

    const qrResult = await generateStyledQR(data, { style, ...options });

    if (!qrResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate QR code',
        error: qrResult.error
      });
    }

    res.json({
      success: true,
      message: 'QR code generated successfully',
      qrCode: qrResult
    });

  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/qr-demo/generate-type
 * @desc    Generate QR code by specific type
 * @access  Public
 */
router.post('/generate-type', async (req, res) => {
  try {
    const { type, data, options = {} } = req.body;

    if (!type || !data) {
      return res.status(400).json({
        success: false,
        message: 'Type and data are required'
      });
    }

    const validTypes = ['attendance', 'feedback', 'event', 'company', 'student', 'custom'];
    
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid type. Must be one of: ${validTypes.join(', ')}`
      });
    }

    const qrResult = await generateQRByType(type, data, options);

    if (!qrResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate QR code',
        error: qrResult.error
      });
    }

    res.json({
      success: true,
      message: `${type} QR code generated successfully`,
      qrCode: qrResult
    });

  } catch (error) {
    console.error('Error generating typed QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/qr-demo/generate-all-styles
 * @desc    Generate QR code in all available styles
 * @access  Public
 */
router.post('/generate-all-styles', async (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        message: 'Data is required to generate QR codes'
      });
    }

    const qrResults = await generateMultipleStyles(data);

    if (!qrResults.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate QR codes',
        error: qrResults.error
      });
    }

    res.json({
      success: true,
      message: 'All style QR codes generated successfully',
      results: qrResults
    });

  } catch (error) {
    console.error('Error generating all styles:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/qr-demo/generate-with-logo
 * @desc    Generate QR code with logo (placeholder)
 * @access  Public
 */
router.post('/generate-with-logo', async (req, res) => {
  try {
    const { data, logo, options = {} } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        message: 'Data is required to generate QR code'
      });
    }

    const qrResult = await generateQRWithLogo(data, { logo, ...options });

    if (!qrResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate QR code with logo',
        error: qrResult.error
      });
    }

    res.json({
      success: true,
      message: 'QR code with logo generated successfully',
      qrCode: qrResult
    });

  } catch (error) {
    console.error('Error generating QR code with logo:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/qr-demo/validate
 * @desc    Validate QR code data
 * @access  Public
 */
router.post('/validate', (req, res) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: 'QR data is required for validation'
      });
    }

    const validationResult = validateQRData(qrData);

    res.json({
      success: true,
      validation: validationResult
    });

  } catch (error) {
    console.error('Error validating QR data:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/qr-demo/examples
 * @desc    Get example data for different QR types
 * @access  Public
 */
router.get('/examples', (req, res) => {
  const examples = {
    attendance: {
      visitId: 'visit_123',
      studentId: 'student_456',
      location: 'Main Building',
      companyName: 'Tech Corp'
    },
    feedback: {
      visitId: 'visit_123',
      studentId: 'student_456',
      feedbackType: 'company_visit',
      rating: 5
    },
    event: {
      eventId: 'event_789',
      eventName: 'Industrial Visit to Tech Corp',
      date: '2024-01-15',
      location: 'Tech Corp HQ'
    },
    company: {
      companyId: 'company_101',
      companyName: 'Tech Corp',
      purpose: 'Industrial Visit',
      industry: 'Technology'
    },
    student: {
      studentId: 'student_456',
      studentName: 'John Doe',
      rollNumber: 'CS2024001',
      department: 'Computer Science'
    }
  };

  res.json({
    success: true,
    examples,
    message: 'Use these examples to test different QR code types'
  });
});

module.exports = router;

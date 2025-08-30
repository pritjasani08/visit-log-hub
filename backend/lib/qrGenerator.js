const QRCode = require('qrcode');
const crypto = require('crypto');

/**
 * Generate enhanced unique QR code with multiple layers of uniqueness
 * @param {Object} visitData - Visit information
 * @param {Object} qrCodeData - QR code data from database
 * @returns {Promise<Object>} - QR code image and data
 */
const generateEnhancedQR = async (visitData, qrCodeData) => {
  try {
    // Create additional unique elements
    const timestamp = Date.now();
    const randomId = crypto.randomBytes(8).toString('hex');
    const sessionHash = crypto.createHash('md5').update(`${qrCodeData.token}-${timestamp}`).digest('hex').substring(0, 12);
    
    // Enhanced QR data with maximum uniqueness
    const enhancedQRData = {
      ...qrCodeData.qrData,
      enhancedTimestamp: timestamp,
      randomId: randomId,
      sessionHash: sessionHash,
      uniqueIdentifier: `${visitData.companyName.substring(0, 3).toUpperCase()}-${timestamp}-${randomId}`,
      qrVersion: '2.0',
      securityLevel: 'HIGH',
      generatedAt: new Date().toISOString(),
      checksum: crypto.createHash('sha256').update(JSON.stringify(qrCodeData.qrData)).digest('hex').substring(0, 16)
    };

    // Generate QR code image
    const qrImageUrl = await QRCode.toDataURL(JSON.stringify(enhancedQRData), {
      width: 512,
      margin: 2,
      color: {
        dark: '#1F2937',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H', // Highest error correction
      version: 10 // Larger QR code for more data
    });

    // Generate QR code as SVG for better quality
    const qrSvg = await QRCode.toString(JSON.stringify(enhancedQRData), {
      type: 'svg',
      width: 512,
      margin: 2,
      color: {
        dark: '#1F2937',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H'
    });

    return {
      success: true,
      qrImageUrl,
      qrSvg,
      enhancedData: enhancedQRData,
      uniqueness: {
        token: qrCodeData.token,
        timestamp: timestamp,
        randomId: randomId,
        sessionHash: sessionHash,
        checksum: enhancedQRData.checksum
      }
    };

  } catch (error) {
    console.error('Error generating enhanced QR code:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate a completely new unique QR code for existing visits
 * @param {Object} visitData - Visit information
 * @returns {Promise<Object>} - New QR code data
 */
const generateNewUniqueQR = async (visitData) => {
  try {
    const timestamp = Date.now();
    const randomBytes = crypto.randomBytes(16).toString('hex');
    const visitId = visitData._id.toString();
    const studentId = visitData.studentId.toString();
    
    // Create completely new unique token
    const uniqueString = `NEW-${timestamp}-${randomBytes}-${visitId}-${studentId}-${Math.random()}`;
    const newToken = crypto.createHash('sha256').update(uniqueString).digest('hex');
    
    // New QR data structure
    const newQRData = {
      token: newToken,
      visitId: visitId,
      studentId: studentId,
      timestamp: timestamp,
      randomId: randomBytes,
      companyName: visitData.companyName,
      visitDate: visitData.visitDate,
      purpose: visitData.purpose,
      uniqueHash: crypto.createHash('md5').update(`${newToken}-${timestamp}`).digest('hex').substring(0, 8),
      isNewGeneration: true,
      generationCount: (visitData.qrCode?.qrData?.generationCount || 0) + 1,
      newSessionId: `NEW-SESSION-${timestamp}-${randomBytes.substring(0, 8)}`
    };

    return {
      success: true,
      newToken,
      newQRData,
      uniqueness: {
        newToken,
        timestamp,
        randomId: randomBytes,
        sessionId: newQRData.newSessionId
      }
    };

  } catch (error) {
    console.error('Error generating new unique QR code:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate QR code with custom styling and colors
 * @param {Object} data - Data to encode
 * @param {Object} options - Styling options
 * @returns {Promise<Object>} - Styled QR code
 */
const generateStyledQR = async (data, options = {}) => {
  try {
    const defaultOptions = {
      width: 512,
      margin: 2,
      color: {
        dark: '#1F2937',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H',
      version: 10,
      style: 'default'
    };

    const finalOptions = { ...defaultOptions, ...options };

    // Apply different styles
    let qrOptions = { ...finalOptions };
    
    switch (finalOptions.style) {
      case 'rounded':
        qrOptions.margin = 4;
        qrOptions.color.dark = '#3B82F6';
        qrOptions.color.light = '#F3F4F6';
        break;
      case 'gradient':
        qrOptions.color.dark = '#8B5CF6';
        qrOptions.color.light = '#FEF3C7';
        break;
      case 'corporate':
        qrOptions.color.dark = '#059669';
        qrOptions.color.light = '#ECFDF5';
        break;
      case 'dark':
        qrOptions.color.dark = '#FFFFFF';
        qrOptions.color.light = '#1F2937';
        break;
      case 'colorful':
        qrOptions.color.dark = '#EF4444';
        qrOptions.color.light = '#FEF3C7';
        break;
      default:
        break;
    }

    const qrImageUrl = await QRCode.toDataURL(JSON.stringify(data), qrOptions);
    const qrSvg = await QRCode.toString(JSON.stringify(data), { ...qrOptions, type: 'svg' });

    return {
      success: true,
      qrImageUrl,
      qrSvg,
      style: finalOptions.style,
      options: qrOptions
    };

  } catch (error) {
    console.error('Error generating styled QR code:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate QR code for different use cases
 * @param {string} type - Type of QR code
 * @param {Object} data - Data to encode
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Generated QR code
 */
const generateQRByType = async (type, data, options = {}) => {
  try {
    let qrData = {};
    let qrOptions = { ...options };

    switch (type) {
      case 'attendance':
        qrData = {
          type: 'attendance',
          visitId: data.visitId,
          studentId: data.studentId,
          timestamp: Date.now(),
          action: 'check-in',
          location: data.location || 'default',
          ...data
        };
        qrOptions.style = 'corporate';
        break;

      case 'feedback':
        qrData = {
          type: 'feedback',
          visitId: data.visitId,
          studentId: data.studentId,
          feedbackType: data.feedbackType || 'general',
          timestamp: Date.now(),
          ...data
        };
        qrOptions.style = 'rounded';
        break;

      case 'event':
        qrData = {
          type: 'event',
          eventId: data.eventId,
          eventName: data.eventName,
          date: data.date,
          location: data.location,
          timestamp: Date.now(),
          ...data
        };
        qrOptions.style = 'gradient';
        break;

      case 'company':
        qrData = {
          type: 'company',
          companyId: data.companyId,
          companyName: data.companyName,
          visitPurpose: data.purpose,
          timestamp: Date.now(),
          ...data
        };
        qrOptions.style = 'corporate';
        break;

      case 'student':
        qrData = {
          type: 'student',
          studentId: data.studentId,
          studentName: data.studentName,
          rollNumber: data.rollNumber,
          timestamp: Date.now(),
          ...data
        };
        qrOptions.style = 'rounded';
        break;

      default:
        qrData = {
          type: 'custom',
          data: data,
          timestamp: Date.now()
        };
        qrOptions.style = 'default';
    }

    return await generateStyledQR(qrData, qrOptions);

  } catch (error) {
    console.error('Error generating QR by type:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate multiple QR codes with different styles
 * @param {Object} data - Data to encode
 * @returns {Promise<Object>} - Multiple styled QR codes
 */
const generateMultipleStyles = async (data) => {
  try {
    const styles = ['default', 'rounded', 'gradient', 'corporate', 'dark', 'colorful'];
    const results = {};

    for (const style of styles) {
      const result = await generateStyledQR(data, { style });
      if (result.success) {
        results[style] = result;
      }
    }

    return {
      success: true,
      styles: results,
      totalStyles: Object.keys(results).length
    };

  } catch (error) {
    console.error('Error generating multiple styles:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate QR code with logo overlay (placeholder for future enhancement)
 * @param {Object} data - Data to encode
 * @param {Object} options - Options including logo
 * @returns {Promise<Object>} - QR code with logo
 */
const generateQRWithLogo = async (data, options = {}) => {
  try {
    // For now, return a styled QR code
    // In the future, this can be enhanced with actual logo overlay
    const result = await generateStyledQR(data, { ...options, style: 'corporate' });
    
    return {
      ...result,
      hasLogo: options.logo ? true : false,
      logoInfo: options.logo || 'No logo specified'
    };

  } catch (error) {
    console.error('Error generating QR with logo:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Validate QR code data
 * @param {Object} qrData - QR code data to validate
 * @returns {Object} - Validation result
 */
const validateQRData = (qrData) => {
  try {
    const requiredFields = ['type', 'timestamp'];
    const missingFields = requiredFields.filter(field => !qrData[field]);
    
    if (missingFields.length > 0) {
      return {
        valid: false,
        missingFields,
        message: `Missing required fields: ${missingFields.join(', ')}`
      };
    }

    // Check if timestamp is recent (within 24 hours)
    const now = Date.now();
    const qrTime = new Date(qrData.timestamp).getTime();
    const timeDiff = now - qrTime;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (timeDiff > maxAge) {
      return {
        valid: false,
        message: 'QR code has expired',
        age: Math.floor(timeDiff / (1000 * 60 * 60)) + ' hours'
      };
    }

    return {
      valid: true,
      message: 'QR code data is valid',
      age: Math.floor(timeDiff / (1000 * 60)) + ' minutes'
    };

  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
};

module.exports = {
  generateEnhancedQR,
  generateNewUniqueQR,
  generateStyledQR,
  generateQRByType,
  generateMultipleStyles,
  generateQRWithLogo,
  validateQRData
};

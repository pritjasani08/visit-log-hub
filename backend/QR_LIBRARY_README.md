# 🔐 InTrack QR Code Library

A comprehensive QR code generation library with multiple styles, types, and customization options for the InTrack system.

## ✨ Features

- **6 Different QR Code Styles**: Default, Rounded, Gradient, Corporate, Dark, Colorful
- **5 QR Code Types**: Attendance, Feedback, Event, Company, Student
- **Custom Styling**: Custom colors, margins, error correction levels
- **Multiple Formats**: PNG (Data URL) and SVG output
- **Validation**: Built-in QR data validation with expiry checking
- **Logo Support**: Placeholder for future logo overlay functionality

## 🚀 Quick Start

### 1. Basic Usage

```javascript
const { generateStyledQR } = require('./lib/qrGenerator');

// Generate a simple QR code
const qrResult = await generateStyledQR(
  { message: "Hello World" },
  { style: 'corporate' }
);

console.log(qrResult.qrImageUrl); // Data URL for PNG
console.log(qrResult.qrSvg);      // SVG string
```

### 2. Generate by Type

```javascript
const { generateQRByType } = require('./lib/qrGenerator');

// Generate attendance QR code
const attendanceQR = await generateQRByType('attendance', {
  visitId: 'visit_123',
  studentId: 'student_456',
  location: 'Main Building'
});
```

### 3. Generate All Styles

```javascript
const { generateMultipleStyles } = require('./lib/qrGenerator');

// Generate the same data in all available styles
const allStyles = await generateMultipleStyles({
  message: "Generate all styles"
});

// Access individual styles
console.log(allStyles.styles.default.qrImageUrl);
console.log(allStyles.styles.corporate.qrImageUrl);
```

## 🎨 Available Styles

| Style | Description | Colors |
|-------|-------------|---------|
| `default` | Classic black and white | Dark: #1F2937, Light: #FFFFFF |
| `rounded` | Blue rounded style | Dark: #3B82F6, Light: #F3F4F6 |
| `gradient` | Purple gradient style | Dark: #8B5CF6, Light: #FEF3C7 |
| `corporate` | Professional green | Dark: #059669, Light: #ECFDF5 |
| `dark` | Dark theme with white QR | Dark: #FFFFFF, Light: #1F2937 |
| `colorful` | Vibrant red and yellow | Dark: #EF4444, Light: #FEF3C7 |

## 🏷️ QR Code Types

### 1. Attendance QR
```javascript
{
  type: 'attendance',
  visitId: 'visit_123',
  studentId: 'student_456',
  timestamp: Date.now(),
  action: 'check-in',
  location: 'Main Building'
}
```

### 2. Feedback QR
```javascript
{
  type: 'feedback',
  visitId: 'visit_123',
  studentId: 'student_456',
  feedbackType: 'company_visit',
  timestamp: Date.now()
}
```

### 3. Event QR
```javascript
{
  type: 'event',
  eventId: 'event_789',
  eventName: 'Industrial Visit to Tech Corp',
  date: '2024-01-15',
  location: 'Tech Corp HQ',
  timestamp: Date.now()
}
```

### 4. Company QR
```javascript
{
  type: 'company',
  companyId: 'company_101',
  companyName: 'Tech Corp',
  visitPurpose: 'Industrial Visit',
  timestamp: Date.now()
}
```

### 5. Student QR
```javascript
{
  type: 'student',
  studentId: 'student_456',
  studentName: 'John Doe',
  rollNumber: 'CS2024001',
  timestamp: Date.now()
}
```

## 🔧 API Endpoints

### Demo Routes (`/api/qr-demo`)

- `GET /styles` - Get all available QR styles
- `POST /generate` - Generate custom QR code
- `POST /generate-type` - Generate typed QR code
- `POST /generate-all-styles` - Generate in all styles
- `POST /generate-with-logo` - Generate with logo (placeholder)
- `POST /validate` - Validate QR data
- `GET /examples` - Get example data templates

### Example API Calls

```bash
# Get available styles
curl http://localhost:5000/api/qr-demo/styles

# Generate custom QR
curl -X POST http://localhost:5000/api/qr-demo/generate \
  -H "Content-Type: application/json" \
  -d '{"data": {"message": "Hello"}, "style": "corporate"}'

# Generate attendance QR
curl -X POST http://localhost:5000/api/qr-demo/generate-type \
  -H "Content-Type: application/json" \
  -d '{"type": "attendance", "data": {"visitId": "123", "studentId": "456"}}'
```

## 🎯 Demo Page

Access the interactive demo page at:
```
http://localhost:5000/qr-demo.html
```

This page allows you to:
- Test all QR code styles
- Generate different types of QR codes
- See real-time previews
- Validate QR data
- View examples and templates

## ⚙️ Configuration Options

### QR Code Options

```javascript
const options = {
  width: 512,                    // QR code width in pixels
  margin: 2,                     // Margin around QR code
  color: {
    dark: '#1F2937',            // Dark color (QR code)
    light: '#FFFFFF'            // Light color (background)
  },
  errorCorrectionLevel: 'H',    // Error correction level (L, M, Q, H)
  version: 10,                  // QR code version (1-40)
  style: 'default'              // Predefined style
};
```

### Error Correction Levels

- `L` (Low): 7% recovery capacity
- `M` (Medium): 15% recovery capacity
- `Q` (Quartile): 25% recovery capacity
- `H` (High): 30% recovery capacity (recommended)

## ✅ Validation

The library includes built-in validation:

```javascript
const { validateQRData } = require('./lib/qrGenerator');

const validation = validateQRData(qrData);
console.log(validation.valid);        // true/false
console.log(validation.message);      // Validation message
console.log(validation.age);          // Age of QR code
```

### Validation Rules

- Requires `type` and `timestamp` fields
- Checks if QR code is expired (24 hours)
- Returns detailed validation information

## 🔮 Future Enhancements

- **Logo Overlay**: Add company logos to QR codes
- **Custom Patterns**: More styling patterns and themes
- **Batch Generation**: Generate multiple QR codes at once
- **Export Options**: PDF, EPS, and other formats
- **Advanced Styling**: Gradients, shadows, and effects

## 🐛 Troubleshooting

### Common Issues

1. **Port 5000 in use**: Kill existing processes or change PORT environment variable
2. **MongoDB connection**: Ensure MongoDB is running on localhost:27017
3. **CORS errors**: Check FRONTEND_URL environment variable

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

## 📚 Dependencies

- `qrcode`: QR code generation
- `crypto`: Cryptographic functions for uniqueness
- `express`: Web framework for API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

**Happy QR Coding! 🎉**

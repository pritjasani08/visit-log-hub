# InTrack Backend API

A comprehensive Node.js backend for the InTrack Smart Attendance & Feedback System, designed to manage industrial visits, QR code generation, attendance tracking, and feedback collection.

## 🚀 Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Student, Company, Admin)
  - Secure password hashing with bcrypt

- **Industrial Visit Management**
  - Create, read, update, delete visits
  - Automatic QR code generation
  - Visit status management (Pending, Active, Completed)

- **Attendance Tracking**
  - GPS-based location validation
  - QR code scanning for check-in
  - Real-time attendance status

- **Feedback System**
  - Star ratings and text feedback
  - Sentiment analysis
  - Dynamic question support

- **Security Features**
  - Input validation and sanitization
  - Rate limiting
  - CORS protection
  - Helmet security headers

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express-validator
- **Security**: Helmet, bcryptjs
- **QR Code**: qrcode library
- **File Upload**: Multer

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   
   MONGODB_URI=mongodb://localhost:27017/intrack
   
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

4. **Start MongoDB**
   ```bash
   # Start MongoDB service
   mongod
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - User logout
- `POST /api/auth/change-password` - Change password

### Industrial Visits
- `POST /api/visits` - Create new visit
- `GET /api/visits` - Get all visits
- `GET /api/visits/:id` - Get specific visit
- `PUT /api/visits/:id` - Update visit
- `DELETE /api/visits/:id` - Delete visit
- `POST /api/visits/:id/regenerate-qr` - Regenerate QR code

### Attendance
- `POST /api/attendance/checkin` - Mark attendance
- `GET /api/attendance/visit/:visitId` - Get attendance for visit
- `GET /api/attendance/student/:studentId` - Get student attendance

### Feedback
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback/visit/:visitId` - Get feedback for visit
- `GET /api/feedback/student/:studentId` - Get student feedback

### Admin
- `GET /api/admin/analytics` - Get system analytics
- `GET /api/admin/visits` - Get all visits (admin view)
- `PUT /api/admin/settings` - Update system settings

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

## 📊 Database Models

### User
- Basic info (name, email, mobile)
- Role-based access control
- Password hashing
- Profile management

### IndustrialVisit
- Visit details (company, date, purpose)
- QR code generation
- Status management
- Location settings

### Attendance
- Check-in/out tracking
- GPS validation
- Device information
- Location verification

### Feedback
- Star ratings
- Text feedback
- Sentiment analysis
- Dynamic questions

## 🚨 Error Handling

The API uses consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Validation errors if any
}
```

## 🔒 Security Features

- **Input Validation**: All inputs are validated and sanitized
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers for protection
- **JWT**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/intrack` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRE` | JWT expiration time | `7d` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📦 Production Deployment

1. **Set environment variables**
   ```bash
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your-production-mongodb-uri
   JWT_SECRET=your-production-jwt-secret
   ```

2. **Build and start**
   ```bash
   npm start
   ```

3. **Use PM2 for process management**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "intrack-backend"
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Updates

- **v1.0.0**: Initial release with core functionality
- Authentication and user management
- Industrial visit management
- QR code generation
- Attendance tracking
- Feedback system
- Admin analytics

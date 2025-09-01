export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  role: Role;
  createdAt: string;
}

export type Role = 'STUDENT' | 'COMPANY' | 'ADMIN';

export interface IndustrialVisit {
  id: string;
  studentId: string;
  companyName: string;
  visitDate: string;
  purpose: string;
  startTime: string;
  endTime: string;
  location: string;
  companyAddress?: string;
  qrCode: string;
  createdAt: string;
  updatedAt: string;
  attendanceCount?: number;
  feedbackCount?: number;
  averageRating?: number;
  extraQuestions?: Array<{
    id: string;
    label: string;
    required?: boolean;
    type?: 'text' | 'textarea' | 'checkbox';
  }>;
}

export interface Attendance {
  id: string;
  visitId: string;
  studentId: string;
  checkInAt: string;
  gpsLat: number;
  gpsLng: number;
  gpsAccuracy?: number;
  userAgent?: string;
  isValidGPS: boolean;
  student?: User;
  visit?: IndustrialVisit;
}

export interface Feedback {
  id: string;
  studentId: string;
  visitId: string;
  starsContent: number;
  starsDelivery: number;
  starsRelevance: number;
  recommend: boolean;
  shortAnswer?: string;
  longAnswer?: string;
  sentiment?: number;
  createdAt: string;
  updatedAt: string;
  student?: User;
  visit?: IndustrialVisit;
  extraResponses?: Record<string, string | boolean>;
}

export interface QRToken {
  visitId: string;
  nonce: string;
  exp: number;
  iat: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

export interface AttendanceCheckIn {
  qrToken: string;
  gpsLat: number;
  gpsLng: number;
  deviceTime: string;
}

export interface FeedbackSubmission {
  visitId: string;
  starsContent: number;
  starsDelivery: number;
  starsRelevance: number;
  recommend: boolean;
  shortAnswer?: string;
  longAnswer?: string;
}

export interface AnalyticsData {
  totalVisits: number;
  activeSessions: number;
  attendanceRate: number;
  averageRating: number;
  attendanceOverTime: Array<{
    date: string;
    count: number;
  }>;
  ratingsDistribution: Array<{
    rating: number;
    count: number;
  }>;
  topKeywords: Array<{
    word: string;
    count: number;
  }>;
  sentimentAnalysis: Array<{
    sentiment: 'positive' | 'neutral' | 'negative';
    count: number;
    percentage: number;
  }>;
}
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  createdAt: string;
}

export type Role = 'STUDENT' | 'ADMIN' | 'COMPANY_VIEWER';

export interface Event {
  id: string;
  title: string;
  description?: string;
  companyName?: string;
  locationLat: number;
  locationLng: number;
  radiusMeters: number;
  startTime: string;
  endTime: string;
  createdById: string;
  qrNonce?: string;
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
  userId: string;
  eventId: string;
  checkInAt: string;
  gpsLat: number;
  gpsLng: number;
  gpsAccuracy?: number;
  userAgent?: string;
  isValidGPS: boolean;
  user?: User;
  event?: Event;
}

export interface Feedback {
  id: string;
  userId: string;
  eventId: string;
  starsContent: number;
  starsDelivery: number;
  starsRelevance: number;
  recommend: boolean;
  shortAnswer?: string;
  longAnswer?: string;
  sentiment?: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
  event?: Event;
  extraResponses?: Record<string, string | boolean>;
}

export interface QRToken {
  eventId: string;
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
  eventId: string;
  starsContent: number;
  starsDelivery: number;
  starsRelevance: number;
  recommend: boolean;
  shortAnswer?: string;
  longAnswer?: string;
}

export interface AnalyticsData {
  totalEvents: number;
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
}
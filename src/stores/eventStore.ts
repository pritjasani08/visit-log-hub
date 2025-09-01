import { create } from 'zustand';
import { IndustrialVisit, Attendance, Feedback, AnalyticsData } from '@/types';

interface VisitStore {
  visits: IndustrialVisit[];
  currentVisit: IndustrialVisit | null;
  attendances: Attendance[];
  feedbacks: Feedback[];
  qrToken: string | null;
  qrExpiry: Date | null;
  analytics: AnalyticsData | null;

  // Actions
  loadVisits: () => Promise<void>;
  createVisit: (visit: Omit<IndustrialVisit, 'id' | 'createdAt' | 'updatedAt' | 'qrCode'>) => Promise<IndustrialVisit>;
  updateVisit: (id: string, updates: Partial<IndustrialVisit>) => Promise<IndustrialVisit>;
  deleteVisit: (id: string) => Promise<void>;
  setCurrentVisit: (visit: IndustrialVisit | null) => void;
  generateQR: (visitId: string) => Promise<{ token: string; expiry: Date }>;
  rotateQR: (visitId: string) => Promise<{ token: string; expiry: Date }>;
  checkIn: (qrToken: string, gpsLat: number, gpsLng: number) => Promise<boolean>;
  submitFeedback: (feedback: Omit<Feedback, 'id' | 'studentId' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  loadAnalytics: (visitId: string) => Promise<void>;
}

// Mock data
const mockVisits: IndustrialVisit[] = [
  {
    id: '1',
    studentId: '2',
    companyName: 'TechCorp Solutions',
    visitDate: new Date().toISOString().split('T')[0],
    purpose: 'Software Development Internship',
    startTime: new Date(Date.now() + 1000 * 60 * 30).toISOString(), // 30 minutes from now
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(), // 3 hours from now
    location: 'San Francisco, CA',
    companyAddress: '123 Tech Street, San Francisco, CA 94105',
    qrCode: 'qr-techcorp-123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attendanceCount: 24,
    feedbackCount: 18,
    averageRating: 4.2,
  },
  {
    id: '2',
    studentId: '2',
    companyName: 'Industrial Dynamics Inc.',
    visitDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().split('T')[0], // Tomorrow
    purpose: 'Manufacturing Process Study',
    startTime: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // Tomorrow
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 28).toISOString(), // Tomorrow + 4 hours
    location: 'New York, NY',
    companyAddress: '456 Industry Ave, New York, NY 10001',
    qrCode: 'qr-industrial-456',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attendanceCount: 0,
    feedbackCount: 0,
    averageRating: 0,
  },
];

const mockAttendances: Attendance[] = [
  {
    id: '1',
    studentId: '2',
    visitId: '1',
    checkInAt: new Date().toISOString(),
    gpsLat: 40.7128,
    gpsLng: -74.0060,
    gpsAccuracy: 10,
    isValidGPS: true,
  },
];

const mockFeedbacks: Feedback[] = [
  {
    id: '1',
    studentId: '2',
    visitId: '1',
    starsContent: 5,
    starsDelivery: 4,
    starsRelevance: 5,
    recommend: true,
    shortAnswer: 'Great visit!',
    longAnswer: 'The visit was incredibly informative and well-structured. I learned a lot about modern tech innovations.',
    sentiment: 0.8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const useVisitStore = create<VisitStore>((set, get) => ({
  visits: [],
  currentVisit: null,
  attendances: [],
  feedbacks: [],
  qrToken: null,
  qrExpiry: null,
  analytics: null,

  loadVisits: async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    set((state) => ({ ...state, visits: mockVisits }));
  },

  createVisit: async (visitData) => {
    console.log('createVisit called with:', visitData);
    
    const newVisit: IndustrialVisit = {
      ...visitData,
      id: Math.random().toString(36).substr(2, 9),
      qrCode: `qr-${visitData.companyName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attendanceCount: 0,
      feedbackCount: 0,
      averageRating: 0,
    };
    
    console.log('New visit object:', newVisit);
    
    set((state) => ({
      ...state,
      visits: [...state.visits, newVisit]
    }));
    
    console.log('Returning new visit:', newVisit);
    return newVisit;
  },

  updateVisit: async (id, updates) => {
    const updatedVisit = { ...get().visits.find(v => v.id === id)!, ...updates, updatedAt: new Date().toISOString() };
    
    set((state) => ({
      ...state,
      visits: state.visits.map(v => v.id === id ? updatedVisit : v)
    }));
    
    return updatedVisit;
  },

  deleteVisit: async (id) => {
    set((state) => ({
      ...state,
      visits: state.visits.filter(v => v.id !== id)
    }));
  },

  setCurrentVisit: (visit) => {
    set((state) => ({
      ...state,
      currentVisit: visit
    }));
  },

  generateQR: async (visitId) => {
    const token = `qr-${visitId}-${Date.now()}`;
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    set((state) => ({
      ...state,
      qrToken: token,
      qrExpiry: expiry
    }));
    
    return { token, expiry };
  },

  rotateQR: async (visitId) => {
    return get().generateQR(visitId);
  },

  checkIn: async (qrToken, gpsLat, gpsLng) => {
    // Parse QR (supports JSON token as generated by QRGenerator)
    let parsed: { visitId?: string } = {};
    try {
      parsed = JSON.parse(qrToken);
    } catch {}
    const visitIdFromToken = parsed.visitId || qrToken.split('-')[1] || '1';

    const visit = get().visits.find(v => v.id === visitIdFromToken) || get().visits[0];
    if (!visit) return false;

    // Time window validation
    const now = Date.now();
    const starts = new Date(visit.startTime).getTime();
    const ends = new Date(visit.endTime).getTime();
    if (now < starts || now > ends) {
      return false;
    }

    const newAttendance: Attendance = {
      id: Math.random().toString(36).substr(2, 9),
      studentId: '2',
      visitId: visit.id,
      checkInAt: new Date().toISOString(),
      gpsLat,
      gpsLng,
      gpsAccuracy: 10,
      isValidGPS: true,
    };
    set((state) => ({ 
      attendances: [...state.attendances, newAttendance] 
    }));
    return true;
  },

  submitFeedback: async (feedbackData) => {
    const newFeedback: Feedback = {
      ...feedbackData,
      id: Math.random().toString(36).substr(2, 9),
      studentId: '2', // Current user
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    set((state) => ({
      ...state,
      feedbacks: [...state.feedbacks, newFeedback]
    }));
    
    return true;
  },

  loadAnalytics: async (visitId) => {
    // Mock analytics data
    const analytics: AnalyticsData = {
      totalVisits: 5,
      activeSessions: 1,
      attendanceRate: 0.85,
      averageRating: 4.2,
      attendanceOverTime: [
        { date: '2024-01-01', count: 15 },
        { date: '2024-01-02', count: 23 },
        { date: '2024-01-03', count: 18 },
        { date: '2024-01-04', count: 31 },
        { date: '2024-01-05', count: 27 },
      ],
      ratingsDistribution: [
        { rating: 1, count: 2 },
        { rating: 2, count: 3 },
        { rating: 3, count: 8 },
        { rating: 4, count: 15 },
        { rating: 5, count: 22 },
      ],
      topKeywords: [
        { word: 'informative', count: 15 },
        { word: 'engaging', count: 12 },
        { word: 'practical', count: 10 },
        { word: 'useful', count: 8 },
        { word: 'relevant', count: 7 },
      ],
      sentimentAnalysis: [
        { sentiment: 'positive', count: 35, percentage: 70 },
        { sentiment: 'neutral', count: 10, percentage: 20 },
        { sentiment: 'negative', count: 5, percentage: 10 },
      ],
    };
    
    set((state) => ({ ...state, analytics }));
  },
}));

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

// Pages
import RoleGate from "@/components/RoleGate";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import StudentHome from "@/components/student/StudentHome";
import StudentEvents from "@/components/student/StudentEvents";
import StudentAttendance from "@/components/student/StudentAttendance";
import QRScanner from "@/components/student/QRScanner";
import FeedbackForm from "@/components/student/FeedbackForm";
import AdminDashboard from "@/components/admin/AdminDashboard";
import QRGenerator from "@/components/admin/QRGenerator";
import EventCreator from "@/components/admin/EventCreator";
import EventDetails from "@/components/admin/EventDetails";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  const { selectedRole, isAuthenticated } = useAuthStore();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/" 
              element={
                isAuthenticated ? (
                  <Navigate to={`/${selectedRole?.toLowerCase().replace('_', '-')}`} replace />
                ) : (
                  <RoleGate />
                )
              } 
            />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />

            {/* Student Routes */}
            <Route 
              path="/student" 
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentHome />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/events" 
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentEvents />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/attendance" 
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentAttendance />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/scan" 
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <QRScanner />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/feedback/new" 
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <FeedbackForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/feedback/:eventId" 
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <FeedbackForm />
                </ProtectedRoute>
              } 
            />

            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/events/:eventId" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <EventDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/events/new" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <EventCreator />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/events/:eventId/qr" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <QRGenerator />
                </ProtectedRoute>
              } 
            />

            {/* Company Routes */}
            <Route 
              path="/company" 
              element={
                <ProtectedRoute allowedRoles={['COMPANY_VIEWER']}>
                  <div className="min-h-screen bg-gradient-surface flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-3xl font-bold mb-4">Company Dashboard</h1>
                      <p className="text-muted-foreground">Coming soon - View analytics and feedback</p>
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;


import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthStore } from "@/stores/authStore";
import RoleGate from "@/components/RoleGate";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import StudentHome from "@/components/student/StudentHome";
import AdminDashboard from "@/components/admin/AdminDashboard";
import CompanyDashboard from "@/components/student/QRScanner";
import StudentQRDisplay from "@/components/student/StudentQRDisplay";
import FeedbackForm from "@/components/student/FeedbackForm";
import AdminSettings from "@/components/admin/AdminSettings";
import VisitCreator from "@/components/student/VisitCreator";

const App = () => {
  const { selectedRole, isAuthenticated } = useAuthStore();

  console.log('App render - selectedRole:', selectedRole, 'isAuthenticated:', isAuthenticated);

  return (
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
          <Route path="/student" element={<StudentHome />} />
          <Route path="/student/visits/new" element={<VisitCreator />} />
          <Route path="/student/visits/:visitId/qr" element={<StudentQRDisplay />} />
          <Route path="/student/qr/:visitId" element={<StudentQRDisplay />} />
          <Route path="/student/feedback/:visitId" element={<FeedbackForm />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/settings" element={<AdminSettings />} />

          {/* Company Routes */}
          <Route path="/company" element={<CompanyDashboard />} />

          <Route path="*" element={<div>Not Found - Route not defined</div>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;

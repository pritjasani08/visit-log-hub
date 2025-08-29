
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, 
  Shield, 
  Building,
  QrCode,
  BarChart3,
  Users
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import { Role } from '@/types';

const RoleGate = () => {
  const { selectRole } = useAuthStore();
  const navigate = useNavigate();

  const handleRoleSelection = (role: Role) => {
    selectRole(role);
    navigate('/login');
  };

  const roles = [
    {
      type: 'STUDENT' as Role,
      title: "I'm a Student",
      description: 'Scan QR codes for attendance and submit feedback',
      icon: GraduationCap,
      features: ['QR Code Scanning', 'GPS Verification', 'Feedback Forms'],
      color: 'from-primary to-primary-glow'
    },
    {
      type: 'ADMIN' as Role,
      title: "I'm an Admin",
      description: 'Manage events, generate QR codes, and view analytics',
      icon: Shield,
      features: ['Event Management', 'Live QR Sessions', 'Analytics Dashboard'],
      color: 'from-secondary to-emerald-400'
    },
    {
      type: 'COMPANY_VIEWER' as Role,
      title: "Company View",
      description: 'View anonymized feedback and analytics (read-only)',
      icon: Building,
      features: ['Event Analytics', 'Feedback Reports', 'Performance Metrics'],
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-surface flex flex-col items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-primary p-3 rounded-2xl shadow-glow">
              <QrCode className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              InTrack
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Smart Attendance & Feedback System for Internship and Industrial Visits
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Card 
                key={role.type} 
                className="group hover:shadow-large transition-all duration-300 hover:-translate-y-1 border-0 shadow-medium"
              >
                <CardContent className="p-6">
                  <div className={`bg-gradient-to-br ${role.color} p-4 rounded-2xl w-fit mb-4 group-hover:shadow-glow transition-all duration-300`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2">{role.title}</h3>
                  <p className="text-muted-foreground mb-4 text-sm">{role.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    {role.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-1 h-1 bg-primary rounded-full" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={() => handleRoleSelection(role.type)}
                    className="w-full bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary transition-all duration-300 text-white border-0 shadow-medium hover:shadow-large"
                  >
                    Continue as {role.title.replace("I'm a ", "")}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features Overview */}
        <div className="text-center">
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="bg-gradient-primary p-3 rounded-full w-fit mx-auto mb-3 shadow-medium">
                <QrCode className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-sm">QR Attendance</h4>
              <p className="text-xs text-muted-foreground">Real-time scanning</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-secondary p-3 rounded-full w-fit mx-auto mb-3 shadow-medium">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-sm">Analytics</h4>
              <p className="text-xs text-muted-foreground">Detailed insights</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-3 rounded-full w-fit mx-auto mb-3 shadow-medium">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-sm">Feedback</h4>
              <p className="text-xs text-muted-foreground">Structured reviews</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleGate;

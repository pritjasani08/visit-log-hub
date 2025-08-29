
import { useNavigate } from 'react-router-dom';
import { Building, GraduationCap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';

const RoleGate = () => {
  const navigate = useNavigate();
  const { setSelectedRole } = useAuthStore();

  const handleRoleSelect = (role: 'STUDENT' | 'ADMIN' | 'COMPANY') => {
    setSelectedRole(role);
    navigate('/login');
  };

  const roles = [
    {
      id: 'STUDENT',
      title: 'Student',
      description: 'Create industrial visits and manage your attendance',
      icon: GraduationCap,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      features: [
        'Create industrial visits',
        'Generate QR codes',
        'Track attendance',
        'Submit feedback'
      ]
    },
    {
      id: 'COMPANY',
      title: 'Company',
      description: 'Scan QR codes to mark student attendance',
      icon: Building,
      color: 'text-green-600',
      bg: 'bg-green-50',
      features: [
        'Scan QR codes',
        'Mark students present',
        'View visit details',
        'Track attendance'
      ]
    },
    {
      id: 'ADMIN',
      title: 'Admin',
      description: 'Monitor analytics and performance metrics',
      icon: Shield,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      features: [
        'View attendance analytics',
        'Monitor performance',
        'Sentiment analysis',
        'Generate reports'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-surface flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            Visit Log Hub
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose your role to access the industrial visit management system
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Card 
                key={role.id} 
                className="border-0 shadow-large hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => handleRoleSelect(role.id as 'STUDENT' | 'ADMIN' | 'COMPANY')}
              >
                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto w-16 h-16 ${role.bg} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-8 w-8 ${role.color}`} />
                  </div>
                  <CardTitle className="text-2xl">{role.title}</CardTitle>
                  <CardDescription className="text-base">
                    {role.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {role.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full mt-6 bg-gradient-primary hover:opacity-90 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRoleSelect(role.id as 'STUDENT' | 'ADMIN' | 'COMPANY');
                    }}
                  >
                    Continue as {role.title}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            Demo Credentials: <br />
            <span className="font-mono text-xs">
              Student: student@intrack.app / Student@123<br />
              Company: company@intrack.app / Company@123<br />
              Admin: admin@intrack.app / Admin@123
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleGate;

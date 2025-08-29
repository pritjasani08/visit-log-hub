import { useState, useEffect, useMemo, useRef } from 'react';
import { useVisitStore } from '@/stores/eventStore';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, BarChart3, Users, Clock, Star, TrendingUp, MessageSquare, User, LogOut, QrCode, Scan, Building, Sparkles, Zap, Target, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  DropdownMenu,
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const CompanyDashboard = () => {
  const { visits, loadVisits, attendances } = useVisitStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadVisits();
  }, [loadVisits]);

  // Animated background effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Floating particles for background
    const particles: Array<{x: number, y: number, vx: number, vy: number, size: number, opacity: number, color: string}> = [];
    for (let i = 0; i < 55; i++) {
      const colors = [
        'hsla(160, 84%, 39%, 0.3)',
        'hsla(238, 54%, 55%, 0.3)',
        'hsla(160, 74%, 50%, 0.3)',
        'hsla(238, 64%, 70%, 0.3)'
      ];
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.6 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    // Floating geometric shapes
    const shapes = [
      { x: 150, y: 120, size: 22, rotation: 0, speed: 0.03, type: 'square' },
      { x: canvas.width - 180, y: 100, size: 25, rotation: 0, speed: 0.025, type: 'circle' },
      { x: 250, y: canvas.height - 120, size: 28, rotation: 0, speed: 0.035, type: 'triangle' },
      { x: canvas.width - 250, y: canvas.height - 100, size: 20, rotation: 0, speed: 0.04, type: 'diamond' },
    ];

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Update and draw shapes
      shapes.forEach(shape => {
        shape.rotation += shape.speed;
        
        ctx.save();
        ctx.translate(shape.x, shape.y);
        ctx.rotate(shape.rotation);
        
        const floatOffset = Math.sin(Date.now() * 0.001 + shape.x * 0.01) * 3;
        ctx.translate(0, floatOffset);
        
        switch (shape.type) {
          case 'circle':
            ctx.fillStyle = 'hsla(160, 84%, 39%, 0.1)';
            ctx.beginPath();
            ctx.arc(0, 0, shape.size, 0, Math.PI * 2);
            ctx.fill();
            break;
          case 'square':
            ctx.fillStyle = 'hsla(238, 54%, 55%, 0.1)';
            ctx.fillRect(-shape.size, -shape.size, shape.size * 2, shape.size * 2);
            break;
          case 'triangle':
            ctx.fillStyle = 'hsla(160, 74%, 50%, 0.1)';
            ctx.beginPath();
            ctx.moveTo(0, -shape.size);
            ctx.lineTo(-shape.size, shape.size);
            ctx.lineTo(shape.size, shape.size);
            ctx.closePath();
            ctx.fill();
            break;
          case 'diamond':
            ctx.fillStyle = 'hsla(238, 64%, 70%, 0.1)';
            ctx.beginPath();
            ctx.moveTo(0, -shape.size);
            ctx.lineTo(shape.size, 0);
            ctx.lineTo(0, shape.size);
            ctx.lineTo(-shape.size, 0);
            ctx.closePath();
            ctx.fill();
            break;
        }
        
        ctx.restore();
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const now = Date.now();
  const { upcoming, past, active } = useMemo(() => {
    const upcoming = visits.filter(v => new Date(v.startTime).getTime() > now);
    const past = visits.filter(v => new Date(v.endTime).getTime() < now);
    const active = visits.filter(v => {
      const start = new Date(v.startTime).getTime();
      const end = new Date(v.endTime).getTime();
      return now >= start && now <= end;
    });
    return { upcoming, past, active };
  }, [visits, now]);

  const totals = useMemo(() => {
    const totalVisits = visits.length;
    const totalAttendance = attendances.length;
    const totalFeedback = visits.reduce((sum, v) => sum + (v.feedbackCount || 0), 0);
    const avgRating = visits.reduce((sum, v) => sum + (v.averageRating || 0), 0) / (visits.filter(v => v.averageRating > 0).length || 1);
    return { totalVisits, totalAttendance, totalFeedback, avgRating: avgRating || 0 };
  }, [visits, attendances]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleEditProfile = () => {
    // Navigate to edit profile page (to be implemented)
    navigate('/company/profile');
  };

  const handleScanQR = () => {
    navigate('/company/scan');
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
        style={{ background: 'transparent' }}
      />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-blue-600 via-emerald-600 to-teal-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                  <Building className="h-8 w-8 text-yellow-300 animate-pulse" />
                  Company Dashboard
                </h1>
                <p className="text-white/90 text-lg">
                  Scan QR codes to mark student attendance for industrial visits
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button 
                  onClick={handleScanQR}
                  className="bg-white text-blue-600 hover:bg-white/90 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold px-6 py-3"
                >
                  <Scan className="h-5 w-5 mr-2" />
                  Scan QR Code
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-12 w-12 rounded-full hover:bg-white/20 transition-all duration-300">
                      <Avatar className="h-12 w-12 ring-2 ring-white/30">
                        <AvatarImage src="/avatars/01.png" alt={user?.firstName} />
                        <AvatarFallback className="bg-white/20 text-white font-bold">
                          {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleEditProfile} className="hover:bg-blue-50">
                      <User className="mr-2 h-4 w-4 text-blue-600" />
                      <span>Edit Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="hover:bg-red-50">
                      <LogOut className="mr-2 h-4 w-4 text-red-600" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Enhanced Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-lg backdrop-blur-sm bg-white/90 hover:bg-white/95 transition-all duration-500 transform hover:scale-105 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Visits</p>
                    <p className="text-3xl font-bold text-blue-600">{totals.totalVisits}</p>
                  </div>
                  <div className="p-4 rounded-full bg-blue-100 group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="h-7 w-7 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg backdrop-blur-sm bg-white/90 hover:bg-white/95 transition-all duration-500 transform hover:scale-105 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Active Sessions</p>
                    <p className="text-3xl font-bold text-orange-600">{active.length}</p>
                  </div>
                  <div className="p-4 rounded-full bg-orange-100 group-hover:scale-110 transition-transform duration-300">
                    <Clock className="h-7 w-7 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg backdrop-blur-sm bg-white/90 hover:bg-white/95 transition-all duration-500 transform hover:scale-105 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Students Present</p>
                    <p className="text-3xl font-bold text-emerald-600">{totals.totalAttendance}</p>
                  </div>
                  <div className="p-4 rounded-full bg-emerald-100 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-7 w-7 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg backdrop-blur-sm bg-white/90 hover:bg-white/95 transition-all duration-500 transform hover:scale-105 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Avg Rating</p>
                    <p className="text-3xl font-bold text-purple-600">{totals.avgRating.toFixed(1)}</p>
                  </div>
                  <div className="p-4 rounded-full bg-purple-100 group-hover:scale-110 transition-transform duration-300">
                    <Star className="h-7 w-7 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Active Sessions */}
          {active.length > 0 && (
            <Card className="border-0 shadow-lg backdrop-blur-sm bg-white/90 hover:bg-white/95 transition-all duration-500 mb-6">
              <CardHeader className="bg-gradient-to-r from-red-50 to-red-100/50">
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <QrCode className="h-6 w-6" />
                  Active Sessions - Ready for QR Scanning
                </CardTitle>
                <CardDescription className="text-red-600">These visits are currently active and ready for student attendance</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {active.map((visit, index) => (
                    <div 
                      key={visit.id} 
                      className="border border-red-200 rounded-xl p-6 bg-gradient-to-r from-red-50/50 to-red-100/30 hover:from-red-100/50 hover:to-red-200/30 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md"
                      style={{
                        animationDelay: `${index * 0.1}s`
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-lg text-gray-800">{visit.companyName}</div>
                          <div className="text-gray-600 mb-3">{visit.purpose}</div>
                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <span className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-blue-600" />
                              {visit.visitDate}
                            </span>
                            <span className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-orange-600" />
                              {new Date(visit.startTime).toLocaleTimeString()} - {new Date(visit.endTime).toLocaleTimeString()}
                            </span>
                            <span className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-emerald-600" />
                              {visit.attendanceCount || 0} students present
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className="bg-red-500 text-white animate-pulse px-3 py-1 text-sm font-bold">
                            <Zap className="h-3 w-3 mr-1" />
                            LIVE
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() => navigate(`/company/scan/${visit.id}`)}
                            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                          >
                            <Scan className="h-4 w-4 mr-2" />
                            Scan QR
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Recent Visits */}
          <Card className="border-0 shadow-lg backdrop-blur-sm bg-white/90 hover:bg-white/95 transition-all duration-500 mb-6">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50">
              <CardTitle className="text-blue-800 flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                Recent Industrial Visits
              </CardTitle>
              <CardDescription className="text-blue-600">Overview of recent student visits to your company</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {visits.slice(0, 5).map((visit, index) => {
                  const isActive = active.some(v => v.id === visit.id);
                  const isUpcoming = upcoming.some(v => v.id === visit.id);
                  const isPast = past.some(v => v.id === visit.id);
                  
                  return (
                    <div 
                      key={visit.id} 
                      className="border border-blue-200 rounded-xl p-6 hover:bg-blue-50/50 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md"
                      style={{
                        animationDelay: `${index * 0.1}s`
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-lg text-gray-800">{visit.companyName}</div>
                          <div className="text-gray-600 mb-3">{visit.purpose}</div>
                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <span className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-blue-600" />
                              {visit.visitDate}
                            </span>
                            <span className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-orange-600" />
                              {new Date(visit.startTime).toLocaleTimeString()} - {new Date(visit.endTime).toLocaleTimeString()}
                            </span>
                            <span className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-emerald-600" />
                              {visit.attendanceCount || 0} present
                            </span>
                            {visit.averageRating > 0 && (
                              <span className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-yellow-500" />
                                {visit.averageRating.toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {isActive ? (
                            <Badge className="bg-red-500 text-white animate-pulse px-3 py-1 text-sm font-bold">
                              <Zap className="h-3 w-3 mr-1" />
                              LIVE
                            </Badge>
                          ) : isUpcoming ? (
                            <Badge className="bg-blue-500 text-white px-3 py-1 text-sm font-bold">
                              <Clock className="h-3 w-3 mr-1" />
                              Upcoming
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-500 text-white px-3 py-1 text-sm font-bold">
                              <Award className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                          {isActive && (
                            <Button
                              size="sm"
                              onClick={() => navigate(`/company/scan/${visit.id}`)}
                              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                            >
                              <Scan className="h-4 w-4 mr-2" />
                              Scan QR
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Quick Actions */}
          <Card className="border-0 shadow-lg backdrop-blur-sm bg-white/90 hover:bg-white/95 transition-all duration-500">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-teal-100/50">
              <CardTitle className="text-teal-800 flex items-center gap-2">
                <Sparkles className="h-6 w-6" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-teal-600">Common tasks for managing student visits</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Button
                  onClick={handleScanQR}
                  className="h-24 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <div className="text-center">
                    <Scan className="h-8 w-8 mx-auto mb-3" />
                    <div className="font-bold text-lg">Scan QR Code</div>
                    <div className="text-sm opacity-90">Mark student attendance</div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => navigate('/company/visits')}
                  className="h-24 border-teal-200 text-teal-700 hover:bg-teal-50 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="text-center">
                    <Calendar className="h-8 w-8 mx-auto mb-3" />
                    <div className="font-bold text-lg">View All Visits</div>
                    <div className="text-sm opacity-90">See visit history</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;



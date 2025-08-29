import { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock,
  QrCode,
  MapPin,
  Star,
  User,
  LogOut,
  Plus,
  Building,
  Sparkles,
  Zap,
  Target,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useVisitStore } from '@/stores/eventStore';
import { useAuthStore } from '@/stores/authStore';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const StudentHome = () => {
  const navigate = useNavigate();
  const { visits, loadVisits, analytics, loadAnalytics } = useVisitStore();
  const { user, logout } = useAuthStore();
  const [activeVisits, setActiveVisits] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadVisits();
    loadAnalytics('1'); // Load demo analytics
  }, [loadVisits, loadAnalytics]);

  useEffect(() => {
    const now = new Date();
    const active = visits.filter(visit => {
      const start = new Date(visit.startTime);
      const end = new Date(visit.endTime);
      return now >= start && now <= end;
    }).length;
    setActiveVisits(active);
  }, [visits]);

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
    for (let i = 0; i < 50; i++) {
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
      { x: 100, y: 100, size: 20, rotation: 0, speed: 0.02, type: 'circle' },
      { x: canvas.width - 120, y: 80, size: 18, rotation: 0, speed: 0.03, type: 'square' },
      { x: 200, y: canvas.height - 100, size: 25, rotation: 0, speed: 0.025, type: 'triangle' },
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleEditProfile = () => {
    // Navigate to edit profile page (to be implemented)
    navigate('/student/profile');
  };

  const stats = [
    {
      title: 'Total Visits',
      value: visits.length,
      icon: Calendar,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
      gradient: 'from-emerald-400 to-emerald-600',
    },
    {
      title: 'Active Sessions',
      value: activeVisits,
      icon: Zap,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
      gradient: 'from-orange-400 to-orange-600',
    },
    {
      title: 'Attendance Rate',
      value: visits.length > 0 ? Math.round((visits.filter(v => v.attendanceCount && v.attendanceCount > 0).length / visits.length) * 100) : 0,
      icon: Target,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      gradient: 'from-blue-400 to-blue-600',
      suffix: '%',
    },
    {
      title: 'Avg Rating',
      value: visits.length > 0 ? (visits.reduce((sum, v) => sum + (v.averageRating || 0), 0) / visits.filter(v => v.averageRating > 0).length || 1).toFixed(1) : '0.0',
      icon: Award,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      gradient: 'from-purple-400 to-purple-600',
    },
  ];

  const attendanceData = analytics?.attendanceOverTime || [];
  const ratingsData = analytics?.ratingsDistribution || [];
  const pieColors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

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
        <div className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                  <Sparkles className="h-8 w-8 text-yellow-300 animate-pulse" />
                  Student Dashboard
                </h1>
                <p className="text-white/90 text-lg">
                  Welcome back, {user?.firstName}! Manage your industrial visits.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button 
                  onClick={() => navigate('/student/visits/new')}
                  className="bg-white text-emerald-600 hover:bg-white/90 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold px-6 py-3"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Visit
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
                    <DropdownMenuItem onClick={handleEditProfile} className="hover:bg-emerald-50">
                      <User className="mr-2 h-4 w-4 text-emerald-600" />
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card 
                  key={index} 
                  className="border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 backdrop-blur-sm bg-white/90 hover:bg-white/95 overflow-hidden group"
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                  <CardContent className="p-6 relative">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                        <p className="text-3xl font-bold text-foreground">{stat.value}{stat.suffix || ''}</p>
                      </div>
                      <div className={`p-4 rounded-full ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`h-7 w-7 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Enhanced Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Attendance Trend */}
            <Card className="border-0 shadow-lg backdrop-blur-sm bg-white/90 hover:bg-white/95 transition-all duration-500 transform hover:scale-[1.02]">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50">
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <TrendingUp className="h-6 w-6" />
                  Visit Attendance Trend
                </CardTitle>
                <CardDescription className="text-blue-600">Your visit attendance over the past week</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="hsl(220, 100%, 50%)" 
                      strokeWidth={4}
                      dot={{ fill: 'hsl(220, 100%, 50%)', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, stroke: 'hsl(220, 100%, 50%)', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Ratings Distribution */}
            <Card className="border-0 shadow-lg backdrop-blur-sm bg-white/90 hover:bg-white/95 transition-all duration-500 transform hover:scale-[1.02]">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100/50">
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <Star className="h-6 w-6" />
                  Visit Ratings
                </CardTitle>
                <CardDescription className="text-purple-600">Distribution of your visit ratings</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={ratingsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ rating, count }) => `${rating}★ (${count})`}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {ratingsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Recent Visits */}
          <Card className="border-0 shadow-lg backdrop-blur-sm bg-white/90 hover:bg-white/95 transition-all duration-500">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-emerald-800 flex items-center gap-2">
                    <Building className="h-6 w-6" />
                    Recent Industrial Visits
                  </CardTitle>
                  <CardDescription className="text-emerald-600">Your latest industrial visits and sessions</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/student/visits')}
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-all duration-300"
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {visits.slice(0, 5).map((visit, index) => {
                  const isLive = new Date() >= new Date(visit.startTime) && new Date() <= new Date(visit.endTime);
                  const isUpcoming = new Date() < new Date(visit.startTime);
                  const hasAttended = visit.attendanceCount && visit.attendanceCount > 0;
                  
                  return (
                    <div 
                      key={visit.id} 
                      className="flex items-center justify-between p-6 border border-emerald-100 rounded-xl hover:bg-emerald-50/50 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md"
                      style={{
                        animationDelay: `${index * 0.1}s`
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex items-center gap-3">
                          {isLive ? (
                            <Badge className="bg-red-500 text-white animate-pulse px-3 py-1 text-sm font-bold">
                              <Zap className="h-3 w-3 mr-1" />
                              LIVE
                            </Badge>
                          ) : isUpcoming ? (
                            <Badge className="bg-blue-500 text-white px-3 py-1 text-sm font-bold">
                              <Clock className="h-3 w-3 mr-1" />
                              Upcoming
                            </Badge>
                          ) : hasAttended ? (
                            <Badge className="bg-emerald-500 text-white px-3 py-1 text-sm font-bold">
                              <Award className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="px-3 py-1 text-sm">
                              Missed
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-gray-800 mb-2">{visit.companyName}</h4>
                          <p className="text-gray-600 mb-3">{visit.purpose}</p>
                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <span className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-emerald-600" />
                              {visit.visitDate}
                            </span>
                            <span className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-blue-600" />
                              {formatDate(visit.startTime)} - {new Date(visit.endTime).toLocaleTimeString()}
                            </span>
                            {hasAttended && (
                              <span className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-yellow-500" />
                                {visit.averageRating?.toFixed(1) || 'N/A'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/student/visits/${visit.id}`)}
                          className="hover:bg-gray-50 transition-all duration-300"
                        >
                          View Details
                        </Button>
                        {isLive && (
                          <Button
                            size="sm"
                            onClick={() => navigate(`/student/visits/${visit.id}/qr`)}
                            className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                          >
                            <QrCode className="h-4 w-4 mr-2" />
                            Show QR
                          </Button>
                        )}
                        {hasAttended && !isUpcoming && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/student/feedback/${visit.id}`)}
                            className="hover:bg-purple-50 border-purple-200 text-purple-700 transition-all duration-300"
                          >
                            Give Feedback
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentHome;

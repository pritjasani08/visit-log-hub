import { useState, useEffect } from 'react';
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
  Building
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
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Active Sessions',
      value: activeVisits,
      icon: Clock,
      color: 'text-secondary',
      bg: 'bg-secondary/10',
    },
    {
      title: 'Attendance Rate',
      value: visits.length > 0 ? Math.round((visits.filter(v => v.attendanceCount && v.attendanceCount > 0).length / visits.length) * 100) : 0,
      icon: Users,
      color: 'text-indigo-600',
      bg: 'bg-indigo-100',
      suffix: '%',
    },
    {
      title: 'Avg Rating',
      value: visits.length > 0 ? (visits.reduce((sum, v) => sum + (v.averageRating || 0), 0) / visits.filter(v => v.averageRating > 0).length || 1).toFixed(1) : '0.0',
      icon: Star,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
    },
  ];

  const attendanceData = analytics?.attendanceOverTime || [];
  const ratingsData = analytics?.ratingsDistribution || [];
  const pieColors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Header */}
      <div className="bg-gradient-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Student Dashboard
              </h1>
              <p className="text-primary-foreground/80 mt-1">
                Welcome back, {user?.firstName}! Manage your industrial visits.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => navigate('/student/visits/new')}
                className="bg-white text-primary hover:bg-white/90 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Visit
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/avatars/01.png" alt={user?.firstName} />
                      <AvatarFallback>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</AvatarFallback>
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
                  <DropdownMenuItem onClick={handleEditProfile}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Edit Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-0 shadow-medium hover:shadow-large transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}{stat.suffix || ''}</p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bg}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Attendance Trend */}
          <Card className="border-0 shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Visit Attendance Trend
              </CardTitle>
              <CardDescription>Your visit attendance over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Ratings Distribution */}
          <Card className="border-0 shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Visit Ratings
              </CardTitle>
              <CardDescription>Distribution of your visit ratings</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ratingsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ rating, count }) => `${rating}★ (${count})`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {ratingsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Visits */}
        <Card className="border-0 shadow-medium">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Industrial Visits</CardTitle>
                <CardDescription>Your latest industrial visits and sessions</CardDescription>
              </div>
              <Button variant="outline" onClick={() => navigate('/student/visits')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {visits.slice(0, 5).map((visit) => {
                const isLive = new Date() >= new Date(visit.startTime) && new Date() <= new Date(visit.endTime);
                const isUpcoming = new Date() < new Date(visit.startTime);
                const hasAttended = visit.attendanceCount && visit.attendanceCount > 0;
                
                return (
                  <div key={visit.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center gap-2">
                        {isLive ? (
                          <Badge className="bg-destructive text-destructive-foreground animate-pulse">LIVE</Badge>
                        ) : isUpcoming ? (
                          <Badge variant="secondary">Upcoming</Badge>
                        ) : hasAttended ? (
                          <Badge className="bg-secondary text-secondary-foreground">Completed</Badge>
                        ) : (
                          <Badge variant="outline">Missed</Badge>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold">{visit.companyName}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{visit.purpose}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {visit.visitDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(visit.startTime)} - {new Date(visit.endTime).toLocaleTimeString()}
                          </span>
                          {hasAttended && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {visit.averageRating?.toFixed(1) || 'N/A'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/student/visits/${visit.id}`)}
                      >
                        View Details
                      </Button>
                      {isLive && (
                        <Button
                          size="sm"
                          onClick={() => navigate(`/student/visits/${visit.id}/qr`)}
                          className="bg-gradient-primary hover:opacity-90"
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
  );
};

export default StudentHome;

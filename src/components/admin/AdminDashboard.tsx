import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock,
  QrCode,
  BarChart3,
  MapPin,
  Star,
  User,
  LogOut,
  PieChart as PieChartIcon,
  Activity,
  Settings
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { visits, loadVisits, analytics, loadAnalytics, attendances } = useVisitStore();
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
    navigate('/admin/profile');
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
  const sentimentData = analytics?.sentimentAnalysis || [];
  const pieColors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];
  const sentimentColors = ['#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Header */}
      <div className="bg-gradient-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Admin Analytics Dashboard
              </h1>
              <p className="text-primary-foreground/80 mt-1">
                Welcome back, {user?.firstName}! Monitor industrial visit analytics and performance.
              </p>
            </div>
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
                <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
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
              <CardDescription>Daily attendance across all industrial visits</CardDescription>
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

          {/* Sentiment Analysis */}
          <Card className="border-0 shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Sentiment Analysis
              </CardTitle>
              <CardDescription>Feedback sentiment distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ sentiment, percentage }) => `${sentiment} (${percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={sentimentColors[index % sentimentColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card className="border-0 shadow-medium mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
            <CardDescription>Overall performance indicators for industrial visits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {visits.length > 0 ? Math.round((visits.filter(v => v.attendanceCount && v.attendanceCount > 0).length / visits.length) * 100) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Overall Attendance Rate</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {visits.filter(v => v.attendanceCount && v.attendanceCount > 0).length} of {visits.length} visits had attendance
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary mb-2">
                  {visits.length > 0 ? (visits.reduce((sum, v) => sum + (v.averageRating || 0), 0) / visits.filter(v => v.averageRating > 0).length || 1).toFixed(1) : '0.0'}
                </div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
                <div className="flex justify-center mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`h-4 w-4 ${star <= (visits.length > 0 ? visits.reduce((sum, v) => sum + (v.averageRating || 0), 0) / visits.filter(v => v.averageRating > 0).length || 1 : 0) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-2">
                  {attendances.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Students Marked Present</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Across all industrial visits
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Visits */}
        <Card className="border-0 shadow-medium">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Industrial Visits</CardTitle>
                <CardDescription>Monitor latest student visits and their performance</CardDescription>
              </div>
              <Button variant="outline" onClick={() => navigate('/admin/visits')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {visits.slice(0, 5).map((visit) => {
                const isLive = new Date() >= new Date(visit.startTime) && new Date() <= new Date(visit.endTime);
                const isUpcoming = new Date() < new Date(visit.startTime);
                const attendanceRate = visit.attendanceCount && visit.attendanceCount > 0 ? Math.round((visit.attendanceCount / 30) * 100) : 0; // Assuming 30 students per visit
                
                return (
                  <div key={visit.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center gap-2">
                        {isLive ? (
                          <Badge className="bg-destructive text-destructive-foreground animate-pulse">LIVE</Badge>
                        ) : isUpcoming ? (
                          <Badge variant="secondary">Upcoming</Badge>
                        ) : (
                          <Badge variant="outline">Completed</Badge>
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
                            <Users className="h-3 w-3" />
                            {visit.attendanceCount || 0} students present
                          </span>
                          <span className="flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            {attendanceRate}% attendance rate
                          </span>
                          {visit.averageRating > 0 && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {visit.averageRating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/visits/${visit.id}`)}
                      >
                        View Details
                      </Button>
                      {isLive && (
                        <Button
                          size="sm"
                          onClick={() => navigate(`/admin/visits/${visit.id}/analytics`)}
                          className="bg-gradient-primary hover:opacity-90"
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Analytics
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

export default AdminDashboard;
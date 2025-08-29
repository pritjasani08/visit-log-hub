import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock,
  QrCode,
  Plus,
  BarChart3,
  MapPin,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '@/stores/eventStore';
import { useAuthStore } from '@/stores/authStore';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { events, loadEvents, analytics, loadAnalytics } = useEventStore();
  const { user } = useAuthStore();
  const [activeEvents, setActiveEvents] = useState(0);

  useEffect(() => {
    loadEvents();
    loadAnalytics('1'); // Load demo analytics
  }, [loadEvents, loadAnalytics]);

  useEffect(() => {
    const now = new Date();
    const active = events.filter(event => {
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);
      return now >= start && now <= end;
    }).length;
    setActiveEvents(active);
  }, [events]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const stats = [
    {
      title: 'Total Events',
      value: events.length,
      icon: Calendar,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Active Sessions',
      value: activeEvents,
      icon: Clock,
      color: 'text-secondary',
      bg: 'bg-secondary/10',
    },
    {
      title: 'Attendance Rate',
      value: '85%',
      icon: Users,
      color: 'text-indigo-600',
      bg: 'bg-indigo-100',
    },
    {
      title: 'Avg Rating',
      value: '4.2',
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
                Admin Dashboard
              </h1>
              <p className="text-primary-foreground/80 mt-1">
                Welcome back, {user?.firstName}! Here's your event overview.
              </p>
            </div>
            <Button 
              onClick={() => navigate('/admin/events/new')}
              className="bg-white text-primary hover:bg-white/90 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
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
                      <p className="text-2xl font-bold">{stat.value}</p>
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
                Attendance Trend
              </CardTitle>
              <CardDescription>Daily attendance over the past week</CardDescription>
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
                <BarChart3 className="h-5 w-5" />
                Ratings Distribution
              </CardTitle>
              <CardDescription>Feedback ratings breakdown</CardDescription>
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

        {/* Recent Events */}
        <Card className="border-0 shadow-medium">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Events</CardTitle>
                <CardDescription>Manage your latest events and sessions</CardDescription>
              </div>
              <Button variant="outline" onClick={() => navigate('/admin')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.slice(0, 5).map((event) => {
                const isLive = new Date() >= new Date(event.startTime) && new Date() <= new Date(event.endTime);
                const isUpcoming = new Date() < new Date(event.startTime);
                
                return (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
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
                        <h4 className="font-semibold">{event.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{event.companyName}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(event.startTime)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {event.attendanceCount || 0} attended
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {event.averageRating?.toFixed(1) || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/events/${event.id}`)}
                      >
                        View Details
                      </Button>
                      {isLive && (
                        <Button
                          size="sm"
                          onClick={() => navigate(`/admin/events/${event.id}/qr`)}
                          className="bg-gradient-primary hover:opacity-90"
                        >
                          <QrCode className="h-4 w-4 mr-2" />
                          QR Session
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
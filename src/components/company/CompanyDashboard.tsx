import { useEffect, useMemo } from 'react';
import { useEventStore } from '@/stores/eventStore';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, BarChart3, Users, Clock, Star, TrendingUp, MessageSquare, User, LogOut } from 'lucide-react';
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
  const { events, loadEvents } = useEventStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const now = Date.now();
  const { upcoming, past } = useMemo(() => {
    const upcoming = events.filter(e => new Date(e.startTime).getTime() > now);
    const past = events.filter(e => new Date(e.endTime).getTime() < now);
    return { upcoming, past };
  }, [events, now]);

  const totals = useMemo(() => {
    const totalAttendance = events.reduce((sum, e) => sum + (e.attendanceCount || 0), 0);
    const totalEvents = events.length;
    const totalFeedback = events.reduce((sum, e) => sum + (e.feedbackCount || 0), 0);
    const avgRating = events.reduce((sum, e) => sum + (e.averageRating || 0), 0) / (events.filter(e => e.averageRating > 0).length || 1);
    return { totalAttendance, totalEvents, totalFeedback, avgRating: avgRating || 0 };
  }, [events]);

  const attendanceShare = (count?: number) => {
    if (!totals.totalAttendance) return 0;
    return Math.round(((count || 0) / totals.totalAttendance) * 100);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleEditProfile = () => {
    // Navigate to edit profile page (to be implemented)
    navigate('/company/profile');
  };

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Company Analytics</h1>
            <p className="text-muted-foreground">Read-only overview of event attendance and timelines</p>
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
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <Card className="border-0 shadow-medium">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-bold">{totals.totalEvents}</p>
                </div>
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-medium">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                  <p className="text-2xl font-bold">{upcoming.length}</p>
                </div>
                <Clock className="h-6 w-6 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-medium">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{past.length}</p>
                </div>
                <BarChart3 className="h-6 w-6 text-indigo-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-medium">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Attendance</p>
                  <p className="text-2xl font-bold">{totals.totalAttendance}</p>
                </div>
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-medium">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Feedback</p>
                  <p className="text-2xl font-bold">{totals.totalFeedback}</p>
                </div>
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-medium">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Rating</p>
                  <p className="text-2xl font-bold">{totals.avgRating.toFixed(1)}</p>
                </div>
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Past Events with Feedback */}
        <Card className="border-0 shadow-medium mb-6">
          <CardHeader>
            <CardTitle>Past Events & Feedback Reports</CardTitle>
            <CardDescription>Detailed analysis of completed events with performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {past.map((e) => {
                const share = attendanceShare(e.attendanceCount);
                const feedbackRate = e.attendanceCount ? Math.round(((e.feedbackCount || 0) / e.attendanceCount) * 100) : 0;
                return (
                  <div key={e.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-semibold">{e.title}</div>
                        <div className="text-sm text-muted-foreground">{e.companyName}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(e.startTime).toLocaleDateString()} - {new Date(e.endTime).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant="outline">Completed</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-lg font-semibold">{e.attendanceCount || 0}</div>
                        <div className="text-xs text-muted-foreground">Attendance</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{e.feedbackCount || 0}</div>
                        <div className="text-xs text-muted-foreground">Feedback</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{feedbackRate}%</div>
                        <div className="text-xs text-muted-foreground">Feedback Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold flex items-center justify-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          {e.averageRating?.toFixed(1) || 'N/A'}
                        </div>
                        <div className="text-xs text-muted-foreground">Avg Rating</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Attendance Share</span>
                        <span className="font-medium">{share}%</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded">
                        <div className="h-2 bg-primary rounded" style={{ width: `${share}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="border-0 shadow-medium mb-6">
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Scheduled events and sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcoming.map((e) => (
                <div key={e.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{e.title}</div>
                      <div className="text-sm text-muted-foreground">{e.companyName}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(e.startTime).toLocaleDateString()} - {new Date(e.endTime).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant="secondary">Upcoming</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="border-0 shadow-medium">
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Overall performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{totals.avgRating.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
                <div className="flex justify-center mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`h-4 w-4 ${star <= totals.avgRating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary mb-2">
                  {totals.totalEvents > 0 ? Math.round((past.length / totals.totalEvents) * 100) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Completion Rate</div>
                <div className="text-xs text-muted-foreground mt-1">{past.length} of {totals.totalEvents} events completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-2">
                  {totals.totalAttendance > 0 ? Math.round((totals.totalFeedback / totals.totalAttendance) * 100) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Feedback Rate</div>
                <div className="text-xs text-muted-foreground mt-1">{totals.totalFeedback} feedback from {totals.totalAttendance} attendees</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyDashboard;



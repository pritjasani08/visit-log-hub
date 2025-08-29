import { useState, useEffect, useMemo } from 'react';
import { useVisitStore } from '@/stores/eventStore';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, BarChart3, Users, Clock, Star, TrendingUp, MessageSquare, User, LogOut, QrCode, Scan } from 'lucide-react';
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

  useEffect(() => {
    loadVisits();
  }, [loadVisits]);

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
    <div className="min-h-screen bg-gradient-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Company Dashboard</h1>
            <p className="text-muted-foreground">Scan QR codes to mark student attendance for industrial visits</p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleScanQR}
              className="bg-gradient-primary hover:opacity-90 transition-opacity"
            >
              <Scan className="h-4 w-4 mr-2" />
              Scan QR Code
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-medium">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Visits</p>
                  <p className="text-2xl font-bold">{totals.totalVisits}</p>
                </div>
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-medium">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Sessions</p>
                  <p className="text-2xl font-bold">{active.length}</p>
                </div>
                <Clock className="h-6 w-6 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-medium">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Students Marked Present</p>
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
                  <p className="text-sm text-muted-foreground">Avg Rating</p>
                  <p className="text-2xl font-bold">{totals.avgRating.toFixed(1)}</p>
                </div>
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Sessions */}
        {active.length > 0 && (
          <Card className="border-0 shadow-medium mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Active Sessions - Ready for QR Scanning
              </CardTitle>
              <CardDescription>These visits are currently active and ready for student attendance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {active.map((visit) => (
                  <div key={visit.id} className="border rounded-lg p-4 bg-gradient-to-r from-primary/5 to-secondary/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-lg">{visit.companyName}</div>
                        <div className="text-sm text-muted-foreground mb-2">{visit.purpose}</div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {visit.visitDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(visit.startTime).toLocaleTimeString()} - {new Date(visit.endTime).toLocaleTimeString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {visit.attendanceCount || 0} students present
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-destructive text-destructive-foreground animate-pulse">
                          LIVE
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => navigate(`/company/scan/${visit.id}`)}
                          className="bg-gradient-primary hover:opacity-90"
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

        {/* Recent Visits */}
        <Card className="border-0 shadow-medium mb-6">
          <CardHeader>
            <CardTitle>Recent Industrial Visits</CardTitle>
            <CardDescription>Overview of recent student visits to your company</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {visits.slice(0, 5).map((visit) => {
                const isActive = active.some(v => v.id === visit.id);
                const isUpcoming = upcoming.some(v => v.id === visit.id);
                const isPast = past.some(v => v.id === visit.id);
                
                return (
                  <div key={visit.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{visit.companyName}</div>
                        <div className="text-sm text-muted-foreground mb-2">{visit.purpose}</div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {visit.visitDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(visit.startTime).toLocaleTimeString()} - {new Date(visit.endTime).toLocaleTimeString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {visit.attendanceCount || 0} present
                          </span>
                          {visit.averageRating > 0 && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {visit.averageRating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isActive ? (
                          <Badge className="bg-destructive text-destructive-foreground animate-pulse">LIVE</Badge>
                        ) : isUpcoming ? (
                          <Badge variant="secondary">Upcoming</Badge>
                        ) : (
                          <Badge variant="outline">Completed</Badge>
                        )}
                        {isActive && (
                          <Button
                            size="sm"
                            onClick={() => navigate(`/company/scan/${visit.id}`)}
                            className="bg-gradient-primary hover:opacity-90"
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

        {/* Quick Actions */}
        <Card className="border-0 shadow-medium">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for managing student visits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={handleScanQR}
                className="h-20 bg-gradient-primary hover:opacity-90 transition-opacity"
              >
                <div className="text-center">
                  <Scan className="h-6 w-6 mx-auto mb-2" />
                  <div className="font-semibold">Scan QR Code</div>
                  <div className="text-sm opacity-90">Mark student attendance</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => navigate('/company/visits')}
                className="h-20"
              >
                <div className="text-center">
                  <Calendar className="h-6 w-6 mx-auto mb-2" />
                  <div className="font-semibold">View All Visits</div>
                  <div className="text-sm opacity-90">See visit history</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyDashboard;



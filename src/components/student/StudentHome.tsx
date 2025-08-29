import { useState, useEffect } from 'react';
import { QrCode, Calendar, ClipboardCheck, MapPin, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '@/stores/eventStore';
import { useAuthStore } from '@/stores/authStore';
import { Event } from '@/types';

const StudentHome = () => {
  const navigate = useNavigate();
  const { events, loadEvents } = useEventStore();
  const { user } = useAuthStore();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pendingFeedback, setPendingFeedback] = useState(2); // Mock data

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    const now = new Date();
    const upcoming = events.filter(event => new Date(event.startTime) > now);
    setUpcomingEvents(upcoming);
  }, [events]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isEventLive = (event: Event) => {
    const now = new Date();
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);
    return now >= start && now <= end;
  };

  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Header */}
      <div className="bg-gradient-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-primary-foreground/80 mt-1">
                Ready to attend your next session?
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">5</div>
                <div className="text-sm text-primary-foreground/80">Events Attended</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">4.2</div>
                <div className="text-sm text-primary-foreground/80">Avg Rating Given</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="group hover:shadow-large transition-all duration-300 border-0 shadow-medium cursor-pointer" onClick={() => navigate('/student/scan')}>
            <CardContent className="p-6 text-center">
              <div className="bg-gradient-primary p-4 rounded-2xl w-fit mx-auto mb-4 group-hover:shadow-glow transition-all duration-300">
                <QrCode className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Scan QR Code</h3>
              <p className="text-muted-foreground text-sm">Mark your attendance quickly</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-large transition-all duration-300 border-0 shadow-medium cursor-pointer" onClick={() => navigate('/student/events')}>
            <CardContent className="p-6 text-center">
              <div className="bg-gradient-secondary p-4 rounded-2xl w-fit mx-auto mb-4 group-hover:shadow-glow transition-all duration-300">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">My Events</h3>
              <p className="text-muted-foreground text-sm">View all your sessions</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-large transition-all duration-300 border-0 shadow-medium cursor-pointer" onClick={() => navigate('/student/feedback')}>
            <CardContent className="p-6 text-center relative">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-4 rounded-2xl w-fit mx-auto mb-4 group-hover:shadow-glow transition-all duration-300">
                <ClipboardCheck className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Pending Feedback</h3>
              <p className="text-muted-foreground text-sm">Complete your reviews</p>
              {pendingFeedback > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground">
                  {pendingFeedback}
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Upcoming Events</h2>
            <Button variant="outline" onClick={() => navigate('/student/events')}>
              View All
            </Button>
          </div>

          {upcomingEvents.length === 0 ? (
            <Card className="border-0 shadow-medium">
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No upcoming events</h3>
                <p className="text-muted-foreground">Check back later for new sessions</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {upcomingEvents.slice(0, 3).map((event) => (
                <Card key={event.id} className="border-0 shadow-medium hover:shadow-large transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{event.title}</h3>
                          {isEventLive(event) && (
                            <Badge className="bg-destructive text-destructive-foreground animate-pulse">
                              LIVE
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-muted-foreground mb-4">{event.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{formatTime(event.startTime)}</div>
                              <div className="text-muted-foreground">{formatDate(event.startTime)}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{event.companyName}</div>
                              <div className="text-muted-foreground">Location required</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{event.attendanceCount || 0} attending</div>
                              <div className="text-muted-foreground">Registered students</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {isEventLive(event) && (
                        <Button 
                          onClick={() => navigate('/student/scan')}
                          className="bg-gradient-primary hover:opacity-90 transition-opacity ml-4"
                        >
                          <QrCode className="h-4 w-4 mr-2" />
                          Scan QR
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentHome;
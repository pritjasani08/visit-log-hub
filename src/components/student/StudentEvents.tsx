
import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Users, ArrowLeft, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '@/stores/eventStore';
import { useAuthStore } from '@/stores/authStore';
import { Event } from '@/types';

const StudentEvents = () => {
  const navigate = useNavigate();
  const { events, loadEvents } = useEventStore();
  const { user } = useAuthStore();
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'attended'>('all');

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    const now = new Date();
    let filtered = events;

    switch (filter) {
      case 'upcoming':
        filtered = events.filter(event => new Date(event.startTime) > now);
        break;
      case 'past':
        filtered = events.filter(event => new Date(event.endTime) < now);
        break;
      case 'attended':
        // Mock: showing events with attendance count > 0
        filtered = events.filter(event => (event.attendanceCount || 0) > 0);
        break;
      default:
        filtered = events;
    }

    setFilteredEvents(filtered);
  }, [events, filter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEventStatus = (event: Event) => {
    const now = new Date();
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);
    
    if (now >= start && now <= end) {
      return { label: 'LIVE', color: 'bg-destructive text-destructive-foreground' };
    } else if (now < start) {
      return { label: 'UPCOMING', color: 'bg-primary text-primary-foreground' };
    } else {
      return { label: 'COMPLETED', color: 'bg-muted text-muted-foreground' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Header */}
      <div className="bg-gradient-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/student')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">My Events</h1>
            <p className="text-primary-foreground/80 mt-1">
              View all your sessions and industrial visits
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter events" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past Events</SelectItem>
                <SelectItem value="attended">Attended</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Events List */}
        {filteredEvents.length === 0 ? (
          <Card className="border-0 shadow-medium">
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No events found</h3>
              <p className="text-muted-foreground">
                {filter === 'all' ? 'No events have been created yet' : `No ${filter} events found`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredEvents.map((event) => {
              const status = getEventStatus(event);
              return (
                <Card key={event.id} className="border-0 shadow-medium hover:shadow-large transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{event.title}</h3>
                          <Badge className={status.color}>
                            {status.label}
                          </Badge>
                        </div>
                        
                        {event.description && (
                          <p className="text-muted-foreground mb-4">{event.description}</p>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">
                                {formatTime(event.startTime)} - {formatTime(event.endTime)}
                              </div>
                              <div className="text-muted-foreground">
                                {formatDate(event.startTime)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{event.companyName || 'TBA'}</div>
                              <div className="text-muted-foreground">
                                {event.radiusMeters}m radius
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">
                                {event.attendanceCount || 0} attending
                              </div>
                              <div className="text-muted-foreground">
                                Avg rating: {event.averageRating?.toFixed(1) || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        {status.label === 'LIVE' && (
                          <Button 
                            onClick={() => navigate('/student/scan')}
                            className="bg-gradient-primary hover:opacity-90"
                            size="sm"
                          >
                            Check In
                          </Button>
                        )}
                        {status.label === 'COMPLETED' && (
                          <Button 
                            onClick={() => navigate(`/student/feedback/${event.id}`)}
                            variant="outline"
                            size="sm"
                          >
                            View Feedback
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentEvents;

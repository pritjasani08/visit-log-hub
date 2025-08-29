import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowLeft, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEventStore } from '@/stores/eventStore';

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { events } = useEventStore();

  const event = useMemo(() => events.find(e => e.id === eventId), [events, eventId]);

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-surface flex items-center justify-center">
        <Card className="w-96 border-0 shadow-large">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Event not found</h3>
            <p className="text-muted-foreground mb-4">The requested event does not exist.</p>
            <Button onClick={() => navigate('/admin')}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDateTime = (iso: string) => new Date(iso).toLocaleString();

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/admin')} className="hover:bg-accent">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{event.title}</h1>
            <p className="text-muted-foreground">{event.companyName}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-medium">
              <CardHeader>
                <CardTitle>Details</CardTitle>
                <CardDescription>Event information and schedule</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {event.description && (
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formatDateTime(event.startTime)} - {new Date(event.endTime).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>
                    Lat {event.locationLat.toFixed(5)}, Lng {event.locationLng.toFixed(5)} · Radius {event.radiusMeters}m
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-medium">
              <CardHeader>
                <CardTitle>Attendance</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <Users className="h-5 w-5" />
                <div className="text-sm">
                  <div className="font-semibold">{event.attendanceCount || 0} attendees</div>
                  <div className="text-muted-foreground">Feedback: {event.feedbackCount || 0} · Rating: {event.averageRating?.toFixed(1) || 'N/A'}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="border-0 shadow-medium">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={() => navigate(`/admin/events/${event.id}/qr`)} className="w-full bg-gradient-primary hover:opacity-90">
                  <QrCode className="h-4 w-4 mr-2" />
                  Start QR Session
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;



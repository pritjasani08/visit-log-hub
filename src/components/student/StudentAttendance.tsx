
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, MapPin, Clock, ArrowLeft, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '@/stores/eventStore';
import { useAuthStore } from '@/stores/authStore';

const StudentAttendance = () => {
  const navigate = useNavigate();
  const { events, loadEvents } = useEventStore();
  const { user } = useAuthStore();
  const [attendanceData, setAttendanceData] = useState<any[]>([]);

  useEffect(() => {
    loadEvents();
    // Mock attendance data
    const mockAttendance = events.map((event, index) => ({
      eventId: event.id,
      event: event,
      attended: index % 3 !== 0, // Mock: 2/3 attendance rate
      checkInTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      gpsAccuracy: Math.floor(Math.random() * 20) + 5,
      feedbackSubmitted: index % 2 === 0,
    }));
    setAttendanceData(mockAttendance);
  }, [events]);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const attendedCount = attendanceData.filter(a => a.attended).length;
  const totalEvents = attendanceData.length;
  const attendanceRate = totalEvents > 0 ? (attendedCount / totalEvents) * 100 : 0;

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">My Attendance</h1>
              <p className="text-primary-foreground/80 mt-1">
                Track your attendance across all events
              </p>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold">{attendedCount}</div>
                <div className="text-sm text-primary-foreground/80">Events Attended</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{attendanceRate.toFixed(0)}%</div>
                <div className="text-sm text-primary-foreground/80">Attendance Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards - Mobile */}
        <div className="md:hidden grid grid-cols-2 gap-4 mb-6">
          <Card className="border-0 shadow-medium">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{attendedCount}</div>
              <div className="text-sm text-muted-foreground">Attended</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-medium">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-secondary">{attendanceRate.toFixed(0)}%</div>
              <div className="text-sm text-muted-foreground">Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance History */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Attendance History</h2>

          {attendanceData.length === 0 ? (
            <Card className="border-0 shadow-medium">
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No attendance records</h3>
                <p className="text-muted-foreground">Your attendance history will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {attendanceData.map((attendance) => (
                <Card key={attendance.eventId} className="border-0 shadow-medium hover:shadow-large transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{attendance.event.title}</h3>
                          {attendance.attended ? (
                            <Badge className="bg-secondary text-secondary-foreground">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Attended
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-muted">
                              <XCircle className="h-3 w-3 mr-1" />
                              Absent
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-muted-foreground mb-4">{attendance.event.companyName}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">Event Date</div>
                              <div className="text-muted-foreground">
                                {formatDateTime(attendance.event.startTime)}
                              </div>
                            </div>
                          </div>
                          
                          {attendance.attended && (
                            <>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <div className="font-medium">Check-in Time</div>
                                  <div className="text-muted-foreground">
                                    {formatDateTime(attendance.checkInTime)}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <div className="font-medium">GPS Accuracy</div>
                                  <div className="text-muted-foreground">
                                    ±{attendance.gpsAccuracy}m
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        {attendance.attended && !attendance.feedbackSubmitted && (
                          <Button 
                            onClick={() => navigate(`/student/feedback/${attendance.eventId}`)}
                            size="sm"
                            className="bg-gradient-primary hover:opacity-90"
                          >
                            Submit Feedback
                          </Button>
                        )}
                        {attendance.attended && attendance.feedbackSubmitted && (
                          <Button 
                            onClick={() => navigate(`/student/feedback/${attendance.eventId}`)}
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;

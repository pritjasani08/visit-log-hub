import { useEffect, useMemo } from 'react';
import { useEventStore } from '@/stores/eventStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, BarChart3, Users, Clock } from 'lucide-react';

const CompanyDashboard = () => {
  const { events, loadEvents } = useEventStore();

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
    return { totalAttendance, totalEvents };
  }, [events]);

  const attendanceShare = (count?: number) => {
    if (!totals.totalAttendance) return 0;
    return Math.round(((count || 0) / totals.totalAttendance) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">Company Analytics</h1>
          <p className="text-muted-foreground">Read-only overview of event attendance and timelines</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
        </div>

        {/* Event analysis */}
        <Card className="border-0 shadow-medium">
          <CardHeader>
            <CardTitle>Event Attendance Share</CardTitle>
            <CardDescription>Percentage share of total attendance by event</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.map((e) => {
                const share = attendanceShare(e.attendanceCount);
                const status = new Date(e.startTime).getTime() > now ? 'Upcoming' : (new Date(e.endTime).getTime() < now ? 'Completed' : 'Live');
                return (
                  <div key={e.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-semibold">{e.title}</div>
                        <div className="text-sm text-muted-foreground">{e.companyName}</div>
                      </div>
                      <Badge variant={status === 'Upcoming' ? 'secondary' : status === 'Live' ? undefined : 'outline'}>{status}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-muted-foreground">Attendance</div>
                      <div className="font-medium">{e.attendanceCount || 0}</div>
                    </div>
                    <div className="mt-2 h-2 w-full bg-muted rounded">
                      <div className="h-2 bg-primary rounded" style={{ width: `${share}%` }} />
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{share}% of total attendance</div>
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

export default CompanyDashboard;



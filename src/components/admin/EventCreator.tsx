import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useVisitStore } from '@/stores/eventStore';
import { useNavigate } from 'react-router-dom';

const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  companyName: z.string().min(2, 'Company name is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
});

type EventFormData = z.infer<typeof eventSchema>;

const EventCreator = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createVisit } = useVisitStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  const onSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);
    try {
      const event = await createVisit({
        studentId: '1', // Current admin user
        companyName: data.companyName,
        visitDate: new Date(data.startTime).toISOString().split('T')[0],
        purpose: data.description || data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        location: 'TBD', // Default location for admin-created events
      });

      toast({
        title: 'Event created!',
        description: 'Your event has been successfully created.',
      });

      navigate(`/admin/events/${event.id}/qr`);
    } catch (error) {
      toast({
        title: 'Creation failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onInvalid = () => {
    // Show a concise toast when form is invalid
    const firstError = Object.values(errors)[0];
    const errorMessage = firstError?.message || 'Some required fields are missing or invalid.';
    toast({
      title: 'Please fix the highlighted fields',
      description: errorMessage,
      variant: 'destructive',
    });
  };

  const generateDefaultTimes = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // 9 AM tomorrow
    
    const endTime = new Date(tomorrow);
    endTime.setHours(17, 0, 0, 0); // 5 PM tomorrow

    setValue('startTime', tomorrow.toISOString().slice(0, 16));
    setValue('endTime', endTime.toISOString().slice(0, 16));
  };

  useEffect(() => {
    // Auto-fill default times so the form can be submitted without manual time input
    generateDefaultTimes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin')}
            className="hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Create New Event</h1>
            <p className="text-muted-foreground">Set up a new session or industrial visit</p>
          </div>
        </div>

        <Card className="border-0 shadow-large">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Event Details
            </CardTitle>
            <CardDescription>
              Fill in the information below to create your event
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    placeholder="Tech Innovation Workshop"
                    {...register('title')}
                    className={errors.title ? 'border-destructive' : ''}
                    required
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName">Company/Organization *</Label>
                  <Input
                    id="companyName"
                    placeholder="TechCorp Solutions"
                    {...register('companyName')}
                    className={errors.companyName ? 'border-destructive' : ''}
                    required
                  />
                  {errors.companyName && (
                    <p className="text-sm text-destructive">{errors.companyName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the event, objectives, and what students will learn..."
                  rows={3}
                  {...register('description')}
                />
              </div>

              {/* Date & Time */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Schedule
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateDefaultTimes}
                  >
                    Set Default Times
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time *</Label>
                    <Input
                      id="startTime"
                      type="datetime-local"
                      {...register('startTime')}
                      className={errors.startTime ? 'border-destructive' : ''}
                      required
                    />
                    {errors.startTime && (
                      <p className="text-sm text-destructive">{errors.startTime.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time *</Label>
                    <Input
                      id="endTime"
                      type="datetime-local"
                      {...register('endTime')}
                      className={errors.endTime ? 'border-destructive' : ''}
                      required
                    />
                    {errors.endTime && (
                      <p className="text-sm text-destructive">{errors.endTime.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-primary hover:opacity-90"
                >
                  {isSubmitting ? 'Creating...' : 'Create Event'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventCreator;
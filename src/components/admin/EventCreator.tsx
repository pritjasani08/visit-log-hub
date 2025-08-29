import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, MapPin, Calendar, Clock, Building, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useEventStore } from '@/stores/eventStore';
import { useNavigate } from 'react-router-dom';

const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  companyName: z.string().min(2, 'Company name is required'),
  locationLat: z.number().min(-90).max(90),
  locationLng: z.number().min(-180).max(180),
  radiusMeters: z.number().min(10).max(1000),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  extraQuestions: z
    .array(
      z.object({
        id: z.string(),
        label: z.string().min(1),
        required: z.boolean().optional(),
        type: z.enum(['text', 'textarea', 'checkbox']).optional(),
      })
    )
    .optional(),
}).refine((data) => new Date(data.endTime) > new Date(data.startTime), {
  message: "End time must be after start time",
  path: ["endTime"],
});

type EventFormData = z.infer<typeof eventSchema>;

const EventCreator = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [newQuestionLabel, setNewQuestionLabel] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<'text' | 'textarea' | 'checkbox'>('text');
  const [newQuestionRequired, setNewQuestionRequired] = useState<'optional' | 'required'>('optional');
  const { createEvent } = useEventStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      locationLat: 40.7128, // NYC default
      locationLng: -74.0060,
      radiusMeters: 100,
      extraQuestions: [],
    },
  });

  const watchedValues = watch();

  const onSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);
    try {
      const event = await createEvent({
        ...data,
        createdById: '1', // Current admin user
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
    const firstError = Object.values(errors)[0] as any;
    toast({
      title: 'Please fix the highlighted fields',
      description: firstError?.message || 'Some required fields are missing or invalid.',
      variant: 'destructive',
    });
  };

  const handleLocationPreset = (preset: string) => {
    const presets: Record<string, { lat: number; lng: number; name: string }> = {
      nyc: { lat: 40.7128, lng: -74.0060, name: 'New York City' },
      sf: { lat: 37.7749, lng: -122.4194, name: 'San Francisco' },
      london: { lat: 51.5074, lng: -0.1278, name: 'London' },
      tokyo: { lat: 35.6762, lng: 139.6503, name: 'Tokyo' },
    };

    const location = presets[preset];
    if (location) {
      setValue('locationLat', location.lat);
      setValue('locationLng', location.lng);
      toast({
        title: 'Location set',
        description: `Location set to ${location.name}`,
      });
    }
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

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="locationLat">Latitude *</Label>
                    <Input
                      id="locationLat"
                      type="number"
                      step="any"
                      placeholder="40.7128"
                      {...register('locationLat', { valueAsNumber: true })}
                      className={errors.locationLat ? 'border-destructive' : ''}
                      required
                    />
                    {errors.locationLat && (
                      <p className="text-sm text-destructive">{errors.locationLat.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="locationLng">Longitude *</Label>
                    <Input
                      id="locationLng"
                      type="number"
                      step="any"
                      placeholder="-74.0060"
                      {...register('locationLng', { valueAsNumber: true })}
                      className={errors.locationLng ? 'border-destructive' : ''}
                      required
                    />
                    {errors.locationLng && (
                      <p className="text-sm text-destructive">{errors.locationLng.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="radiusMeters">Radius (meters) *</Label>
                    <Input
                      id="radiusMeters"
                      type="number"
                      min="10"
                      max="1000"
                      placeholder="100"
                      {...register('radiusMeters', { valueAsNumber: true })}
                      className={errors.radiusMeters ? 'border-destructive' : ''}
                      required
                    />
                    {errors.radiusMeters && (
                      <p className="text-sm text-destructive">{errors.radiusMeters.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Quick Location Presets</Label>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { key: 'nyc', label: 'New York' },
                      { key: 'sf', label: 'San Francisco' },
                      { key: 'london', label: 'London' },
                      { key: 'tokyo', label: 'Tokyo' },
                    ].map((preset) => (
                      <Button
                        key={preset.key}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleLocationPreset(preset.key)}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="text-sm text-muted-foreground bg-accent p-3 rounded-lg">
                  <p className="font-medium mb-1">Current Location:</p>
                  <p>Lat: {watchedValues.locationLat?.toFixed(6)}, Lng: {watchedValues.locationLng?.toFixed(6)}</p>
                  <p>Attendance radius: {watchedValues.radiusMeters}m</p>
                </div>
              </div>

              {/* Extra Feedback Questions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Extra Feedback Questions (optional)
                </h3>
                <div className="space-y-2">
                  <Label>Add a question</Label>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                    <div className="md:col-span-2">
                      <Input
                        placeholder="Question label (e.g., Was the tour helpful?)"
                        value={newQuestionLabel}
                        onChange={(e) => setNewQuestionLabel(e.target.value)}
                      />
                    </div>
                    <Select value={newQuestionType} onValueChange={(val) => setNewQuestionType(val as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Type (text)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="textarea">Textarea</SelectItem>
                        <SelectItem value="checkbox">Checkbox</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={newQuestionRequired} onValueChange={(val) => setNewQuestionRequired(val as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Optional/Required" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="optional">Optional</SelectItem>
                        <SelectItem value="required">Required</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const label = newQuestionLabel.trim();
                        if (!label) return;
                        const newQ = {
                          id: Math.random().toString(36).slice(2),
                          label,
                          type: newQuestionType,
                          required: newQuestionRequired === 'required',
                        } as const;
                        setValue('extraQuestions', [...(watchedValues.extraQuestions || []), newQ]);
                        setNewQuestionLabel('');
                        setNewQuestionType('text');
                        setNewQuestionRequired('optional');
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  {!!(watchedValues.extraQuestions || []).length && (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        {(watchedValues.extraQuestions || []).length} question(s) added
                      </div>
                      <div className="space-y-2">
                        {(watchedValues.extraQuestions || []).map((q) => (
                          <div key={q.id} className="flex items-center justify-between border rounded-md p-2">
                            <div className="text-sm">
                              <div className="font-medium">{q.label}</div>
                              <div className="text-muted-foreground">
                                {q.type || 'text'} · {q.required ? 'Required' : 'Optional'}
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => setValue('extraQuestions', (watchedValues.extraQuestions || []).filter(x => x.id !== q.id))}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
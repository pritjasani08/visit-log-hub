import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building, Calendar, Clock, FileText, QrCode } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useVisitStore } from '@/stores/eventStore';
import { useAuthStore } from '@/stores/authStore';

const visitSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  visitDate: z.string().min(1, 'Visit date is required'),
  purpose: z.string().min(3, 'Purpose must be at least 3 characters'), // Reduced from 10 to 3
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
}).refine((data) => {
  const start = new Date(`${data.visitDate}T${data.startTime}`);
  const end = new Date(`${data.visitDate}T${data.endTime}`);
  return end > start;
}, {
  message: "End time must be after start time",
  path: ["endTime"],
});

type VisitFormData = z.infer<typeof visitSchema>;

const VisitCreator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { createVisit, loadVisits } = useVisitStore();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm<VisitFormData>({
    resolver: zodResolver(visitSchema),
  });

  // Initialize store and load visits
  useEffect(() => {
    loadVisits();
  }, [loadVisits]);

  // Auto-fill default times
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    // Set default values using setValue
    setValue('visitDate', tomorrowStr);
    setValue('startTime', '09:00');
    setValue('endTime', '17:00');
    
    console.log('Default values set:', { visitDate: tomorrowStr, startTime: '09:00', endTime: '17:00' });
  }, [setValue]);

  const onSubmit = async (data: VisitFormData) => {
    console.log('=== FORM SUBMISSION STARTED ===');
    console.log('Form submitted with data:', data);
    console.log('User:', user);
    console.log('Form errors:', errors);
    
    setIsLoading(true);
    try {
      console.log('Calling createVisit...');
      
      // Validate required fields
      if (!data.companyName || !data.visitDate || !data.purpose || !data.startTime || !data.endTime) {
        const missingFields = [];
        if (!data.companyName) missingFields.push('Company Name');
        if (!data.visitDate) missingFields.push('Visit Date');
        if (!data.purpose) missingFields.push('Purpose');
        if (!data.startTime) missingFields.push('Start Time');
        if (!data.endTime) missingFields.push('End Time');
        
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      const visitData = {
        studentId: user.id,
        companyName: data.companyName,
        visitDate: data.visitDate,
        purpose: data.purpose,
        startTime: new Date(`${data.visitDate}T${data.startTime}`).toISOString(),
        endTime: new Date(`${data.visitDate}T${data.endTime}`).toISOString(),
      };
      
      console.log('Visit data to send:', visitData);
      
      const visit = await createVisit(visitData);

      console.log('Visit created successfully:', visit);
      console.log('Navigating to:', `/student/visits/${visit.id}/qr`);

      toast({
        title: 'Visit created successfully!',
        description: `Your industrial visit to ${data.companyName} has been created.`,
      });

      // Navigate to QR code page
      navigate(`/student/visits/${visit.id}/qr`);
    } catch (error) {
      console.error('Error creating visit:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        data: data,
        user: user
      });
      
      toast({
        title: 'Error creating visit',
        description: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    console.log('=== FORM SUBMIT EVENT TRIGGERED ===');
    console.log('Form event:', e);
    console.log('Form errors before submit:', errors);
    console.log('Form values before submit:', watch());
    
    // Prevent default form submission
    e.preventDefault();
    
    // Check if form is valid
    if (Object.keys(errors).length > 0) {
      console.log('Form has validation errors:', errors);
      toast({
        title: 'Form validation failed',
        description: 'Please fix the errors above before submitting.',
        variant: 'destructive',
      });
      return;
    }
    
    // Call the original onSubmit with the form data
    const formData = watch();
    console.log('Form data to submit:', formData);
    onSubmit(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/student')}
          className="mb-6 hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="shadow-large border-0">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
              <Building className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl">Create Industrial Visit</CardTitle>
            <CardDescription>
              Schedule a new industrial visit and generate QR code for attendance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Form Validation Summary */}
              {Object.keys(errors).length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">Please fix the following errors:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {Object.entries(errors).map(([field, error]) => (
                      <li key={field}>• {error?.message}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Company Information
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    placeholder="Enter company name (minimum 2 characters)"
                    {...register('companyName')}
                    className={errors.companyName ? 'border-destructive' : ''}
                    required
                  />
                  {errors.companyName && (
                    <p className="text-sm text-destructive">{errors.companyName.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Minimum 2 characters required. Current: {watch('companyName')?.length || 0} characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose of Visit *</Label>
                  <Textarea
                    id="purpose"
                    placeholder="Describe the purpose of your industrial visit (minimum 3 characters)..."
                    {...register('purpose')}
                    className={errors.purpose ? 'border-destructive' : ''}
                    rows={3}
                    required
                  />
                  {errors.purpose && (
                    <p className="text-sm text-destructive">{errors.purpose.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Minimum 3 characters required. Current: {watch('purpose')?.length || 0} characters
                  </p>
                </div>
              </div>

              {/* Visit Schedule */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Visit Schedule
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="visitDate">Visit Date *</Label>
                    <Input
                      id="visitDate"
                      type="date"
                      {...register('visitDate')}
                      className={errors.visitDate ? 'border-destructive' : ''}
                      required
                    />
                    {errors.visitDate && (
                      <p className="text-sm text-destructive">{errors.visitDate.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time *</Label>
                    <Input
                      id="startTime"
                      type="time"
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
                      type="time"
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

              {/* Preview */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  What happens next?
                </h3>
                
                <div className="bg-accent/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    After creating this visit, you'll get a QR code that you can:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Share with company representatives</li>
                    <li>• Display during your visit for attendance tracking</li>
                    <li>• Use to mark student attendance</li>
                  </ul>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-primary hover:opacity-90 transition-opacity text-lg py-3"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Visit...
                  </>
                ) : (
                  <>
                    <QrCode className="h-5 w-5 mr-2" />
                    Create Visit & Generate QR
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VisitCreator;

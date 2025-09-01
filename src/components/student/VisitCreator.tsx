import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building, Calendar, Clock, FileText, QrCode, Sparkles, Zap, Target, Award } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useVisitStore } from '@/stores/eventStore';
import { useAuthStore } from '@/stores/authStore';

const visitSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  visitDate: z.string().min(1, 'Visit date is required'),
  purpose: z.string().min(1, 'Purpose is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  location: z.string().min(1, 'Location is required'),
  companyAddress: z.string().optional(),
});

type VisitFormData = z.infer<typeof visitSchema>;

const VisitCreator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const { createVisit, loadVisits } = useVisitStore();
  const { user, getCurrentUser, restoreUser } = useAuthStore();
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
    const initializePage = async () => {
      try {
        setIsPageLoading(true);
        
        // Try to restore user from localStorage if not in store
        if (!user) {
          restoreUser();
        }
        
        await loadVisits();
        setIsPageLoading(false);
      } catch (err) {
        console.error('Error loading visits:', err);
        setError('Failed to load visits');
        setIsPageLoading(false);
      }
    };
    
    initializePage();
  }, [loadVisits, user, restoreUser]);

  // Auto-fill default times
  useEffect(() => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      setValue('visitDate', tomorrowStr);
      setValue('startTime', '09:00');
      setValue('endTime', '17:00');
    } catch (err) {
      console.error('Error setting default values:', err);
    }
  }, [setValue]);

  const onSubmit = async (data: VisitFormData) => {
    console.log('=== FORM SUBMISSION STARTED ===');
    console.log('Form data:', data);
    console.log('Current user:', getCurrentUser());
    
    setIsLoading(true);
    try {
      // Get current user from store or localStorage
      const currentUser = getCurrentUser();
      console.log('Current user:', currentUser);
      
      if (!currentUser?.id) {
        console.error('No user found');
        throw new Error('User not authenticated. Please login again.');
      }
      
      const visitData = {
        studentId: currentUser.id,
        companyName: data.companyName,
        visitDate: data.visitDate,
        purpose: data.purpose,
        startTime: new Date(`${data.visitDate}T${data.startTime}`).toISOString(),
        endTime: new Date(`${data.visitDate}T${data.endTime}`).toISOString(),
        location: data.location,
        companyAddress: data.companyAddress,
      };
      
      console.log('Creating visit with data:', visitData);
      const visit = await createVisit(visitData);
      console.log('Visit created successfully:', visit);

      toast({
        title: 'Visit Created Successfully! 🎉',
        description: `QR Code generated for ${data.companyName} visit. Redirecting to QR display...`,
      });

      // Brief delay to show success message, then redirect
      setTimeout(() => {
        console.log('Redirecting to QR page:', `/student/visits/${visit.id}/qr`);
        navigate(`/student/visits/${visit.id}/qr`);
      }, 1500);
    } catch (error) {
      console.error('Error creating visit:', error);
      toast({
        title: 'Error creating visit',
        description: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Simple form submission handler
  const handleSimpleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== SIMPLE FORM SUBMISSION ===');
    
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      companyName: formData.get('companyName') as string,
      visitDate: formData.get('visitDate') as string,
      purpose: formData.get('purpose') as string,
      startTime: formData.get('startTime') as string,
      endTime: formData.get('endTime') as string,
      location: formData.get('location') as string,
      companyAddress: formData.get('companyAddress') as string,
    };
    
    console.log('Simple form data:', data);
    onSubmit(data);
  };

  // Direct QR generation function for testing
  const generateQRDirectly = async () => {
    console.log('=== DIRECT QR GENERATION ===');
    setIsLoading(true);
    
    try {
      const currentUser = getCurrentUser();
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      // Create a simple visit with current form data
      const formData = watch();
      const visitData = {
        studentId: currentUser.id,
        companyName: formData.companyName || 'Test Company',
        visitDate: formData.visitDate || new Date().toISOString().split('T')[0],
        purpose: formData.purpose || 'Test Purpose',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
        location: formData.location || 'Test Location',
        companyAddress: formData.companyAddress || 'Test Address',
      };

      console.log('Direct visit data:', visitData);
      const visit = await createVisit(visitData);
      console.log('Direct visit created:', visit);

      toast({
        title: 'QR Generated Directly! 🎉',
        description: 'Visit created and QR generated successfully!',
      });

      setTimeout(() => {
        navigate(`/student/visits/${visit.id}/qr`);
      }, 1000);
    } catch (error) {
      console.error('Direct QR generation error:', error);
      toast({
        title: 'Direct QR Generation Failed',
        description: error instanceof Error ? error.message : 'Error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/student')}
          className="mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <h4 className="font-semibold text-red-800 mb-2">Error Loading Page</h4>
            <p className="text-red-700">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-2 bg-red-600 hover:bg-red-700 text-white"
            >
              Reload Page
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isPageLoading && (
          <div className="mb-6 p-8 bg-blue-50 border border-blue-200 rounded-xl text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h4 className="font-semibold text-blue-800 mb-2">Loading Visit Creator...</h4>
            <p className="text-blue-700">Please wait while we prepare the form</p>
          </div>
        )}

        {/* Form */}
        {!isPageLoading && !error && (
          <Card>
            <CardHeader>
              <CardTitle>Create Industrial Visit</CardTitle>
              <CardDescription>
                Schedule a new industrial visit and generate QR code for attendance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSimpleSubmit} className="space-y-6">
                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    placeholder="Enter company name"
                    {...register('companyName')}
                    className={errors.companyName ? 'border-destructive' : ''}
                  />
                  {errors.companyName && (
                    <p className="text-sm text-destructive">{errors.companyName.message}</p>
                  )}
                </div>

                {/* Purpose */}
                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose of Visit *</Label>
                  <Textarea
                    id="purpose"
                    name="purpose"
                    placeholder="Describe the purpose of your visit"
                    {...register('purpose')}
                    className={errors.purpose ? 'border-destructive' : ''}
                    rows={3}
                  />
                  {errors.purpose && (
                    <p className="text-sm text-destructive">{errors.purpose.message}</p>
                  )}
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="visitDate">Visit Date *</Label>
                    <Input
                      id="visitDate"
                      name="visitDate"
                      type="date"
                      {...register('visitDate')}
                      className={errors.visitDate ? 'border-destructive' : ''}
                    />
                    {errors.visitDate && (
                      <p className="text-sm text-destructive">{errors.visitDate.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time *</Label>
                    <Input
                      id="startTime"
                      name="startTime"
                      type="time"
                      {...register('startTime')}
                      className={errors.startTime ? 'border-destructive' : ''}
                    />
                    {errors.startTime && (
                      <p className="text-sm text-destructive">{errors.startTime.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time *</Label>
                    <Input
                      id="endTime"
                      name="endTime"
                      type="time"
                      {...register('endTime')}
                      className={errors.endTime ? 'border-destructive' : ''}
                    />
                    {errors.endTime && (
                      <p className="text-sm text-destructive">{errors.endTime.message}</p>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="Enter the location of the visit"
                    {...register('location')}
                    className={errors.location ? 'border-destructive' : ''}
                  />
                  {errors.location && (
                    <p className="text-sm text-destructive">{errors.location.message}</p>
                  )}
                </div>

                {/* Company Address (Optional) */}
                <div className="space-y-2">
                  <Label htmlFor="companyAddress">Company Address (Optional)</Label>
                  <Input
                    id="companyAddress"
                    name="companyAddress"
                    placeholder="Enter the company address"
                    {...register('companyAddress')}
                    className={errors.companyAddress ? 'border-destructive' : ''}
                  />
                  {errors.companyAddress && (
                    <p className="text-sm text-destructive">{errors.companyAddress.message}</p>
                  )}
                </div>

                {/* QR Code Preview */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-purple-700">
                    <QrCode className="h-5 w-5" />
                    What will be in your QR Code?
                  </h3>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl p-6 border border-purple-200/50 space-y-3">
                    <p className="text-sm text-purple-700 font-medium">
                      Your QR code will contain all these details:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-purple-600">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span><strong>Company:</strong> {watch('companyName') || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span><strong>Location:</strong> {watch('location') || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span><strong>Date:</strong> {watch('visitDate') || 'Not specified'}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span><strong>Time:</strong> {watch('startTime') || 'Not specified'} - {watch('endTime') || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span><strong>Purpose:</strong> {watch('purpose') || 'Not specified'}</span>
                        </div>
                        {watch('companyAddress') && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span><strong>Address:</strong> {watch('companyAddress')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Generating QR Code...
                    </div>
                  ) : (
                    <>
                      <QrCode className="h-5 w-5 mr-2" />
                      Create Visit & Generate QR
                    </>
                  )}
                </Button>

                {/* Test Button - Remove this after fixing */}
                <Button
                  type="button"
                  onClick={() => {
                    console.log('Test button clicked');
                    console.log('Form values:', watch());
                    console.log('Form errors:', errors);
                    console.log('Current user:', getCurrentUser());
                  }}
                  className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  Test - Check Form Status
                </Button>

                {/* Direct QR Generation Button - Remove this after fixing */}
                <Button
                  type="button"
                  onClick={generateQRDirectly}
                  disabled={isLoading}
                  className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white"
                >
                  {isLoading ? 'Generating QR...' : 'Generate QR Directly (Bypass Form)'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VisitCreator;

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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animated background effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Floating particles for background
    const particles: Array<{x: number, y: number, vx: number, vy: number, size: number, opacity: number, color: string}> = [];
    for (let i = 0; i < 45; i++) {
      const colors = [
        'hsla(160, 84%, 39%, 0.3)',
        'hsla(238, 54%, 55%, 0.3)',
        'hsla(160, 74%, 50%, 0.3)',
        'hsla(238, 64%, 70%, 0.3)'
      ];
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    // Floating geometric shapes
    const shapes = [
      { x: 100, y: 100, size: 18, rotation: 0, speed: 0.02, type: 'circle' },
      { x: canvas.width - 120, y: 80, size: 20, rotation: 0, speed: 0.03, type: 'square' },
      { x: 200, y: canvas.height - 100, size: 22, rotation: 0, speed: 0.025, type: 'triangle' },
    ];

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Update and draw shapes
      shapes.forEach(shape => {
        shape.rotation += shape.speed;
        
        ctx.save();
        ctx.translate(shape.x, shape.y);
        ctx.rotate(shape.rotation);
        
        const floatOffset = Math.sin(Date.now() * 0.001 + shape.x * 0.01) * 2;
        ctx.translate(0, floatOffset);
        
        switch (shape.type) {
          case 'circle':
            ctx.fillStyle = 'hsla(160, 84%, 39%, 0.1)';
            ctx.beginPath();
            ctx.arc(0, 0, shape.size, 0, Math.PI * 2);
            ctx.fill();
            break;
          case 'square':
            ctx.fillStyle = 'hsla(238, 54%, 55%, 0.1)';
            ctx.fillRect(-shape.size, -shape.size, shape.size * 2, shape.size * 2);
            break;
          case 'triangle':
            ctx.fillStyle = 'hsla(160, 74%, 50%, 0.1)';
            ctx.beginPath();
            ctx.moveTo(0, -shape.size);
            ctx.lineTo(-shape.size, shape.size);
            ctx.lineTo(shape.size, shape.size);
            ctx.closePath();
            ctx.fill();
            break;
        }
        
        ctx.restore();
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm<VisitFormData>({
    resolver: zodResolver(visitSchema),
  });

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
        style={{ background: 'transparent' }}
      />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Enhanced Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate('/student')}
            className="mb-8 hover:bg-white/20 hover:text-white transition-all duration-300 backdrop-blur-sm bg-white/10 text-foreground rounded-full px-6 py-3 group"
          >
            <ArrowLeft className="h-5 w-5 mr-3 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Dashboard
          </Button>

          {/* Enhanced Card */}
          <Card className="shadow-2xl border-0 backdrop-blur-enhanced bg-white/90 hover:bg-white/95 transition-all duration-500 transform hover:scale-[1.02]">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Building className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold gradient-text-animated">Create Industrial Visit</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Schedule a new industrial visit and generate QR code for attendance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleFormSubmit} className="space-y-6">
                {/* Form Validation Summary */}
                {Object.keys(errors).length > 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Please fix the following errors:
                    </h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {Object.entries(errors).map(([field, error]) => (
                        <li key={field}>• {error?.message}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Company Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-emerald-700">
                    <Building className="h-5 w-5" />
                    Company Information
                  </h3>
                  
                  <div className="space-y-3">
                    <Label htmlFor="companyName" className="text-base font-semibold">Company Name *</Label>
                    <Input
                      id="companyName"
                      placeholder="Enter company name (minimum 2 characters)"
                      {...register('companyName')}
                      className={`h-12 text-base transition-all duration-300 focus:scale-[1.02] focus:shadow-lg ${
                        errors.companyName ? 'border-destructive ring-destructive/20' : 'border-muted focus:border-emerald-500'
                      }`}
                      required
                    />
                    {errors.companyName && (
                      <p className="text-sm text-destructive animate-pulse">{errors.companyName.message}</p>
                    )}
                    <div className="p-3 bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-lg border border-emerald-200/50">
                      <p className="text-xs text-emerald-700 flex items-center gap-2">
                        <Sparkles className="h-3 w-3" />
                        Minimum 2 characters required. Current: {watch('companyName')?.length || 0} characters
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="purpose" className="text-base font-semibold">Purpose of Visit *</Label>
                    <Textarea
                      id="purpose"
                      placeholder="Describe the purpose of your industrial visit (minimum 3 characters)..."
                      {...register('purpose')}
                      className={`transition-all duration-300 focus:scale-[1.02] focus:shadow-lg ${
                        errors.purpose ? 'border-destructive ring-destructive/20' : 'border-muted focus:border-emerald-500'
                      }`}
                      rows={3}
                      required
                    />
                    {errors.purpose && (
                      <p className="text-sm text-destructive animate-pulse">{errors.purpose.message}</p>
                    )}
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-lg border border-blue-200/50">
                      <p className="text-xs text-blue-700 flex items-center gap-2">
                        <FileText className="h-3 w-3" />
                        Minimum 3 characters required. Current: {watch('purpose')?.length || 0} characters
                      </p>
                    </div>
                  </div>
                </div>

                {/* Visit Schedule */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-700">
                    <Calendar className="h-5 w-5" />
                    Visit Schedule
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="visitDate" className="text-base font-semibold">Visit Date *</Label>
                      <Input
                        id="visitDate"
                        type="date"
                        {...register('visitDate')}
                        className={`h-12 text-base transition-all duration-300 focus:scale-[1.02] focus:shadow-lg ${
                          errors.visitDate ? 'border-destructive ring-destructive/20' : 'border-muted focus:border-blue-500'
                        }`}
                        required
                      />
                      {errors.visitDate && (
                        <p className="text-sm text-destructive animate-pulse">{errors.visitDate.message}</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="startTime" className="text-base font-semibold">Start Time *</Label>
                      <Input
                        id="startTime"
                        type="time"
                        {...register('startTime')}
                        className={`h-12 text-base transition-all duration-300 focus:scale-[1.02] focus:shadow-lg ${
                          errors.startTime ? 'border-destructive ring-destructive/20' : 'border-muted focus:border-blue-500'
                        }`}
                        required
                      />
                      {errors.startTime && (
                        <p className="text-sm text-destructive animate-pulse">{errors.startTime.message}</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="endTime" className="text-base font-semibold">End Time *</Label>
                      <Input
                        id="endTime"
                        type="time"
                        {...register('endTime')}
                        className={`h-12 text-base transition-all duration-300 focus:scale-[1.02] focus:shadow-lg ${
                          errors.endTime ? 'border-destructive ring-destructive/20' : 'border-muted focus:border-blue-500'
                        }`}
                        required
                      />
                      {errors.endTime && (
                        <p className="text-sm text-destructive animate-pulse">{errors.endTime.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-purple-700">
                    <QrCode className="h-5 w-5" />
                    What happens next?
                  </h3>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl p-6 border border-purple-200/50 space-y-3">
                    <p className="text-sm text-purple-700 font-medium">
                      After creating this visit, you'll get a QR code that you can:
                    </p>
                    <ul className="text-sm text-purple-600 space-y-2 ml-4">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        Share with company representatives
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        Display during your visit for attendance tracking
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        Use to mark student attendance
                      </li>
                    </ul>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg btn-3d-hover"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating Visit...
                    </div>
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
    </div>
  );
};

export default VisitCreator;

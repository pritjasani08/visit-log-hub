import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Star, CheckCircle, MessageSquare, Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useVisitStore } from '@/stores/eventStore';
import { useAuthStore } from '@/stores/authStore';

const feedbackSchema = z.object({
  starsContent: z.number().min(1, 'Please rate the content quality'),
  starsDelivery: z.number().min(1, 'Please rate the delivery'),
  starsRelevance: z.number().min(1, 'Please rate the relevance'),
  recommend: z.boolean(),
  shortAnswer: z.string().min(10, 'Please provide a brief feedback (at least 10 characters)'),
  longAnswer: z.string().min(20, 'Please provide detailed feedback (at least 20 characters)'),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

const FeedbackForm = () => {
  const { visitId } = useParams<{ visitId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { visits, submitFeedback } = useVisitStore();
  const { user } = useAuthStore();
  
  const [visit, setVisit] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredStar, setHoveredStar] = useState<{ field: string; value: number } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      starsContent: 0,
      starsDelivery: 0,
      starsRelevance: 0,
      recommend: true,
      shortAnswer: '',
      longAnswer: '',
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    if (visitId) {
      const foundVisit = visits.find(v => v.id === visitId);
      if (foundVisit) {
        setVisit(foundVisit);
      } else {
        // If visit not found, create a mock visit for demo
        setVisit({
          id: visitId,
          companyName: 'Company Name',
          purpose: 'Industrial Visit Purpose',
          visitDate: new Date().toISOString().split('T')[0],
        });
      }
    }
  }, [visitId, visits]);

  const handleStarClick = (field: string, value: number) => {
    setValue(field as keyof FeedbackFormData, value);
  };

  const renderStarRating = (field: string, value: number, label: string) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleStarClick(field, star)}
            onMouseEnter={() => setHoveredStar({ field, value: star })}
            onMouseLeave={() => setHoveredStar(null)}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                star <= (hoveredStar?.field === field ? hoveredStar.value : value)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {value > 0 ? `${value} star${value > 1 ? 's' : ''}` : 'Click to rate'}
      </p>
    </div>
  );

  const onSubmit = async (data: FeedbackFormData) => {
    if (!visitId) return;
    
    setIsLoading(true);
    try {
      await submitFeedback({
        visitId,
        ...data,
      });

      toast({
        title: 'Feedback submitted successfully!',
        description: 'Thank you for your valuable feedback.',
      });

      // Navigate back to student dashboard
      navigate('/student');
    } catch (error) {
      toast({
        title: 'Error submitting feedback',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!visit) {
    return (
      <div className="min-h-screen bg-gradient-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading visit details...</p>
        </div>
      </div>
    );
  }

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
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Attendance Confirmed!</CardTitle>
            <CardDescription>
              Please provide feedback about your industrial visit to {visit.companyName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Visit Summary */}
              <div className="bg-accent/50 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold">Visit Summary</h4>
                <p className="text-sm text-muted-foreground">
                  <strong>Company:</strong> {visit.companyName}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Date:</strong> {visit.visitDate}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Purpose:</strong> {visit.purpose}
                </p>
              </div>

              {/* Star Ratings */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Rate Your Experience
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {renderStarRating('starsContent', watchedValues.starsContent, 'Content Quality')}
                  {renderStarRating('starsDelivery', watchedValues.starsDelivery, 'Delivery')}
                  {renderStarRating('starsRelevance', watchedValues.starsRelevance, 'Relevance')}
                </div>
              </div>

              {/* Recommendation */}
              <div className="space-y-3">
                <h4 className="text-lg font-semibold">Would you recommend this visit?</h4>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="true"
                      checked={watchedValues.recommend === true}
                      onChange={() => setValue('recommend', true)}
                      className="w-4 h-4 text-primary"
                    />
                    <span>Yes, definitely!</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="false"
                      checked={watchedValues.recommend === false}
                      onChange={() => setValue('recommend', false)}
                      className="w-4 h-4 text-primary"
                    />
                    <span>No, not really</span>
                  </label>
                </div>
              </div>

              {/* Short Feedback */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Brief Feedback <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="Share your overall impression in a few words..."
                  {...register('shortAnswer')}
                  className={errors.shortAnswer ? 'border-destructive' : ''}
                  rows={2}
                />
                {errors.shortAnswer && (
                  <p className="text-sm text-destructive">{errors.shortAnswer.message}</p>
                )}
              </div>

              {/* Detailed Feedback */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Detailed Feedback <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="Tell us more about your experience, what you learned, and suggestions for improvement..."
                  {...register('longAnswer')}
                  className={errors.longAnswer ? 'border-destructive' : ''}
                  rows={4}
                />
                {errors.longAnswer && (
                  <p className="text-sm text-destructive">{errors.longAnswer.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
              >
                {isLoading ? (
                  'Submitting Feedback...'
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Feedback
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

export default FeedbackForm;
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Star, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useEventStore } from '@/stores/eventStore';
import { useNavigate } from 'react-router-dom';

const feedbackSchema = z.object({
  starsContent: z.number().min(1, 'Please rate the content').max(5),
  starsDelivery: z.number().min(1, 'Please rate the delivery').max(5),
  starsRelevance: z.number().min(1, 'Please rate the relevance').max(5),
  recommend: z.boolean(),
  shortAnswer: z.string().optional(),
  longAnswer: z.string().optional(),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

const FeedbackForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { submitFeedback } = useEventStore();
  const { toast } = useToast();
  const navigate = useNavigate();

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
      recommend: false,
    },
  });

  const watchedValues = watch();

  const StarRating = ({ 
    label, 
    value, 
    onChange, 
    error 
  }: { 
    label: string; 
    value: number; 
    onChange: (value: number) => void;
    error?: string;
  }) => {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="transition-colors hover:scale-110 transition-transform"
            >
              <Star
                className={`h-8 w-8 ${
                  star <= value 
                    ? 'fill-yellow-400 text-yellow-400' 
                    : 'text-muted-foreground hover:text-yellow-400'
                }`}
              />
            </button>
          ))}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  };

  const onSubmit = async (data: FeedbackFormData) => {
    setIsSubmitting(true);
    try {
      const success = await submitFeedback({
        eventId: '1', // In real app, this would come from props/params
        ...data,
      });

      if (success) {
        setSubmitted(true);
        toast({
          title: 'Feedback submitted!',
          description: 'Thank you for your valuable feedback.',
        });
      } else {
        toast({
          title: 'Submission failed',
          description: 'Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-surface flex items-center justify-center">
        <Card className="w-full max-w-md border-0 shadow-large">
          <CardContent className="p-8 text-center">
            <div className="bg-secondary/10 p-6 rounded-full w-fit mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Feedback Submitted!</h3>
            <p className="text-muted-foreground mb-6">
              Thank you for taking the time to provide your feedback. It helps us improve future sessions.
            </p>
            <Button 
              onClick={() => navigate('/student')}
              className="bg-gradient-primary hover:opacity-90"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/student')}
            className="hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Session Feedback</h1>
            <p className="text-muted-foreground">Help us improve by sharing your experience</p>
          </div>
        </div>

        <Card className="border-0 shadow-large">
          <CardHeader>
            <CardTitle>Tech Innovation Workshop</CardTitle>
            <CardDescription>TechCorp Solutions - Please rate your experience</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Rating Sections */}
              <div className="space-y-6">
                <StarRating
                  label="Content Quality"
                  value={watchedValues.starsContent}
                  onChange={(value) => setValue('starsContent', value)}
                  error={errors.starsContent?.message}
                />

                <StarRating
                  label="Delivery & Presentation"
                  value={watchedValues.starsDelivery}
                  onChange={(value) => setValue('starsDelivery', value)}
                  error={errors.starsDelivery?.message}
                />

                <StarRating
                  label="Relevance to Studies"
                  value={watchedValues.starsRelevance}
                  onChange={(value) => setValue('starsRelevance', value)}
                  error={errors.starsRelevance?.message}
                />
              </div>

              {/* Text Feedback */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shortAnswer">What did you like most about this session?</Label>
                  <Textarea
                    id="shortAnswer"
                    placeholder="Share the highlights of your experience..."
                    {...register('shortAnswer')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longAnswer">Suggestions for improvement</Label>
                  <Textarea
                    id="longAnswer"
                    placeholder="How can we make future sessions even better?"
                    rows={4}
                    {...register('longAnswer')}
                  />
                </div>
              </div>

              {/* Recommendation */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recommend"
                  checked={watchedValues.recommend}
                  onCheckedChange={(checked) => setValue('recommend', !!checked)}
                />
                <Label htmlFor="recommend" className="text-sm font-medium leading-none">
                  I would recommend this session to other students
                </Label>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/student')}
                  className="flex-1"
                >
                  Skip for now
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-primary hover:opacity-90"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FeedbackForm;
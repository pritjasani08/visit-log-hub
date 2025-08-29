import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Settings, MapPin, FileText, Plus, Trash2, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useVisitStore } from '@/stores/eventStore';

const radiusSchema = z.object({
  radius: z.number().min(100, 'Radius must be at least 100 meters').max(10000, 'Radius cannot exceed 10km'),
});

const feedbackQuestionSchema = z.object({
  label: z.string().min(3, 'Question must be at least 3 characters'),
  type: z.enum(['text', 'textarea', 'checkbox']),
  required: z.boolean(),
});

type RadiusFormData = z.infer<typeof radiusSchema>;
type FeedbackQuestionData = z.infer<typeof feedbackQuestionSchema>;

const AdminSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentRadius, setCurrentRadius] = useState(500); // Default 500m
  const [feedbackQuestions, setFeedbackQuestions] = useState<Array<FeedbackQuestionData & { id: string }>>([
    {
      id: '1',
      label: 'What did you learn from this visit?',
      type: 'textarea',
      required: true,
    },
    {
      id: '2',
      label: 'Would you recommend this company to other students?',
      type: 'checkbox',
      required: false,
    },
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RadiusFormData>({
    resolver: zodResolver(radiusSchema),
    defaultValues: {
      radius: currentRadius,
    },
  });

  const {
    register: registerQuestion,
    handleSubmit: handleSubmitQuestion,
    formState: { errors: questionErrors },
    reset: resetQuestion,
  } = useForm<FeedbackQuestionData>({
    resolver: zodResolver(feedbackQuestionSchema),
    defaultValues: {
      label: '',
      type: 'text',
      required: false,
    },
  });

  const onSubmitRadius = (data: RadiusFormData) => {
    setCurrentRadius(data.radius);
    toast({
      title: 'Radius updated!',
      description: `Visit radius has been set to ${data.radius} meters.`,
    });
    reset();
  };

  const onSubmitQuestion = (data: FeedbackQuestionData) => {
    const newQuestion = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
    };
    
    setFeedbackQuestions(prev => [...prev, newQuestion]);
    toast({
      title: 'Question added!',
      description: 'New feedback question has been added to the form.',
    });
    resetQuestion();
  };

  const removeQuestion = (id: string) => {
    setFeedbackQuestions(prev => prev.filter(q => q.id !== id));
    toast({
      title: 'Question removed',
      description: 'Feedback question has been removed.',
    });
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'text': return 'Short Text';
      case 'textarea': return 'Long Text';
      case 'checkbox': return 'Yes/No';
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin')}
          className="mb-6 hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
            <Settings className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Admin Settings</h1>
          <p className="text-muted-foreground">
            Configure visit radius and customize feedback forms
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Radius Settings */}
          <Card className="shadow-large border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Visit Radius Settings
              </CardTitle>
              <CardDescription>
                Set the maximum distance students can be from the company location to mark attendance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Radius Display */}
              <div className="bg-accent/50 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">Current Radius</p>
                <p className="text-3xl font-bold text-primary">{currentRadius}m</p>
                <p className="text-sm text-muted-foreground">
                  {currentRadius >= 1000 ? `${(currentRadius / 1000).toFixed(1)}km` : `${currentRadius}m`}
                </p>
              </div>

              {/* Radius Update Form */}
              <form onSubmit={handleSubmit(onSubmitRadius)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="radius">New Radius (meters)</Label>
                  <Input
                    id="radius"
                    type="number"
                    placeholder="Enter radius in meters"
                    {...register('radius', { valueAsNumber: true })}
                    className={errors.radius ? 'border-destructive' : ''}
                    min="100"
                    max="10000"
                    step="100"
                  />
                  {errors.radius && (
                    <p className="text-sm text-destructive">{errors.radius.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Range: 100m - 10km (1000m = 1km)
                  </p>
                </div>

                <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90">
                  <Save className="h-4 w-4 mr-2" />
                  Update Radius
                </Button>
              </form>

              {/* Radius Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Students must be within this radius to mark attendance</li>
                  <li>GPS coordinates are verified during QR code scanning</li>
                  <li>Larger radius allows for more flexible attendance marking</li>
                  <li>Smaller radius ensures students are physically present</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Feedback Form Builder */}
          <Card className="shadow-large border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Feedback Form Builder
              </CardTitle>
              <CardDescription>
                Create custom questions for student feedback forms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add New Question Form */}
              <form onSubmit={handleSubmitQuestion(onSubmitQuestion)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="question-label">Question Text</Label>
                  <Textarea
                    id="question-label"
                    placeholder="Enter your question..."
                    {...registerQuestion('label')}
                    className={questionErrors.label ? 'border-destructive' : ''}
                    rows={2}
                  />
                  {questionErrors.label && (
                    <p className="text-sm text-destructive">{questionErrors.label.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="question-type">Question Type</Label>
                    <select
                      {...registerQuestion('type')}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="text">Short Text</option>
                      <option value="textarea">Long Text</option>
                      <option value="checkbox">Yes/No</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="question-required">Required</Label>
                    <select
                      {...registerQuestion('required')}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="false">Optional</option>
                      <option value="true">Required</option>
                    </select>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </form>

              {/* Existing Questions */}
              <div className="space-y-3">
                <h4 className="font-semibold">Current Questions</h4>
                {feedbackQuestions.map((question) => (
                  <div
                    key={question.id}
                    className="flex items-center justify-between p-3 bg-accent/50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{question.label}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                          {getQuestionTypeLabel(question.type)}
                        </span>
                        {question.required && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                            Required
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(question.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Form Preview Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">Form Preview:</h4>
                <p className="text-sm text-green-800">
                  Students will see these questions after marking attendance. 
                  Standard rating questions (content, delivery, relevance) are always included.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;

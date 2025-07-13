import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { MessageCircle, Star, Send, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const feedbackSchema = z.object({
  usefulness: z.enum(['1', '2', '3', '4', '5'], {
    required_error: "Please rate the usefulness of this app"
  }),
  easeOfUse: z.enum(['1', '2', '3', '4', '5'], {
    required_error: "Please rate the ease of use"
  }),
  overallSatisfaction: z.enum(['1', '2', '3', '4', '5'], {
    required_error: "Please rate your overall satisfaction"
  }),
  mostHelpfulFeature: z.string().min(1, "Please tell us what you found most helpful"),
  suggestedImprovements: z.string().min(1, "Please share any suggestions for improvement"),
  additionalComments: z.string().optional()
});

type FeedbackData = z.infer<typeof feedbackSchema>;

const ratingLabels = {
  '1': 'Very Poor',
  '2': 'Poor', 
  '3': 'Average',
  '4': 'Good',
  '5': 'Excellent'
};

// Function to track analytics events
const trackAnalytics = async (eventType: 'view' | 'submit') => {
  try {
    await fetch('/api/feedback/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventType,
        formType: 'feedback'
      }),
    });
  } catch (error) {
    console.error('Error tracking analytics:', error);
  }
};

export function FeedbackForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  // Track when the feedback form is viewed
  useEffect(() => {
    trackAnalytics('view');
  }, []);

  const form = useForm<FeedbackData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      usefulness: undefined,
      easeOfUse: undefined,
      overallSatisfaction: undefined,
      mostHelpfulFeature: '',
      suggestedImprovements: '',
      additionalComments: ''
    }
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: async (data: FeedbackData) => {
      const response = await apiRequest('POST', '/api/feedback', data);
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Thank you for your feedback!",
        description: "Your input helps us improve the application.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error submitting feedback",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: FeedbackData) => {
    // Track submission attempt
    trackAnalytics('submit');
    submitFeedbackMutation.mutate(data);
  };

  if (isSubmitted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            Thank You for Your Feedback!
          </h3>
          <p className="text-green-700">
            Your input is valuable and helps us continue improving this application for CNAs like you.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
          <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
          Help Us Improve - Share Your Feedback
        </CardTitle>
        <p className="text-sm text-gray-600">
          Your experience matters! Please take a moment to help us make this tool better for CNAs.
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Rating Questions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="usefulness"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center font-medium">
                      <Star className="h-4 w-4 mr-1 text-yellow-500" />
                      How useful is this app?
                    </FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} value={field.value}>
                        {Object.entries(ratingLabels).map(([value, label]) => (
                          <div key={value} className="flex items-center space-x-2">
                            <RadioGroupItem value={value} id={`usefulness-${value}`} />
                            <Label htmlFor={`usefulness-${value}`} className="text-sm">
                              {value} - {label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="easeOfUse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center font-medium">
                      <Star className="h-4 w-4 mr-1 text-yellow-500" />
                      How easy to use?
                    </FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} value={field.value}>
                        {Object.entries(ratingLabels).map(([value, label]) => (
                          <div key={value} className="flex items-center space-x-2">
                            <RadioGroupItem value={value} id={`ease-${value}`} />
                            <Label htmlFor={`ease-${value}`} className="text-sm">
                              {value} - {label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="overallSatisfaction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center font-medium">
                      <Star className="h-4 w-4 mr-1 text-yellow-500" />
                      Overall satisfaction?
                    </FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} value={field.value}>
                        {Object.entries(ratingLabels).map(([value, label]) => (
                          <div key={value} className="flex items-center space-x-2">
                            <RadioGroupItem value={value} id={`satisfaction-${value}`} />
                            <Label htmlFor={`satisfaction-${value}`} className="text-sm">
                              {value} - {label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Text Questions */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="mostHelpfulFeature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">
                      What feature did you find most helpful?
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g., Multi-language support, step-by-step form, AI report generation..."
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="suggestedImprovements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">
                      What would you change or improve?
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g., Add more form fields, improve navigation, different report format..."
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additionalComments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">
                      Any additional comments? (Optional)
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Share any other thoughts about your experience..."
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={submitFeedbackMutation.isPending}
            >
              {submitFeedbackMutation.isPending ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Feedback
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Star, MessageSquare, TrendingUp, Users } from 'lucide-react';

interface FeedbackData {
  id: number;
  usefulness: number;
  easeOfUse: number;
  overallSatisfaction: number;
  mostHelpfulFeature: string;
  suggestedImprovements: string;
  additionalComments?: string;
  submittedAt: string;
}

interface FeedbackStats {
  totalResponses: number;
  averageUsefulness: number;
  averageEaseOfUse: number;
  averageSatisfaction: number;
  ratingDistribution: Array<{ rating: number; count: number }>;
  topFeatures: Array<{ feature: string; count: number }>;
  commonSuggestions: Array<{ suggestion: string; count: number }>;
}

export default function FeedbackDashboard() {
  const [authKey, setAuthKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { data: feedbackData, isLoading, error } = useQuery({
    queryKey: ['/api/admin/feedback'],
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: feedbackStats } = useQuery({
    queryKey: ['/api/admin/feedback/stats'],
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  const handleAuth = () => {
    // Simple admin key check - replace with your secure method
    if (authKey === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('Invalid access key');
    }
  };

  const exportFeedback = () => {
    if (!feedbackData) return;
    
    const csv = [
      ['ID', 'Submitted', 'Usefulness', 'Ease of Use', 'Satisfaction', 'Most Helpful', 'Improvements', 'Comments'].join(','),
      ...feedbackData.map((item: FeedbackData) => [
        item.id,
        item.submittedAt,
        item.usefulness,
        item.easeOfUse,
        item.overallSatisfaction,
        `"${item.mostHelpfulFeature.replace(/"/g, '""')}"`,
        `"${item.suggestedImprovements.replace(/"/g, '""')}"`,
        `"${(item.additionalComments || '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen bg-neutral-50">
        <div className="flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Admin Access Required</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                type="password"
                placeholder="Enter admin access key"
                value={authKey}
                onChange={(e) => setAuthKey(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
              />
              <Button onClick={handleAuth} className="w-full">
                Access Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading feedback data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">Error loading feedback data</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Feedback Dashboard</h1>
            <Button onClick={exportFeedback} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {feedbackStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Responses</p>
                    <p className="text-2xl font-bold text-gray-900">{feedbackStats.totalResponses}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Star className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Usefulness</p>
                    <p className="text-2xl font-bold text-gray-900">{feedbackStats.averageUsefulness.toFixed(1)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Ease of Use</p>
                    <p className="text-2xl font-bold text-gray-900">{feedbackStats.averageEaseOfUse.toFixed(1)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <MessageSquare className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Satisfaction</p>
                    <p className="text-2xl font-bold text-gray-900">{feedbackStats.averageSatisfaction.toFixed(1)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="responses">All Responses</TabsTrigger>
            <TabsTrigger value="analysis">Text Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Rating Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={feedbackStats?.ratingDistribution || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="rating" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Satisfaction Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={feedbackStats?.ratingDistribution || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ rating, count }) => `${rating} stars (${count})`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {(feedbackStats?.ratingDistribution || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="responses">
            <Card>
              <CardHeader>
                <CardTitle>All Feedback Responses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {feedbackData?.map((item: FeedbackData) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex space-x-4">
                          <Badge variant="outline">Usefulness: {item.usefulness}/5</Badge>
                          <Badge variant="outline">Ease: {item.easeOfUse}/5</Badge>
                          <Badge variant="outline">Satisfaction: {item.overallSatisfaction}/5</Badge>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(item.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <strong>Most Helpful:</strong> {item.mostHelpfulFeature}
                        </div>
                        <div>
                          <strong>Improvements:</strong> {item.suggestedImprovements}
                        </div>
                        {item.additionalComments && (
                          <div>
                            <strong>Additional Comments:</strong> {item.additionalComments}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Helpful Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {feedbackStats?.topFeatures?.map((feature, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">{feature.feature}</span>
                        <Badge>{feature.count} mentions</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Common Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {feedbackStats?.commonSuggestions?.map((suggestion, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">{suggestion.suggestion}</span>
                        <Badge>{suggestion.count} mentions</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
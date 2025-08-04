import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { t } from "@/utils/i18n";
import { 
  Lightbulb, 
  Star, 
  MessageSquare, 
  Bug, 
  Plus, 
  ThumbsUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Users
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const suggestionSchema = z.object({
  userName: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  suggestionType: z.enum(["feature_improvement", "new_feature", "bug_report", "other"]),
  featureArea: z.string().optional(),
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
});

type SuggestionFormData = z.infer<typeof suggestionSchema>;

interface Suggestion {
  id: number;
  userName?: string;
  email?: string;
  suggestionType: string;
  featureArea?: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  userVotes: number;
  adminResponse?: string;
  respondedAt?: string;
  createdAt: string;
}

const suggestionTypeIcons = {
  feature_improvement: Star,
  new_feature: Plus,
  bug_report: Bug,
  other: MessageSquare,
};

const statusColors = {
  submitted: "bg-blue-100 text-blue-800",
  under_review: "bg-yellow-100 text-yellow-800", 
  in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  declined: "bg-red-100 text-red-800",
};

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

export default function Suggestions() {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<SuggestionFormData>({
    resolver: zodResolver(suggestionSchema),
    defaultValues: {
      suggestionType: "feature_improvement",
      priority: "medium",
      userName: "",
      email: "",
      featureArea: "",
      title: "",
      description: "",
    },
  });

  const { data: suggestions = [], isLoading } = useQuery<Suggestion[]>({
    queryKey: ["/api/suggestions"],
  });

  const createSuggestionMutation = useMutation({
    mutationFn: async (data: SuggestionFormData) => {
      return apiRequest("/api/suggestions", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: t("suggestionSubmitted"),
        description: t("suggestionSubmittedMessage"),
      });
      form.reset();
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["/api/suggestions"] });
    },
    onError: () => {
      toast({
        title: t("error"),
        description: t("suggestionSubmissionFailed"),
        variant: "destructive",
      });
    },
  });

  const voteMutation = useMutation({
    mutationFn: async (suggestionId: number) => {
      return apiRequest(`/api/suggestions/${suggestionId}/vote`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suggestions"] });
      toast({
        title: t("voteRecorded"),
        description: t("voteRecordedMessage"),
      });
    },
  });

  const onSubmit = (data: SuggestionFormData) => {
    createSuggestionMutation.mutate(data);
  };

  const handleVote = (suggestionId: number) => {
    voteMutation.mutate(suggestionId);
  };

  const filteredSuggestions = suggestions.filter(suggestion => {
    if (filter === "all") return true;
    if (filter === "my_votes") return suggestion.userVotes > 0;
    return suggestion.status === filter;
  });

  const groupedSuggestions = filteredSuggestions.reduce((acc, suggestion) => {
    const status = suggestion.status;
    if (!acc[status]) acc[status] = [];
    acc[status].push(suggestion);
    return acc;
  }, {} as Record<string, Suggestion[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Lightbulb className="h-8 w-8 text-yellow-500" />
            <h1 className="text-3xl font-bold text-gray-900">
              {t("suggestionCenter")}
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("suggestionCenterDescription")}
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center space-x-4">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t("filterSuggestions")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allSuggestions")}</SelectItem>
                <SelectItem value="submitted">{t("submitted")}</SelectItem>
                <SelectItem value="under_review">{t("underReview")}</SelectItem>
                <SelectItem value="in_progress">{t("inProgress")}</SelectItem>
                <SelectItem value="completed">{t("completed")}</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-gray-500">
              {filteredSuggestions.length} {t("suggestions")}
            </div>
          </div>
          
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("submitSuggestion")}
          </Button>
        </div>

        {/* Suggestion Form */}
        {showForm && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                <span>{t("submitNewSuggestion")}</span>
              </CardTitle>
              <CardDescription>
                {t("suggestionFormDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="userName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("name")} ({t("optional")})</FormLabel>
                          <FormControl>
                            <Input placeholder={t("yourName")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("email")} ({t("optional")})</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder={t("yourEmail")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="suggestionType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("suggestionType")}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("selectType")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="feature_improvement">{t("featureImprovement")}</SelectItem>
                              <SelectItem value="new_feature">{t("newFeature")}</SelectItem>
                              <SelectItem value="bug_report">{t("bugReport")}</SelectItem>
                              <SelectItem value="other">{t("other")}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="featureArea"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("featureArea")} ({t("optional")})</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("selectArea")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="incident_reports">{t("incidentReports")}</SelectItem>
                              <SelectItem value="adl_tracker">{t("adlTracker")}</SelectItem>
                              <SelectItem value="shift_handoff">{t("shiftHandoff")}</SelectItem>
                              <SelectItem value="general_statements">{t("generalStatements")}</SelectItem>
                              <SelectItem value="general">{t("general")}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("priority")}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("selectPriority")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">{t("low")}</SelectItem>
                              <SelectItem value="medium">{t("medium")}</SelectItem>
                              <SelectItem value="high">{t("high")}</SelectItem>
                              <SelectItem value="urgent">{t("urgent")}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("title")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("suggestionTitlePlaceholder")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("description")}</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder={t("suggestionDescriptionPlaceholder")}
                            className="min-h-32"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowForm(false)}
                    >
                      {t("cancel")}
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createSuggestionMutation.isPending}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      {createSuggestionMutation.isPending ? t("submitting") : t("submitSuggestion")}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Suggestions List */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">{t("loadingSuggestions")}</p>
            </div>
          ) : Object.keys(groupedSuggestions).length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t("noSuggestionsYet")}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t("noSuggestionsMessage")}
                </p>
                <Button 
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("submitFirstSuggestion")}
                </Button>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedSuggestions).map(([status, statusSuggestions]) => (
              <div key={status} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-semibold text-gray-900 capitalize">
                    {t(status.replace('_', ''))}
                  </h2>
                  <Badge variant="secondary">{statusSuggestions.length}</Badge>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {statusSuggestions.map((suggestion) => {
                    const TypeIcon = suggestionTypeIcons[suggestion.suggestionType as keyof typeof suggestionTypeIcons] || MessageSquare;
                    
                    return (
                      <Card key={suggestion.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2">
                              <TypeIcon className="h-5 w-5 text-blue-600" />
                              <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={priorityColors[suggestion.priority as keyof typeof priorityColors]}>
                                {t(suggestion.priority)}
                              </Badge>
                              <Badge className={statusColors[suggestion.status as keyof typeof statusColors]}>
                                {t(suggestion.status.replace('_', ''))}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            {suggestion.userName && (
                              <span className="flex items-center space-x-1">
                                <Users className="h-3 w-3" />
                                <span>{suggestion.userName}</span>
                              </span>
                            )}
                            <span className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(suggestion.createdAt).toLocaleDateString()}</span>
                            </span>
                            {suggestion.featureArea && (
                              <Badge variant="outline" className="text-xs">
                                {t(suggestion.featureArea.replace('_', ''))}
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                          <p className="text-gray-700 mb-4">
                            {suggestion.description}
                          </p>
                          
                          {suggestion.adminResponse && (
                            <div className="bg-blue-50 p-3 rounded-lg mb-4">
                              <div className="flex items-center space-x-2 mb-2">
                                <CheckCircle className="h-4 w-4 text-blue-600" />
                                <span className="font-medium text-blue-900">{t("adminResponse")}</span>
                              </div>
                              <p className="text-blue-800 text-sm">{suggestion.adminResponse}</p>
                              {suggestion.respondedAt && (
                                <p className="text-blue-600 text-xs mt-1">
                                  {new Date(suggestion.respondedAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleVote(suggestion.id)}
                              disabled={voteMutation.isPending}
                              className="flex items-center space-x-1"
                            >
                              <ThumbsUp className="h-3 w-3" />
                              <span>{suggestion.userVotes}</span>
                              <span>{t("votes")}</span>
                            </Button>
                            
                            <div className="text-xs text-gray-500">
                              {t("suggestionType")}: {t(suggestion.suggestionType.replace('_', ''))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
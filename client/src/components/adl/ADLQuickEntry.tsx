import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Save, ClipboardList } from "lucide-react";
import { insertAdlEntrySchema, type Patient, type AdlCategory } from "@shared/schema";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";

const quickEntrySchema = insertAdlEntrySchema.extend({
  entryDate: z.string(),
  entryTime: z.string(),
});

type QuickEntryForm = z.infer<typeof quickEntrySchema>;

interface ADLQuickEntryProps {
  patient: Patient;
  onBack: () => void;
}

export function ADLQuickEntry({ patient, onBack }: ADLQuickEntryProps) {
  const queryClient = useQueryClient();

  const form = useForm<QuickEntryForm>({
    resolver: zodResolver(quickEntrySchema),
    defaultValues: {
      patientId: patient.id,
      cnaName: "",
      shiftType: "morning",
      entryDate: new Date().toISOString().split('T')[0],
      entryTime: new Date().toTimeString().slice(0, 5),
      categoryId: 1,
      assistanceLevel: "independent",
      completionPercentage: 100,
      notes: "",
      patientResponse: "",
    }
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/adl-categories"],
  });

  const createEntryMutation = useMutation({
    mutationFn: async (data: QuickEntryForm) => {
      return apiRequest("/api/adl-entries", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/adl-entries"] });
      toast({
        title: "ADL Entry Created",
        description: "Successfully recorded ADL activity for " + patient.name,
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        variant: "destructive", 
        title: "Error",
        description: "Failed to create ADL entry. Please try again.",
      });
      console.error("Error creating ADL entry:", error);
    }
  });

  const onSubmit = (data: QuickEntryForm) => {
    createEntryMutation.mutate(data);
  };

  const assistanceLevels = [
    { value: "independent", label: "Independent", color: "bg-green-100 text-green-800" },
    { value: "supervision", label: "Supervision Only", color: "bg-blue-100 text-blue-800" },
    { value: "minimal_assist", label: "Minimal Assistance", color: "bg-yellow-100 text-yellow-800" },
    { value: "moderate_assist", label: "Moderate Assistance", color: "bg-orange-100 text-orange-800" },
    { value: "maximum_assist", label: "Maximum Assistance", color: "bg-red-100 text-red-800" },
    { value: "total_dependence", label: "Total Dependence", color: "bg-gray-100 text-gray-800" }
  ];

  const completionPercentages = [
    { value: 100, label: "100% - Complete" },
    { value: 75, label: "75% - Mostly Complete" },
    { value: 50, label: "50% - Partially Complete" },
    { value: 25, label: "25% - Minimal Completion" },
    { value: 0, label: "0% - Not Completed" }
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ADL Quick Entry</h2>
          <p className="text-gray-600">Patient: {patient.name} • Room {patient.roomNumber}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ClipboardList className="h-5 w-5 mr-2" />
            Record ADL Activity
          </CardTitle>
          <CardDescription>
            Quickly document activities of daily living for {patient.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cnaName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNA Name</FormLabel>
                      <FormControl>
                        <input
                          type="text"
                          placeholder="Enter your name"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shiftType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shift</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select shift" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="morning">Morning (7AM-3PM)</SelectItem>
                          <SelectItem value="day">Day (3PM-11PM)</SelectItem>
                          <SelectItem value="evening">Evening (11PM-7AM)</SelectItem>
                          <SelectItem value="night">Night</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="entryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <input
                          type="date"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="entryTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <FormControl>
                        <input
                          type="time"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ADL Category</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select ADL category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((category: AdlCategory) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name} - {category.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assistanceLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assistance Level</FormLabel>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {assistanceLevels.map((level) => (
                        <Button
                          key={level.value}
                          type="button"
                          variant={field.value === level.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => field.onChange(level.value)}
                          className="text-left justify-start h-auto py-3"
                        >
                          <div>
                            <div className="font-medium">{level.label.split(' ')[0]}</div>
                            <div className="text-xs opacity-75">{level.label}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="completionPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Completion Percentage</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select completion percentage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {completionPercentages.map((percentage) => (
                          <SelectItem key={percentage.value} value={percentage.value.toString()}>
                            {percentage.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes about the ADL activity..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="patientResponse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient Response (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What did the patient say or how did they respond?"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={onBack}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createEntryMutation.isPending}>
                  {createEntryMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Entry
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
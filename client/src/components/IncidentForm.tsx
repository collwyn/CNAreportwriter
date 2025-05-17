import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertReportSchema } from "@shared/schema";
import { useLanguage } from "@/context/LanguageContext";
import { generateReport } from "@/lib/openai";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, CheckIcon, ClipboardEdit } from "lucide-react";

type FormData = {
  cnaName: string;
  shiftTime: string;
  floor: string;
  supervisorOnDuty: string;
  patientName: string;
  patientRoom: string;
  incidentTime: string;
  incidentNature: string;
  incidentDescription: string;
  patientAbleToState: string;
  patientStatement?: string;
  cnaActions: string;
  nurseActions: string;
};

interface IncidentFormProps {
  onReportGenerated: (report: string) => void;
}

type FormStep = 1 | 2 | 3 | 4 | 5 | 6;

export function IncidentForm({ onReportGenerated }: IncidentFormProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [patientCanRespond, setPatientCanRespond] = useState<boolean | null>(null);
  const totalSteps = 6;

  const form = useForm<FormData>({
    resolver: zodResolver(insertReportSchema.extend({
      patientStatement: patientCanRespond ? insertReportSchema.shape.patientStatement : insertReportSchema.shape.patientStatement.optional(),
    })),
    defaultValues: {
      cnaName: "",
      shiftTime: "",
      floor: "",
      supervisorOnDuty: "",
      patientName: "",
      patientRoom: "",
      incidentTime: "",
      incidentNature: "",
      incidentDescription: "",
      patientAbleToState: "",
      patientStatement: "",
      cnaActions: "",
      nurseActions: "",
    },
    mode: "onChange",
  });

  const generateReportMutation = useMutation({
    mutationFn: generateReport,
    onSuccess: (data) => {
      onReportGenerated(data.report.generatedReport);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate report. Please try again.",
      });
    },
  });

  const onSubmit = (values: FormData) => {
    if (currentStep === totalSteps) {
      generateReportMutation.mutate(values);
    }
  };

  // Check if the current step is valid before allowing to proceed
  const canProceedToNextStep = () => {
    const currentFields = {
      1: ["cnaName", "shiftTime", "floor", "supervisorOnDuty"],
      2: ["patientName", "patientRoom"],
      3: ["incidentTime", "incidentNature", "incidentDescription"],
      4: ["patientAbleToState", ...(patientCanRespond ? ["patientStatement"] : [])],
      5: ["cnaActions", "nurseActions"],
      6: [],
    }[currentStep];

    const formValues = form.getValues();
    const isValid = currentFields.every(field => !!formValues[field as keyof FormData]);
    return isValid;
  };

  // Function to validate and move to the next step
  const handleNext = () => {
    if (canProceedToNextStep()) {
      if (currentStep < totalSteps) {
        // Force form revalidation when changing steps to clear any cross-step field errors
        form.trigger(getFieldsForStep(currentStep) as any).then(() => {
          setCurrentStep(prev => (prev + 1) as FormStep);
        });
      }
    } else {
      toast({
        variant: "destructive",
        title: t("formIncomplete"),
        description: t("stepRequired"),
      });

      // Trigger validation to show errors
      form.trigger(getFieldsForStep(currentStep) as any);
    }
  };

  // Function to move to the previous step
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => (prev - 1) as FormStep);
    }
  };

  // Get fields for the current step for validation
  const getFieldsForStep = (step: FormStep): (keyof FormData)[] => {
    switch (step) {
      case 1:
        return ["cnaName", "shiftTime", "floor", "supervisorOnDuty"];
      case 2:
        return ["patientName", "patientRoom"];
      case 3:
        return ["incidentTime", "incidentNature", "incidentDescription"];
      case 4:
        return patientCanRespond 
          ? ["patientAbleToState", "patientStatement"] 
          : ["patientAbleToState"];
      case 5:
        return ["cnaActions", "nurseActions"];
      case 6:
        return [];
      default:
        return [];
    }
  };

  // Get the step title based on the current step
  const getStepTitle = (step: FormStep): string => {
    return t(`formStep${step}`);
  };

  // Render the form fields based on the current step
  const renderStepContent = (step: FormStep) => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">{t("cnaInfoText")}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cnaName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("cnaName")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("cnaNamePlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shiftTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("shiftTime")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("selectOption")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="morning">{t("morning")}</SelectItem>
                        <SelectItem value="day">{t("day")}</SelectItem>
                        <SelectItem value="evening">{t("evening")}</SelectItem>
                        <SelectItem value="night">{t("night")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="floor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("floor")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("floorPlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supervisorOnDuty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("supervisorOnDuty")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("supervisorPlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">{t("patientInfoText")}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="patientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("patientName")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("patientNamePlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="patientRoom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("patientRoom")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("roomPlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">{t("incidentInfoText")}</p>
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="incidentTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("incidentTime")}</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="incidentNature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("incidentNature")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("selectOption")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="fall">{t("fall")}</SelectItem>
                        <SelectItem value="slip">{t("slip")}</SelectItem>
                        <SelectItem value="trip">{t("trip")}</SelectItem>
                        <SelectItem value="collapse">{t("collapse")}</SelectItem>
                        <SelectItem value="other">{t("other")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="incidentDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("incidentDescription")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("descriptionPlaceholder")}
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">{t("patientResponseText")}</p>
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="patientAbleToState"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>{t("patientAbleToState")}</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => {
                          field.onChange(value);
                          setPatientCanRespond(value === "yes");
                          if (value === "no") {
                            form.setValue("patientStatement", "");
                          }
                        }}
                        defaultValue={field.value}
                        value={field.value}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="yes" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {t("yes")}
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="no" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {t("no")}
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {patientCanRespond && (
                <FormField
                  control={form.control}
                  name="patientStatement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("patientStatement")}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t("statementPlaceholder")}
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">{t("actionsTakenText")}</p>
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="cnaActions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("cnaActions")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("cnaActionsPlaceholder")}
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
                name="nurseActions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("nurseActions")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("nurseActionsPlaceholder")}
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">{t("reviewText")}</p>
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">{t("cnaInfoSection")}</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="text-gray-600">{t("cnaName")}:</div>
                  <div>{form.getValues("cnaName")}</div>
                  <div className="text-gray-600">{t("shiftTime")}:</div>
                  <div>
                    {form.getValues("shiftTime") ? 
                      (form.getValues("shiftTime") === "morning" ? t("morning") :
                       form.getValues("shiftTime") === "day" ? t("day") :
                       form.getValues("shiftTime") === "evening" ? t("evening") :
                       form.getValues("shiftTime") === "night" ? t("night") : "") 
                      : ""}
                  </div>
                  <div className="text-gray-600">{t("floor")}:</div>
                  <div>{form.getValues("floor")}</div>
                  <div className="text-gray-600">{t("supervisorOnDuty")}:</div>
                  <div>{form.getValues("supervisorOnDuty")}</div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 text-xs"
                  onClick={() => setCurrentStep(1)}
                >
                  <ClipboardEdit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">{t("patientInfoSection")}</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="text-gray-600">{t("patientName")}:</div>
                  <div>{form.getValues("patientName")}</div>
                  <div className="text-gray-600">{t("patientRoom")}:</div>
                  <div>{form.getValues("patientRoom")}</div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 text-xs"
                  onClick={() => setCurrentStep(2)}
                >
                  <ClipboardEdit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">{t("incidentInfoSection")}</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="text-gray-600">{t("incidentTime")}:</div>
                  <div>{form.getValues("incidentTime")}</div>
                  <div className="text-gray-600">{t("incidentNature")}:</div>
                  <div>
                    {form.getValues("incidentNature") ? 
                      (form.getValues("incidentNature") === "fall" ? t("fall") :
                       form.getValues("incidentNature") === "slip" ? t("slip") :
                       form.getValues("incidentNature") === "trip" ? t("trip") :
                       form.getValues("incidentNature") === "collapse" ? t("collapse") :
                       form.getValues("incidentNature") === "other" ? t("other") : "") 
                      : ""}
                  </div>
                  <div className="text-gray-600">{t("incidentDescription")}:</div>
                  <div className="break-words">{form.getValues("incidentDescription")}</div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 text-xs"
                  onClick={() => setCurrentStep(3)}
                >
                  <ClipboardEdit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">{t("patientResponseSection")}</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="text-gray-600">{t("patientAbleToState")}:</div>
                  <div>
                    {form.getValues("patientAbleToState") === "yes" ? t("yes") :
                     form.getValues("patientAbleToState") === "no" ? t("no") : ""}
                  </div>
                  {form.getValues("patientAbleToState") === "yes" && (
                    <>
                      <div className="text-gray-600">{t("patientStatement")}:</div>
                      <div className="break-words">{form.getValues("patientStatement")}</div>
                    </>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 text-xs"
                  onClick={() => setCurrentStep(4)}
                >
                  <ClipboardEdit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">{t("actionsTakenSection")}</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="text-gray-600">{t("cnaActions")}:</div>
                  <div className="break-words">{form.getValues("cnaActions")}</div>
                  <div className="text-gray-600">{t("nurseActions")}:</div>
                  <div className="break-words">{form.getValues("nurseActions")}</div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 text-xs"
                  onClick={() => setCurrentStep(5)}
                >
                  <ClipboardEdit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Render progress steps
  const renderProgressSteps = () => {
    return (
      <div className="flex justify-between mb-6">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div key={step} className="flex flex-col items-center">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === currentStep 
                  ? "bg-blue-500 text-white" 
                  : step < currentStep 
                    ? "bg-green-500 text-white" 
                    : "bg-gray-200 text-gray-500"
              }`}
            >
              {step < currentStep ? (
                <CheckIcon className="h-4 w-4" />
              ) : (
                step
              )}
            </div>
            <div className="text-xs text-center mt-1 max-w-[80px] overflow-hidden text-ellipsis">
              {getStepTitle(step as FormStep)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Add special handling for the form to ensure it behaves correctly
  useEffect(() => {
    // Just clear errors when changing steps
    form.clearErrors();
    
    // Ensure the form is properly registered with all fields
    if (currentStep === 2) {
      // Force revalidation of patient form fields
      setTimeout(() => {
        form.trigger(['patientName', 'patientRoom']);
      }, 10);
    }
  }, [currentStep, form]);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{t("introTitle")}</CardTitle>
        <CardDescription>
          {t("formProgress").replace("{current}", currentStep.toString()).replace("{total}", totalSteps.toString())}
        </CardDescription>
        {renderProgressSteps()}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {renderStepContent(currentStep)}
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("previous")}
        </Button>
        
        {currentStep === totalSteps ? (
          <Button 
            type="button" 
            onClick={form.handleSubmit(onSubmit)}
            disabled={generateReportMutation.isPending}
          >
            {generateReportMutation.isPending ? t("loading") : t("generateReport")}
          </Button>
        ) : (
          <Button 
            type="button" 
            onClick={handleNext}
          >
            {t("next")}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

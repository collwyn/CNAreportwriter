import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/context/LanguageContext";
import { generateReport } from "@/lib/openai";
import { useToast } from "@/hooks/use-toast";
import { useRateLimit } from "@/hooks/useRateLimit";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, CheckIcon, ClipboardEdit } from "lucide-react";

// Define the form data structure
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
  supervisorNotified: string; // Changed from nurseActions to supervisorNotified
};

interface SimpleFormProps {
  onReportGenerated: (report: string) => void;
}

// Define steps as 1-based index
type FormStep = 1 | 2 | 3 | 4 | 5 | 6;

export function SimpleForm({ onReportGenerated }: SimpleFormProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: rateLimit } = useRateLimit();
  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [patientCanRespond, setPatientCanRespond] = useState<boolean | null>(null);
  const [formState, setFormState] = useState<FormData>({
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
    supervisorNotified: "",
  });
  const totalSteps = 6;

  const generateReportMutation = useMutation({
    mutationFn: generateReport,
    onSuccess: (data) => {
      onReportGenerated(data.report.generatedReport);
      // Refresh rate limit status after successful generation
      queryClient.invalidateQueries({ queryKey: ['rateLimit'] });
      toast({
        title: "Report Generated Successfully",
        description: "Your incident report has been created.",
      });
    },
    onError: (error: any) => {
      // Handle rate limit errors specifically
      if (error?.status === 429) {
        toast({
          variant: "destructive",
          title: "Daily Limit Reached",
          description: error?.message || "You have reached your daily limit of 5 report generations. Please try again tomorrow.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to generate report. Please try again.",
        });
      }
    },
  });

  // Handle field changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));

    // Special handling for patientAbleToState
    if (field === 'patientAbleToState') {
      const canRespond = value === 'yes';
      setPatientCanRespond(canRespond);
      
      // Reset patientStatement if they can't respond
      if (!canRespond) {
        setFormState(prev => ({
          ...prev,
          patientStatement: ''
        }));
      }
    }
  };

  // Navigation functions
  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => (prev + 1) as FormStep);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => (prev - 1) as FormStep);
    }
  };

  const goToStep = (step: FormStep) => {
    setCurrentStep(step);
  };

  // Submit the form
  const handleSubmit = () => {
    generateReportMutation.mutate(formState);
  };

  // Get title for progress steps
  const getStepTitle = (step: FormStep): string => {
    switch(step) {
      case 1: return t("formStep1");
      case 2: return t("formStep2");
      case 3: return t("formStep3");
      case 4: return t("formStep4");
      case 5: return t("formStep5");
      case 6: return t("formStep6");
      default: return "";
    }
  };

  // Render the appropriate step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // CNA Information
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">{t("cnaInfoText")}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("cnaName")}</label>
                <Input 
                  placeholder={t("cnaNamePlaceholder")}
                  value={formState.cnaName}
                  onChange={(e) => handleInputChange('cnaName', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("shiftTime")}</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formState.shiftTime}
                  onChange={(e) => handleInputChange('shiftTime', e.target.value)}
                >
                  <option value="" disabled>{t("selectOption")}</option>
                  <option value="morning">{t("morning")}</option>
                  <option value="day">{t("day")}</option>
                  <option value="evening">{t("evening")}</option>
                  <option value="night">{t("night")}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("floor")}</label>
                <Input 
                  placeholder={t("floorPlaceholder")}
                  value={formState.floor}
                  onChange={(e) => handleInputChange('floor', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("supervisorOnDuty")}</label>
                <Input 
                  placeholder={t("supervisorPlaceholder")}
                  value={formState.supervisorOnDuty}
                  onChange={(e) => handleInputChange('supervisorOnDuty', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 2: // Patient Information
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">{t("patientInfoText")}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("patientName")}</label>
                <Input 
                  placeholder={t("patientNamePlaceholder")}
                  value={formState.patientName}
                  onChange={(e) => handleInputChange('patientName', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("patientRoom")}</label>
                <Input 
                  placeholder={t("roomPlaceholder")}
                  value={formState.patientRoom}
                  onChange={(e) => handleInputChange('patientRoom', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 3: // Incident Information
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">{t("incidentInfoText")}</p>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("incidentTime")}</label>
                <Input 
                  type="time"
                  value={formState.incidentTime}
                  onChange={(e) => handleInputChange('incidentTime', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("incidentNature")}</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formState.incidentNature}
                  onChange={(e) => handleInputChange('incidentNature', e.target.value)}
                >
                  <option value="" disabled>{t("selectOption")}</option>
                  <option value="fall">{t("fall")}</option>
                  <option value="slip">{t("slip")}</option>
                  <option value="trip">{t("trip")}</option>
                  <option value="collapse">{t("collapse")}</option>
                  <option value="other">{t("other")}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("incidentDescription")}</label>
                <Textarea
                  placeholder={t("descriptionPlaceholder")}
                  rows={3}
                  value={formState.incidentDescription}
                  onChange={(e) => handleInputChange('incidentDescription', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 4: // Patient Response
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">{t("patientResponseText")}</p>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("patientAbleToState")}</label>
                <div className="flex space-x-4 mt-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="patientAbleToState"
                      value="yes"
                      checked={formState.patientAbleToState === "yes"}
                      onChange={() => handleInputChange('patientAbleToState', 'yes')}
                      className="h-4 w-4"
                    />
                    <span>{t("yes")}</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="patientAbleToState"
                      value="no"
                      checked={formState.patientAbleToState === "no"}
                      onChange={() => handleInputChange('patientAbleToState', 'no')}
                      className="h-4 w-4"
                    />
                    <span>{t("no")}</span>
                  </label>
                </div>
              </div>

              {formState.patientAbleToState === "yes" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("patientStatement")}</label>
                  <Textarea
                    placeholder={t("statementPlaceholder")}
                    rows={3}
                    value={formState.patientStatement || ""}
                    onChange={(e) => handleInputChange('patientStatement', e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 5: // Actions Taken
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">{t("actionsTakenText")}</p>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("cnaActions")}</label>
                <Textarea
                  placeholder={t("cnaActionsPlaceholder")}
                  rows={3}
                  value={formState.cnaActions}
                  onChange={(e) => handleInputChange('cnaActions', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Did you tell a supervisor?</label>
                <div className="flex space-x-4 mt-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="supervisorNotified"
                      value="yes"
                      checked={formState.supervisorNotified === "yes"}
                      onChange={() => handleInputChange('supervisorNotified', 'yes')}
                      className="h-4 w-4"
                    />
                    <span>{t("yes")}</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="supervisorNotified"
                      value="no"
                      checked={formState.supervisorNotified === "no"}
                      onChange={() => handleInputChange('supervisorNotified', 'no')}
                      className="h-4 w-4"
                    />
                    <span>{t("no")}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 6: // Review
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">{t("reviewText")}</p>
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">{t("cnaInfoSection")}</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="text-gray-600">{t("cnaName")}:</div>
                  <div>{formState.cnaName}</div>
                  <div className="text-gray-600">{t("shiftTime")}:</div>
                  <div>
                    {formState.shiftTime ? 
                      (formState.shiftTime === "morning" ? t("morning") :
                       formState.shiftTime === "day" ? t("day") :
                       formState.shiftTime === "evening" ? t("evening") :
                       formState.shiftTime === "night" ? t("night") : "") 
                      : ""}
                  </div>
                  <div className="text-gray-600">{t("floor")}:</div>
                  <div>{formState.floor}</div>
                  <div className="text-gray-600">{t("supervisorOnDuty")}:</div>
                  <div>{formState.supervisorOnDuty}</div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 text-xs"
                  onClick={() => goToStep(1)}
                >
                  <ClipboardEdit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">{t("patientInfoSection")}</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="text-gray-600">{t("patientName")}:</div>
                  <div>{formState.patientName}</div>
                  <div className="text-gray-600">{t("patientRoom")}:</div>
                  <div>{formState.patientRoom}</div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 text-xs"
                  onClick={() => goToStep(2)}
                >
                  <ClipboardEdit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">{t("incidentInfoSection")}</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="text-gray-600">{t("incidentTime")}:</div>
                  <div>{formState.incidentTime}</div>
                  <div className="text-gray-600">{t("incidentNature")}:</div>
                  <div>
                    {formState.incidentNature ? 
                      (formState.incidentNature === "fall" ? t("fall") :
                       formState.incidentNature === "slip" ? t("slip") :
                       formState.incidentNature === "trip" ? t("trip") :
                       formState.incidentNature === "collapse" ? t("collapse") :
                       formState.incidentNature === "other" ? t("other") : "") 
                      : ""}
                  </div>
                  <div className="text-gray-600">{t("incidentDescription")}:</div>
                  <div className="break-words">{formState.incidentDescription}</div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 text-xs"
                  onClick={() => goToStep(3)}
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
                    {formState.patientAbleToState === "yes" ? t("yes") :
                     formState.patientAbleToState === "no" ? t("no") : ""}
                  </div>
                  {formState.patientAbleToState === "yes" && (
                    <>
                      <div className="text-gray-600">{t("patientStatement")}:</div>
                      <div className="break-words">{formState.patientStatement}</div>
                    </>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 text-xs"
                  onClick={() => goToStep(4)}
                >
                  <ClipboardEdit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">{t("actionsTakenSection")}</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="text-gray-600">{t("cnaActions")}:</div>
                  <div className="break-words">{formState.cnaActions}</div>
                  <div className="text-gray-600">Supervisor Notified:</div>
                  <div className="break-words">
                    {formState.supervisorNotified === "yes" ? "Yes" : 
                     formState.supervisorNotified === "no" ? "No" : ""}
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 text-xs"
                  onClick={() => goToStep(5)}
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

  // Progress indicator
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
        {renderStepContent()}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          type="button" 
          variant="outline" 
          onClick={goToPreviousStep}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("previous")}
        </Button>
        
        {currentStep === totalSteps ? (
          <Button 
            type="button" 
            onClick={handleSubmit}
            disabled={generateReportMutation.isPending || (rateLimit?.remaining === 0)}
            className={rateLimit?.remaining === 0 ? "bg-gray-400 cursor-not-allowed" : ""}
          >
            {generateReportMutation.isPending 
              ? t("loading") 
              : rateLimit?.remaining === 0 
                ? "Daily Limit Reached" 
                : t("generateReport")
            }
          </Button>
        ) : (
          <Button 
            type="button" 
            onClick={goToNextStep}
          >
            {t("next")}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
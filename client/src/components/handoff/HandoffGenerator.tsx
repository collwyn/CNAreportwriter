import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ClipboardCheck, Download, Printer, Share, AlertCircle, CheckCircle, Clock } from "lucide-react";
import type { ShiftSession, HandoffReport } from "@shared/schema";

interface HandoffGeneratorProps {
  shiftSession: ShiftSession;
  onClose: () => void;
}

export default function HandoffGenerator({ shiftSession, onClose }: HandoffGeneratorProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [handoffReport, setHandoffReport] = useState<HandoffReport | null>(null);
  const [additionalNotes, setAdditionalNotes] = useState("");

  // Get existing handoff report if available
  const { data: existingHandoff } = useQuery({
    queryKey: ['/api/handoff', shiftSession.id],
    retry: false,
  });

  // Generate handoff mutation
  const generateHandoffMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/handoff/generate', {
        method: 'POST',
        body: JSON.stringify({
          shiftSessionId: shiftSession.id,
          additionalNotes,
        }),
      });
    },
    onSuccess: (data) => {
      setHandoffReport(data);
      queryClient.invalidateQueries({ queryKey: ['/api/handoff', shiftSession.id] });
      toast({
        title: t('handoffGenerated'),
        description: "Your shift handoff report has been generated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error generating handoff",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Print handoff
  const handlePrint = () => {
    const printContent = document.getElementById('handoff-report-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Shift Handoff Report</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { border-bottom: 2px solid #000; margin-bottom: 20px; padding-bottom: 10px; }
                .section { margin-bottom: 20px; }
                .section h3 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
                .priority-item { background: #fee; border-left: 4px solid #f00; padding: 8px; margin: 5px 0; }
                .patient-item { background: #f9f9f9; border: 1px solid #ddd; padding: 8px; margin: 5px 0; }
                .activity-item { padding: 4px 0; }
                @media print { body { margin: 0; } }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const currentReport = handoffReport || existingHandoff;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ClipboardCheck className="w-5 h-5" />
            <span>{t('generateHandoff')}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Shift Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Shift Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-500">CNA</p>
                  <p>{shiftSession.cnaName}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Shift Type</p>
                  <p className="capitalize">{shiftSession.shiftType}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Floor/Unit</p>
                  <p>{shiftSession.facilityFloor || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Duration</p>
                  <p>{new Date(shiftSession.shiftStart).toLocaleTimeString()} - {shiftSession.shiftEnd ? new Date(shiftSession.shiftEnd).toLocaleTimeString() : 'Ongoing'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes Input */}
          {!currentReport && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Notes (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Add any final observations, concerns, or important information for the incoming CNA..."
                  rows={3}
                />
              </CardContent>
            </Card>
          )}

          {/* Generate Button */}
          {!currentReport && (
            <div className="flex justify-center">
              <Button
                onClick={() => generateHandoffMutation.mutate()}
                disabled={generateHandoffMutation.isPending}
                size="lg"
                className="flex items-center space-x-2"
              >
                <ClipboardCheck className="w-5 h-5" />
                <span>
                  {generateHandoffMutation.isPending ? t('generatingHandoff') : t('generateHandoff')}
                </span>
              </Button>
            </div>
          )}

          {/* Generated Report */}
          {currentReport && (
            <div id="handoff-report-content" className="space-y-6">
              <div className="header text-center border-b-2 border-gray-200 pb-4 mb-6">
                <h1 className="text-2xl font-bold">SHIFT HANDOFF REPORT</h1>
                <p className="text-gray-600">
                  {new Date(shiftSession.shiftStart).toLocaleDateString()} - 
                  {shiftSession.shiftType.toUpperCase()} SHIFT
                </p>
                <p className="text-sm text-gray-500">
                  Generated on {new Date(currentReport.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Priority Alerts */}
              {currentReport.priorityAlerts && (currentReport.priorityAlerts as string[]).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-red-700">
                      <AlertCircle className="w-5 h-5" />
                      <span>{t('priorityAlerts')}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {(currentReport.priorityAlerts as string[]).map((alert, index) => (
                        <div key={index} className="bg-red-50 border-l-4 border-red-500 p-3">
                          <p className="text-red-800">{alert}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Patient Summaries */}
              {currentReport.patientSummaries && (currentReport.patientSummaries as string[]).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <span>{t('patientSummaries')}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(currentReport.patientSummaries as string[]).map((summary, index) => (
                        <div key={index} className="bg-blue-50 border border-blue-200 p-3 rounded">
                          <p className="text-blue-800">{summary}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Completed Activities */}
              {currentReport.completedActivities && (currentReport.completedActivities as string[]).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>{t('completedActivities')}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {(currentReport.completedActivities as string[]).map((activity, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <p className="text-gray-700">{activity}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Items for Next Shift */}
              {currentReport.itemsForNextShift && (currentReport.itemsForNextShift as string[]).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-orange-600" />
                      <span>{t('itemsForNextShift')}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {(currentReport.itemsForNextShift as string[]).map((item, index) => (
                        <div key={index} className="bg-orange-50 border-l-4 border-orange-500 p-3">
                          <p className="text-orange-800">{item}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Full Summary Text */}
              <Card>
                <CardHeader>
                  <CardTitle>Complete Report Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded border">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800">
                      {currentReport.generatedSummary}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Action Buttons */}
          {currentReport && (
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="flex space-x-2">
                <Button onClick={handlePrint} variant="outline" size="sm">
                  <Printer className="w-4 h-4 mr-2" />
                  {t('printHandoff')}
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  {t('exportHandoff')}
                </Button>
                <Button variant="outline" size="sm">
                  <Share className="w-4 h-4 mr-2" />
                  {t('shareHandoff')}
                </Button>
              </div>
              <Button onClick={onClose}>
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
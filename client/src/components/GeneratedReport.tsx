import { useState } from "react";
import { SupportedLanguage, LANGUAGES } from "@/utils/i18n";
import { useLanguage } from "@/context/LanguageContext";
import { useMutation } from "@tanstack/react-query";
import { translateReport } from "@/lib/openai";
import { useToast } from "@/hooks/use-toast";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CopyIcon, PrinterIcon } from "lucide-react";

interface GeneratedReportProps {
  report: string;
}

export function GeneratedReport({ report }: GeneratedReportProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [reportLanguage, setReportLanguage] = useState<SupportedLanguage>(language);
  const [displayedReport, setDisplayedReport] = useState(report);

  const translateMutation = useMutation({
    mutationFn: (targetLanguage: string) => 
      translateReport(report, targetLanguage),
    onSuccess: (data) => {
      setDisplayedReport(data.translatedReport);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Translation Error",
        description: "Failed to translate the report. Please try again.",
      });
    }
  });

  const handleLanguageChange = (value: SupportedLanguage) => {
    setReportLanguage(value);
    
    // Only call translate API if language is different from original
    if (value !== language) {
      translateMutation.mutate(value);
    } else {
      // Reset to original report
      setDisplayedReport(report);
    }
  };

  const copyReport = () => {
    navigator.clipboard.writeText(displayedReport).then(() => {
      toast({
        title: t("copySuccess"),
        duration: 2000,
      });
    });
  };

  const printReport = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Incident Report</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
              h1 { text-align: center; margin-bottom: 20px; }
              .report { white-space: pre-line; }
            </style>
          </head>
          <body>
            <h1>Incident Report</h1>
            <div class="report">${displayedReport.replace(/\n/g, "<br>")}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("generatedReport")}</CardTitle>
        <div className="flex items-center space-x-2">
          <Select value={reportLanguage} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(LANGUAGES).map(([code, { native }]) => (
                <SelectItem key={code} value={code as SupportedLanguage}>
                  {native}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {translateMutation.isPending ? (
          <div className="p-4 bg-neutral-50 rounded-lg mb-4 h-60 flex items-center justify-center">
            <p className="text-gray-500">{t("translating")}</p>
          </div>
        ) : (
          <div className="p-4 bg-neutral-50 rounded-lg mb-4">
            <p className="whitespace-pre-line text-gray-800">{displayedReport}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-xs text-gray-500">{t("reportDisclaimer")}</p>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={copyReport}>
            <CopyIcon className="h-4 w-4 mr-2" />
            {t("copyReport")}
          </Button>
          <Button variant="outline" size="sm" onClick={printReport}>
            <PrinterIcon className="h-4 w-4 mr-2" />
            {t("print")}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

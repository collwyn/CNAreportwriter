import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { SimpleForm } from "@/components/SimpleForm";
import { GeneratedReport } from "@/components/GeneratedReport";
import { RateLimitDisplay } from "@/components/RateLimitDisplay";
import { RateLimitAlert } from "@/components/RateLimitAlert";
import { FeedbackForm } from "@/components/FeedbackForm";
import { Footer } from "@/components/Footer";

export default function Home() {
  const { t } = useLanguage();
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);

  const handleReportGenerated = (report: string) => {
    setGeneratedReport(report);
    // Scroll to report section
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-800">
              {t("appTitle")}
            </h1>
          </div>
          <LanguageSelector />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-grow">
        <div className="space-y-4 mb-6">
          <RateLimitAlert />
          <RateLimitDisplay />
        </div>
        
        <SimpleForm onReportGenerated={handleReportGenerated} />
        
        {generatedReport && (
          <>
            <GeneratedReport report={generatedReport} />
            
            {/* Feedback Section - Only show after successful report generation */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <FeedbackForm />
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

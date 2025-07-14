import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { SimpleForm } from "@/components/SimpleForm";
import { GeneratedReport } from "@/components/GeneratedReport";
import { RateLimitDisplay } from "@/components/RateLimitDisplay";
import { RateLimitAlert } from "@/components/RateLimitAlert";
import { FeedbackForm } from "@/components/FeedbackForm";
import { Footer } from "@/components/Footer";
import { NurseLogo } from "@/components/NurseLogo";
import { useRateLimit } from "@/hooks/useRateLimit";

export default function Home() {
  const { t } = useLanguage();
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const { data: rateLimitData } = useRateLimit();

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
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-800">
              {t("appTitle")}
            </h1>
            <a 
              href="/admin/feedback" 
              className="text-xs text-gray-500 hover:text-gray-700 underline"
              style={{ fontSize: '10px' }}
            >
              Admin
            </a>
          </div>
          <LanguageSelector />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 flex-grow">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <NurseLogo />
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            CNA Incident Report Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            This tool walks you through each step of creating a professional incident report. Just answer 
            the questions, and we'll generate a properly formatted report you can use at work.
          </p>
          <p className="text-base text-gray-500 max-w-xl mx-auto mb-8">
            Built by a developer to help a CNA friend – now helping healthcare workers everywhere 
            document incidents quickly and accurately.
          </p>
        </div>

        {/* Daily Report Generations Card */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div className="font-medium text-gray-900">Daily Report Generations</div>
              <div className="text-sm text-gray-600">
                {rateLimitData?.used || 0} of {rateLimitData?.limit || 5} used • Resets in 24 hours
              </div>
            </div>
            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              {rateLimitData?.remaining || 5} remaining
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {rateLimitData?.remaining || 5}
          </div>
          <div className="text-sm text-gray-500 font-medium">
            LEFT TODAY
          </div>
        </div>

        {/* Rate Limit Alert */}
        <div className="mb-6">
          <RateLimitAlert />
        </div>
        
        {/* Form Section */}
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

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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRateLimit } from "@/hooks/useRateLimit";
import { Link } from "wouter";
import headerLogoImage from "@assets/cnageniuslogo_1752779536382.jpg";

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
      <header className="bg-white shadow-sm sticky top-0 z-10" style={{ height: '100px' }}>
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center h-full">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <img 
                src={headerLogoImage} 
                alt="CNA Genius Logo" 
                className="h-16 w-16 rounded-lg object-cover"
              />
              <h1 className="text-3xl font-semibold text-gray-800">
                CNA Genius
              </h1>
            </div>
            <a 
              href="/admin/feedback" 
              className="text-xs text-gray-500 hover:text-gray-700 underline"
              style={{ fontSize: '10px' }}
            >
              {t("admin")}
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
            {t("heroTitle")}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            {t("heroDescription")}
          </p>
          <p className="text-base text-gray-500 max-w-xl mx-auto mb-8">
            {t("heroSubtitle")}
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
              <div className="font-medium text-gray-900">{t("dailyReportsTitle")}</div>
              <div className="text-sm text-gray-600">
                {t("dailyReportsUsed", { used: rateLimitData?.used || 0, limit: rateLimitData?.limit || 3 })}
              </div>
            </div>
            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              {rateLimitData?.remaining || 3} {t("remaining")}
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {rateLimitData?.remaining || 3}
          </div>
          <div className="text-sm text-gray-500 font-medium">
            {t("leftToday")}
          </div>
        </div>

        {/* Rate Limit Alert */}
        <div className="mb-6">
          <RateLimitAlert />
        </div>
        
        {/* Navigation Cards - Choose Your Tool */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200 bg-blue-50">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('incidentReportWriter')}</h3>
              <p className="text-gray-600 mb-4">{t('incidentReportDescription')}</p>
              <Button 
                onClick={() => {
                  // Scroll to form section
                  const formSection = document.getElementById('incident-form-section');
                  formSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {t('startIncidentReport')}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-green-200 bg-green-50">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-600 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a2 2 0 002 2h4a2 2 0 002-2V3a2 2 0 012 2v6a2 2 0 01-2 2V9a2 2 0 00-2-2H8a2 2 0 00-2 2v2a2 2 0 01-2-2V5zM8 11v-1h4v1H8z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('adlTracker')}</h3>
              <p className="text-gray-600 mb-4">{t('adlTrackerDescription')}</p>
              <Link href="/adl-dashboard">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  {t('openAdlTracker')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Form Section */}
        <div id="incident-form-section">
          <SimpleForm onReportGenerated={handleReportGenerated} />
        </div>
        
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

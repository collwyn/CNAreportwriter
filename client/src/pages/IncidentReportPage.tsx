import { useState } from 'react';
import { Link } from 'wouter';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Home, Activity } from 'lucide-react';
import { RateLimitAlert } from '@/components/RateLimitAlert';
import { RateLimitDisplay } from '@/components/RateLimitDisplay';
import { useRateLimit } from '@/hooks/useRateLimit';
import TopNavigation from '@/components/TopNavigation';
import PatientSelector from '@/components/PatientSelector';

export default function IncidentReportPage() {
  const { t } = useLanguage();
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const { data: rateLimitData } = useRateLimit();

  if (selectedPatient) {
    // Import and use the existing IncidentReportWithPatient component
    const IncidentReportWithPatient = require('@/pages/IncidentReportWithPatient').default;
    return <IncidentReportWithPatient patient={selectedPatient} onBack={() => setSelectedPatient(null)} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      <TopNavigation />

      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-800">
            {t('incidentReportWriter')}
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-grow">
        {/* Description */}
        <div className="text-center mb-8">
          <p className="text-lg text-gray-600">
            {t('incidentReportDescription')}
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
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              {rateLimitData?.remaining || 3} {t("remaining")}
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {rateLimitData?.remaining || 3}
            </div>
            <div className="text-sm text-gray-500 font-medium">
              {t("leftToday")}
            </div>
          </div>
        </div>

        {/* Rate Limit Alert */}
        <div className="mb-8">
          <RateLimitAlert />
        </div>

        {/* Patient Selection Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>{t('selectPatient')}</span>
            </CardTitle>
            <CardDescription>
              {t('incidentReportDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PatientSelector onPatientSelect={setSelectedPatient} context="incident" />
          </CardContent>
        </Card>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            {t('introTitle')}
          </h3>
          <p className="text-blue-800">
            {t('introText')}
          </p>
        </div>
      </main>
    </div>
  );
}
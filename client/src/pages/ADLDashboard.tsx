import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, ClipboardList, FileText, Plus, Search } from "lucide-react";
import { Link } from "wouter";
import { PatientSelector } from "@/components/adl/PatientSelector";
import { ADLQuickEntry } from "@/components/adl/ADLQuickEntry";
import type { Patient } from "@shared/schema";
import headerLogoImage from "@assets/cnageniuslogo_1752779536382.jpg";

type ViewMode = 'dashboard' | 'patient-selector' | 'quick-entry';

export default function ADLDashboard() {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const { data: patients, isLoading } = useQuery({
    queryKey: ["/api/patients"],
  });

  const getCareLevel = (level: string) => {
    const levels = {
      skilled: { text: t('skilledCare'), color: "bg-red-100 text-red-800" },
      assisted: { text: t('assistedLiving'), color: "bg-yellow-100 text-yellow-800" },
      independent: { text: t('independent'), color: "bg-green-100 text-green-800" }
    };
    return levels[level as keyof typeof levels] || levels.assisted;
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setViewMode('quick-entry');
  };

  const handleBackToDashboard = () => {
    setViewMode('dashboard');
    setSelectedPatient(null);
  };

  // Show patient selector view
  if (viewMode === 'patient-selector') {
    return (
      <div className="flex flex-col min-h-screen bg-neutral-50">
        <header className="bg-white shadow-sm sticky top-0 z-10" style={{ height: '100px' }}>
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center h-full">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={handleBackToDashboard}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('backToDashboard')}
                </Button>
                <img 
                  src={headerLogoImage} 
                  alt="CNA Genius Logo" 
                  className="h-16 w-16 rounded-lg object-cover"
                />
                <h1 className="text-3xl font-semibold text-gray-800">
                  {t('selectPatient')}
                </h1>
              </div>
            </div>
            <LanguageSelector />
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-grow">
          <PatientSelector onPatientSelect={handlePatientSelect} />
        </main>

        <Footer />
      </div>
    );
  }

  // Show quick entry view
  if (viewMode === 'quick-entry' && selectedPatient) {
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
                  {t('adlEntry')}
                </h1>
              </div>
            </div>
            <LanguageSelector />
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-grow">
          <ADLQuickEntry patient={selectedPatient} onBack={handleBackToDashboard} />
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      <header className="bg-white shadow-sm sticky top-0 z-10" style={{ height: '100px' }}>
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center h-full">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('backToHome')}
                </Button>
              </Link>
              <img 
                src={headerLogoImage} 
                alt="CNA Genius Logo" 
                className="h-16 w-16 rounded-lg object-cover"
              />
              <h1 className="text-3xl font-semibold text-gray-800">
                {t('adlTracker')}
              </h1>
            </div>
          </div>
          <LanguageSelector />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-grow">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setViewMode('patient-selector')}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Plus className="h-5 w-5 mr-2 text-blue-600" />
                {t('quickAdlEntry')}
              </CardTitle>
              <CardDescription>
                {t('quickAdlEntryDescription')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <FileText className="h-5 w-5 mr-2 text-green-600" />
                {t('dailySummaries')}
              </CardTitle>
              <CardDescription>
                {t('dailySummariesDescription')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Search className="h-5 w-5 mr-2 text-purple-600" />
                {t('patientSearch')}
              </CardTitle>
              <CardDescription>
                {t('patientSearchDescription')}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Patient List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              {t('activePatients')} ({patients?.length || 0})
            </CardTitle>
            <CardDescription>
              {t('patientsRequiringDocumentation')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">{t('loadingPatients')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {patients?.slice(0, 5).map((patient: Patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-medium text-gray-900">{patient.name}</h3>
                        <p className="text-sm text-gray-600">{t('room')} {patient.roomNumber}</p>
                      </div>
                      <Badge className={getCareLevel(patient.careLevel).color}>
                        {getCareLevel(patient.careLevel).text}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Button size="sm" onClick={() => handlePatientSelect(patient)}>
                        <ClipboardList className="h-4 w-4 mr-2" />
                        {t('enterAdl')}
                      </Button>
                    </div>
                  </div>
                ))}
                {patients?.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {t('noPatients')}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ADL Categories Quick Reference */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('adlCategories')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { nameKey: "bathing", icon: "🛁", descriptionKey: "bathingDescription" },
              { nameKey: "dressing", icon: "👔", descriptionKey: "dressingDescription" },
              { nameKey: "eating", icon: "🍽️", descriptionKey: "eatingDescription" },
              { nameKey: "mobility", icon: "🚶", descriptionKey: "mobilityDescription" },
              { nameKey: "toileting", icon: "🚽", descriptionKey: "toiletingDescription" },
              { nameKey: "communication", icon: "💬", descriptionKey: "communicationDescription" }
            ].map((category) => (
              <Card key={category.nameKey} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <h3 className="font-medium text-gray-900">{t(category.nameKey)}</h3>
                      <p className="text-xs text-gray-600">{t(category.descriptionKey)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
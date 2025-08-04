import { useLanguage } from "@/context/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Footer } from "@/components/Footer";
import { NurseLogo } from "@/components/NurseLogo";
import TopNavigation from "@/components/TopNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { FileText, Activity, ClipboardCheck, FileEdit, Lightbulb } from "lucide-react";
import headerLogoImage from "@assets/cnageniuslogo_1753839891568.jpg";

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      {/* Top Navigation */}
      <TopNavigation />
      
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-end">
          <a 
            href="/admin/feedback" 
            className="text-xs text-gray-500 hover:text-gray-700 underline"
            style={{ fontSize: '10px' }}
          >
            {t("admin")}
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 flex-grow">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <NurseLogo />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t("heroTitle")}
          </h1>
          <p className="text-xl font-bold text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            {t("heroSubtitle")}
          </p>
          <div className="text-base text-gray-700 max-w-4xl mx-auto mb-8 leading-relaxed text-left">
            <p className="mb-4">
              {t("heroDescriptionParagraph1")}
            </p>
            <p>
              {t("heroDescriptionParagraph2")}
            </p>
          </div>
        </div>
        
        {/* Navigation Cards - Choose Your Tool */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <FileText className="w-6 h-6 text-blue-600" />
                <span>{t('incidentReportWriter')}</span>
              </CardTitle>
              <CardDescription>
                {t('incidentReportDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/incident-report">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  {t('startIncidentReport')}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Activity className="w-6 h-6 text-green-600" />
                <span>{t('adlTracker')}</span>
              </CardTitle>
              <CardDescription>
                {t('adlTrackerDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/adl-dashboard">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  {t('openAdlTracker')}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <ClipboardCheck className="w-6 h-6 text-purple-600" />
                <span>{t('shiftHandoff')}</span>
              </CardTitle>
              <CardDescription>
                {t('shiftHandoffDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/shift-handoff">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  {t('startShiftHandoff')}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <FileEdit className="w-6 h-6 text-orange-600" />
                <span>{t('generalStatementWriter')}</span>
              </CardTitle>
              <CardDescription>
                {t('generalStatementDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/general-statement">
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  {t('startGeneralStatement')}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Lightbulb className="w-6 h-6 text-yellow-600" />
                <span>{t('suggestionCenter')}</span>
              </CardTitle>
              <CardDescription>
                {t('suggestionCenterDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/suggestions">
                <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                  {t('submitSuggestion')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

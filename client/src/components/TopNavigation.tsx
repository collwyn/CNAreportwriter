import { Link, useLocation } from 'wouter';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Home, FileText, Activity } from 'lucide-react';

export default function TopNavigation() {
  const { t } = useLanguage();
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-1">
            <Link href="/">
              <Button 
                variant={isActive('/') ? 'default' : 'ghost'} 
                className="flex items-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">{t('backToHome')}</span>
              </Button>
            </Link>
            <Link href="/incident-report">
              <Button 
                variant={isActive('/incident-report') ? 'default' : 'ghost'} 
                className="flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">{t('incidentReportWriter')}</span>
              </Button>
            </Link>
            <Link href="/adl-dashboard">
              <Button 
                variant={isActive('/adl-dashboard') ? 'default' : 'ghost'} 
                className="flex items-center space-x-2"
              >
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">{t('adlTracker')}</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
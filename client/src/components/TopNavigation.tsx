import { Link, useLocation } from 'wouter';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Button } from '@/components/ui/button';
import { Home, FileText, Activity } from 'lucide-react';
import headerLogoImage from "@assets/cnageniuslogo_1752779536382.jpg";

export default function TopNavigation() {
  const { t } = useLanguage();
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Site Name */}
          <div className="flex items-center space-x-4">
            <Link href="/">
              <div className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <img 
                  src={headerLogoImage} 
                  alt="CNA Genius Logo" 
                  className="h-10 w-10 rounded-lg object-cover"
                />
                <h1 className="text-2xl font-semibold text-gray-800 hidden sm:block">
                  CNA Genius
                </h1>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            <Link href="/">
              <Button 
                variant={isActive('/') ? 'default' : 'ghost'} 
                size="sm"
                className="flex items-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span className="hidden md:inline">{t('home')}</span>
              </Button>
            </Link>
            <Link href="/incident-report">
              <Button 
                variant={isActive('/incident-report') ? 'default' : 'ghost'} 
                size="sm"
                className="flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden md:inline">{t('incidentReportWriter')}</span>
              </Button>
            </Link>
            <Link href="/adl-dashboard">
              <Button 
                variant={isActive('/adl-dashboard') ? 'default' : 'ghost'} 
                size="sm"
                className="flex items-center space-x-2"
              >
                <Activity className="w-4 h-4" />
                <span className="hidden md:inline">{t('adlTracker')}</span>
              </Button>
            </Link>
          </div>

          {/* Language Selector */}
          <div className="flex items-center">
            <LanguageSelector />
          </div>
        </div>
      </div>
    </nav>
  );
}
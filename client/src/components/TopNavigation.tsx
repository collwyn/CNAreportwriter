import { Link, useLocation } from 'wouter';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Button } from '@/components/ui/button';
import { Home, FileText, Activity, LogIn, LogOut, User } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import headerLogoImage from "@assets/cnageniuslogo_1752779536382.jpg";

export default function TopNavigation() {
  const { t } = useLanguage();
  const [location] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isActive = (path: string) => location === path;

  // Check if user is authenticated
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/auth/logout', {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
    },
    onError: () => {
      toast({
        title: "Sign out failed",
        description: "There was an error signing you out.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

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

          {/* Right side - Auth and Language */}
          <div className="flex items-center space-x-3">
            {/* Authentication */}
            {!isUserLoading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">
                        {user.firstName} {user.lastName}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                      className="flex items-center space-x-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden sm:inline">
                        {logoutMutation.isPending ? 'Signing out...' : t('signOut')}
                      </span>
                    </Button>
                  </div>
                ) : (
                  <Link href="/auth">
                    <Button variant="outline" size="sm" className="flex items-center space-x-1">
                      <LogIn className="w-4 h-4" />
                      <span className="hidden sm:inline">{t('signIn')}</span>
                    </Button>
                  </Link>
                )}
              </>
            )}
            
            <LanguageSelector />
          </div>
        </div>
      </div>
    </nav>
  );
}
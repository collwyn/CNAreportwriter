import { useRateLimit } from '@/hooks/useRateLimit';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function RateLimitDisplay() {
  const { data: rateLimit, isLoading, error } = useRateLimit();
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-gray-500">
            <Clock className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading usage info...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !rateLimit) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-yellow-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Unable to load usage information</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = () => {
    if (rateLimit.remaining === 0) return 'destructive';
    if (rateLimit.remaining <= 1) return 'secondary';
    return 'default';
  };

  const getStatusIcon = () => {
    if (rateLimit.remaining === 0) return <AlertCircle className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  const formatResetTime = (resetTime: string) => {
    const reset = new Date(resetTime);
    const now = new Date();
    const hoursUntilReset = Math.ceil((reset.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (hoursUntilReset <= 0) {
      return 'Resets shortly';
    } else if (hoursUntilReset === 1) {
      return 'Resets in 1 hour';
    } else {
      return `Resets in ${hoursUntilReset} hours`;
    }
  };

  return (
    <Card className={`border-2 ${
      rateLimit.remaining === 0 
        ? 'border-red-200 bg-red-50' 
        : rateLimit.remaining <= 1 
          ? 'border-yellow-200 bg-yellow-50'
          : 'border-green-200 bg-green-50'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`${
              rateLimit.remaining === 0 
                ? 'text-red-600' 
                : rateLimit.remaining <= 1 
                  ? 'text-yellow-600'
                  : 'text-green-600'
            }`}>
              {getStatusIcon()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">
                  Daily Report Generations
                </span>
                <Badge variant={getStatusColor()}>
                  {rateLimit.remaining} remaining
                </Badge>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {rateLimit.used} of {rateLimit.limit} used • {formatResetTime(rateLimit.resetTime)}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {rateLimit.remaining}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Left Today
            </div>
          </div>
        </div>
        

      </CardContent>
    </Card>
  );
}
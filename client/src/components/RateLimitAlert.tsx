import { useRateLimit } from '@/hooks/useRateLimit';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Clock } from 'lucide-react';

export function RateLimitAlert() {
  const { data: rateLimit } = useRateLimit();

  if (!rateLimit || rateLimit.remaining > 0) return null;

  // Calculate hours remaining until reset
  const resetTime = new Date(rateLimit.resetTime);
  const now = new Date();
  const hoursRemaining = Math.ceil((resetTime.getTime() - now.getTime()) / (1000 * 60 * 60));
  
  const timeText = hoursRemaining === 1 
    ? "1 hour" 
    : hoursRemaining < 24 
      ? `${hoursRemaining} hours`
      : "24 hours";

  return (
    <Alert className="border-red-200 bg-red-50">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800">
        <div className="flex items-center justify-between">
          <span>
            <strong>Daily usage limit hit.</strong> Please try again within {timeText}.
          </span>
          <div className="flex items-center text-sm text-red-600 ml-4">
            <Clock className="h-4 w-4 mr-1" />
            Resets in {timeText}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
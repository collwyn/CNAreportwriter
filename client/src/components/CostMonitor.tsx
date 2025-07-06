import { useRateLimit } from '@/hooks/useRateLimit';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, TrendingUp } from 'lucide-react';

export function CostMonitor() {
  const { data: rateLimit } = useRateLimit();

  if (!rateLimit) return null;

  // Assuming each report generation costs approximately $2 based on $10 daily budget / 5 reports
  const costPerReport = 2.00;
  const dailyBudget = 10.00;
  const usedCost = rateLimit.used * costPerReport;
  const remainingBudget = dailyBudget - usedCost;
  const budgetUsedPercentage = (usedCost / dailyBudget) * 100;

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-blue-600">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">Daily Budget Usage</span>
                <div className="flex items-center text-sm text-blue-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {budgetUsedPercentage.toFixed(0)}%
                </div>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                ${usedCost.toFixed(2)} of ${dailyBudget.toFixed(2)} used • ${remainingBudget.toFixed(2)} remaining
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">
              ${remainingBudget.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              Left Today
            </div>
          </div>
        </div>
        
        {/* Budget usage bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                budgetUsedPercentage > 80 ? 'bg-red-500' : 
                budgetUsedPercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(budgetUsedPercentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>$0</span>
            <span>${dailyBudget.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
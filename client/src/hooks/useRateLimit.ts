import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface RateLimitStatus {
  remaining: number;
  used: number;
  limit: number;
  resetTime: string;
}

export function useRateLimit() {
  return useQuery({
    queryKey: ['rateLimit'],
    queryFn: async (): Promise<RateLimitStatus> => {
      const response = await apiRequest('GET', '/api/rate-limit/status');
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });
}
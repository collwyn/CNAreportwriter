import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [ip: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 3, windowMs: number = 24 * 60 * 60 * 1000) { // 24 hours
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  private getClientIP(req: Request): string {
    return req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
  }

  private cleanExpiredEntries(): void {
    const now = Date.now();
    Object.keys(this.store).forEach(ip => {
      if (this.store[ip].resetTime <= now) {
        delete this.store[ip];
      }
    });
  }

  middleware = (req: Request, res: Response, next: NextFunction): void => {
    const ip = this.getClientIP(req);
    const now = Date.now();
    
    // Clean expired entries periodically
    this.cleanExpiredEntries();

    // Initialize or reset if window expired
    if (!this.store[ip] || this.store[ip].resetTime <= now) {
      this.store[ip] = {
        count: 0,
        resetTime: now + this.windowMs
      };
    }

    const remaining = Math.max(0, this.maxRequests - this.store[ip].count);
    const resetTime = new Date(this.store[ip].resetTime).toISOString();

    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': this.maxRequests.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': resetTime,
      'X-RateLimit-Used': this.store[ip].count.toString()
    });

    if (this.store[ip].count >= this.maxRequests) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: `You have exceeded the daily limit of ${this.maxRequests} report generations. Please try again tomorrow.`,
        retryAfter: resetTime,
        remaining: 0,
        used: this.store[ip].count,
        limit: this.maxRequests
      });
    }

    // Increment counter for this request
    this.store[ip].count++;

    next();
  };

  getRemainingRequests(req: Request): { remaining: number; used: number; limit: number; resetTime: string } {
    const ip = this.getClientIP(req);
    const now = Date.now();

    if (!this.store[ip] || this.store[ip].resetTime <= now) {
      return {
        remaining: this.maxRequests,
        used: 0,
        limit: this.maxRequests,
        resetTime: new Date(now + this.windowMs).toISOString()
      };
    }

    const remaining = Math.max(0, this.maxRequests - this.store[ip].count);
    return {
      remaining,
      used: this.store[ip].count,
      limit: this.maxRequests,
      resetTime: new Date(this.store[ip].resetTime).toISOString()
    };
  }
}

// Create rate limiter instance - 3 requests per 24 hours
export const reportRateLimit = new RateLimiter(3, 24 * 60 * 60 * 1000);
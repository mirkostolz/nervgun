import { NextRequest } from 'next/server';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const rateLimitConfig: Record<string, RateLimitConfig> = {
  '/api/reports': { windowMs: 15 * 60 * 1000, maxRequests: 10 }, // 10 requests per 15 minutes
  '/api/reports/[id]/comments': { windowMs: 5 * 60 * 1000, maxRequests: 5 }, // 5 comments per 5 minutes
  '/api/reports/[id]/upvote': { windowMs: 60 * 1000, maxRequests: 3 }, // 3 upvotes per minute
};

const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(req: NextRequest, path: string): { allowed: boolean; remaining: number } {
  const config = rateLimitConfig[path];
  if (!config) {
    return { allowed: true, remaining: Infinity };
  }

  const clientId = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
  const key = `${clientId}:${path}`;
  const now = Date.now();
  
  const current = requestCounts.get(key);
  
  if (!current || now > current.resetTime) {
    // Reset or initialize
    requestCounts.set(key, { count: 1, resetTime: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1 };
  }
  
  if (current.count >= config.maxRequests) {
    return { allowed: false, remaining: 0 };
  }
  
  current.count++;
  return { allowed: true, remaining: config.maxRequests - current.count };
}

export function cleanupRateLimit() {
  const now = Date.now();
  for (const [key, value] of requestCounts.entries()) {
    if (now > value.resetTime) {
      requestCounts.delete(key);
    }
  }
}

// Cleanup every 5 minutes
setInterval(cleanupRateLimit, 5 * 60 * 1000);

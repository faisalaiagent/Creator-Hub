// Simple in-memory IP-based rate limiter.
// Good enough for launch / AdSense review. Resets on server restart/redeploy.
// Upgrade to Upstash Redis later once you have real traffic.

interface Bucket {
  count: number;
  resetAt: number; // epoch ms
}

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
const DEFAULT_LIMIT = 15; // generations per IP per 24h per tool

/**
 * Returns true if the request is allowed, false if rate-limited.
 * Call this once per tool route, keyed by `${ip}:${tool}`.
 */
export function checkRateLimit(ip: string, tool: string, limit: number = DEFAULT_LIMIT): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const key = `${ip}:${tool}`;
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt < now) {
    const resetAt = now + WINDOW_MS;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}

/**
 * Extracts the client IP from a Next.js request, accounting for
 * common proxy headers used by Vercel.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

// Periodic cleanup to prevent unbounded memory growth
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}, 60 * 60 * 1000); // every hour

import { NextResponse } from 'next/server';
import { getClientIp } from '@/lib/http';

/**
 * Minimal fixed-window, in-memory rate limiter.
 * NOTE: state is per server instance. On serverless/multi-instance deployments use a shared
 * store (e.g. Upstash Redis) for strict guarantees — this still blunts casual abuse.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 10_000) {
      for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
    }
    return true;
  }

  bucket.count += 1;
  return bucket.count <= limit;
}

/** Returns a 429 response when the caller's IP exceeded the limit for `scope`, otherwise null. */
export function limitByIp(req: Request, scope: string, limit: number, windowMs: number) {
  if (rateLimit(`${scope}:${getClientIp(req)}`, limit, windowMs)) return null;
  return NextResponse.json(
    { message: 'Too many requests. Please wait a moment and try again.', error: 'Too many requests.' },
    { status: 429 }
  );
}

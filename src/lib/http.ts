import { NextResponse } from 'next/server';

/** Error whose message is safe to show to end users. */
export class PublicError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

/** Message to return to the client: internal details are hidden in production. */
export function safeMessage(error: unknown, fallback: string): string {
  if (error instanceof PublicError) return error.message;
  if (process.env.NODE_ENV !== 'production' && error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

export function errorResponse(error: unknown, fallback = 'Internal Server Error', key: 'message' | 'error' = 'message') {
  const status = error instanceof PublicError ? error.status : 500;
  if (status >= 500) console.error(fallback, error);
  return NextResponse.json({ [key]: safeMessage(error, fallback) }, { status });
}

/** Returns the value only if it is a non-empty string (guards against `{ "$ne": "" }` style payloads). */
export function asString(value: unknown, maxLength = 1000): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) return null;
  return trimmed;
}

export function normalizeEmail(value: unknown): string | null {
  const email = asString(value, 254)?.toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  return (forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip')) || 'unknown';
}

/** Rejects request bodies larger than `maxBytes` based on the Content-Length header. */
export function assertBodySize(req: Request, maxBytes: number) {
  const length = Number(req.headers.get('content-length') || 0);
  if (length > maxBytes) {
    throw new PublicError(`Request is too large (max ${Math.round(maxBytes / 1024 / 1024)} MB).`, 413);
  }
}

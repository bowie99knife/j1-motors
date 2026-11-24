import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export class InvalidInput extends Error {}
export function field(value: unknown, label: string, max: number, required = false): string {
  if (value == null || value === '') {
    if (required) throw new InvalidInput(`${label} is required.`);
    return '';
  }
  if (typeof value !== 'string') throw new InvalidInput(`${label} is invalid.`);
  const v = value.trim();
  if (v.length > max || (required && !v) || /[\u0000-\u001f\u007f]/.test(v)) throw new InvalidInput(`${label} is invalid.`);
  return v;
}
export function emailField(value: unknown): string | null {
  const v = field(value, 'Email', 254);
  if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) throw new InvalidInput('Email is invalid.');
  return v || null;
}
export function phoneField(value: unknown): string {
  const v = field(value, 'Phone', 50, true);
  if (!/^\+?[0-9 ()-]{7,50}$/.test(v) || v.replace(/\D/g,'').length < 7) throw new InvalidInput('Phone is invalid.');
  return v;
}
export function yearField(value: unknown): number | null {
  if (value === '' || value == null) return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1886 || n > new Date().getFullYear() + 1) throw new InvalidInput('Year is invalid.');
  return n;
}

export function dateField(value: unknown): string {
  const v = field(value, 'Preferred date', 10, true);

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(v) ||
    Number.isNaN(Date.parse(`${v}T00:00:00Z`)) ||
    new Date(`${v}T00:00:00Z`).toISOString().slice(0, 10) !== v
  ) {
    throw new InvalidInput('Preferred date is invalid.');
  }

  // Compare dates using Perth local time.
  const todayInPerth = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Australia/Perth',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  if (v < todayInPerth) {
    throw new InvalidInput('Preferred date cannot be in the past.');
  }

  return v;
}

export async function jsonBody(request: Request): Promise<Record<string,unknown>> {
  const len = Number(request.headers.get('content-length'));
  if (Number.isFinite(len) && len > 8192) throw new InvalidInput('Request is too large.');
  const raw = await request.text();
  if (Buffer.byteLength(raw, 'utf8') > 8192) throw new InvalidInput('Request is too large.');
  let obj: unknown;
  try { obj = JSON.parse(raw); } catch { throw new InvalidInput('Invalid JSON.'); }
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new InvalidInput('Invalid request.');
  return obj as Record<string,unknown>;
}
export function reference(prefix: string): string { return `${prefix}${randomBytes(10).toString('hex').toUpperCase()}`; }
function clientBucket(request: Request): string {
  // Only Netlify's connection-IP header is trusted in production; other forwarded headers are user-spoofable.
  const ip = process.env.NETLIFY ? request.headers.get('x-nf-client-connection-ip') : null;
  const identity = ip && /^[0-9a-fA-F:.]{3,45}$/.test(ip) ? ip : 'shared-unknown';
  const secret = process.env.RATE_LIMIT_HASH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return createHash('sha256').update(`${secret}:${identity}`).digest('hex');
}
export async function enforceLimit(request: Request, action: string, limit: number, seconds: number): Promise<NextResponse | null> {
  const { data, error } = await supabaseAdmin.rpc('public_api_rate_limit', {
    p_bucket: `${action}:${clientBucket(request)}`, p_limit: limit, p_window_seconds: seconds,
  });
  if (error || typeof data !== 'boolean') {
    console.error('Public rate limiter unavailable:', error?.code || 'invalid response');
    return NextResponse.json({error:'Service temporarily unavailable. Please try again later.'}, {status:503});
  }
  return data ? null : NextResponse.json({error:'Too many requests. Please try again later.'}, {status:429,headers:{'Retry-After':String(seconds)}});
}
export function invalidResponse(error: unknown, generic: string) {
  if (error instanceof InvalidInput) return NextResponse.json({error:error.message},{status:400});
  console.error(generic, error);
  return NextResponse.json({error:generic},{status:500});
}

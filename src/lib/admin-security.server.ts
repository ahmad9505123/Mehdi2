import { createHash, timingSafeEqual } from 'node:crypto';
import { getRequest, setResponseHeader, useSession } from '@tanstack/react-start/server';
export function digest(value: string) { return createHash('sha256').update(value).digest('hex'); }
export function passwordMatches(input: string, expected: string) {
  return timingSafeEqual(Buffer.from(digest(input)), Buffer.from(digest(expected)));
}
export function authorizedSession(version: unknown, expected: string | undefined) {
  return Boolean(expected && typeof version === 'string' && passwordMatches(version, digest(expected)));
}
export function adminConfigured() {
  return Boolean(process.env['ADMIN_PASSWORD']);
}
function sessionSecret() {
  const explicit = process.env['SESSION_SECRET'];
  if (explicit && explicit.length >= 32) return explicit;
  const password = process.env['ADMIN_PASSWORD'];
  if (!password) return undefined;
  // Without a dedicated SESSION_SECRET, derive one from the admin password so changing the password invalidates sessions.
  return digest(`mahdi-admin-session:${password}`);
}
const isDev = process.env['NODE_ENV'] !== 'production';
export async function adminSession() {
  const secret = sessionSecret();
  if (!secret) throw new Error('لم يتم إعداد الرقم السري للإدارة (ADMIN_PASSWORD)');
  setResponseHeader('Cache-Control', 'no-store');
  return useSession<{ version?: string }>({
    password: secret,
    name: 'mahdi-admin',
    maxAge: 60 * 60 * 8,
    // The dev preview runs inside a cross-site iframe, where SameSite=Strict cookies are never sent.
    cookie: { httpOnly: true, secure: true, sameSite: isDev ? 'none' : 'strict', path: '/' },
  });
}
function requestHost(request: Request) {
  return request.headers.get('x-forwarded-host')?.split(',')[0]?.trim() || request.headers.get('host') || new URL(request.url).host;
}
export function requireSameOrigin() {
  const request = getRequest();
  const origin = request.headers.get('origin');
  if (!origin) throw new Error('طلب غير مسموح');
  const originHost = new URL(origin).host;
  if (originHost !== requestHost(request) && originHost !== new URL(request.url).host) throw new Error('طلب غير مسموح');
}
const memoryAttempts = new Map<string, { count: number; resetAt: number }>();
function consumeMemoryAttempt(key: string) {
  const now = Date.now();
  const entry = memoryAttempts.get(key);
  if (!entry || entry.resetAt < now) {
    memoryAttempts.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }
  entry.count += 1;
  return entry.count <= 5;
}
export async function consumeLoginAttempt(key: string) {
  if (process.env['SUPABASE_URL'] && process.env['SUPABASE_SERVICE_ROLE_KEY']) {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data, error } = await supabaseAdmin.rpc('consume_admin_attempt', { attempt_key: key });
    if (!error) return Boolean(data);
    console.error('[admin] consume_admin_attempt failed, using in-memory limiter:', error.message);
  }
  return consumeMemoryAttempt(key);
}
export async function requireAdmin() {
  requireSameOrigin();
  const session = await adminSession();
  if (!authorizedSession(session.data.version, process.env['ADMIN_PASSWORD'])) throw new Error('يرجى تسجيل الدخول أولاً');
}

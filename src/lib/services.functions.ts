import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { serviceSchema } from './service-schema';
import { catalogSchema } from './catalog';
const catalogSchemaLazy = () => catalogSchema;
import type { Database } from '@/integrations/supabase/types';
export const listServices = createServerFn({ method: 'GET' }).handler(async () => {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) { console.error('[services] SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY غير مضبوطة في الاستضافة'); return [] as { id: string; name: string; price: number | null; currency: string; available: boolean }[]; }
  const client = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => {
    const headers = new Headers(init?.headers);
    if (key.startsWith('sb_') && headers.get('Authorization') === `Bearer ${key}`) headers.delete('Authorization');
    headers.set('apikey', key); return fetch(input, { ...init, headers });
  } } });
  const { data, error } = await client.from('services').select('id,name,price,currency,available').order('created_at');
  if (error) { console.error('[services] ', error.message); return []; }
  return data;
});
export const adminStatus = createServerFn({ method: 'GET' }).handler(async () => {
  const { adminSession, authorizedSession, adminConfigured } = await import('./admin-security.server');
  if (!adminConfigured()) return { unlocked: false, configured: false };
  const session = await adminSession();
  return { unlocked: authorizedSession(session.data.version, process.env['ADMIN_PASSWORD']), configured: true };
});
export const adminLogin = createServerFn({ method: 'POST' }).inputValidator((input) => z.object({ password: z.string().min(1).max(256) }).parse(input)).handler(async ({ data }) => {
  const { adminSession, passwordMatches, digest, requireSameOrigin, consumeLoginAttempt } = await import('./admin-security.server');
  requireSameOrigin();
  const expected = process.env['ADMIN_PASSWORD'];
  if (!expected) throw new Error('لم يتم إعداد الرقم السري بعد');
  const { getRequest } = await import('@tanstack/react-start/server');
  const headers = getRequest().headers;
  const ip = headers.get('cf-connecting-ip') ?? headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'shared-admin-login';
  const allowed = await consumeLoginAttempt(digest(ip));
  if (!allowed) throw new Error('محاولات كثيرة، حاول بعد 15 دقيقة');
  if (!passwordMatches(data.password, expected)) return { ok: false };
  const session = await adminSession();
  await session.update({ version: digest(expected) });
  return { ok: true };
});
export const adminLogout = createServerFn({ method: 'POST' }).handler(async () => {
  const { adminSession, requireSameOrigin } = await import('./admin-security.server');
  requireSameOrigin(); await (await adminSession()).clear(); return { ok: true };
});
export const saveService = createServerFn({ method: 'POST' }).inputValidator((input) => serviceSchema.parse(input)).handler(async ({ data }) => {
  const { requireAdmin } = await import('./admin-security.server');
  await requireAdmin();
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { id, ...values } = data;
  const result = id ? await supabaseAdmin.from('services').update(values).eq('id', id).select('id').single() : await supabaseAdmin.from('services').insert(values).select('id').single();
  if (result.error) throw new Error('تعذر حفظ الخدمة');
  return result.data;
});
export const deleteService = createServerFn({ method: 'POST' }).inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input)).handler(async ({ data }) => {
  const { requireAdmin } = await import('./admin-security.server'); await requireAdmin();
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { error } = await supabaseAdmin.from('services').delete().eq('id', data.id);
  if (error) throw new Error('تعذر حذف الخدمة');
  return { ok: true };
});
const accountKey = z.string().trim().min(1).max(300);
export const listAccountAvailability = createServerFn({ method: 'GET' }).handler(async () => {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) { console.error('[availability] Supabase env missing'); return {} as Record<string, boolean>; }
  const client = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => {
    const headers = new Headers(init?.headers);
    if (key.startsWith('sb_') && headers.get('Authorization') === `Bearer ${key}`) headers.delete('Authorization');
    headers.set('apikey', key); return fetch(input, { ...init, headers });
  } } });
  const { data, error } = await client.from('account_availability').select('key,available');
  if (error) { console.error('[availability] ', error.message); return {} as Record<string, boolean>; }
  return Object.fromEntries(data.map(row => [row.key, row.available])) as Record<string, boolean>;
});
export const setAccountAvailability = createServerFn({ method: 'POST' }).inputValidator((input) => z.object({ key: accountKey, available: z.boolean() }).parse(input)).handler(async ({ data }) => {
  const { requireAdmin } = await import('./admin-security.server'); await requireAdmin();
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { error } = await supabaseAdmin.from('account_availability').upsert({ key: data.key, available: data.available, updated_at: new Date().toISOString() });
  if (error) throw new Error('تعذر حفظ الحالة');
  return { ok: true };
});
export const setServiceAvailability = createServerFn({ method: 'POST' }).inputValidator((input) => z.object({ id: z.string().uuid(), available: z.boolean() }).parse(input)).handler(async ({ data }) => {
  const { requireAdmin } = await import('./admin-security.server'); await requireAdmin();
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { error } = await supabaseAdmin.from('services').update({ available: data.available }).eq('id', data.id);
  if (error) throw new Error('تعذر حفظ الحالة');
  return { ok: true };
});
export const getCatalog = createServerFn({ method: 'GET' }).handler(async () => {
  const { defaultCatalog, catalogSchema } = await import('./catalog');
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) return defaultCatalog;
  const client = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => {
    const headers = new Headers(init?.headers);
    if (key.startsWith('sb_') && headers.get('Authorization') === `Bearer ${key}`) headers.delete('Authorization');
    headers.set('apikey', key); return fetch(input, { ...init, headers });
  } } });
  const { data } = await client.from('site_content').select('data').eq('key', 'catalog').maybeSingle();
  const parsed = catalogSchema.safeParse(data?.data);
  return parsed.success ? parsed.data : defaultCatalog;
});
export const saveCatalog = createServerFn({ method: 'POST' }).inputValidator((input) => catalogSchemaLazy().parse(input)).handler(async ({ data }) => {
  const { requireAdmin } = await import('./admin-security.server'); await requireAdmin();
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { error } = await supabaseAdmin.from('site_content').upsert({ key: 'catalog', data: data as never, updated_at: new Date().toISOString() });
  if (error) throw new Error('تعذر حفظ التعديلات');
  return { ok: true };
});

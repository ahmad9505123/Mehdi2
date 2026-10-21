import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// المتصفح يقرأ المتغيرات من VITE_* (تُحقن وقت البناء).
// السيرفر (SSR) يقرأ من process.env إن وُجد، وإلا يرجع إلى VITE_*.
const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};
const proc = typeof process !== 'undefined' ? process.env : undefined;

const supabaseUrl = proc?.['SUPABASE_URL'] || proc?.['VITE_SUPABASE_URL'] || env['VITE_SUPABASE_URL'] || '';
const supabaseKey =
  proc?.['SUPABASE_PUBLISHABLE_KEY'] || proc?.['VITE_SUPABASE_PUBLISHABLE_KEY'] || env['VITE_SUPABASE_PUBLISHABLE_KEY'] || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('⚠️ Supabase env vars missing: set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY at build time.');
}

// placeholder يمنع انهيار createClient عند غياب المتغيرات، فتظهر الصفحة بدل شاشة الخطأ.
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key',
);

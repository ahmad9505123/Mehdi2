import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useState, type FormEvent } from 'react';
import { LockKeyhole, LogOut } from 'lucide-react';
import MahdiSite from '@/components/MahdiSite';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminStatus, adminLogin, adminLogout } from '@/lib/services.functions';
export const Route = createFileRoute('/admin')({
  loader: () => adminStatus(),
  head: () => ({ meta: [{ title: 'إدارة الخدمات | مهدي خدماتي' }, { name: 'description', content: 'إدارة خدمات وأسعار مهدي خدماتي.' }, { property: 'og:title', content: 'إدارة الخدمات | مهدي خدماتي' }, { property: 'og:description', content: 'لوحة إدارة الخدمات والأسعار.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex,nofollow' }] }),
  component: AdminPage,
});
function AdminPage() {
  const { unlocked, configured } = Route.useLoaderData();
  const router = useRouter();
  const login = useServerFn(adminLogin);
  const logout = useServerFn(adminLogout);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    const form = event.currentTarget;
    const password = String(new FormData(form).get('password') ?? '');
    try { const result = await login({ data: { password } }); if (!result.ok) setError('الرقم السري غير صحيح'); else { form.reset(); await router.invalidate(); } }
    catch (e) { setError(e instanceof Error ? e.message : 'تعذر تسجيل الدخول'); }
    finally { setBusy(false); }
  }
  if (unlocked) return <><div className="admin-bar" dir="rtl"><span>✏️ وضع التعديل — اضغط على أي قلم لتعديل الخانة</span><Button size="sm" variant="outline" onClick={async () => { await logout(); await router.invalidate(); }}><LogOut />خروج</Button></div><MahdiSite admin /></>;
  return <main className="admin-shell" dir="rtl"><header className="admin-header"><Link to="/"><img src="/image.png" alt="مهدي خدماتي" />مهدي خدماتي</Link>{unlocked && <Button variant="outline" onClick={async () => { await logout(); await router.invalidate(); }}><LogOut />خروج</Button>}</header>{!unlocked ? <form className="admin-login" onSubmit={submit}><LockKeyhole size={32} /><h1>دخول الإدارة</h1><label htmlFor="admin-password">الرقم السري</label><Input id="admin-password" name="password" type="password" autoComplete="current-password" required maxLength={256} />{!configured && <p className="text-destructive" role="alert">لم يتم إعداد الرقم السري بعد. أضف المتغير ADMIN_PASSWORD من إعدادات المشروع (Vars).</p>}{error && <p className="text-destructive" role="alert">{error}</p>}<Button type="submit" disabled={busy}>{busy ? 'جارٍ التحقق…' : 'دخول'}</Button></form> : null}</main>;
}

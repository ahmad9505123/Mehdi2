import { useState, type FormEvent, type ReactNode } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useServerFn } from '@tanstack/react-start';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { Account } from '@/lib/catalog';
import type { Service } from '@/lib/service-schema';
import { deleteService, saveService } from '@/lib/services.functions';

export function EditButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <button type="button" className="edit-pencil" aria-label={`تعديل ${label}`} title="تعديل" onClick={(e) => { e.stopPropagation(); onClick(); }}><Pencil size={13} /></button>;
}

function EditorDialog({ title, open, onClose, children }: { title: string; open: boolean; onClose: () => void; children: ReactNode }) {
  return <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}><DialogContent dir="rtl" className="edit-dialog"><DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>{children}</DialogContent></Dialog>;
}

function useSubmit(action: () => Promise<void>, onClose: () => void) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const run = async (e?: FormEvent) => { e?.preventDefault(); setBusy(true); setError(''); try { await action(); onClose(); } catch (err) { setError(err instanceof Error ? err.message : 'تعذر الحفظ'); } finally { setBusy(false); } };
  return { busy, error, run };
}

const lines = (v: string) => { const l = v.split('\n').map((s) => s.trim()).filter(Boolean); return l.length ? l : undefined; };

export function FieldDialog({ open, onClose, field, onSave, onDelete }: { open: boolean; onClose: () => void; field?: { label: string; value: string } | undefined; onSave: (f: { label: string; value: string }) => Promise<void>; onDelete?: (() => Promise<void>) | undefined }) {
  const [label, setLabel] = useState(field?.label ?? '');
  const [value, setValue] = useState(field?.value ?? '');
  const { busy, error, run } = useSubmit(() => onSave({ label: label.trim(), value: value.trim() }), onClose);
  const del = useSubmit(async () => { await onDelete?.(); }, onClose);
  return <EditorDialog title={field ? 'تعديل الخانة' : 'إضافة خانة'} open={open} onClose={onClose}><form className="edit-form" onSubmit={run}><label>العنوان (مثل: الآيبان)<Input value={label} onChange={(e) => setLabel(e.target.value)} required maxLength={200} /></label><label>القيمة<Input value={value} onChange={(e) => setValue(e.target.value)} required maxLength={500} dir="auto" /></label>{(error || del.error) && <p className="text-destructive">{error || del.error}</p>}<div className="edit-actions"><Button type="submit" disabled={busy}>{busy ? 'جارٍ الحفظ…' : 'حفظ'}</Button>{onDelete && <Button type="button" variant="destructive" disabled={del.busy} onClick={() => { if (window.confirm('حذف هذه الخانة؟')) void del.run(); }}><Trash2 />حذف</Button>}</div></form></EditorDialog>;
}

export function AccountDialog({ open, onClose, account, onSave, onDelete }: { open: boolean; onClose: () => void; account?: Account | undefined; onSave: (a: Account) => Promise<void>; onDelete?: (() => Promise<void>) | undefined }) {
  const [title, setTitle] = useState(account?.title ?? '');
  const [subtitle, setSubtitle] = useState(account?.subtitle ?? 'حساب بنكي مباشر · محدث');
  const [icon, setIcon] = useState<Account['icon']>(account?.icon ?? 'bank');
  const [fields, setFields] = useState(account?.fields ?? [{ label: 'اسم صاحب الحساب', value: '' }, { label: 'الـ IBAN', value: '' }]);
  const [description, setDescription] = useState(account?.description ?? '');
  const [directLink, setDirectLink] = useState(account?.directLink ?? '');
  const [mode, setMode] = useState<'data' | 'amount' | 'whatsapp'>(account?.amountRequest ? 'amount' : account?.whatsappMessage ? 'whatsapp' : 'data');
  const [waMessage, setWaMessage] = useState(account?.whatsappMessage ?? '');
  const [currencyLabel, setCurrencyLabel] = useState(account?.amountRequest?.currencyLabel ?? '');
  const [amountMessage, setAmountMessage] = useState(account?.amountRequest?.messageTemplate ?? 'مرحباً، أريد حساب لتحويل مبلغ {amount}');
  const [warningTitle, setWarningTitle] = useState(account?.warningTitle ?? '');
  const [warning, setWarning] = useState((account?.warning ?? []).join('\n'));
  const [note, setNote] = useState((account?.note ?? []).join('\n'));
  const [date, setDate] = useState(account?.date ?? new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));
  const { busy, error, run } = useSubmit(() => onSave({
    ...(account ?? {}), title: title.trim(), subtitle, icon, date,
    fields: fields.filter((f) => f.label.trim() && f.value.trim()).map((f) => ({ label: f.label.trim(), value: f.value.trim() })),
    description: description.trim() || undefined, directLink: directLink.trim() || undefined,
    whatsappMessage: mode === 'whatsapp' ? (waMessage.trim() || undefined) : undefined,
    amountRequest: mode === 'amount' ? {
      inputLabel: account?.amountRequest?.inputLabel ?? (currencyLabel.trim() ? `المبلغ المطلوب (${currencyLabel.trim()})` : 'المبلغ المطلوب'),
      placeholder: account?.amountRequest?.placeholder ?? 'مثال: 500',
      currencyLabel: currencyLabel.trim(),
      buttonLabel: account?.amountRequest?.buttonLabel ?? 'اطلب الحساب',
      emptyError: account?.amountRequest?.emptyError ?? 'يرجى كتابة المبلغ المطلوب تحويله أولاً.',
      invalidError: account?.amountRequest?.invalidError ?? 'يرجى إدخال مبلغ صحيح (أرقام فقط، أكبر من صفر).',
      messageTemplate: amountMessage.trim() || 'مرحباً، أريد حساب لتحويل مبلغ {amount}',
    } : undefined,
    warningTitle: warningTitle.trim() || undefined, warning: lines(warning), note: lines(note),
  }), onClose);
  const del = useSubmit(async () => { await onDelete?.(); }, onClose);
  const setField = (i: number, k: 'label' | 'value', v: string) => setFields(fields.map((f, j) => (j === i ? { ...f, [k]: v } : f)));
  return <EditorDialog title={account ? 'تعديل الحساب' : 'إضافة حساب'} open={open} onClose={onClose}><form className="edit-form" onSubmit={run}>
    <label>اسم الحساب / البنك<Input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} /></label>
    <label>الوصف القصير<Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} maxLength={200} /></label>
    <label>النوع<select className="edit-select" value={icon} onChange={(e) => setIcon(e.target.value as Account['icon'])}><option value="bank">حساب بنكي</option><option value="wallet">محفظة إلكترونية</option></select></label>
    <label>طريقة العرض للزبون<select className="edit-select" value={mode} onChange={(e) => setMode(e.target.value as 'data' | 'amount' | 'whatsapp')}><option value="data">عرض بيانات الحساب (الاسم والآيبان)</option><option value="amount">طلب المبلغ ثم إرسال رسالة واتساب</option><option value="whatsapp">زر طلب الحساب عبر واتساب (رسالة جاهزة)</option></select></label>
    {mode === 'amount' && <><label>اسم العملة (مثل: ريال سعودي SAR)<Input value={currencyLabel} onChange={(e) => setCurrencyLabel(e.target.value)} maxLength={100} /></label><label>نص رسالة واتساب — اكتب {'{amount}'} مكان المبلغ<Textarea value={amountMessage} onChange={(e) => setAmountMessage(e.target.value)} maxLength={500} /></label></>}
    {mode === 'whatsapp' && <label>نص رسالة واتساب الجاهزة<Textarea value={waMessage} onChange={(e) => setWaMessage(e.target.value)} maxLength={500} /></label>}
    <fieldset className="edit-fields"><legend>البيانات (الاسم، الآيبان، الرقم…)</legend>{fields.map((f, i) => <div className="edit-field-row" key={i}><Input aria-label="العنوان" placeholder="العنوان" value={f.label} onChange={(e) => setField(i, 'label', e.target.value)} maxLength={200} /><Input aria-label="القيمة" placeholder="القيمة" dir="auto" value={f.value} onChange={(e) => setField(i, 'value', e.target.value)} maxLength={500} /><Button type="button" variant="ghost" size="icon" aria-label="حذف الخانة" onClick={() => setFields(fields.filter((_, j) => j !== i))}><Trash2 /></Button></div>)}<Button type="button" variant="outline" onClick={() => setFields([...fields, { label: '', value: '' }])}><Plus />إضافة خانة</Button></fieldset>
    <label>رابط مباشر (اختياري) — مثل رابط PayPal.me، اتركه فارغًا لإخفاء الزر<Input type="url" dir="ltr" placeholder="https://www.paypal.me/اسم_المستخدم" value={directLink} onChange={(e) => setDirectLink(e.target.value)} maxLength={500} /></label>
    <label>نص توضيحي (اختياري)<Textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} /></label>
    <label>عنوان التنبيه (اختياري)<Input value={warningTitle} onChange={(e) => setWarningTitle(e.target.value)} placeholder="تنبيه هام" maxLength={200} /></label>
    <label>التنبيهات — كل سطر تنبيه<Textarea value={warning} onChange={(e) => setWarning(e.target.value)} /></label>
    <label>الملاحظات — كل سطر ملاحظة<Textarea value={note} onChange={(e) => setNote(e.target.value)} /></label>
    <label>آخر تحديث<Input value={date} onChange={(e) => setDate(e.target.value)} maxLength={100} /></label>
    {(error || del.error) && <p className="text-destructive">{error || del.error}</p>}
    <div className="edit-actions"><Button type="submit" disabled={busy}>{busy ? 'جارٍ الحفظ…' : 'حفظ'}</Button>{onDelete && <Button type="button" variant="destructive" disabled={del.busy} onClick={() => { if (window.confirm('حذف هذا الحساب؟')) void del.run(); }}><Trash2 />حذف الحساب</Button>}</div>
  </form></EditorDialog>;
}

export function CountryDialog({ open, onClose, country, onSave, onDelete }: { open: boolean; onClose: () => void; country?: { name: string; flag: string } | undefined; onSave: (c: { name: string; flag: string }) => Promise<void>; onDelete?: (() => Promise<void>) | undefined }) {
  const [name, setName] = useState(country?.name ?? '');
  const [flag, setFlag] = useState(country?.flag ?? '');
  const { busy, error, run } = useSubmit(() => onSave({ name: name.trim(), flag: flag.trim() }), onClose);
  const del = useSubmit(async () => { await onDelete?.(); }, onClose);
  return <EditorDialog title={country ? 'تعديل الدولة' : 'إضافة دولة'} open={open} onClose={onClose}><form className="edit-form" onSubmit={run}><label>اسم الدولة<Input value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} /></label><label>العلم (رمز تعبيري مثل 🇯🇴)<Input value={flag} onChange={(e) => setFlag(e.target.value)} maxLength={20} /></label>{(error || del.error) && <p className="text-destructive">{error || del.error}</p>}<div className="edit-actions"><Button type="submit" disabled={busy}>{busy ? 'جارٍ الحفظ…' : 'حفظ'}</Button>{onDelete && <Button type="button" variant="destructive" disabled={del.busy} onClick={() => { if (window.confirm('حذف هذه الدولة وكل حساباتها؟')) void del.run(); }}><Trash2 />حذف الدولة</Button>}</div></form></EditorDialog>;
}

export function ServiceDialog({ open, onClose, service }: { open: boolean; onClose: () => void; service?: Service | undefined }) {
  const [name, setName] = useState(service?.name ?? '');
  const [price, setPrice] = useState(service?.price?.toString() ?? '');
  const [currency, setCurrency] = useState(service?.currency ?? '');
  const save = useServerFn(saveService);
  const remove = useServerFn(deleteService);
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['services'] });
  const { busy, error, run } = useSubmit(async () => { await save({ data: { id: service?.id, name, price: price.trim() ? Number(price) : null, currency, available: service?.available ?? true } }); await refresh(); }, onClose);
  const del = useSubmit(async () => { if (service) { await remove({ data: { id: service.id } }); await refresh(); } }, onClose);
  return <EditorDialog title={service ? 'تعديل الخدمة' : 'إضافة خدمة'} open={open} onClose={onClose}><form className="edit-form" onSubmit={run}><label>اسم الخدمة<Input value={name} onChange={(e) => setName(e.target.value)} required maxLength={150} /></label><label>السعر (اتركه فارغاً = حسب الطلب)<Input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} /></label><label>العملة<Input value={currency} onChange={(e) => setCurrency(e.target.value)} maxLength={30} /></label>{(error || del.error) && <p className="text-destructive">{error || del.error}</p>}<div className="edit-actions"><Button type="submit" disabled={busy}>{busy ? 'جارٍ الحفظ…' : 'حفظ'}</Button>{service && <Button type="button" variant="destructive" disabled={del.busy} onClick={() => { if (window.confirm(`حذف خدمة ${service.name}؟`)) void del.run(); }}><Trash2 />حذف</Button>}</div></form></EditorDialog>;
}

export function ConfirmDelete({ open, name, onCancel, onConfirm }: { open: boolean; name: string; onCancel: () => void; onConfirm: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const confirm = async () => { setBusy(true); setError(''); try { await onConfirm(); onCancel(); } catch (e) { setError(e instanceof Error ? e.message : 'تعذر الحذف'); } finally { setBusy(false); } };
  return <AlertDialog open={open} onOpenChange={(o) => { if (!o && !busy) onCancel(); }}><AlertDialogContent dir="rtl"><AlertDialogHeader><AlertDialogTitle>تأكيد الحذف</AlertDialogTitle><AlertDialogDescription>هل أنت متأكد من حذف «{name}»؟ لا يمكن التراجع عن هذه الخطوة.</AlertDialogDescription></AlertDialogHeader>{error && <p className="text-destructive">{error}</p>}<AlertDialogFooter className="gap-2"><AlertDialogCancel disabled={busy}>إلغاء</AlertDialogCancel><Button variant="destructive" disabled={busy} onClick={() => void confirm()}><Trash2 />{busy ? 'جارٍ الحذف…' : 'نعم، احذف'}</Button></AlertDialogFooter></AlertDialogContent></AlertDialog>;
}

export function AdminActions({ name, onEdit, onDelete }: { name: string; onEdit: () => void; onDelete?: (() => Promise<void>) | undefined }) {
  const [confirming, setConfirming] = useState(false);
  return <div className="admin-actions" onClick={(e) => e.stopPropagation()}><Button type="button" size="sm" variant="outline" onClick={onEdit}><Pencil />تعديل</Button>{onDelete && <Button type="button" size="sm" variant="destructive" onClick={() => setConfirming(true)}><Trash2 />حذف</Button>}{onDelete && <ConfirmDelete open={confirming} name={name} onCancel={() => setConfirming(false)} onConfirm={onDelete} />}</div>;
}

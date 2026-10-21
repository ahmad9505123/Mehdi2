import type * as React from 'react';
import { useEffect, useId, useRef, useState } from 'react';
import ServicesList from './ServicesList';
import AvailabilityToggle from './AvailabilityToggle';
import { AccountDialog, AdminActions, CountryDialog, EditButton, FieldDialog } from './AdminEditors';
import { useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { accountAvailabilityQuery, catalogQuery, useLiveAccountAvailability, useLiveCatalog } from '@/lib/services-query';
import { saveCatalog, setAccountAvailability } from '@/lib/services.functions';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  Clipboard,
  Copy,
  ExternalLink,
  Landmark,
  LockKeyhole,
  Plus,
  MessageCircle,
  Send,
  ShieldCheck,
  Wallet,
  X,
} from 'lucide-react';

import { type Account, type AmountRequest, type Catalog } from '@/lib/catalog';

const WHATSAPP_NUMBER = '972566125588';

const createWhatsappUrl = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

const whatsappUrl = createWhatsappUrl('أهلاً مهدي خدماتي، أريد إرسال إشعار التحويل');


function BrandMark() {
  return (
    <div className="brand-mark" aria-label="مهدي خدمات">
      <img src="/image.png" alt="شعار مهدي خدمات" />
    </div>
  );
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to legacy method
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.opacity = '0';
    textarea.style.fontSize = '16px';

    const isIOS = /ipad|iphone|ipod/i.test(navigator.userAgent);
    if (isIOS) {
      textarea.contentEditable = 'true';
      textarea.readOnly = false;
      const range = document.createRange();
      range.selectNodeContents(textarea);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      textarea.setSelectionRange(0, text.length);
    } else {
      textarea.focus();
      textarea.select();
    }

    document.body.appendChild(textarea);
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

type ToastState = { id: number; message: string } | null;

const ARABIC_INDIC = '٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹';

function normalizeAmount(raw: string): string {
  let out = '';
  for (const char of raw) {
    const index = ARABIC_INDIC.indexOf(char);
    out += index >= 0 ? String(index % 10) : char;
  }
  return out.replace(/[\s,٫]/g, (match) => (match === '٫' ? '.' : '')).trim();
}

function AmountRequest({ request, showToast }: { request: AmountRequest; showToast: (message: string) => void }) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const inputId = useId();

  const handleChange = (value: string) => {
    setError('');
    setAmount(value.replace(/[^\d.,٠-٩۰-۹٫]/g, '').slice(0, 14));
  };

  const requestAccount = () => {
    const value = normalizeAmount(amount);
    if (!value) {
      setError(request.emptyError);
      return;
    }
    if (!/^\d{1,9}(\.\d{1,2})?$/.test(value) || Number(value) <= 0) {
      setError(request.invalidError);
      return;
    }
    window.open(createWhatsappUrl(request.messageTemplate.replace('{amount}', value)), '_blank', 'noopener,noreferrer');
    showToast('تم فتح الواتساب مع طلبك جاهزاً');
  };

  return (
    <div className="amount-request">
      <label className="amount-label" htmlFor={inputId}>{request.inputLabel}</label>
      <div className="amount-field">
        <input
          id={inputId}
          className="amount-input"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder={request.placeholder}
          value={amount}
          onChange={(event) => handleChange(event.target.value)}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
        <span className="amount-currency">{request.currencyLabel}</span>
      </div>
      {error && <p className="amount-error" id={`${inputId}-error`} role="alert"><AlertCircle size={14} /> {error}</p>}
      <button className="primary-button amount-submit" type="button" onClick={requestAccount}><MessageCircle size={16} /> {request.buttonLabel}</button>
    </div>
  );
}

type CardEdit = { remove: () => Promise<void>; account: () => void; field: (index: number) => void; addField: () => void };
function AccountCard({ account, showToast, available = true, adminToggle, edit }: { account: Account; showToast: (message: string) => void; available?: boolean; adminToggle?: React.ReactNode; edit?: CardEdit | undefined }) {
  const [copied, setCopied] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyDetails = async () => {
    const ok = await copyToClipboard(account.fields.map((field) => `${field.label}: ${field.value}`).join('\n'));
    if (ok) {
      setCopied(true);
      showToast('تم نسخ جميع البيانات بنجاح');
      window.setTimeout(() => setCopied(false), 1800);
    } else {
      showToast('تعذّر النسخ، حاول مرة أخرى');
    }
  };

  const copyField = async (field: { label: string; value: string }) => {
    const ok = await copyToClipboard(field.value);
    if (ok) {
      setCopiedField(field.value);
      showToast(`تم نسخ ${field.label} بنجاح`);
      window.setTimeout(() => setCopiedField(null), 1800);
    } else {
      showToast('تعذّر النسخ، حاول مرة أخرى');
    }
  };

  return (
    <article className={`account-card ${available ? '' : 'is-unavailable'}`}>
      {adminToggle}
      {!available && <div className="unavailable-badge">غير متاح حالياً 🔴</div>}
      <header className="account-header">
        {account.showIcon !== false && <div className="account-icon">{account.icon === 'bank' ? <Landmark size={25} /> : <Wallet size={25} />}</div>}
        <div><h3>{account.title}{edit && <EditButton label={account.title} onClick={edit.account} />}</h3><p>{account.subtitle}</p></div>
      </header>
      {edit && <AdminActions name={account.title} onEdit={edit.account} onDelete={edit.remove} />}
      <div className="account-body">
        {account.fields.length > 0 && <div className="field-list">
          {account.fields.map((field, fieldIndex) => (
            <div className="field-row" key={`${field.label}-${field.value}`}>
              <div><span>{field.label}</span><strong>{field.value}</strong></div>
              {edit && <EditButton label={field.label} onClick={() => edit.field(fieldIndex)} />}
              <button className="copy-field" onClick={() => copyField(field)} aria-label={`نسخ ${field.label}`}>{copiedField === field.value ? <Check size={17} /> : <Copy size={17} />}</button>
            </div>
          ))}
        </div>}
        {edit && <button type="button" className="admin-add" onClick={edit.addField}><Plus size={14} /> إضافة خانة</button>}
        {account.description && <p className="account-description">{account.description}</p>}
        {account.amountRequest && <AmountRequest request={account.amountRequest} showToast={showToast} />}
        {account.warning && <div className="warning-box"><strong><AlertCircle size={17} /> {account.warningTitle ?? 'تنبيه هام'}</strong>{account.warning.map((warning) => <p key={warning}>{warning}</p>)}</div>}
        {account.note && <div className="note-box"><strong><ShieldCheck size={16} /> ملاحظات مهمة</strong>{account.note.map((note, index) => <p key={note}>{index + 1}. {note}</p>)}</div>}
        {!account.amountRequest && <div className="card-actions">
          {account.whatsappMessage ? <a className="primary-button" href={createWhatsappUrl(account.whatsappMessage)} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> طلب الحساب عبر الواتساب</a> : <>
            <button className="outline-button" onClick={() => window.open(whatsappUrl, '_blank', 'noopener,noreferrer')}><Send size={16} /> إرسال إشعار التحويل</button>
            {account.directLink && <a className="outline-button direct-link" href={account.directLink} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} /> فتح PayPal.me</a>}
            <button className="primary-button" onClick={copyDetails}>{copied ? <><Check size={16} /> تم النسخ</> : <><Copy size={16} /> نسخ البيانات</>}</button>
          </>}
        </div>}
        <div className="updated"><span>آخر تحديث:</span> {account.date}</div>
      </div>
    </article>
  );
}

function Toast({ toast }: { toast: ToastState }) {
  if (!toast) return null;
  return (
    <div className="toast" role="status" key={toast.id}>
      <Check size={16} /> {toast.message}
    </div>
  );
}

function App({ admin = false }: { admin?: boolean }) {
  const [selectedCountry, setSelectedCountry] = useState('الأردن');
  const [showMenu, setShowMenu] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const countryListRef = useRef<HTMLDivElement>(null);
  const { data: catalog } = useSuspenseQuery(catalogQuery);
  useLiveCatalog();
  const persist = useServerFn(saveCatalog);
  const currentCountry = catalog.find((c) => c.name === selectedCountry) ?? catalog.find((c) => c.name === 'الأردن') ?? catalog[0];
  const visibleAccounts = currentCountry?.accounts ?? [];
  type Editing = { kind: 'country'; index?: number } | { kind: 'account'; index?: number } | { kind: 'field'; account: number; index?: number };
  const [editing, setEditing] = useState<(Editing & { key: number }) | null>(null);
  const openEditor = (e: Editing) => setEditing({ ...e, key: Date.now() });
  const update = async (next: Catalog) => {
    await persist({ data: next });
    queryClient.setQueryData(catalogQuery.queryKey, next);
    showToast('تم الحفظ وظهر التعديل للزوار');
  };
  const countryIndex = currentCountry ? catalog.indexOf(currentCountry) : 0;
  const updateAccounts = (fn: (accounts: Account[]) => Account[]) => update(catalog.map((c, i) => (i === countryIndex ? { ...c, accounts: fn(c.accounts) } : c)));
  const { data: availability = {} } = useQuery(accountAvailabilityQuery);

  useLiveAccountAvailability();
  const queryClient = useQueryClient();
  const saveAvailability = useServerFn(setAccountAvailability);
  const accountKey = (account: Account) => `${currentCountry?.name ?? selectedCountry}::${account.title}`;

  const showToast = (message: string) => {
    const id = Date.now();
    setToast({ id, message });
    window.setTimeout(() => {
      setToast((current) => (current && current.id === id ? null : current));
    }, 2000);
  };

  const scrollCountries = (direction: 'left' | 'right') => {
    const list = countryListRef.current;
    if (!list) return;
    // The pill row is RTL: scrolling toward later countries means a negative scrollLeft.
    const step = direction === 'right' ? 260 : -260;
    try {
      list.scrollBy({ left: step, behavior: 'smooth' });
    } catch {
      list.scrollLeft += step;
    }
  };

  // Keep the selected country pill visible when the choice or the catalog changes.
  useEffect(() => {
    const pill = countryListRef.current?.querySelector<HTMLElement>('.country-pill.selected');
    if (!pill) return;
    try {
      pill.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    } catch {
      pill.scrollIntoView();
    }
  }, [currentCountry?.name, catalog.length]);

  return (
    <div className="app-shell" dir="rtl">
      <div className="top-strip"><div className="container strip-inner"><span><Check size={14} /> حسابات محدثة يومياً</span><span>خدمة آمنة وموثوقة للتحويلات</span><span className="strip-lock"><LockKeyhole size={14} /> بياناتك محمية</span></div></div>
      <header className="site-header">
        <div className="container nav-bar">
          <a className="brand" href="#home"><div><strong>MAHDI KHDAMATI</strong><small>مهدي خدماتي</small></div><img className="brand-logo" src="/image.png" alt="شعار مهدي خدمات" /></a>
          <nav><a href="#about">عن المنصة</a><a href="#countries">الدول والمسارات</a><a href="#accounts">الحسابات</a></nav>
          <a className="whatsapp-button" href={whatsappUrl} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} /> تواصل واتساب</a>
          <button className="mobile-menu-button" onClick={() => setShowMenu(!showMenu)} aria-label="فتح القائمة"><ChevronDown size={20} /></button>
        </div>
        {showMenu && <nav className="mobile-nav"><a href="#about" onClick={() => setShowMenu(false)}>عن المنصة</a><a href="#countries" onClick={() => setShowMenu(false)}>الدول والمسارات</a><a href="#accounts" onClick={() => setShowMenu(false)}>الحسابات</a></nav>}
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-glow" />
          <div className="container hero-content">
            <div className="hero-copy" id="about">
              <div className="eyebrow"><span /> للخدمات المالية الإلكترونية</div>
              <h1>منصة <em>مهدي خدماتي</em><br />تقرّب لك الحسابات</h1>
              <p>تسهيل الوصول لحسابات التحويل والمحافظ الإلكترونية من مكان واحد</p>
              <div className="hero-actions"><a className="primary-button large" href="#accounts"><Building2 size={18} /> تصفح الحسابات</a><a className="outline-button large" href={whatsappUrl} target="_blank" rel="noopener noreferrer"><Send size={17} /> إرسال إشعار التحويل</a></div>
            </div>
            <div className="hero-card-wrap">
              <div className="hero-card">
                <div className="hero-logo"><img src="/image.png" alt="شعار مهدي خدماتي للخدمات المالية الإلكترونية" /></div>
              </div>
              <div className="floating-badge"><Check size={15} /> منصة موثوقة وآمنة</div>
            </div>
          </div>
        </section>

        <section className="coverage-section" id="countries">
          <div className="container coverage-card"><div className="currency-row"><span>$</span><span>€</span><span>د.إ</span><span>ريال</span></div><div><p className="section-kicker">تغطية واسعة</p><h2>خطوط تحويل في الدول الأساسية</h2><p>تجد الحسابات النشطة باستمرار وتظهر لك فقط البيانات الجاهزة للاستلام.</p><div className="mini-pills"><span>موثق</span><span>متاح يومياً</span><span>سريع ومرن</span></div></div></div>
        </section>

        <ServicesList admin={admin} />
        <section className="accounts-section" id="accounts">
          <div className="container">
            <div className="section-heading"><div><p className="section-kicker">حسابات المكاتب</p><h2>اختر بلد التحويل</h2><p>انسخ بيانات الحساب الظاهرة فقط لضمان أن تكون صالحة ومحدثة.</p></div><div className="live-status"><i /> تحديث مباشر</div></div>
            <div className="country-navigation"><button className="round-button" type="button" onClick={() => scrollCountries('right')} aria-label="الدول السابقة"><ArrowRight size={18} /></button><div className="country-list" ref={countryListRef}>{catalog.map((country, ci) => <div className="country-pill-wrap" key={country.name}><button className={`country-pill ${currentCountry?.name === country.name ? 'selected' : ''}`} onClick={() => setSelectedCountry(country.name)}><span>{country.flag}</span>{country.name}</button>{admin && <EditButton label={country.name} onClick={() => openEditor({ kind: 'country', index: ci })} />}</div>)}{admin && <button type="button" className="admin-add" onClick={() => openEditor({ kind: 'country' })}><Plus size={14} /> دولة</button>}</div><button className="round-button" type="button" onClick={() => scrollCountries('left')} aria-label="الدول التالية"><ArrowLeft size={18} /></button></div>
            <div className="selected-country-label"><span>اسحب للتصفح</span><strong>{currentCountry?.name}</strong></div>
            <div className="accounts-grid">{visibleAccounts.map((account, index) => { const key = accountKey(account); const isAvailable = availability[key] ?? true; return <AccountCard key={`${account.title}-${index}`} account={account} showToast={showToast} available={isAvailable} edit={admin ? { remove: () => updateAccounts((list) => list.filter((_, j) => j !== index)), account: () => openEditor({ kind: 'account', index }), field: (fi) => openEditor({ kind: 'field', account: index, index: fi }), addField: () => openEditor({ kind: 'field', account: index }) } : undefined} adminToggle={admin ? <AvailabilityToggle label={account.title} available={isAvailable} onChange={async (next) => { await saveAvailability({ data: { key, available: next } }); queryClient.setQueryData(accountAvailabilityQuery.queryKey, (old: Record<string, boolean> | undefined) => ({ ...(old ?? {}), [key]: next })); showToast(next ? 'أصبحت متاحة للزوار' : 'أصبحت غير متاحة للزوار'); }} /> : undefined} />; })}</div>
            {admin && <button type="button" className="admin-add admin-add-account" onClick={() => openEditor({ kind: 'account' })}><Plus size={15} /> إضافة حساب لـ {currentCountry?.name}</button>}
          </div>
        </section>
      </main>

      <footer className="site-footer"><div className="container"><BrandMark /><p>منصة مهدي خدماتي — حسابات تحويل موثوقة ومحدثة للمكاتب.</p><span className="office-address">عنوان المكتب: غزة، مخيم الشاطئ، قهوه غبن</span><span>© 2026 جميع الحقوق محفوظة</span></div></footer>
      <div className="floating-tools"><button aria-label="نسخ"><Clipboard size={15} /></button><button aria-label="قفل"><LockKeyhole size={14} /></button><button aria-label="إغلاق"><X size={15} /></button></div>
      <Toast toast={toast} />
      {admin && editing?.kind === 'country' && <CountryDialog key={editing.key} open onClose={() => setEditing(null)} country={editing.index !== undefined ? catalog[editing.index] : undefined}
        onSave={async (c) => { const i = editing.index; if (catalog.some((x, j) => x.name === c.name && j !== i)) throw new Error('هذه الدولة موجودة بالفعل'); await update(i === undefined ? [...catalog, { ...c, accounts: [] }] : catalog.map((x, j) => (j === i ? { ...x, ...c } : x))); setSelectedCountry(c.name); }}
        onDelete={editing.index !== undefined ? async () => { if (catalog.length <= 1) throw new Error('يجب أن تبقى دولة واحدة على الأقل'); await update(catalog.filter((_, j) => j !== editing.index)); } : undefined} />}
      {admin && editing?.kind === 'account' && <AccountDialog key={editing.key} open onClose={() => setEditing(null)} account={editing.index !== undefined ? visibleAccounts[editing.index] : undefined}
        onSave={(a) => updateAccounts((list) => (editing.index === undefined ? [...list, a] : list.map((x, j) => (j === editing.index ? a : x))))}
        onDelete={editing.index !== undefined ? () => updateAccounts((list) => list.filter((_, j) => j !== editing.index)) : undefined} />}
      {admin && editing?.kind === 'field' && <FieldDialog key={editing.key} open onClose={() => setEditing(null)} field={editing.index !== undefined ? visibleAccounts[editing.account]?.fields[editing.index] : undefined}
        onSave={(f) => updateAccounts((list) => list.map((a, j) => (j !== editing.account ? a : { ...a, fields: editing.index === undefined ? [...a.fields, f] : a.fields.map((x, k) => (k === editing.index ? f : x)) })))}
        onDelete={editing.index !== undefined ? () => updateAccounts((list) => list.map((a, j) => (j !== editing.account ? a : { ...a, fields: a.fields.filter((_, k) => k !== editing.index) }))) : undefined} />}
    </div>
  );
}

export default App;

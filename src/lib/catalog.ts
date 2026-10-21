import { z } from 'zod';
const amountRequestSchema = z.object({ inputLabel: z.string().max(200), placeholder: z.string().max(200), currencyLabel: z.string().max(100), buttonLabel: z.string().max(200), emptyError: z.string().max(300), invalidError: z.string().max(300), messageTemplate: z.string().max(500) });
export const accountSchema = z.object({
  title: z.string().trim().min(1).max(200),
  subtitle: z.string().max(200),
  icon: z.enum(['bank', 'wallet']),
  showIcon: z.boolean().optional(),
  fields: z.array(z.object({ label: z.string().max(200), value: z.string().max(500) })).max(30),
  note: z.array(z.string().max(1000)).max(30).optional(),
  warning: z.array(z.string().max(1000)).max(30).optional(),
  warningTitle: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  whatsappMessage: z.string().max(500).optional(),
  amountRequest: amountRequestSchema.optional(),
  date: z.string().max(100),
  directLink: z.string().url().max(500).optional(),
});
export const countrySchema = z.object({ name: z.string().trim().min(1).max(100), flag: z.string().max(20), accounts: z.array(accountSchema).max(30) });
export const catalogSchema = z.array(countrySchema).min(1).max(60);
export type Account = z.infer<typeof accountSchema>;
export type AmountRequest = z.infer<typeof amountRequestSchema>;
export type Country = z.infer<typeof countrySchema>;
export type Catalog = z.infer<typeof catalogSchema>;
const countries: { name: string; flag: string }[] = [
  { name: 'المغرب', flag: '🇲🇦' },
  { name: 'باي بال', flag: '▣' },
  { name: 'العراق', flag: '🇮🇶' },
  { name: 'الجزائر', flag: '🇩🇿' },
  { name: 'الأردن', flag: '🇯🇴' },
  { name: 'السعودية', flag: '🇸🇦' },
  { name: 'أمريكا', flag: '🇺🇸' },
  { name: 'سلطنة عمان', flag: '🇴🇲' },
  { name: 'قطر', flag: '🇶🇦' },
  { name: 'أوروبا', flag: '🇪🇺' },
  { name: 'الإمارات', flag: '🇦🇪' },
  { name: 'مصر', flag: '🇪🇬' },
  { name: 'تونس', flag: '🇹🇳' },
];

const accounts: Record<string, Account[]> = {
  المغرب: [
    {
      title: 'البنك الشعبي (Banque Populaire)',
      subtitle: 'حساب بنكي مباشر · محدث',
      icon: 'bank',
      fields: [
        { label: 'اسم صاحب الحساب', value: 'Mr AAhmed' },
        { label: 'رقم الحساب', value: '2114068457450001' },
        { label: 'رقم RIB', value: '181 810 2114068457450001 86' },
      ],
      date: '16 Oct, 2026',
    },
    {
      title: 'بنك سياش',
      subtitle: 'حساب بنكي مباشر · محدث',
      icon: 'bank',
      fields: [
        { label: 'اسم صاحب الحساب', value: 'Mr AAhmed' },
        { label: 'رقم الحساب', value: '6615203214034800' },
        { label: 'رقم RIB', value: '230 810 6615203214034800 04' },
      ],
      date: '16 Oct, 2026',
    },
  ],
  'باي بال': [
    {
      title: 'بايبال (PayPal)',
      subtitle: 'محفظة إلكترونية · محدث',
      icon: 'wallet',
      fields: [
        { label: 'البريد الإلكتروني', value: 'majdi25bel@gmail.com' },
      ],
      directLink: 'https://www.paypal.me/MajdiAlnajjar226',
      note: [
        '⚠️ طريقة الإرسال: يجب اختيار Friends and Family عند الإرسال (Send the payment as Friends and Family).',
        '🚨 تنبيه حاسم: ممنوع منعاً باتّاً كتابة أي ملاحظات (مثل: غزة، تبرعات، أو ما شابه)، وإلا لن يتم اعتماد الحوالة أو ستفرض غرامة 5% من قيمتها.',
      ],
      date: '16 Oct, 2026',
    },
  ],
  العراق: [
    {
      title: 'ماستر كارد (ماستر استقبال)',
      subtitle: 'حساب بنكي مباشر · محدث',
      icon: 'bank',
      fields: [
        { label: 'اسم البنك', value: 'ماستر كارد (ماستر استقبال)' },
        { label: 'رقم الحساب / البطاقة', value: '7136527939' },
        { label: 'اسم المستفيد', value: 'Sajad' },
      ],
      note: ['أقل مبلغ للتحويل 100 ألف دينار عراقي'],
      date: '17 Oct, 2026',
    },
  ],
  الجزائر: [
    {
      title: 'حساب استقبال',
      subtitle: 'حساب بنكي مباشر · محدث',
      icon: 'bank',
      fields: [
        { label: 'نوع الحساب', value: 'حساب استقبال' },
        { label: 'اسم المستفيد', value: 'جوادة السعيد' },
        { label: 'رقم الحساب (RIB)', value: '00799999000636464348' },
        { label: 'المفتاح (CLE)', value: '6364643cle 48' },
      ],
      note: [
        '🚫 عدم نشر الحساب للعامة',
        '🚫 عدم نشر الحساب على وسائل التواصل الاجتماعي 📱',
        '🚫 يتم تحديث الحساب بشكل يومي',
        '🚫 الحساب لمرة واحدة فقط',
      ],
      date: '17 Oct, 2026',
    },
  ],
  الأردن: [
    {
      title: 'البنك الإسلامي الأردني',
      subtitle: 'حساب بنكي مباشر · محدث',
      icon: 'bank',
      fields: [
        { label: 'اسم البنك', value: 'البنك الإسلامي الأردني' },
        { label: 'رقم الحساب / الآيبان', value: 'SRMBL' },
        { label: 'اسم المستفيد', value: 'هيفاء أحمد محمود' },
      ],
      note: [
        '📌 يجب إرسال سكرين شوت لوصل الإرسال واسم المرسل للتشييك.',
        '⚠️ الحساب فعال، ولكن تجنباً لأي خلل يرجى مراجعتنا قبل التحويل وإلا لن يكون المكتب مسؤولاً عن أي خلل.',
      ],
      date: '17 Oct, 2026',
    },
  ],
  السعودية: [
    {
      title: 'التحويل إلى السعودية (SAR)',
      subtitle: 'حساب حسب الطلب · تحويل بنكي أو سريع',
      icon: 'bank',
      fields: [],
      description:
        'خدمة التحويل للسعودية متوفرة حسب الطلب. يرجى تحديد المبلغ المطلوب تحويله، وسنقوم بتزويدك بالحساب البنكي المناسب فوراً.',
      amountRequest: {
        inputLabel: 'المبلغ المطلوب بالريال السعودي',
        placeholder: 'مثال: 1500',
        currencyLabel: 'ريال سعودي (SAR)',
        buttonLabel: 'أريد حساب سعودي / اطلب الحساب',
        emptyError: 'يرجى كتابة المبلغ المطلوب تحويله أولاً.',
        invalidError: 'يرجى إدخال مبلغ صحيح (أرقام فقط، أكبر من صفر).',
        messageTemplate: 'مرحباً، أريد حساب بنكي سعودي لتحويل مبلغ {amount} ريال سعودي',
      },
      date: 'حسب الطلب',
    },
  ],
  أمريكا: [
    {
      title: 'التحويل إلى أمريكا (USD)',
      subtitle: 'حساب حسب الطلب · تحويل بنكي أو سريع',
      icon: 'bank',
      fields: [],
      description:
        'خدمة التحويل لأمريكا متوفرة حسب الطلب. يرجى تحديد المبلغ المطلوب تحويله، وسنقوم بتزويدك بالحساب المناسب فوراً.',
      amountRequest: {
        inputLabel: 'المبلغ المطلوب بالدولار الأمريكي',
        placeholder: 'مثال: 500',
        currencyLabel: 'دولار أمريكي (USD)',
        buttonLabel: 'أريد حساب أمريكي / اطلب الحساب',
        emptyError: 'يرجى كتابة المبلغ المطلوب تحويله أولاً.',
        invalidError: 'يرجى إدخال مبلغ صحيح (أرقام فقط، أكبر من صفر).',
        messageTemplate: 'مرحباً، أريد حساب بنكي أمريكي لتحويل مبلغ {amount} دولار أمريكي',
      },
      date: 'حسب الطلب',
    },
  ],
  'سلطنة عمان': [
    {
      title: 'سلطنة عُمان (Oman · OMR)',
      subtitle: 'تحويل بنكي دولي · حساب محدث',
      icon: 'bank',
      fields: [
        { label: 'اسم البنك', value: 'Sohar International' },
        { label: 'اسم الحساب (Account Holder)', value: 'Al Najar For Comprehensive Trading And Services Spc' },
        { label: 'رقم الحساب (Account Number)', value: '043020066699' },
        { label: 'الـ IBAN', value: 'OM40030000043020066699' },
        { label: 'رمز SWIFT Code', value: 'BSHROMRUXXX' },
      ],
      warning: ['⛔ ممنوع كتابة أي ملاحظات نهائياً عند التحويل.'],
      note: ['🚫 تم إلغاء أي حساب عماني قديم، ويُعتمد هذا الحساب المحدث فقط.'],
      date: '18 Oct, 2026',
    },
  ],
  قطر: [
    {
      title: 'قطر (Qatar · QAR)',
      subtitle: 'تحويل بنكي دولي · حساب محدث',
      icon: 'bank',
      fields: [
        { label: 'اسم البنك', value: 'بنك الدوحة' },
        { label: 'اسم الحساب', value: 'موسى الحسن' },
        { label: 'الـ IBAN', value: 'QA18DOHB022811912470010010000' },
        { label: 'سبب التحويل', value: 'شراء كبينة' },
      ],
      warningTitle: 'شروط التحويل',
      warning: [
        '🔒 للزبائن المكفولين المكررين حصراً.',
        '📌 الرجاء الالتزام بسبب التحويل (شراء كبينة).',
        '⛔ ممنوع كتابة أي ملاحظات أخرى عند التحويل.',
        '⚡ متاح رقم تحويل فوري على الطلب.',
      ],
      note: ['🚫 تم إلغاء أي حساب قطري قديم، ويُعتمد هذا الحساب المحدث فقط.'],
      date: '18 Oct, 2026',
    },
  ],
  أوروبا: [
    {
      title: 'التحويل إلى أوروبا (EUR)',
      subtitle: 'حساب حسب الطلب · تحويل بنكي أو سريع',
      icon: 'bank',
      fields: [],
      description:
        'خدمة التحويل لأوروبا متوفرة حسب الطلب. يرجى تحديد المبلغ المطلوب تحويله، وسنقوم بتزويدك بالحساب المناسب فوراً.',
      amountRequest: {
        inputLabel: 'المبلغ المطلوب باليورو',
        placeholder: 'مثال: 300',
        currencyLabel: 'يورو (EUR)',
        buttonLabel: 'أريد حساب أوروبي / اطلب الحساب',
        emptyError: 'يرجى كتابة المبلغ المطلوب تحويله أولاً.',
        invalidError: 'يرجى إدخال مبلغ صحيح (أرقام فقط، أكبر من صفر).',
        messageTemplate: 'مرحباً، أريد حساب بنكي أوروبي لتحويل مبلغ {amount} يورو',
      },
      date: 'حسب الطلب',
    },
  ],
  الإمارات: [
    {
      title: 'الإمارات (UAE · AED)',
      subtitle: 'تحويل بنكي دولي · حساب محدث',
      icon: 'bank',
      fields: [
        { label: 'اسم الحساب (Account Holder)', value: 'alrkn aldhhby For Fashion Designing' },
        { label: 'الـ IBAN', value: 'AE450860000009244027480' },
        { label: 'رمز BIC / SWIFT', value: 'WIOBAEADXXX' },
        { label: 'عنوان البنك', value: 'Etihad Airways Centre 5th Floor, Abu Dhabi, UAE' },
      ],
      warning: ['🚫 ⛔ ممنوع كتابة أي ملاحظات أو كتابة تبرعات عند التحويل.'],
      note: ['🚫 تم إلغاء أي حساب إماراتي قديم، ويُعتمد هذا الحساب المحدث فقط.'],
      date: '18 Oct, 2026',
    },
  ],
  مصر: [
    {
      title: 'حساب مصر',
      subtitle: 'حساب متاح عبر الواتساب',
      icon: 'bank',
      fields: [],
      description: 'يتم تزويدك بالحساب من خلال الواتساب',
      whatsappMessage: 'مرحباً، أريد حساب مصر',
      date: 'قريباً',
    },
  ],
  تونس: [
    {
      title: 'التحويل إلى تونس (TND)',
      subtitle: 'حساب حسب الطلب · تحويل بنكي أو سريع',
      icon: 'bank',
      fields: [],
      description:
        'خدمة التحويل لتونس متوفرة حسب الطلب. يرجى تحديد المبلغ المطلوب تحويله، وسنقوم بتزويدك بالحساب البنكي المناسب فوراً.',
      amountRequest: {
        inputLabel: 'المبلغ المطلوب بالدينار التونسي',
        placeholder: 'مثال: 200',
        currencyLabel: 'دينار تونسي (TND)',
        buttonLabel: 'أريد حساب تونسي / اطلب الحساب',
        emptyError: 'يرجى كتابة المبلغ المطلوب تحويله أولاً.',
        invalidError: 'يرجى إدخال مبلغ صحيح (أرقام فقط، أكبر من صفر).',
        messageTemplate: 'مرحباً، أريد حساب بنكي تونسي لتحويل مبلغ {amount} دينار تونسي',
      },
      date: 'حسب الطلب',
    },
  ],
};
export const defaultCatalog: Catalog = countries.map((c) => ({ ...c, accounts: accounts[c.name] ?? [] }));

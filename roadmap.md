# Roadmap

## In progress
- (none)

## Done
- Password-protected /admin service add/edit/delete, prices and availability, Cloud persistence and live homepage updates; login, incorrect password, refresh, logout, and independent visitor live updates verified; temporary test service removed.
- Qatar 🇶🇦 card replaced with بنك الدوحة / موسى الحسن / IBAN QA18DOHB022811912470010010000 / سبب التحويل شراء كبينة, a red bold "شروط التحويل" box with the four transfer conditions, per-row copy buttons, and the existing "نسخ البيانات" and "إرسال إشعار التحويل" actions kept working.
- UAE 🇦🇪 and Oman 🇴🇲 cards replaced with the real account details (account holder, IBAN, BIC/SWIFT, bank address for UAE; bank name, account holder, account number, IBAN, SWIFT for Oman), each row with its own copy button, plus a red "تنبيه هام" warning banning transfer notes and a note that any old account is cancelled.
- Saudi Arabia (KSA 🇸🇦) on-demand card: SAR amount input + "أريد حساب سعودي / اطلب الحساب" WhatsApp button with the amount in the message.
- Europe 🇪🇺 and America 🇺🇸 cards converted to the Saudi on-demand style: EUR/USD amount input + WhatsApp "اطلب الحساب" button with the amount in the message; verified in preview.
- Country tabs kept as one horizontal scroll row on all screens; fixed RTL arrow directions (the "next countries" arrow previously did nothing) with scrollBy fallback, plus auto-centering of the selected country pill; arrows verified scrolling in preview.
- WhatsApp link fix: all links use `https://wa.me/972566125588?text=...` (URL-encoded), open in a new tab with `target="_blank"` + `rel="noopener noreferrer"` or `window.open(url, '_blank', 'noopener,noreferrer')`.

## Open
- (none)

import { useState } from 'react';
type Props = { available: boolean; label: string; onChange: (available: boolean) => Promise<void> };
export default function AvailabilityToggle({ available, label, onChange }: Props) {
  const [busy, setBusy] = useState(false);
  const [optimistic, setOptimistic] = useState<boolean | null>(null);
  const shown = optimistic ?? available;
  return <button type="button" role="switch" aria-checked={shown} aria-label={`حالة ${label}`} disabled={busy} className={`availability-toggle ${shown ? 'is-on' : 'is-off'}`} onClick={async () => {
    const next = !shown; setOptimistic(next); setBusy(true);
    try { await onChange(next); } catch { setOptimistic(null); window.alert('تعذر حفظ الحالة، حاول مرة أخرى'); }
    finally { setBusy(false); setOptimistic(null); }
  }}><span className="availability-dot" />{shown ? 'متاحة 🟢' : 'غير متاحة 🔴'}</button>;
}

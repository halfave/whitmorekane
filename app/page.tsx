'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FIRM } from '@/lib/agreement';

const STEPS = [
  { t: 'We find the money', d: 'We review public agency records for overpaid fines and penalties that were never refunded to property owners.' },
  { t: 'You authorize us', d: 'Enter the code from your letter, review the amount and sign a short authorization online.' },
  { t: 'We file the paperwork', d: 'We prepare the refund request, gather the supporting documents and follow up with the agency.' },
  { t: 'The agency pays you', d: 'The refund check goes directly to you. We invoice our fee only after you are paid.' },
];

const FAQ = [
  { q: 'Is this legitimate?', a: 'Yes. These are real credits on public records, usually from a fine that was paid twice or reduced after payment. Agencies refund them on request, but rarely contact owners.' },
  { q: 'Can I claim it myself?', a: 'Yes. You can request the refund directly from the holding agency at no cost. We handle the research, documents and follow-up for owners who prefer not to.' },
  { q: 'What does it cost?', a: 'A percentage of the amount actually refunded, stated in the authorization before you sign. No upfront fees. If nothing is refunded, you owe nothing.' },
  { q: 'Why not tell me the agency upfront?', a: 'Identifying the record is the work we do. Once you sign, the agency, record numbers and property are shown in your portal right away.' },
  { q: 'Do you hold my money?', a: 'Never. The agency pays the original payer directly.' },
  { q: 'What information do you need?', a: 'A signed authorization, a photo ID for the signer and proof of the original payment, such as a receipt or bank statement. We do not ask for your Social Security number.' },
  { q: 'Can I cancel?', a: 'Yes, at no cost, any time before we file the request.' },
];

// Real client quotes only, with their permission. The section stays hidden while empty.
const TESTIMONIALS: { quote: string; name: string; detail: string }[] = [];

export default function WkHome() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [zip, setZip] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function go(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr('');
    const c = code.trim().toUpperCase();
    const r = await fetch(`/api/claim/${encodeURIComponent(c)}?zip=${encodeURIComponent(zip.trim())}`);
    setBusy(false);
    if (!r.ok) return setErr((await r.json()).error || 'Claim not found.');
    try { sessionStorage.setItem(`claim_zip_${c}`, zip.trim()); } catch {}
    router.push(`/claim/${c}`);
  }

  return (
    <div className="grid gap-10">
      <section className="pt-2">
        <h1 className="font-serif text-3xl leading-tight sm:text-4xl">Recovering money owed to New York property owners.</h1>
        <p className="mt-3 max-w-xl text-[#4a5561]">
          {FIRM} locates overpaid fines and penalties held by public agencies and helps owners get them refunded.
        </p>
      </section>

      <section id="claim" className="rounded-lg border border-[#e3e0d8] bg-white p-6 sm:p-8">
        <h2 className="font-serif text-2xl">Received a letter?</h2>
        <p className="mt-2 text-sm text-[#4a5561]">Enter the claim code and ZIP code printed on it.</p>
        <form onSubmit={go} className="mt-6 grid gap-4 sm:grid-cols-[1fr_160px_auto] sm:items-end">
          <label className="text-sm">Claim code
            <input value={code} onChange={(e) => setCode(e.target.value)} required
              className="mt-1 w-full rounded border border-[#cfcac0] px-3 py-2 uppercase tracking-widest" />
          </label>
          <label className="text-sm">ZIP code
            <input value={zip} onChange={(e) => setZip(e.target.value)} inputMode="numeric"
              className="mt-1 w-full rounded border border-[#cfcac0] px-3 py-2" />
          </label>
          <button disabled={busy} className="rounded bg-[#1f3a4d] px-5 py-2 text-white disabled:opacity-50">
            {busy ? 'Checking…' : 'View my claim'}
          </button>
        </form>
        {err && <p className="mt-3 text-sm text-red-700">{err}</p>}
      </section>

      <section>
        <h2 className="font-serif text-2xl">How it works</h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2">
          {STEPS.map((s, i) => (
            <li key={s.t} className="rounded-lg border border-[#e3e0d8] bg-white p-5">
              <div className="text-xs text-[#6b7480]">Step {i + 1}</div>
              <div className="mt-1 font-medium">{s.t}</div>
              <p className="mt-1 text-sm text-[#4a5561]">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="font-serif text-2xl">Questions</h2>
        <div className="mt-4 divide-y divide-[#e3e0d8] rounded-lg border border-[#e3e0d8] bg-white">
          {FAQ.map((f) => (
            <details key={f.q} className="group p-5">
              <summary className="cursor-pointer list-none font-medium">{f.q}</summary>
              <p className="mt-2 text-sm text-[#4a5561]">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {TESTIMONIALS.length > 0 && (
        <section>
          <h2 className="font-serif text-2xl">What owners say</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="rounded-lg border border-[#e3e0d8] bg-white p-5">
                <blockquote className="text-sm text-[#1d2630]">"{t.quote}"</blockquote>
                <figcaption className="mt-2 text-xs text-[#6b7480]">{t.name} · {t.detail}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-lg border border-[#e3e0d8] bg-white p-6">
        <h2 className="font-serif text-xl">Contact</h2>
        <p className="mt-2 text-sm text-[#4a5561]">
          Questions about a letter you received? Email <a className="underline" href="mailto:claims@whitmorekane.com">claims@whitmorekane.com</a> with your claim code.
        </p>
      </section>
    </div>
  );
}

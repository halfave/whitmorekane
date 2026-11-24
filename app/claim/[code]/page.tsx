'use client';
import { use, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { agreementText, FIRM } from '@/lib/agreement';

type View = {
  code: string; respondent: string; amount: number; agency: string; feePct: number;
  status: string; signed: boolean; details: { summons: string[]; property: string | null } | null;
};
const usd = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const input = 'mt-1 w-full rounded border border-[#cfcac0] px-3 py-2';
const card = 'rounded-lg border border-[#e3e0d8] bg-white p-6 sm:p-8';

export default function ClaimPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [zip, setZip] = useState('');
  const [view, setView] = useState<View | null>(null);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let z = '';
    try { z = sessionStorage.getItem(`claim_zip_${code}`) || ''; } catch {}
    setZip(z);
    fetch(`/api/claim/${code}?zip=${encodeURIComponent(z)}`).then(async (r) => {
      const j = await r.json();
      r.ok ? setView(j) : setErr(j.error);
    });
  }, [code]);

  if (err) return <div className={card}><p className="text-sm text-red-700">{err}</p><a href="/" className="mt-4 inline-block text-sm underline">Back</a></div>;
  if (!view) return <div className={card}>Loading…</div>;

  const step = done || view.status === 'info_submitted' || ['filed', 'paid', 'closed'].includes(view.status) ? 3 : view.signed ? 2 : 1;

  return (
    <div className="grid gap-6">
      <Steps step={step} />
      <div className={card}>
        <div className="text-xs uppercase tracking-wider text-[#6b7480]">Claim {view.code}</div>
        <h1 className="mt-1 font-[family-name:var(--font-serif)] text-2xl">{view.respondent}</h1>
        <div className="mt-4 text-4xl font-semibold">{usd(view.amount)}</div>
        <p className="mt-1 text-sm text-[#4a5561]">Held by {view.agency}{view.signed ? '' : ' on your behalf'}.</p>
        {view.details && (
          <dl className="mt-4 grid gap-1 text-sm">
            <div><dt className="inline text-[#6b7480]">Record numbers: </dt><dd className="inline">{view.details.summons.join(', ')}</dd></div>
            {view.details.property && <div><dt className="inline text-[#6b7480]">Property: </dt><dd className="inline">{view.details.property}</dd></div>}
          </dl>
        )}
        <p className="mt-5 rounded bg-[#f1efe9] p-3 text-xs leading-relaxed text-[#4a5561]">
          You can recover these funds yourself from the holding agency at no cost. {FIRM} handles the paperwork and
          follow-up for a {view.feePct}% fee, charged only if the agency pays you.
        </p>
      </div>
      {step === 1 && <SignStep view={view} code={code} zip={zip} onSigned={setView} />}
      {step === 2 && <InfoStep code={code} zip={zip} respondent={view.respondent} onDone={() => setDone(true)} />}
      {step === 3 && (
        <div className={card}>
          <h2 className="font-[family-name:var(--font-serif)] text-xl">Thank you. Your claim is submitted.</h2>
          <p className="mt-2 text-sm text-[#4a5561]">
            We'll file the refund request and email you as it moves forward. The agency mails the check directly to the original payer.
          </p>
        </div>
      )}
    </div>
  );
}

function Steps({ step }: { step: number }) {
  const s = ['Authorize', 'Your information', 'Submitted'];
  return (
    <ol className="flex gap-2 text-xs">
      {s.map((l, i) => (
        <li key={l} className={`flex-1 rounded border px-3 py-2 ${i + 1 <= step ? 'border-[#13302a] bg-[#13302a] text-white' : 'border-[#e3e0d8] bg-white text-[#6b7480]'}`}>
          {i + 1}. {l}
        </li>
      ))}
    </ol>
  );
}

function SignStep({ view, code, zip, onSigned }: { view: View; code: string; zip: string; onSigned: (v: View) => void }) {
  const [f, setF] = useState({ signerName: '', signerTitle: '', signerEmail: '', typedSignature: '', accept: false });
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const text = agreementText({ respondent: view.respondent, amount: view.amount, feePct: view.feePct });

  async function sign(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    const r = await fetch(`/api/claim/${code}/sign`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...f, zip }) });
    const j = await r.json(); setBusy(false);
    r.ok ? onSigned(j) : setErr(j.error);
  }

  return (
    <form onSubmit={sign} className={card}>
      <h2 className="font-[family-name:var(--font-serif)] text-xl">Step 1: Sign the authorization</h2>
      <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap rounded border border-[#e3e0d8] bg-[#fbfaf7] p-4 font-sans text-xs leading-relaxed">{text}</pre>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm">Full name<input required className={input} value={f.signerName} onChange={(e) => setF({ ...f, signerName: e.target.value })} /></label>
        <label className="text-sm">Title (e.g. Member, Manager)<input className={input} value={f.signerTitle} onChange={(e) => setF({ ...f, signerTitle: e.target.value })} /></label>
        <label className="text-sm sm:col-span-2">Email<input required type="email" className={input} value={f.signerEmail} onChange={(e) => setF({ ...f, signerEmail: e.target.value })} /></label>
        <label className="text-sm sm:col-span-2">Type your full name to sign
          <input required className={`${input} font-[family-name:var(--font-serif)] text-lg italic`} value={f.typedSignature} onChange={(e) => setF({ ...f, typedSignature: e.target.value })} />
        </label>
      </div>
      <label className="mt-4 flex items-start gap-2 text-sm">
        <input type="checkbox" checked={f.accept} onChange={(e) => setF({ ...f, accept: e.target.checked })} className="mt-1" />
        I am authorized to act for {view.respondent}, and I agree to the terms above.
      </label>
      {err && <p className="mt-3 text-sm text-red-700">{err}</p>}
      <button disabled={busy || !f.accept} className="mt-5 rounded bg-[#13302a] px-5 py-2 text-white disabled:opacity-50">{busy ? 'Signing…' : 'Sign and continue'}</button>
    </form>
  );
}

function InfoStep({ code, zip, respondent, onDone }: { code: string; zip: string; respondent: string; onDone: () => void }) {
  const [f, setF] = useState({ entityName: respondent, contactName: '', contactTitle: '', phone: '', email: '', mailingAddress: '', paidByRespondent: 'yes', payerName: '', notes: '' });
  const [files, setFiles] = useState<Record<string, string>>({});
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  async function upload(kind: string, file?: File) {
    if (!file) return;
    setErr(''); setFiles((s) => ({ ...s, [kind]: 'Uploading…' }));
    const post = (url: string, body: object) => fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...body, zip }) });
    const r = await post(`/api/claim/${code}/upload-url`, { kind, fileName: file.name });
    const j = await r.json();
    if (!r.ok) { setFiles((s) => ({ ...s, [kind]: '' })); return setErr(j.error); }
    const { error } = await supabase.storage.from('claim-docs').uploadToSignedUrl(j.path, j.token, file);
    if (error) { setFiles((s) => ({ ...s, [kind]: '' })); return setErr('Upload failed. Try again.'); }
    await post(`/api/claim/${code}/documents`, { kind, path: j.path, fileName: file.name });
    setFiles((s) => ({ ...s, [kind]: file.name }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    const r = await fetch(`/api/claim/${code}/info`, { method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...f, paidByRespondent: f.paidByRespondent === 'yes', zip }) });
    const j = await r.json(); setBusy(false);
    r.ok ? onDone() : setErr(j.error);
  }

  const Upload = ({ kind, label, hint }: { kind: string; label: string; hint: string }) => (
    <label className="block rounded border border-dashed border-[#cfcac0] p-4 text-sm">
      <div className="font-medium">{label}</div>
      <div className="text-xs text-[#6b7480]">{hint}</div>
      <input type="file" accept=".pdf,image/*" className="mt-2 text-xs" onChange={(e) => upload(kind, e.target.files?.[0])} />
      {files[kind] && <div className="mt-1 text-xs text-green-800">{files[kind]}</div>}
    </label>
  );

  return (
    <form onSubmit={submit} className={card}>
      <h2 className="font-[family-name:var(--font-serif)] text-xl">Step 2: Your information and documents</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm sm:col-span-2">Owner / entity name<input required className={input} value={f.entityName} onChange={set('entityName')} /></label>
        <label className="text-sm">Contact name<input required className={input} value={f.contactName} onChange={set('contactName')} /></label>
        <label className="text-sm">Title<input className={input} value={f.contactTitle} onChange={set('contactTitle')} /></label>
        <label className="text-sm">Phone<input className={input} value={f.phone} onChange={set('phone')} /></label>
        <label className="text-sm">Email<input required type="email" className={input} value={f.email} onChange={set('email')} /></label>
        <label className="text-sm sm:col-span-2">Mailing address for the refund check<textarea required rows={2} className={input} value={f.mailingAddress} onChange={set('mailingAddress')} /></label>
        <label className="text-sm">Was the original payment made by the owner above?
          <select className={input} value={f.paidByRespondent} onChange={set('paidByRespondent')}>
            <option value="yes">Yes</option><option value="no">No, someone else paid</option><option value="unsure">Not sure</option>
          </select>
        </label>
        {f.paidByRespondent !== 'yes' && <label className="text-sm">Who paid, if known<input className={input} value={f.payerName} onChange={set('payerName')} /></label>}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Upload kind="photo_id" label="Government photo ID *" hint="Driver's license or passport of the signer." />
        <Upload kind="proof_of_payment" label="Proof of payment *" hint="Payment receipt, cancelled check (front and back) or card/bank statement." />
        <Upload kind="authority" label="Proof of authority" hint="Optional: document showing you can act for the entity." />
        <Upload kind="other" label="Anything else" hint="Optional: decisions, letters, notices." />
      </div>
      <label className="mt-4 block text-sm">Notes<textarea rows={2} className={input} value={f.notes} onChange={set('notes')} /></label>
      {err && <p className="mt-3 text-sm text-red-700">{err}</p>}
      <button disabled={busy} className="mt-5 rounded bg-[#13302a] px-5 py-2 text-white disabled:opacity-50">{busy ? 'Submitting…' : 'Submit claim'}</button>
    </form>
  );
}

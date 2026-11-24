'use client';
import { use, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { agreementText, FIRM } from '@/lib/agreement';
import SignaturePad from '@/components/SignaturePad';
import FindPayment from '@/components/FindPayment';

type View = {
  code: string; respondent: string; amount: number; agency: string; feePct: number; status: string;
  signed: boolean; hasInfo: boolean; docs: string[]; refundRequestSigned: boolean; filedAt: string | null;
  details: { summons: string[]; property: string | null; penalty: number | null; paid: number | null } | null;
};

const usd = (n: number | null | undefined) => Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const input = 'mt-1 w-full rounded-sm border border-[#cfc8bc] bg-white px-3 py-2.5 text-[14px] outline-none focus:border-[#13302a] focus:ring-1 focus:ring-[#13302a]';
const label = 'text-[13px] font-medium text-[#2b3631]';
const card = 'border border-[#e6e0d5] bg-white p-6 sm:p-8';
const btn = 'rounded-full bg-gradient-to-b from-[#c9935f] to-[#a8703f] px-8 py-3 text-[14px] font-semibold text-white shadow-sm disabled:opacity-50';
const post = (url: string, body: object) => fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

export default function ClaimPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [zip, setZip] = useState('');
  const [view, setView] = useState<View | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    let z = '';
    try { z = sessionStorage.getItem(`claim_zip_${code}`) || ''; } catch {}
    setZip(z);
    fetch(`/api/claim/${code}?zip=${encodeURIComponent(z)}`).then(async (r) => {
      const j = await r.json();
      r.ok ? setView(j) : setErr(j.error);
    });
  }, [code]);

  const step = !view ? 0 : !view.signed ? 1 : !view.hasInfo ? 2 : !view.refundRequestSigned ? 3 : 4;

  return (
    <div className="font-[family-name:var(--font-display)]">
      <section className="bg-[#f4efe6]">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#a8703f]">Claim {code}</div>
          <h1 className="mt-3 text-[30px] font-medium uppercase leading-tight text-[#13302a] sm:text-[36px]">
            {step === 4 ? 'Your claim is in progress' : 'Your money is waiting'}
          </h1>
          {view && <Steps step={step} />}
        </div>
      </section>

      <div className="mx-auto grid max-w-3xl gap-6 px-4 py-10">
        {err && (
          <div className={card}>
            <p className="text-[14px] text-red-700">{err}</p>
            <a href="/" className="mt-4 inline-block text-[14px] underline">Back to claim lookup</a>
          </div>
        )}
        {!view && !err && <div className={card}>Loading your claim…</div>}
        {view && <Summary view={view} />}
        {step === 1 && <AuthorizeStep view={view!} code={code} zip={zip} onDone={setView} />}
        {step === 2 && <DetailsStep view={view!} code={code} zip={zip} onDone={setView} />}
        {step === 3 && <RefundRequestStep code={code} zip={zip} agency={view!.agency} onDone={setView} />}
        {step === 4 && <Track view={view!} code={code} zip={zip} />}
        <p className="text-center text-[13px] text-[#6b756f]">
          Questions? Email <a className="underline" href={`mailto:claims@whitmorekane.com?subject=Claim%20${code}`}>claims@whitmorekane.com</a> with your claim code.
        </p>
      </div>
    </div>
  );
}

function Steps({ step }: { step: number }) {
  const s = ['Authorize', 'Details & documents', 'Sign refund request', 'Track'];
  return (
    <ol className="mx-auto mt-8 grid max-w-2xl grid-cols-4 gap-2 text-left">
      {s.map((l, i) => {
        const n = i + 1, done = n < step, now = n === step;
        return (
          <li key={l} className="grid gap-2">
            <div className={`h-1 rounded-full ${done || now ? 'bg-[#a8703f]' : 'bg-[#ddd5c7]'}`} />
            <div className={`text-[11px] font-semibold uppercase tracking-wide sm:text-[12px] ${now ? 'text-[#13302a]' : done ? 'text-[#a8703f]' : 'text-[#9a9388]'}`}>
              {done ? '✓ ' : `${n}. `}{l}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Summary({ view }: { view: View }) {
  return (
    <div className={`${card} grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center`}>
      <div>
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6b756f]">Claimant</div>
        <div className="mt-1 text-[18px] font-medium text-[#13302a]">{view.respondent}</div>
        <p className="mt-2 text-[14px] text-[#4a5550]">Held by {view.agency}.</p>
        {view.details ? (
          <dl className="mt-3 grid gap-1 text-[14px]">
            <div><dt className="inline text-[#6b756f]">Record number: </dt><dd className="inline font-medium">{view.details.summons.join(', ')}</dd></div>
            {view.details.property && <div><dt className="inline text-[#6b756f]">Property: </dt><dd className="inline">{view.details.property}</dd></div>}
            {view.details.penalty != null && view.details.paid != null && (
              <div><dt className="inline text-[#6b756f]">Penalty vs. paid: </dt><dd className="inline">{usd(view.details.penalty)} owed, {usd(view.details.paid)} paid</dd></div>
            )}
          </dl>
        ) : (
          <p className="mt-2 text-[13px] text-[#6b756f]">The agency, record number and property appear here once you sign.</p>
        )}
      </div>
      <div className="border-t border-[#e6e0d5] pt-4 text-left sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0 sm:text-right">
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6b756f]">Amount</div>
        <div className="mt-1 text-[36px] font-medium leading-none text-[#13302a]">{usd(view.amount)}</div>
      </div>
      <p className="bg-[#f4efe6] p-3 text-[12px] leading-relaxed text-[#4a5550] sm:col-span-2">
        You can recover these funds yourself from the holding agency at no cost. {FIRM} handles the research, paperwork and
        follow-up for {view.feePct}% of what the agency actually refunds. You pay nothing unless you are paid.
      </p>
    </div>
  );
}

function AuthorizeStep({ view, code, zip, onDone }: { view: View; code: string; zip: string; onDone: (v: View) => void }) {
  const [f, setF] = useState({ signerName: '', signerTitle: '', signerEmail: '', accept: false });
  const [sig, setSig] = useState('');
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const text = agreementText({ respondent: view.respondent, amount: view.amount, feePct: view.feePct });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!sig) return setErr('Please draw your signature.');
    setBusy(true); setErr('');
    const r = await post(`/api/claim/${code}/sign`, { ...f, signaturePng: sig, zip });
    const j = await r.json(); setBusy(false);
    r.ok ? onDone(j) : setErr(j.error);
  }

  return (
    <form onSubmit={submit} className={card}>
      <h2 className="text-[22px] font-medium uppercase text-[#13302a]">Step 1 · Authorize us to recover it</h2>
      <p className="mt-2 text-[14px] text-[#4a5550]">Read the agreement, then sign below. It takes about a minute.</p>
      <pre className="mt-5 max-h-72 overflow-auto whitespace-pre-wrap border border-[#e6e0d5] bg-[#fbf9f5] p-4 font-[family-name:var(--font-display)] text-[13px] leading-relaxed text-[#2b3631]">{text}</pre>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className={label}>Your full name<input required className={input} value={f.signerName} onChange={(e) => setF({ ...f, signerName: e.target.value })} /></label>
        <label className={label}>Title (e.g. Member, Managing Agent)<input className={input} value={f.signerTitle} onChange={(e) => setF({ ...f, signerTitle: e.target.value })} /></label>
        <label className={`${label} sm:col-span-2`}>Email<input required type="email" className={input} value={f.signerEmail} onChange={(e) => setF({ ...f, signerEmail: e.target.value })} /></label>
        <div className="sm:col-span-2"><div className={label}>Signature</div><div className="mt-1"><SignaturePad onChange={setSig} /></div></div>
      </div>
      <label className="mt-4 flex items-start gap-2 text-[14px]">
        <input type="checkbox" checked={f.accept} onChange={(e) => setF({ ...f, accept: e.target.checked })} className="mt-1 accent-[#13302a]" />
        I am authorized to act for {view.respondent}, and I agree to the terms above and to sign electronically.
      </label>
      {err && <p className="mt-3 text-[14px] text-red-700">{err}</p>}
      <button disabled={busy || !f.accept} className={`mt-6 ${btn}`}>{busy ? 'Signing…' : 'Sign and continue'}</button>
    </form>
  );
}

function DetailsStep({ view, code, zip, onDone }: { view: View; code: string; zip: string; onDone: (v: View) => void }) {
  const [f, setF] = useState({
    entityName: view.respondent, contactName: '', contactTitle: '', phone: '', email: '', mailingAddress: '',
    paidBy: 'yes', payerName: '', refundReason: 'overpayment', reasonExplain: '',
    payReceiptNumber: '', payDate: '', payAmount: '', payMethod: 'CityPay online', payLast4: '', payUnknown: false, notes: '',
  });
  const [files, setFiles] = useState<Record<string, string>>(Object.fromEntries(view.docs.map((k) => [k, 'Uploaded'])));
  const [showHelp, setShowHelp] = useState(false);
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  async function upload(kind: string, file?: File) {
    if (!file) return;
    setErr(''); setFiles((s) => ({ ...s, [kind]: 'Uploading…' }));
    const r = await post(`/api/claim/${code}/upload-url`, { kind, fileName: file.name, zip });
    const j = await r.json();
    if (!r.ok) { setFiles((s) => ({ ...s, [kind]: '' })); return setErr(j.error); }
    const { error } = await supabase.storage.from('claim-docs').uploadToSignedUrl(j.path, j.token, file);
    if (error) { setFiles((s) => ({ ...s, [kind]: '' })); return setErr('Upload failed. Please try again.'); }
    await post(`/api/claim/${code}/documents`, { kind, path: j.path, fileName: file.name, zip });
    setFiles((s) => ({ ...s, [kind]: file.name }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    const r = await post(`/api/claim/${code}/info`, { ...f, zip });
    const j = await r.json(); setBusy(false);
    r.ok ? onDone(j) : setErr(j.error);
  }

  const Upload = ({ kind, title, hint, req }: { kind: string; title: string; hint: string; req?: boolean }) => (
    <label className="block cursor-pointer border border-dashed border-[#cfc8bc] bg-[#fbf9f5] p-4 text-[14px] hover:border-[#a8703f]">
      <div className="font-medium text-[#13302a]">{title}{req && ' *'}</div>
      <div className="text-[12px] text-[#6b756f]">{hint}</div>
      <input type="file" accept=".pdf,image/*" className="mt-2 text-[12px]" onChange={(e) => upload(kind, e.target.files?.[0])} />
      {files[kind] && <div className="mt-1 text-[12px] font-medium text-green-800">✓ {files[kind]}</div>}
    </label>
  );

  return (
    <form onSubmit={submit} className="grid gap-6">
      <div className={card}>
        <h2 className="text-[22px] font-medium uppercase text-[#13302a]">Step 2 · Your details</h2>
        <p className="mt-2 text-[14px] text-[#4a5550]">These go on the agency’s refund request. The check is mailed to the address you give.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className={`${label} sm:col-span-2`}>Owner / company name<input required className={input} value={f.entityName} onChange={set('entityName')} /></label>
          <label className={label}>Contact name<input required className={input} value={f.contactName} onChange={set('contactName')} /></label>
          <label className={label}>Title<input className={input} value={f.contactTitle} onChange={set('contactTitle')} /></label>
          <label className={label}>Phone<input className={input} value={f.phone} onChange={set('phone')} /></label>
          <label className={label}>Email<input required type="email" className={input} value={f.email} onChange={set('email')} /></label>
          <label className={`${label} sm:col-span-2`}>Mailing address for the refund check<textarea required rows={2} className={input} value={f.mailingAddress} onChange={set('mailingAddress')} /></label>
          <label className={label}>Who made the original payment?
            <select className={input} value={f.paidBy} onChange={set('paidBy')}>
              <option value="yes">The owner above</option><option value="no">Someone else (agent, contractor…)</option><option value="unsure">Not sure</option>
            </select>
          </label>
          {f.paidBy !== 'yes' && <label className={label}>Who paid, if known<input className={input} value={f.payerName} onChange={set('payerName')} /></label>}
          <label className={`${label} sm:col-span-2`}>Reason for the refund
            <select className={input} value={f.refundReason} onChange={set('refundReason')}>
              <option value="overpayment">Overpayment (paid more than the penalty)</option>
              <option value="duplicate">Duplicate payment</option>
              <option value="wrong_summons">Payment applied to the wrong summons</option>
              <option value="dismissed">Summons was dismissed</option>
              <option value="paid_in_error">Paid in error</option>
              <option value="other">Other</option>
            </select>
          </label>
          {['paid_in_error', 'other'].includes(f.refundReason) && <label className={`${label} sm:col-span-2`}>Explain<input className={input} value={f.reasonExplain} onChange={set('reasonExplain')} /></label>}
        </div>
        {f.paidBy !== 'yes' && (
          <p className="mt-4 bg-[#fff6e8] p-3 text-[13px] text-[#6b4a1f]">
            The agency refunds whoever made the original payment. If someone else paid, we’ll help you coordinate with them.
          </p>
        )}
      </div>

      <div className={card}>
        <h2 className="text-[22px] font-medium uppercase text-[#13302a]">Payment confirmation</h2>
        <p className="mt-2 text-[14px] text-[#4a5550]">The agency requires proof of the original payment. Enter what you have and upload a copy.</p>
        <button type="button" onClick={() => setShowHelp(!showHelp)} className="mt-3 text-[14px] font-medium text-[#a8703f] underline">
          {showHelp ? 'Hide' : 'How do I find my payment confirmation?'}
        </button>
        {showHelp && <div className="mt-4 bg-[#fbf9f5] p-5"><FindPayment compact /></div>}
        <fieldset disabled={f.payUnknown} className="mt-6 grid gap-4 disabled:opacity-50 sm:grid-cols-2">
          <label className={label}>Receipt or confirmation number<input placeholder="e.g. CPY030570883" className={input} value={f.payReceiptNumber} onChange={set('payReceiptNumber')} /></label>
          <label className={label}>Payment date<input type="date" className={input} value={f.payDate} onChange={set('payDate')} /></label>
          <label className={label}>Amount paid<input placeholder="$" inputMode="decimal" className={input} value={f.payAmount} onChange={set('payAmount')} /></label>
          <label className={label}>Paid by
            <select className={input} value={f.payMethod} onChange={set('payMethod')}>
              <option>CityPay online</option><option>Mailed check</option><option>In person</option><option>Bank transfer / ACH</option><option>Other</option>
            </select>
          </label>
          <label className={label}>Last 4 digits of card or account<input inputMode="numeric" maxLength={4} className={input} value={f.payLast4} onChange={set('payLast4')} /></label>
          <div className="sm:col-span-2">
            <Upload kind="proof_of_payment" title="Upload payment confirmation" hint="CityPay receipt, cancelled check (front and back) or bank/card statement page." req />
          </div>
        </fieldset>
        <label className="mt-4 flex items-start gap-2 text-[14px]">
          <input type="checkbox" checked={f.payUnknown} onChange={(e) => setF({ ...f, payUnknown: e.target.checked })} className="mt-1 accent-[#13302a]" />
          I can’t find it. Please request the payment record from the agency for me.
        </label>
      </div>

      <div className={card}>
        <h2 className="text-[22px] font-medium uppercase text-[#13302a]">Documents</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Upload kind="photo_id" title="Photo ID of the signer" hint="Driver’s license or passport." req />
          <Upload kind="authority" title="Proof of authority (optional)" hint="Shows you can act for the company, e.g. operating agreement page." />
          <Upload kind="other" title="Anything else (optional)" hint="Decisions, letters or notices." />
        </div>
        <label className={`${label} mt-5 block`}>Notes for us<textarea rows={2} className={input} value={f.notes} onChange={set('notes')} /></label>
        {err && <p className="mt-4 text-[14px] text-red-700">{err}</p>}
        <button disabled={busy} className={`mt-6 ${btn}`}>{busy ? 'Saving…' : 'Continue to review'}</button>
      </div>
    </form>
  );
}

function RefundRequestStep({ code, zip, agency, onDone }: { code: string; zip: string; agency: string; onDone: (v: View) => void }) {
  const [certify, setCertify] = useState(false);
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const pdf = `/api/claim/${code}/refund-request?zip=${encodeURIComponent(zip)}`;

  async function sign() {
    setBusy(true); setErr('');
    const r = await post(`/api/claim/${code}/refund-request`, { certify, zip });
    const j = await r.json(); setBusy(false);
    r.ok ? onDone(j) : setErr(j.error);
  }

  return (
    <div className={card}>
      <h2 className="text-[22px] font-medium uppercase text-[#13302a]">Step 3 · Review and sign the refund request</h2>
      <p className="mt-2 text-[14px] text-[#4a5550]">
        We’ve filled in {agency}’s official refund request from your details. Check it, then sign. We’ll file it with your documents.
      </p>
      <div className="mt-5 border border-[#e6e0d5]">
        <iframe src={pdf} title="Refund request" className="h-[520px] w-full" />
      </div>
      <a href={pdf} target="_blank" rel="noreferrer" className="mt-2 inline-block text-[13px] underline">Open in a new tab</a>
      <label className="mt-5 flex items-start gap-2 text-[14px]">
        <input type="checkbox" checked={certify} onChange={(e) => setCertify(e.target.checked)} className="mt-1 accent-[#13302a]" />
        I certify under penalty of perjury that I am authorized to submit this request and that, to the best of my knowledge,
        the information on it and in the attachments is true. Apply my signature to this form.
      </label>
      {err && <p className="mt-3 text-[14px] text-red-700">{err}</p>}
      <button onClick={sign} disabled={busy || !certify} className={`mt-6 ${btn}`}>{busy ? 'Signing…' : 'Sign refund request'}</button>
    </div>
  );
}

function Track({ view, code, zip }: { view: View; code: string; zip: string }) {
  const filed = ['filed', 'paid', 'closed'].includes(view.status);
  const paid = ['paid', 'closed'].includes(view.status);
  const items = [
    { t: 'Authorization signed', done: true },
    { t: 'Refund request signed', done: true },
    { t: `Filed with ${view.agency}`, done: filed, d: filed ? (view.filedAt ? new Date(view.filedAt).toLocaleDateString() : '') : 'We file within 2 business days.' },
    { t: 'Agency review', done: paid, d: paid ? '' : 'Agencies typically take several weeks. They may first apply the credit to any other balance you owe.' },
    { t: 'Refund check mailed to you', done: paid, d: paid ? '' : 'The agency mails it directly to you. Then we invoice our fee.' },
  ];
  return (
    <div className={card}>
      <h2 className="text-[22px] font-medium uppercase text-[#13302a]">Status</h2>
      <ol className="mt-6 grid gap-0">
        {items.map((it, i) => (
          <li key={it.t} className="relative flex gap-4 pb-6 last:pb-0">
            {i < items.length - 1 && <span className={`absolute left-[11px] top-6 h-full w-0.5 ${it.done ? 'bg-[#a8703f]' : 'bg-[#e0d9cd]'}`} />}
            <span className={`relative z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[12px] ${it.done ? 'bg-[#a8703f] text-white' : 'border-2 border-[#d6cec0] bg-white'}`}>{it.done ? '✓' : ''}</span>
            <div>
              <div className={`text-[15px] font-medium ${it.done ? 'text-[#13302a]' : 'text-[#6b756f]'}`}>{it.t}</div>
              {it.d && <div className="text-[13px] text-[#6b756f]">{it.d}</div>}
            </div>
          </li>
        ))}
      </ol>
      <a href={`/api/claim/${code}/refund-request?zip=${encodeURIComponent(zip)}`} target="_blank" rel="noreferrer" className="mt-6 inline-block text-[14px] underline">
        Download your signed refund request
      </a>
    </div>
  );
}

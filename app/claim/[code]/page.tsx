'use client';
import { use, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { agreementText, FIRM } from '@/lib/agreement';
import SignaturePad from '@/components/SignaturePad';
import PaymentExamples from '@/components/PaymentExamples';
import AddressLookup from '@/components/AddressLookup';

type View = {
  code: string; respondent: string; amount: number; agency: string; feePct: number; status: string;
  signed: boolean; hasInfo: boolean; hasForwardAddress: boolean; docs: string[]; refundRequestSigned: boolean; filedAt: string | null; respondentAddress?: string | null;
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
        <div className="mx-auto max-w-3xl px-4 py-8 text-center">
          {step === 4 && <h1 className="text-[30px] font-medium uppercase leading-tight text-[#13302a] sm:text-[36px]">Your claim is in progress</h1>}
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
        {step === 4 && <Track view={view!} code={code} zip={zip} onDone={setView} />}
        <p className="text-center text-[13px] text-[#6b756f]">
          Questions? Email <a className="underline" href={`mailto:claims@whitmorekane.com?subject=Claim%20${code}`}>claims@whitmorekane.com</a> with your claim code.
        </p>
      </div>
    </div>
  );
}

function Steps({ step }: { step: number }) {
  const s = ['Sign the agreement', 'Upload your old receipt', 'Sign the refund request'];
  return (
    <ol className="mx-auto mt-8 grid max-w-2xl grid-cols-3 gap-3 text-left">
      {s.map((l, i) => {
        const n = i + 1, done = n < step, now = n === step;
        return (
          <li key={l} className="grid gap-2">
            <div className={`h-1.5 rounded-full ${done || now ? 'bg-[#a8703f]' : 'bg-[#ddd5c7]'}`} />
            <div className={`text-[11px] font-bold uppercase tracking-[0.15em] ${now ? 'text-[#a8703f]' : done ? 'text-[#a8703f]' : 'text-[#9a9388]'}`}>
              {done ? '✓ Done' : `Step ${n}`}
            </div>
            <div className={`text-[13px] font-medium sm:text-[14px] ${now ? 'text-[#13302a]' : done ? 'text-[#4a5550]' : 'text-[#9a9388]'}`}>{l}</div>
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
        <div className="flex flex-wrap justify-between gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#6b756f]">
          <span>Claimant</span><span className="text-[#a8703f]">Claim {view.code}</span>
        </div>
        <div className="mt-1 text-[18px] font-medium text-[#13302a]">{view.respondent}</div>
        <p className="mt-2 text-[14px] text-[#4a5550]">Held by {view.agency}.</p>
        {view.details ? (
          <dl className="mt-3 grid gap-1 text-[14px]">
            <div><dt className="inline text-[#6b756f]">Record number: </dt><dd className="inline font-medium">{view.details.summons.join(', ')}</dd></div>
            {view.details.property && <div><dt className="inline text-[#6b756f]">Property: </dt><dd className="inline">{view.details.property}</dd></div>}
            {view.details.paid != null && view.details.penalty != null && (
              <div className="mt-1">
                You paid <b>{usd(view.details.paid)}</b>. The penalty was <b>{usd(view.details.penalty)}</b>, so you’re owed{' '}
                <b>{usd(view.amount)}</b> back.
              </div>
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
        {FIRM} handles the paperwork, the agency and any issues that come up for {view.feePct}% of what we recover. You don’t pay
        unless we recover your funds.
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
      <h2 className="text-[22px] font-medium uppercase text-[#13302a]">Step 1 · Sign the agreement</h2>
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
        I am authorized to act for {view.respondent}. I agree to the terms above, including that I can cancel only until the
        refund request is filed, and to sign electronically.
      </label>
      {err && <p className="mt-3 text-[14px] text-red-700">{err}</p>}
      <button disabled={busy || !f.accept} className={`mt-6 ${btn}`}>{busy ? 'Signing…' : 'Sign and continue'}</button>
    </form>
  );
}

function DetailsStep({ view, code, zip, onDone }: { view: View; code: string; zip: string; onDone: (v: View) => void }) {
  const [f, setF] = useState({
    entityName: view.respondent, paidBy: 'yes', payerName: '',
    payUnknown: false,
  });
  const [files, setFiles] = useState<Record<string, string>>(Object.fromEntries(view.docs.map((k) => [k, 'Uploaded'])));
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
        <h2 className="text-[22px] font-medium uppercase text-[#13302a]">Step 2 · Upload your old receipt</h2>
        <p className="mt-2 text-[14px] text-[#4a5550]">
          Nothing to pay here. To release your refund, the agency needs proof of the payment you already made. The agency mails the check to us so we can verify the amount and
          confirm payment before it reaches you. We will never cash your check.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className={`${label} sm:col-span-2`}>Owner / Company Name<input required className={input} value={f.entityName} onChange={set('entityName')} /></label>
          <label className={label}>Who made the original payment?
            <select className={input} value={f.paidBy} onChange={set('paidBy')}>
              <option value="yes">The owner above</option><option value="no">Someone else (agent, contractor…)</option><option value="unsure">Not sure</option>
            </select>
          </label>
          {f.paidBy !== 'yes' && <label className={label}>Who paid, if known<input className={input} value={f.payerName} onChange={set('payerName')} /></label>}
        </div>

        <div className="mt-8 border-t border-[#e6e0d5] pt-6">
          <h3 className="text-[18px] font-semibold text-[#13302a]">Proof of the payment you already made</h3>
          <p className="mt-1 text-[14px] text-[#4a5550]">One document is all we need. You don’t have to type anything in.</p>
          <div className={f.payUnknown ? 'pointer-events-none opacity-50' : ''}>
            <ol className="mt-5 grid gap-6">
              <li>
                <div className="text-[14px] font-semibold text-[#13302a]"><span className="mr-2 inline-grid h-6 w-6 place-items-center rounded-full bg-[#13302a] text-[12px] text-white">1</span>
                  Find proof that you paid {view.details?.paid != null ? <span className="text-[#a8703f]">{usd(view.details.paid)}</span> : 'the original amount'}
                </div>
                <p className="mt-1 text-[13px] text-[#4a5550]">Any one of these works:</p>
                <PaymentExamples violation={view.details?.summons?.[0]} respondent={view.respondent} paid={view.details?.paid} />
                <details className="group mt-4 border border-[#ddd5c7] bg-[#fbf9f5]">
                  <summary className="cursor-pointer list-none px-4 py-3 text-[14px] font-medium text-[#13302a]">
                    <span className="mr-2 inline-block transition group-open:rotate-90">›</span>Where to look
                  </summary>
                  <ul className="grid gap-2.5 px-4 pb-4 text-[14px] text-[#4a5550]">
                    <li><b className="text-[#13302a]">Search your email</b> for “{view.details?.summons?.[0] || 'your violation number'}”, “CityPay” or “CPY”.</li>
                    <li><b className="text-[#13302a]">Search your billing inbox too</b>, or whoever pays bills for you (bookkeeper, property manager).</li>
                    <li><b className="text-[#13302a]">Let AI search your statements.</b> Drop your bank or card statements into an AI assistant and ask: “Find a payment to NYC, CityPay or ECB{view.details?.paid != null ? ` for ${usd(view.details.paid)}` : ''}.”</li>
                    <li><b className="text-[#13302a]">Check your own records</b>: accounting software, check register or payment logs.</li>
                  </ul>
                </details>
              </li>
              <li>
                <div className="text-[14px] font-semibold text-[#13302a]"><span className="mr-2 inline-grid h-6 w-6 place-items-center rounded-full bg-[#13302a] text-[12px] text-white">2</span>Check that it shows</div>
                <ul className="mt-2 grid gap-1.5 bg-[#fbf9f5] p-4 text-[14px] text-[#4a5550]">
                  <li>✓ The violation number{view.details?.summons?.[0] ? <> (<b className="text-[#13302a]">{view.details.summons[0]}</b>)</> : null} or “ECB”</li>
                  <li>✓ The amount paid{view.details?.paid != null ? <> (<b className="text-[#13302a]">{usd(view.details.paid)}</b>)</> : null}, or a breakdown that adds up to it</li>
                  <li>✓ The date it was paid</li>
                </ul>
                <p className="mt-2 text-[13px] text-[#6b6a64]">
                  <b className="text-[#13302a]">Bank statement?</b> Black out everything unrelated first. We use it only to prove this
                  one payment. We never sell or share your data, and we don’t pull anything else from it.
                </p>
              </li>
              <li>
                <div className="text-[14px] font-semibold text-[#13302a]"><span className="mr-2 inline-grid h-6 w-6 place-items-center rounded-full bg-[#13302a] text-[12px] text-white">3</span>Upload it</div>
                <div className="mt-2">
                  <Upload kind="proof_of_payment" title="Choose a file" hint="PDF or a phone photo. For a check, include the front and back." req />
                </div>
              </li>
            </ol>
          </div>
          <label className="mt-5 flex items-start gap-2 text-[14px]">
            <input type="checkbox" checked={f.payUnknown} onChange={(e) => setF({ ...f, payUnknown: e.target.checked })} className="mt-1 accent-[#13302a]" />
            I can’t find any of these. Please request the payment record from the agency for me.
          </label>
        </div>
        {err && <p className="mt-4 text-[14px] text-red-700">{err}</p>}
        <button disabled={busy} className={`mt-6 ${btn}`}>{busy ? 'Saving…' : 'Continue to step 3'}</button>
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
      <h2 className="text-[22px] font-medium uppercase text-[#13302a]">Step 3 · Sign the refund request</h2>
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

function Track({ view, code, zip, onDone }: { view: View; code: string; zip: string; onDone: (v: View) => void }) {
  const filed = ['filed', 'paid', 'closed'].includes(view.status);
  const paid = ['paid', 'closed'].includes(view.status);
  const items = [
    { t: 'Authorization signed', done: true },
    { t: 'Refund request signed', done: true },
    { t: `Filed with ${view.agency}`, done: filed, d: filed ? (view.filedAt ? new Date(view.filedAt).toLocaleDateString() : '') : 'We file within 2 business days.' },
    { t: 'Agency review', done: paid, d: paid ? '' : 'Agencies typically take several weeks. We handle any questions or issues that come up.' },
    { t: 'Check received and verified', done: paid, d: paid ? '' : 'The agency mails the check to us and we confirm it’s correct.' },
    { t: 'Check mailed to you', done: view.status === 'closed', d: view.status === 'closed' ? '' : 'Sent uncashed by tracked mail within 5 business days. We invoice after you receive it.' },
  ];
  return (
    <>
    {paid && !view.hasForwardAddress && <ForwardAddress view={view} code={code} zip={zip} onDone={onDone} />}
    {!filed && (
      <div className="border border-[#ecdcb8] bg-[#fbf6e9] p-6 sm:p-8">
        <h2 className="text-[22px] font-medium text-[#13302a]">Here’s what’s next</h2>
        <ul className="mt-4 grid gap-2 text-[15px] text-[#2b3631] [&>li]:ml-5 [&>li]:list-[square] [&>li]:marker:text-[#a8703f]">
          <li>We’ll file your refund request with {view.agency} within <b>2 business days</b>. You can cancel free until then.</li>
          <li>The agency reviews it. This usually takes <b>several weeks to a few months</b>. If it asks for anything, we’ll handle it and email you only if we need you.</li>
          <li>The agency mails the check to us as your agent. We never cash it.</li>
          <li>We mail it to you uncashed by tracked mail within <b>5 business days</b>. After you receive it, we invoice our 15% fee.</li>
        </ul>
      </div>
    )}
    <div className="flex items-start gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#13302a] text-[14px] font-semibold text-white">SW</span>
      <div className="bg-[#eef4f2] px-4 py-3 text-[14px] text-[#2b3631]">
        Hi, I’m Susan. Email me at <a className="text-[#a8703f] underline" href={`mailto:claims@whitmorekane.com?subject=Claim%20${code}`}>claims@whitmorekane.com</a> if you need any help!
      </div>
    </div>
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
    </>
  );
}

function ForwardAddress({ view, code, zip, onDone }: { view: View; code: string; zip: string; onDone: (v: View) => void }) {
  const onFile = view.respondentAddress || '';
  const [choice, setChoice] = useState(onFile ? 'file' : 'other');
  const [name, setName] = useState(view.respondent);
  const [other, setOther] = useState('');
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    const street = choice === 'file' ? onFile : other;
    const r = await post(`/api/claim/${code}/forward-address`, { address: `${name.trim()}\n${street.trim()}`, zip });
    const j = await r.json(); setBusy(false);
    r.ok ? onDone(j) : setErr(j.error);
  }
  const radio = 'flex cursor-pointer items-start gap-3 border p-4 text-[14px]';
  return (
    <form onSubmit={save} className="border-2 border-[#a8703f] bg-white p-6 sm:p-8">
      <h2 className="text-[22px] font-medium text-[#13302a]">Good news: your check has arrived</h2>
      <p className="mt-2 text-[14px] text-[#4a5550]">We’ve verified it. Where should we mail it? We’ll send it uncashed by tracked mail within 5 business days.</p>
      <label className={`${label} mt-5`}>Name on the envelope<input required className={input} value={name} onChange={(e) => setName(e.target.value)} /></label>
      <div className="mt-4 grid gap-3">
        {onFile && (
          <label className={`${radio} ${choice === 'file' ? 'border-[#a8703f] bg-[#fbf9f5]' : 'border-[#ddd5c7]'}`}>
            <input type="radio" name="addr" checked={choice === 'file'} onChange={() => setChoice('file')} className="mt-1 accent-[#13302a]" />
            <span><span className="block font-medium text-[#13302a]">Address on file</span>{onFile}</span>
          </label>
        )}
        <label className={`${radio} ${choice === 'other' ? 'border-[#a8703f] bg-[#fbf9f5]' : 'border-[#ddd5c7]'}`}>
          <input type="radio" name="addr" checked={choice === 'other'} onChange={() => setChoice('other')} className="mt-1 accent-[#13302a]" />
          <span className="block font-medium text-[#13302a]">A different address</span>
        </label>
        {choice === 'other' && <AddressLookup value={other} onChange={setOther} className={input} />}
      </div>
      {err && <p className="mt-3 text-[14px] text-red-700">{err}</p>}
      <button disabled={busy} className={`mt-5 ${btn}`}>{busy ? 'Saving…' : 'Mail my check here'}</button>
    </form>
  );
}

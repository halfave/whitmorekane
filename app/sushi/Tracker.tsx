'use client';
import { useMemo, useState, useTransition } from 'react';
import { setStatus, saveDetails } from './actions';
import Attach from './Attach';

type F = { id: string; kind: string; name: string; url: string };
type Row = {
  id: string; violation: string; date: string | null; respondent: string; agency: string;
  penalty: number | null; paid: number | null; owed: number | null; code: string | null; zip: string | null;
  status: string; filedAt: string | null; filedBy: string | null; ppuDraft: boolean; ppuSigned: boolean;
  check: { issued: string | null; number: string | null; amount: number | null; received: string | null; forwarded: string | null };
  files: F[];
};

const STAGES: [string, string][] = [
  ['found', 'Found'], ['sent', 'Letter sent'], ['viewed', 'Opened'], ['signed', 'Agreement signed'],
  ['info_submitted', 'Proof in'], ['filed', 'Filed'], ['paid', 'Check received'], ['closed', 'Check forwarded'], ['declined', 'Declined'],
];
const LABEL = Object.fromEntries(STAGES);
const ORDER = Object.fromEntries(STAGES.map(([k], i) => [k, i]));
const TONE: Record<string, string> = {
  found: 'bg-stone-100 text-stone-700', sent: 'bg-sky-50 text-sky-800', viewed: 'bg-sky-100 text-sky-900',
  signed: 'bg-amber-50 text-amber-800', info_submitted: 'bg-amber-100 text-amber-900', filed: 'bg-violet-100 text-violet-900',
  paid: 'bg-emerald-100 text-emerald-900', closed: 'bg-emerald-600 text-white', declined: 'bg-rose-100 text-rose-800',
};
const usd = (n: number | null | undefined) => (n == null ? '—' : Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }));
const dt = (v: string | null) => (v ? new Date(v.length === 10 ? `${v}T12:00:00` : v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : '—');
const title = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\bLlc\b/g, 'LLC').replace(/\bInc\b/g, 'Inc.').replace(/ I$/, ' Inc.').replace(/\bZdj\b/g, 'ZDJ');
const link = (r: Row) => r.agency === 'DOB'
  ? `https://a810-bisweb.nyc.gov/bisweb/ECBQueryByNumberServlet?requestid=2&ecbin=${r.violation}`
  : 'https://a820-ecbticketfinder.nyc.gov/searchHome.action';

type Key = 'violation' | 'date' | 'respondent' | 'agency' | 'owed' | 'status' | 'filedAt' | 'check';
const val = (r: Row, k: Key): any =>
  k === 'status' ? ORDER[r.status] : k === 'owed' ? Number(r.owed ?? -1) : k === 'check' ? Number(r.check.amount ?? -1) : (r as any)[k] ?? '';

export default function Tracker({ rows }: { rows: Row[] }) {
  const [stage, setStage] = useState<string>('all');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<{ k: Key; dir: 1 | -1 }>({ k: 'date', dir: -1 });
  const [open, setOpen] = useState<string | null>(null);

  const counts = useMemo(() => {
    const m: Record<string, { n: number; owed: number }> = {};
    for (const r of rows) { m[r.status] ??= { n: 0, owed: 0 }; m[r.status].n++; m[r.status].owed += Number(r.owed || 0); }
    return m;
  }, [rows]);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows
      .filter((r) => stage === 'all' || r.status === stage)
      .filter((r) => !s || [r.violation, r.respondent, r.code, r.agency].some((x) => (x || '').toLowerCase().includes(s)))
      .sort((a, b) => { const x = val(a, sort.k), y = val(b, sort.k); return (x > y ? 1 : x < y ? -1 : 0) * sort.dir; });
  }, [rows, stage, q, sort]);
  const totalOwed = rows.reduce((s, r) => s + Number(r.owed || 0), 0);
  const totalIn = rows.reduce((s, r) => s + Number(r.check.amount || 0), 0);

  const Th = ({ k, children, right }: { k: Key; children: React.ReactNode; right?: boolean }) => (
    <th className={`px-3 py-2.5 ${right ? 'text-right' : 'text-left'}`}>
      <button onClick={() => setSort((s) => ({ k, dir: s.k === k ? (s.dir === 1 ? -1 : 1) : k === 'respondent' || k === 'violation' ? 1 : -1 }))}
        className={`inline-flex items-center gap-1 hover:text-[#13302a] ${sort.k === k ? 'text-[#13302a]' : ''}`}>
        {children}<span className="text-[10px]">{sort.k === k ? (sort.dir === 1 ? '▲' : '▼') : ''}</span>
      </button>
    </th>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 font-[family-name:var(--font-display)] text-[#1f2a26]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-medium text-[#13302a]">Refund tracker</h1>
          <p className="text-sm text-[#6b7480]">{rows.length} violations · {usd(totalOwed)} owed · {usd(totalIn)} in checks received</p>
        </div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search violation, respondent, claim #"
          className="w-72 rounded-md border border-[#d9d2c4] bg-white px-3 py-2 text-sm" />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button onClick={() => setStage('all')} className={`rounded-full px-3 py-1.5 text-sm ${stage === 'all' ? 'bg-[#13302a] text-white' : 'bg-white ring-1 ring-[#d9d2c4]'}`}>All {rows.length}</button>
        {STAGES.map(([k, l]) => (
          <button key={k} onClick={() => setStage(k)} disabled={!counts[k]}
            className={`rounded-full px-3 py-1.5 text-sm disabled:opacity-40 ${stage === k ? 'bg-[#13302a] text-white' : 'bg-white ring-1 ring-[#d9d2c4]'}`}>
            {l} <b>{counts[k]?.n || 0}</b>{counts[k] ? <span className="ml-1 opacity-70">{usd(counts[k].owed)}</span> : null}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-[#e3ddd1] bg-white shadow-sm">
        <table className="w-full min-w-[1000px] text-[14px]">
          <thead className="sticky top-0 bg-[#f7f3ec] text-[12px] font-semibold uppercase tracking-wide text-[#6b7480]">
            <tr>
              <Th k="violation">Violation</Th><Th k="date">Issued</Th><Th k="respondent">Respondent</Th><Th k="agency">Agency</Th>
              <Th k="owed" right>Owed</Th><th className="px-3 py-2.5 text-left">Claim #</th><Th k="status">Stage</Th>
              <th className="px-3 py-2.5 text-left">Docs</th><Th k="filedAt">Filed</Th><Th k="check" right>Check</Th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => <RowView key={r.id} r={r} open={open === r.id} toggle={() => setOpen(open === r.id ? null : r.id)} />)}
            {!list.length && <tr><td colSpan={10} className="p-8 text-center text-[#6b7480]">Nothing here.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RowView({ r, open, toggle }: { r: Row; open: boolean; toggle: () => void }) {
  const [pending, start] = useTransition();
  const [status, setS] = useState(r.status);
  const i = ORDER[status];
  const next = i < 7 ? STAGES[i + 1] : null;
  const change = (s: string) => { setS(s); start(async () => { await setStatus(r.id, s); }); };
  const ppu = r.files.filter((f) => f.kind === 'ppu1');
  const pop = r.files.filter((f) => f.kind === 'proof_of_payment');
  const Doc = ({ ok, label, href }: { ok: boolean; label: string; href?: string }) => ok && href
    ? <a href={href} target="_blank" rel="noreferrer" className="rounded bg-emerald-50 px-1.5 py-0.5 text-[12px] text-emerald-800 ring-1 ring-emerald-200 hover:bg-emerald-100">{label} ✓</a>
    : <span className="rounded bg-stone-50 px-1.5 py-0.5 text-[12px] text-stone-400 ring-1 ring-stone-200">{label}</span>;
  const ppuHref = ppu[0]?.url || (r.ppuDraft ? `/api/admin/claims/${r.id}/ppu1` : undefined);

  return (
    <>
      <tr className={`border-t border-[#efe9de] ${open ? 'bg-[#fbf9f5]' : 'hover:bg-[#fcfbf8]'}`}>
        <td className="px-3 py-2.5">
          <a href={link(r)} target="_blank" rel="noreferrer" className="font-mono text-[13px] text-[#1d4f8f] underline decoration-[#1d4f8f]/30 hover:decoration-[#1d4f8f]">{r.violation}</a>
        </td>
        <td className="whitespace-nowrap px-3 py-2.5 text-[#4a5550]">{dt(r.date)}</td>
        <td className="px-3 py-2.5"><button onClick={toggle} className="text-left hover:underline">{title(r.respondent)}</button></td>
        <td className="px-3 py-2.5 text-[12px] text-[#6b7480]">{r.agency}</td>
        <td className="px-3 py-2.5 text-right font-semibold tabular-nums">{usd(r.owed)}</td>
        <td className="px-3 py-2.5 font-mono text-[12px]">{r.code || '—'}</td>
        <td className="px-3 py-2.5">
          <div className="flex items-center gap-1.5">
            <select value={status} onChange={(e) => change(e.target.value)} disabled={pending}
              className={`rounded-full border-0 px-2.5 py-1 text-[12px] font-semibold ${TONE[status]}`}>
              {STAGES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
            {next && status !== 'declined' && (
              <button onClick={() => change(next[0])} disabled={pending} title={`Move to ${next[1]}`}
                className="rounded-full px-1.5 text-[13px] text-[#a8703f] hover:bg-[#f4efe6]">→</button>
            )}
          </div>
        </td>
        <td className="px-3 py-2.5"><div className="flex gap-1"><Doc ok={!!ppuHref} label="PPU1" href={ppuHref} /><Doc ok={!!pop[0]} label="Proof" href={pop[0]?.url} /></div></td>
        <td className="whitespace-nowrap px-3 py-2.5 text-[#4a5550]">{dt(r.filedAt)}</td>
        <td className="px-3 py-2.5 text-right">
          <button onClick={toggle} className="tabular-nums hover:underline">
            {r.check.amount != null ? usd(r.check.amount) : <span className="text-[#a8703f]">{open ? 'Close' : 'Add'}</span>}
          </button>
        </td>
      </tr>
      {open && <Details r={r} />}
    </>
  );
}

function Details({ r }: { r: Row }) {
  const [v, setV] = useState<Record<string, string>>({
    filed_at: r.filedAt ? r.filedAt.slice(0, 10) : '', check_issued_on: r.check.issued || '', check_number: r.check.number || '',
    check_amount: r.check.amount != null ? String(r.check.amount) : '', check_received_on: r.check.received || '', check_forwarded_on: r.check.forwarded || '',
  });
  const [msg, setMsg] = useState(''); const [pending, start] = useTransition();
  const f = (k: string, label: string, type = 'text') => (
    <label className="grid gap-1 text-[12px] text-[#6b7480]">{label}
      <input type={type} value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} className="rounded border border-[#d9d2c4] px-2 py-1.5 text-[13px] text-[#1f2a26]" />
    </label>
  );
  return (
    <tr className="bg-[#fbf9f5]">
      <td colSpan={10} className="px-3 pb-4 pt-1">
        <div className="grid gap-5 rounded-md border border-[#e3ddd1] bg-white p-4 md:grid-cols-[2fr_1fr]">
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-wide text-[#6b7480]">Filing & refund check</div>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {f('filed_at', 'Filed with agency', 'date')}
              {f('check_issued_on', 'Check issued', 'date')}
              {f('check_number', 'Check #')}
              {f('check_amount', 'Check amount')}
              {f('check_received_on', 'Check received', 'date')}
              {f('check_forwarded_on', 'Forwarded to owner', 'date')}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <button disabled={pending} onClick={() => start(async () => { const x = await saveDetails(r.id, v); setMsg(x.error || 'Saved'); })}
                className="rounded bg-[#13302a] px-3 py-1.5 text-[13px] text-white">{pending ? 'Saving…' : 'Save'}</button>
              {msg && <span className="text-[12px] text-[#6b7480]">{msg}</span>}
            </div>
            <div className="mt-3 text-[12px] text-[#6b7480]">
              Penalty {usd(r.penalty)} · Paid {usd(r.paid)}{r.zip ? ` · ZIP ${r.zip}` : ''}{r.filedBy ? ` · ${r.filedBy}` : ''}
            </div>
          </div>
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-wide text-[#6b7480]">Files</div>
            <ul className="mt-2 grid gap-1 text-[13px]">
              {r.files.map((x) => <li key={x.id}><a href={x.url} target="_blank" rel="noreferrer" className="underline">{x.name}</a> <span className="text-[11px] text-[#6b7480]">{x.kind.replace(/_/g, ' ')}</span></li>)}
              {!r.files.length && <li className="text-[#6b7480]">None yet</li>}
            </ul>
            <div className="mt-3"><Attach id={r.id} /></div>
          </div>
        </div>
      </td>
    </tr>
  );
}

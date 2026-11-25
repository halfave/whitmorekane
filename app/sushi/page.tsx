import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { admin, BUCKET } from '@/lib/server';
import { isAdmin } from '@/lib/admin';
import Attach from './Attach';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Refund tracker', robots: { index: false, follow: false } };

const STATUSES = ['found', 'sent', 'viewed', 'signed', 'info_submitted', 'filed', 'paid', 'closed', 'declined'];
const usd = (n: any) => (n == null ? '—' : Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD' }));
const d = (v: any) => (v ? new Date(String(v).length === 10 ? `${v}T12:00:00` : v).toLocaleDateString('en-US') : '—');
const inp = 'w-full rounded border border-[#cfcac0] px-1 py-0.5 text-[11px]';

async function save(f: FormData) {
  'use server';
  if (!(await isAdmin())) redirect('/admin/login?next=/sushi');
  const g = (k: string) => String(f.get(k) || '').trim() || null;
  const status = g('status')!;
  const patch: any = {
    status, check_issued_on: g('check_issued_on'), check_number: g('check_number'),
    check_amount: g('check_amount') ? Number(g('check_amount')!.replace(/[$,]/g, '')) : null,
    check_received_on: g('check_received_on'), check_forwarded_on: g('check_forwarded_on'),
    filed_at: g('filed_at'),
  };
  if (!STATUSES.includes(status)) return;
  await admin.from('claims').update(patch).eq('id', String(f.get('id')));
  revalidatePath('/sushi');
}

export default async function Sushi() {
  if (!(await isAdmin())) redirect('/admin/login?next=/sushi');
  const [{ data: claims }, { data: docs }, { data: infos }] = await Promise.all([
    admin.from('claims').select('*').order('violation_date', { ascending: false, nullsFirst: false }),
    admin.from('documents').select('*').order('uploaded_at'),
    admin.from('claimant_info').select('claim_id'),
  ]);
  const hasInfo = new Set((infos || []).map((x: any) => x.claim_id));
  const signed = await Promise.all((docs || []).map(async (x: any) => {
    const { data } = await admin.storage.from(BUCKET).createSignedUrl(x.storage_path, 600);
    return { ...x, url: data?.signedUrl };
  }));
  const byClaim = new Map<string, any[]>();
  for (const x of signed) byClaim.set(x.claim_id, [...(byClaim.get(x.claim_id) || []), x]);
  const rows = (claims || []).filter((c: any) => !/^TEST/.test(c.violation_number || ''));
  const total = rows.reduce((s: number, c: any) => s + Number(c.amount || 0), 0);
  const recovered = rows.reduce((s: number, c: any) => s + Number(c.check_amount || 0), 0);
  const link = (x: any) => <a key={x.id} href={x.url} target="_blank" rel="noreferrer" className="block truncate underline">{x.file_name || x.kind}</a>;

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8 font-[family-name:var(--font-display)]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-2xl font-medium text-[#13302a]">Refund tracker</h1>
        <div className="flex gap-6 text-sm">
          <div><span className="text-[#6b7480]">Violations </span><b>{rows.length}</b></div>
          <div><span className="text-[#6b7480]">Owed (est.) </span><b>{usd(total)}</b></div>
          <div><span className="text-[#6b7480]">Checks received </span><b>{usd(recovered)}</b></div>
        </div>
      </div>
      <div className="mt-6 overflow-x-auto rounded border border-[#e3e0d8] bg-white">
        <table className="w-full min-w-[1400px] text-[12px]">
          <thead className="bg-[#f4efe6] text-left text-[11px] uppercase tracking-wide text-[#6b7480]">
            <tr>
              <th className="p-2">Violation</th><th className="p-2">Date</th><th className="p-2">Respondent</th>
              <th className="p-2 text-right">Penalty</th><th className="p-2 text-right">Paid</th><th className="p-2 text-right">Owed</th>
              <th className="p-2">Claim #</th><th className="p-2">Status / filed</th><th className="p-2">PPU1</th><th className="p-2">Proof of payment</th>
              <th className="p-2">Refund check (issued · # · amount · received · forwarded)</th><th className="p-2">Files</th><th className="p-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c: any) => {
              const ds = byClaim.get(c.id) || [];
              const ppu = ds.filter((x) => x.kind === 'ppu1');
              const pop = ds.filter((x) => x.kind === 'proof_of_payment');
              const other = ds.filter((x) => !['ppu1', 'proof_of_payment'].includes(x.kind));
              const form = `f-${c.id}`;
              return (
                <tr key={c.id} className="border-t border-[#eee9df] align-top">
                  <td className="p-2 font-mono">{c.violation_number}</td>
                  <td className="p-2 whitespace-nowrap">{d(c.violation_date)}</td>
                  <td className="p-2">{c.respondent_name}</td>
                  <td className="p-2 text-right">{usd(c.penalty_imposed)}</td>
                  <td className="p-2 text-right">{usd(c.amount_paid)}</td>
                  <td className="p-2 text-right font-semibold">{usd(c.amount)}</td>
                  <td className="p-2 font-mono">{c.claim_code || '—'}</td>
                  <td className="p-2">
                    <form id={form} action={save}><input type="hidden" name="id" value={c.id} /></form>
                    <select form={form} name="status" defaultValue={c.status} className={inp}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
                    <input form={form} type="date" name="filed_at" defaultValue={c.filed_at ? String(c.filed_at).slice(0, 10) : ''} className={`${inp} mt-1`} title="Filed with agency" />
                    {c.filed_by && <div className="mt-1 text-[10px] text-[#6b7480]">{c.filed_by}</div>}
                  </td>
                  <td className="p-2 max-w-[120px]">
                    {ppu.map(link)}
                    {!ppu.length && hasInfo.has(c.id) && <a href={`/api/admin/claims/${c.id}/ppu1`} target="_blank" className="underline">{c.refund_request_signed_at ? 'Signed PPU1' : 'Draft PPU1'}</a>}
                    {!ppu.length && !hasInfo.has(c.id) && '—'}
                  </td>
                  <td className="p-2 max-w-[140px]">{pop.length ? pop.map(link) : '—'}</td>
                  <td className="p-2">
                    <div className="grid w-[300px] grid-cols-5 gap-1">
                      <input form={form} type="date" name="check_issued_on" defaultValue={c.check_issued_on || ''} className={inp} title="Issued" />
                      <input form={form} name="check_number" defaultValue={c.check_number || ''} placeholder="#" className={inp} />
                      <input form={form} name="check_amount" defaultValue={c.check_amount ?? ''} placeholder="$" className={inp} />
                      <input form={form} type="date" name="check_received_on" defaultValue={c.check_received_on || ''} className={inp} title="Received" />
                      <input form={form} type="date" name="check_forwarded_on" defaultValue={c.check_forwarded_on || ''} className={inp} title="Forwarded" />
                    </div>
                    <button form={form} className="mt-1 rounded bg-[#13302a] px-2 py-0.5 text-[11px] text-white">Save</button>
                  </td>
                  <td className="p-2 max-w-[160px]">{other.map(link)}<Attach id={c.id} /></td>
                  <td className="p-2 max-w-[280px] text-[11px] text-[#4a5550]">{c.admin_notes}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

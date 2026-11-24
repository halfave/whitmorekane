import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { admin, BUCKET } from '@/lib/server';
import { requireAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false } };

const usd = (n: any) => Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const inp = 'mt-1 w-full rounded border border-[#cfcac0] px-2 py-1.5 text-sm';
const card = 'rounded-lg border border-[#e3e0d8] bg-white p-5';
const STATUSES = ['sent', 'viewed', 'signed', 'info_submitted', 'filed', 'paid', 'closed', 'declined'];
const KINDS: Record<string, string> = {
  refund_received: 'Refund received by owner',
  offset_applied: 'Credit offset by agency',
  fee_invoiced: 'Fee invoiced',
  fee_paid: 'Fee paid to us',
  fee_waived: 'Fee waived',
};

async function updateClaim(f: FormData) {
  'use server';
  await requireAdmin();
  const id = String(f.get('id'));
  const status = String(f.get('status'));
  const patch: any = { status, admin_notes: String(f.get('admin_notes') || '') || null };
  if (status === 'filed') patch.filed_at = new Date().toISOString();
  await admin.from('claims').update(patch).eq('id', id);
  revalidatePath(`/admin/claims/${id}`);
}

async function addPayment(f: FormData) {
  'use server';
  await requireAdmin();
  const id = String(f.get('id'));
  const amount = Number(String(f.get('amount') || '').replace(/[$,]/g, ''));
  if (!amount) redirect(`/admin/claims/${id}`);
  await admin.from('payments').insert({
    claim_id: id,
    kind: String(f.get('kind')),
    amount,
    occurred_on: String(f.get('occurred_on') || '') || undefined,
    method: String(f.get('method') || '') || null,
    reference: String(f.get('reference') || '') || null,
    notes: String(f.get('notes') || '') || null,
  });
  revalidatePath(`/admin/claims/${id}`);
  revalidatePath('/admin');
}

async function invoiceFee(f: FormData) {
  'use server';
  await requireAdmin();
  const id = String(f.get('id'));
  const { data: c } = await admin.from('claims').select('fee_pct').eq('id', id).single();
  const { data: l } = await admin.from('claim_ledger').select('*').eq('claim_id', id).single();
  const fee = Math.round(Number(l?.refunded || 0) * Number(c?.fee_pct || 0)) / 100;
  if (fee > 0) await admin.from('payments').insert({ claim_id: id, kind: 'fee_invoiced', amount: fee, notes: `${c?.fee_pct}% of ${usd(l?.refunded)}` });
  revalidatePath(`/admin/claims/${id}`);
}

async function deletePayment(f: FormData) {
  'use server';
  await requireAdmin();
  const id = String(f.get('id'));
  await admin.from('payments').delete().eq('id', String(f.get('payment_id'))).eq('claim_id', id);
  revalidatePath(`/admin/claims/${id}`);
}

export default async function ClaimAdmin({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [{ data: c }, { data: auths }, { data: info }, { data: docs }, { data: pays }, { data: l }] = await Promise.all([
    admin.from('claims').select('*').eq('id', id).maybeSingle(),
    admin.from('authorizations').select('*').eq('claim_id', id).order('signed_at'),
    admin.from('claimant_info').select('*').eq('claim_id', id).maybeSingle(),
    admin.from('documents').select('*').eq('claim_id', id).order('uploaded_at'),
    admin.from('payments').select('*').eq('claim_id', id).order('occurred_on'),
    admin.from('claim_ledger').select('*').eq('claim_id', id).maybeSingle(),
  ]);
  if (!c) notFound();

  const links = await Promise.all((docs || []).map(async (d: any) => {
    const { data } = await admin.storage.from(BUCKET).createSignedUrl(d.storage_path, 300);
    return { ...d, url: data?.signedUrl };
  }));
  const feeDue = Number(l?.fee_invoiced || 0) - Number(l?.fee_paid || 0) - Number(l?.fee_waived || 0);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="grid gap-5">
      <Link href="/admin" className="text-sm underline">← All claims</Link>

      <div className={card}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-2xl font-medium uppercase text-[#13302a]">{c.violation_number || c.summons_numbers?.join(', ')}</h1>
          <div className="font-mono text-sm">Code {c.claim_code}{c.respondent_zip ? ` · ZIP ${c.respondent_zip}` : ''}</div>
        </div>
        <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
          <div><dt className="inline text-[#6b7480]">Owner: </dt><dd className="inline">{c.respondent_name}</dd></div>
          <div><dt className="inline text-[#6b7480]">Owner address: </dt><dd className="inline">{c.respondent_address || '—'}</dd></div>
          <div><dt className="inline text-[#6b7480]">Property: </dt><dd className="inline">{c.property_address || '—'}</dd></div>
          <div><dt className="inline text-[#6b7480]">Agency: </dt><dd className="inline">{c.agency_name}</dd></div>
          <div><dt className="inline text-[#6b7480]">Penalty / paid: </dt><dd className="inline">{usd(c.penalty_imposed)} / {usd(c.amount_paid)}</dd></div>
          <div><dt className="inline text-[#6b7480]">Credit owed: </dt><dd className="inline font-semibold">{usd(c.amount)}</dd></div>
          <div><dt className="inline text-[#6b7480]">Fee: </dt><dd className="inline">{Number(c.fee_pct)}%</dd></div>
          <div><dt className="inline text-[#6b7480]">Filed: </dt><dd className="inline">{c.filed_at ? new Date(c.filed_at).toLocaleDateString() : '—'}</dd></div>
          <div><dt className="inline text-[#6b7480]">Refund request signed: </dt><dd className="inline">{c.refund_request_signed_at ? `${new Date(c.refund_request_signed_at).toLocaleString()} by ${c.refund_request_signer || '—'} (IP ${c.refund_request_ip || '—'})` : '—'}</dd></div>
        </dl>
        {info && (
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <a href={`/api/admin/claims/${c.id}/ppu1`} target="_blank" rel="noreferrer" className="rounded border border-[#13302a] px-3 py-1.5">
              {c.refund_request_signed_at ? 'Download signed PPU1' : 'Preview PPU1 (unsigned)'}
            </a>
            {c.refund_request_signed_at && (
              <a className="rounded border border-[#13302a] px-3 py-1.5"
                href={`mailto:penaltyprocessing@oath.nyc.gov?cc=ClerksOffice@oath.nyc.gov&subject=${encodeURIComponent(`Refund Request – ${c.respondent_name} – Summons ${c.violation_number}`)}&body=${encodeURIComponent(`Dear Penalty Processing Unit,\n\nOn behalf of respondent ${c.respondent_name}, attached is a signed refund request (PPU1) for summons ${c.violation_number}, with proof of payment and the signer's ID.\n\nPenalty imposed: ${usd(c.penalty_imposed)}\nAmount paid: ${usd(c.amount_paid)}\nCredit requested: ${usd(c.amount)}\n\nThank you,\nWhitmore Kane & Associates\nclaims@whitmorekane.com`)}`}>
                Draft email to OATH
              </a>
            )}
          </div>
        )}
        <form action={updateClaim} className="mt-4 grid gap-3 sm:grid-cols-[180px_1fr_auto] sm:items-end">
          <input type="hidden" name="id" value={c.id} />
          <label className="text-xs">Status
            <select name="status" defaultValue={c.status} className={inp}>{STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}</select>
          </label>
          <label className="text-xs">Internal notes<input name="admin_notes" defaultValue={c.admin_notes || ''} className={inp} /></label>
          <button className="rounded bg-[#13302a] px-4 py-2 text-sm text-white">Save</button>
        </form>
      </div>

      <div className={card}>
        <h2 className="text-lg font-medium uppercase text-[#13302a]">Money</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div><div className="text-xs text-[#6b7480]">Refunded</div>{usd(l?.refunded)}</div>
          <div><div className="text-xs text-[#6b7480]">Offset by agency</div>{usd(l?.offset)}</div>
          <div><div className="text-xs text-[#6b7480]">Fee invoiced</div>{usd(l?.fee_invoiced)}</div>
          <div><div className="text-xs text-[#6b7480]">Fee outstanding</div><span className={feeDue > 0 ? 'font-semibold text-amber-800' : ''}>{usd(feeDue)}</span></div>
        </div>
        <table className="mt-4 w-full text-sm">
          <tbody>
            {(pays || []).map((p: any) => (
              <tr key={p.id} className="border-t border-[#e3e0d8]">
                <td className="py-2 pr-2">{p.occurred_on}</td>
                <td className="py-2 pr-2">{KINDS[p.kind]}</td>
                <td className="py-2 pr-2 text-right">{usd(p.amount)}</td>
                <td className="py-2 pr-2 text-xs text-[#6b7480]">{[p.method, p.reference, p.notes].filter(Boolean).join(' · ')}</td>
                <td className="py-2 text-right">
                  <form action={deletePayment}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="payment_id" value={p.id} /><button className="text-xs underline">Remove</button></form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <form action={addPayment} className="mt-4 grid gap-2 sm:grid-cols-6 sm:items-end">
          <input type="hidden" name="id" value={c.id} />
          <label className="text-xs sm:col-span-2">Entry<select name="kind" className={inp}>{Object.entries(KINDS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
          <label className="text-xs">Amount<input name="amount" required className={inp} /></label>
          <label className="text-xs">Date<input name="occurred_on" type="date" defaultValue={today} className={inp} /></label>
          <label className="text-xs">Method / ref<input name="reference" placeholder="check #, Zelle…" className={inp} /></label>
          <button className="rounded border border-[#13302a] px-3 py-1.5 text-sm">Add</button>
        </form>
        {Number(l?.refunded || 0) > 0 && (
          <form action={invoiceFee} className="mt-3">
            <input type="hidden" name="id" value={c.id} />
            <button className="text-sm underline">Invoice {Number(c.fee_pct)}% of refunded amount</button>
          </form>
        )}
      </div>

      <div className={card}>
        <h2 className="text-lg font-medium uppercase text-[#13302a]">Authorization</h2>
        {auths?.length ? auths.map((a: any) => (
          <p key={a.id} className="mt-2 text-sm">
            Signed by <b>{a.signer_name}</b>{a.signer_title ? `, ${a.signer_title}` : ''} ({a.signer_email}) on {new Date(a.signed_at).toLocaleString()} · IP {a.ip || '—'} · agreement v{a.agreement_version} · <span className="font-mono text-xs">{a.agreement_sha256.slice(0, 12)}</span>
          </p>
        )) : <p className="mt-2 text-sm text-[#6b7480]">Not signed yet.</p>}
      </div>

      <div className={card}>
        <h2 className="text-lg font-medium uppercase text-[#13302a]">Claimant info</h2>
        {info ? (
          <dl className="mt-2 grid gap-1 text-sm">
            <div><dt className="inline text-[#6b7480]">Entity: </dt><dd className="inline">{info.entity_name}</dd></div>
            <div><dt className="inline text-[#6b7480]">Contact: </dt><dd className="inline">{info.contact_name}{info.contact_title ? `, ${info.contact_title}` : ''} · {info.email} · {info.phone || '—'}</dd></div>
            <div><dt className="inline text-[#6b7480]">Check mailing address: </dt><dd className="inline">{info.mailing_address}</dd></div>
            <div><dt className="inline text-[#6b7480]">Paid by owner: </dt><dd className="inline">{info.paid_by_respondent === false ? `No — ${info.payer_name || 'unknown payer'}` : info.paid_by_respondent ? 'Yes' : 'Not sure'}</dd></div>
            <div><dt className="inline text-[#6b7480]">Refund reason: </dt><dd className="inline">{info.refund_reason}{info.reason_explain ? ` — ${info.reason_explain}` : ''}</dd></div>
            <div><dt className="inline text-[#6b7480]">Payment confirmation: </dt><dd className="inline">
              {info.pay_unknown ? <b className="text-amber-800">Owner can’t find it — request payment record from agency</b>
                : [info.pay_receipt_number, info.pay_date, info.pay_amount != null ? usd(info.pay_amount) : null, info.pay_method, info.pay_last4 ? `…${info.pay_last4}` : null].filter(Boolean).join(' · ') || '—'}
            </dd></div>
            {info.notes && <div><dt className="inline text-[#6b7480]">Notes: </dt><dd className="inline">{info.notes}</dd></div>}
          </dl>
        ) : <p className="mt-2 text-sm text-[#6b7480]">Not submitted yet.</p>}
        <h3 className="mt-4 text-sm font-medium">Documents</h3>
        <ul className="mt-1 text-sm">
          {links.length ? links.map((d) => (
            <li key={d.id}><span className="text-[#6b7480]">{d.kind.replace(/_/g, ' ')}:</span> <a className="underline" href={d.url} target="_blank" rel="noreferrer">{d.file_name || 'file'}</a></li>
          )) : <li className="text-[#6b7480]">None yet.</li>}
        </ul>
      </div>
    </div>
  );
}

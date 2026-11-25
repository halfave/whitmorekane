import Link from 'next/link';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { admin } from '@/lib/server';
import { requireAdmin, clearAdminCookie } from '@/lib/admin';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false } };

const usd = (n: number) => Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const inp = 'mt-1 w-full rounded border border-[#cfcac0] px-2 py-1.5 text-sm';

async function createClaim(f: FormData) {
  'use server';
  await requireAdmin();
  const g = (k: string) => String(f.get(k) || '').trim();
  const num = (k: string) => (g(k) ? Number(g(k).replace(/[$,]/g, '')) : null);
  const violation = g('violation_number').toUpperCase();
  const { data, error } = await admin.from('claims').insert({
    claim_code: null,
    violation_number: violation,
    summons_numbers: [violation],
    respondent_name: g('respondent_name'),
    respondent_address: g('respondent_address') || null,
    respondent_zip: g('respondent_zip') || null,
    property_address: g('property_address') || null,
    agency_name: g('agency_name') || 'OATH Hearings Division',
    penalty_imposed: num('penalty_imposed'),
    amount_paid: num('amount_paid'),
    amount: num('amount') ?? 0,
    fee_pct: num('fee_pct') ?? 15,
  }).select('id').single();
  if (error) redirect(`/admin?e=${encodeURIComponent(error.message)}`);
  revalidatePath('/admin');
  redirect(`/admin/claims/${data!.id}`);
}

async function logout() {
  'use server';
  await clearAdminCookie();
  redirect('/admin/login');
}

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  await requireAdmin();
  const { e } = await searchParams;
  const [{ data: claims }, { data: ledger }] = await Promise.all([
    admin.from('claims').select('*').order('created_at', { ascending: false }),
    admin.from('claim_ledger').select('*'),
  ]);
  const L = new Map((ledger || []).map((r: any) => [r.claim_id, r]));
  const t = (claims || []).reduce((a: any, c: any) => {
    const l: any = L.get(c.id) || {};
    a.open += Number(c.amount); a.refunded += Number(l.refunded || 0);
    a.feeDue += Number(l.fee_invoiced || 0) - Number(l.fee_paid || 0) - Number(l.fee_waived || 0);
    a.feePaid += Number(l.fee_paid || 0);
    return a;
  }, { open: 0, refunded: 0, feeDue: 0, feePaid: 0 });

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium uppercase text-[#13302a]">Claims</h1>
        <form action={logout}><button className="text-sm underline">Sign out</button></form>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[['Credits tracked', t.open], ['Refunded to owners', t.refunded], ['Fees outstanding', t.feeDue], ['Fees collected', t.feePaid]].map(([k, v]) => (
          <div key={k as string} className="rounded-lg border border-[#e3e0d8] bg-white p-4">
            <div className="text-xs text-[#6b7480]">{k}</div>
            <div className="mt-1 text-xl font-semibold">{usd(v as number)}</div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-[#e3e0d8] bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[#f1efe9] text-left text-xs text-[#6b7480]">
            <tr><th className="p-3">Violation</th><th className="p-3">Owner</th><th className="p-3">Code</th><th className="p-3 text-right">Credit</th><th className="p-3">Status</th><th className="p-3 text-right">Refunded</th><th className="p-3 text-right">Fee paid</th></tr>
          </thead>
          <tbody>
            {(claims || []).map((c: any) => {
              const l: any = L.get(c.id) || {};
              return (
                <tr key={c.id} className="border-t border-[#e3e0d8]">
                  <td className="p-3"><Link className="underline" href={`/admin/claims/${c.id}`}>{c.violation_number || c.summons_numbers?.join(', ')}</Link></td>
                  <td className="p-3">{c.respondent_name}</td>
                  <td className="p-3 font-mono">{c.claim_code || '—'}</td>
                  <td className="p-3 text-right">{usd(c.amount)}</td>
                  <td className="p-3">{c.status.replace('_', ' ')}</td>
                  <td className="p-3 text-right">{usd(l.refunded)}</td>
                  <td className="p-3 text-right">{usd(l.fee_paid)}</td>
                </tr>
              );
            })}
            {!claims?.length && <tr><td className="p-3 text-[#6b7480]" colSpan={7}>No claims yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <form action={createClaim} className="rounded-lg border border-[#e3e0d8] bg-white p-5">
        <h2 className="text-lg font-medium uppercase text-[#13302a]">New claim (one per violation)</h2>
        {e && <p className="mt-2 text-sm text-red-700">{e}</p>}
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <label className="text-xs">Violation number*<input name="violation_number" required className={inp} /></label>
          <label className="text-xs sm:col-span-2">Respondent (as on summons)*<input name="respondent_name" required className={inp} /></label>
          <label className="text-xs sm:col-span-2">Respondent mailing address<input name="respondent_address" className={inp} /></label>
          <label className="text-xs">Respondent ZIP (unlocks claim)<input name="respondent_zip" className={inp} /></label>
          <label className="text-xs sm:col-span-2">Property address<input name="property_address" className={inp} /></label>
          <label className="text-xs">Agency<input name="agency_name" defaultValue="OATH Hearings Division" className={inp} /></label>
          <label className="text-xs">Penalty imposed<input name="penalty_imposed" className={inp} /></label>
          <label className="text-xs">Amount paid<input name="amount_paid" className={inp} /></label>
          <label className="text-xs">Credit owed*<input name="amount" required className={inp} /></label>
          <label className="text-xs">Fee %<input name="fee_pct" defaultValue="15" className={inp} /></label>
        </div>
        <button className="mt-4 rounded bg-[#13302a] px-4 py-2 text-sm text-white">Create claim and code</button>
      </form>
    </div>
  );
}

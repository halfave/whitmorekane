import { redirect } from 'next/navigation';
import { admin, BUCKET } from '@/lib/server';
import { isAdmin } from '@/lib/admin';
import Tracker from './Tracker';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Refund tracker', robots: { index: false, follow: false } };

export default async function Sushi() {
  if (!(await isAdmin())) redirect('/admin/login?next=/sushi');
  const [{ data: claims }, { data: docs }, { data: infos }] = await Promise.all([
    admin.from('claims').select('*'),
    admin.from('documents').select('*').order('uploaded_at'),
    admin.from('claimant_info').select('claim_id'),
  ]);
  const hasInfo = new Set((infos || []).map((x: any) => x.claim_id));
  const files = await Promise.all((docs || []).map(async (x: any) => {
    const { data } = await admin.storage.from(BUCKET).createSignedUrl(x.storage_path, 3600);
    return { id: x.id, claim_id: x.claim_id, kind: x.kind, name: x.file_name || x.kind, url: data?.signedUrl || '' };
  }));
  const rows = (claims || [])
    .filter((c: any) => !/^TEST/.test(c.violation_number || ''))
    .map((c: any) => ({
      id: c.id, violation: c.violation_number, date: c.violation_date, respondent: c.respondent_name,
      agency: c.issuing_agency || 'DOB', property: c.property_address, feePct: Number(c.fee_pct ?? 15), penalty: c.penalty_imposed, paid: c.amount_paid, owed: c.amount,
      code: c.claim_code, zip: c.respondent_zip, status: c.status, filedAt: c.filed_at, filedBy: c.filed_by,
      ppuDraft: hasInfo.has(c.id), ppuSigned: !!c.refund_request_signed_at,
      check: { issued: c.check_issued_on, number: c.check_number, amount: c.check_amount, received: c.check_received_on, forwarded: c.check_forwarded_on },
      files: files.filter((f) => f.claim_id === c.id),
    }));
  return <Tracker rows={rows} />;
}

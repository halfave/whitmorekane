import { NextRequest, NextResponse } from 'next/server';
import { admin, loadClaim, isSigned } from '@/lib/server';

export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const b = await req.json();
  const claim = await loadClaim(code, b.zip);
  if (!claim || !isSigned(claim.status)) return NextResponse.json({ error: 'Sign the authorization first.' }, { status: 403 });

  const req_ = ['entityName', 'contactName', 'email', 'mailingAddress'];
  if (req_.some((k) => !String(b[k] || '').trim())) return NextResponse.json({ error: 'Please complete all required fields.' }, { status: 400 });

  const { count } = await admin.from('documents').select('id', { count: 'exact', head: true })
    .eq('claim_id', claim.id).in('kind', ['photo_id', 'proof_of_payment']);
  if ((count || 0) < 2) return NextResponse.json({ error: 'Upload a photo ID and proof of payment.' }, { status: 400 });

  const { error } = await admin.from('claimant_info').upsert({
    claim_id: claim.id,
    entity_name: b.entityName,
    contact_name: b.contactName,
    contact_title: b.contactTitle || null,
    phone: b.phone || null,
    email: b.email,
    mailing_address: b.mailingAddress,
    paid_by_respondent: b.paidByRespondent ?? null,
    payer_name: b.payerName || null,
    notes: b.notes || null,
    submitted_at: new Date().toISOString(),
  });
  if (error) return NextResponse.json({ error: 'Could not save your information.' }, { status: 500 });

  await admin.from('claims').update({ status: 'info_submitted' }).eq('id', claim.id).in('status', ['signed']);
  return NextResponse.json({ ok: true });
}

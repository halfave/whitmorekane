import { NextRequest, NextResponse } from 'next/server';
import { admin, loadClaim, isSigned, publicView } from '@/lib/server';

export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const b = await req.json();
  const claim = await loadClaim(code, b.zip);
  if (!claim || !isSigned(claim.status)) return NextResponse.json({ error: 'Sign the authorization first.' }, { status: 403 });
  if (claim.refund_request_signed_at) return NextResponse.json({ error: 'Your refund request is already signed. Email us to make changes.' }, { status: 409 });

  const s = (k: string) => String(b[k] ?? '').trim();
  if (!s('entityName')) return NextResponse.json({ error: 'Please enter the owner or company name.' }, { status: 400 });
  // Contact = whoever signed the authorization; they already gave name, title and email.
  const { data: auths } = await admin.from('authorizations').select('signer_name,signer_title,signer_email')
    .eq('claim_id', claim.id).order('signed_at', { ascending: false }).limit(1);
  const signer = auths?.[0];
  if (!signer) return NextResponse.json({ error: 'Sign the authorization first.' }, { status: 403 });
  const payUnknown = !!b.payUnknown;
  const { data: docs } = await admin.from('documents').select('kind').eq('claim_id', claim.id);
  const kinds = new Set((docs || []).map((d: any) => d.kind));
  if (!payUnknown && !kinds.has('proof_of_payment')) {
    return NextResponse.json({ error: 'Upload a payment document, or tick “I can’t find it.”' }, { status: 400 });
  }

  const amt = s('payAmount').replace(/[$,]/g, '');
  const { error } = await admin.from('claimant_info').upsert({
    claim_id: claim.id,
    entity_name: s('entityName'),
    contact_name: signer.signer_name,
    contact_title: signer.signer_title || null,
    phone: s('phone') || null,
    email: signer.signer_email,
    paid_by_respondent: b.paidBy === 'yes' ? true : b.paidBy === 'no' ? false : null,
    payer_name: s('payerName') || null,
    notes: s('notes') || null,
    pay_receipt_number: s('payReceiptNumber') || null,
    pay_date: s('payDate') || null,
    pay_amount: amt ? Number(amt) : null,
    pay_method: s('payMethod') || null,
    pay_last4: s('payLast4').replace(/\D/g, '').slice(-4) || null,
    pay_unknown: payUnknown,
    submitted_at: new Date().toISOString(),
  });
  if (error) return NextResponse.json({ error: 'Could not save your information.' }, { status: 500 });
  return NextResponse.json(await publicView(claim));
}

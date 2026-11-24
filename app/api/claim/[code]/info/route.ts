import { NextRequest, NextResponse } from 'next/server';
import { admin, loadClaim, isSigned, publicView } from '@/lib/server';

const REASONS = ['overpayment', 'duplicate', 'wrong_summons', 'dismissed', 'paid_in_error', 'other'];

export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const b = await req.json();
  const claim = await loadClaim(code, b.zip);
  if (!claim || !isSigned(claim.status)) return NextResponse.json({ error: 'Sign the authorization first.' }, { status: 403 });
  if (claim.refund_request_signed_at) return NextResponse.json({ error: 'Your refund request is already signed. Email us to make changes.' }, { status: 409 });

  const s = (k: string) => String(b[k] ?? '').trim();
  if (['entityName', 'contactName', 'email', 'mailingAddress'].some((k) => !s(k))) {
    return NextResponse.json({ error: 'Please complete all required fields.' }, { status: 400 });
  }
  const payUnknown = !!b.payUnknown;
  if (!payUnknown && !s('payDate') && !s('payReceiptNumber')) {
    return NextResponse.json({ error: 'Enter your payment date or receipt number, or tick “I can’t find it.”' }, { status: 400 });
  }

  const { data: docs } = await admin.from('documents').select('kind').eq('claim_id', claim.id);
  const kinds = new Set((docs || []).map((d: any) => d.kind));
  if (!kinds.has('photo_id')) return NextResponse.json({ error: 'Upload a photo ID for the signer.' }, { status: 400 });
  if (!payUnknown && !kinds.has('proof_of_payment')) {
    return NextResponse.json({ error: 'Upload your payment confirmation, or tick “I can’t find it.”' }, { status: 400 });
  }

  const reason = REASONS.includes(b.refundReason) ? b.refundReason : 'overpayment';
  const amt = s('payAmount').replace(/[$,]/g, '');
  const { error } = await admin.from('claimant_info').upsert({
    claim_id: claim.id,
    entity_name: s('entityName'),
    contact_name: s('contactName'),
    contact_title: s('contactTitle') || null,
    phone: s('phone') || null,
    email: s('email'),
    mailing_address: s('mailingAddress'),
    paid_by_respondent: b.paidBy === 'yes' ? true : b.paidBy === 'no' ? false : null,
    payer_name: s('payerName') || null,
    notes: s('notes') || null,
    refund_reason: reason,
    reason_explain: s('reasonExplain') || null,
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

import { NextRequest, NextResponse } from 'next/server';
import { admin, loadClaim, publicView, isSigned } from '@/lib/server';
import { agreementText, AGREEMENT_VERSION, sha256 } from '@/lib/agreement';

export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const b = await req.json();
  const claim = await loadClaim(code, b.zip);
  if (!claim) return NextResponse.json({ error: 'Claim not found.' }, { status: 404 });
  if (isSigned(claim.status)) return NextResponse.json(await publicView(claim));

  const name = String(b.signerName || '').trim();
  const email = String(b.signerEmail || '').trim();
  const png = String(b.signaturePng || '');
  if (!name || !email || !b.accept) return NextResponse.json({ error: 'Name, email and acceptance are required.' }, { status: 400 });
  if (!png.startsWith('data:image/png;base64,') || png.length > 300_000) return NextResponse.json({ error: 'Please draw your signature.' }, { status: 400 });

  const text = agreementText({ respondent: claim.respondent_name, amount: Number(claim.amount), feePct: Number(claim.fee_pct) });
  const { error } = await admin.from('authorizations').insert({
    claim_id: claim.id,
    agreement_version: AGREEMENT_VERSION,
    agreement_sha256: await sha256(text),
    signer_name: name,
    signer_title: b.signerTitle || null,
    signer_email: email,
    typed_signature: name,
    signature_png: png,
    ip: req.headers.get('x-forwarded-for')?.split(',')[0] || null,
    user_agent: req.headers.get('user-agent'),
  });
  if (error) return NextResponse.json({ error: 'Could not save your signature. Please try again.' }, { status: 500 });

  await admin.from('claims').update({ status: 'signed' }).eq('id', claim.id);
  claim.status = 'signed';
  return NextResponse.json(await publicView(claim));
}

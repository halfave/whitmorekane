import { NextRequest, NextResponse } from 'next/server';
import { admin, loadClaim, publicView, isSigned, BUCKET } from '@/lib/server';
import { agreementText, AGREEMENT_VERSION, sha256 } from '@/lib/agreement';
import { ESIGN_VERSION } from '@/lib/esign';
import { agreementPdf } from '@/lib/agreementPdf';
import { sendMail } from '@/lib/mail';

export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const b = await req.json();
  const claim = await loadClaim(code, b.zip);
  if (!claim) return NextResponse.json({ error: 'Claim not found.' }, { status: 404 });
  if (isSigned(claim.status)) return NextResponse.json(await publicView(claim));

  const name = String(b.signerName || '').trim();
  const email = String(b.signerEmail || '').trim().toLowerCase();
  const png = String(b.signaturePng || '');
  if (!name || !email || !b.accept || !b.esignConsent) return NextResponse.json({ error: 'Name, email and both confirmations are required.' }, { status: 400 });
  if (!png.startsWith('data:image/png;base64,') || png.length > 300_000) return NextResponse.json({ error: 'Please draw your signature.' }, { status: 400 });

  // The email must have been confirmed with a one-time code in the last hour.
  const { data: v } = await admin.from('email_codes').select('verified_at').eq('claim_id', claim.id).eq('email', email)
    .not('verified_at', 'is', null).gte('verified_at', new Date(Date.now() - 3600_000).toISOString())
    .order('verified_at', { ascending: false }).limit(1);
  const verifiedAt = v?.[0]?.verified_at;
  if (!verifiedAt) return NextResponse.json({ error: 'Please confirm your email with the code we sent.' }, { status: 403 });

  const text = agreementText({ respondent: claim.respondent_name, amount: Number(claim.amount || 0), feePct: Number(claim.fee_pct) });
  const hash = await sha256(text);
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || null;
  const ua = req.headers.get('user-agent');
  const now = new Date();
  const { data: auth, error } = await admin.from('authorizations').insert({
    claim_id: claim.id,
    agreement_version: AGREEMENT_VERSION,
    agreement_sha256: hash,
    agreement_text: text,
    signer_name: name,
    signer_title: b.signerTitle || null,
    signer_email: email,
    typed_signature: name,
    signature_png: png,
    ip, user_agent: ua,
    esign_consent_at: now.toISOString(),
    esign_disclosure_version: ESIGN_VERSION,
    email_verified_at: verifiedAt,
  }).select('id, signed_at').single();
  if (error || !auth) return NextResponse.json({ error: 'Could not save your signature. Please try again.' }, { status: 500 });

  await admin.from('claims').update({ status: 'signed' }).eq('id', claim.id);
  claim.status = 'signed';

  // Signed copy: stored privately and emailed to the signer.
  try {
    const bytes = await agreementPdf({
      text, signerName: name, signerTitle: b.signerTitle || null, signerEmail: email, signaturePng: png,
      signedAt: new Date(auth.signed_at || now), ip, userAgent: ua, sha256: hash, version: AGREEMENT_VERSION,
      claimCode: claim.claim_code, esignVersion: ESIGN_VERSION, emailVerifiedAt: new Date(verifiedAt),
    });
    const file = `Whitmore-Kane-Agreement-${claim.claim_code}.pdf`;
    const path = `${claim.id}/other/${Date.now()}-${file}`;
    const up = await admin.storage.from(BUCKET).upload(path, Buffer.from(bytes), { contentType: 'application/pdf' });
    if (!up.error) await admin.from('documents').insert({ claim_id: claim.id, kind: 'other', storage_path: path, file_name: file });
    const sent = await sendMail({
      to: email,
      subject: `Your signed agreement – claim ${claim.claim_code}`,
      text: `Hi ${name},\n\nThanks for signing. Your signed recovery agreement for ${claim.respondent_name} is attached. Keep it for your records.\n\nNext, return to your claim page to finish the remaining steps.\n\nYou can cancel at no cost until we file your refund request: email claims@whitmorekane.com with your claim code.\n\nWhitmore Kane\nclaims@whitmorekane.com`,
      attachments: [{ filename: file, content: bytes }],
    });
    if (sent) await admin.from('authorizations').update({ copy_emailed_at: new Date().toISOString() }).eq('id', auth.id);
  } catch { /* the signature record is saved; the copy can be resent by staff */ }

  return NextResponse.json(await publicView(claim));
}

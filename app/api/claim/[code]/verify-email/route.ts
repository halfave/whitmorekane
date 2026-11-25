import { NextRequest, NextResponse } from 'next/server';
import { createHmac, randomInt, timingSafeEqual } from 'crypto';
import { admin, loadClaim, isSigned } from '@/lib/server';
import { sendMail } from '@/lib/mail';

const h = (claimId: string, email: string, code: string) =>
  createHmac('sha256', process.env.SUPABASE_SERVICE_ROLE_KEY!).update(`${claimId}|${email}|${code}`).digest('hex');
const norm = (e: string) => String(e || '').trim().toLowerCase();

// step=send: email a 6-digit code. step=check: confirm it.
export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const b = await req.json();
  const claim = await loadClaim(code, b.zip);
  if (!claim) return NextResponse.json({ error: 'Claim not found.' }, { status: 404 });
  if (isSigned(claim.status)) return NextResponse.json({ error: 'Already signed.' }, { status: 409 });
  const email = norm(b.email);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return NextResponse.json({ error: 'Enter a valid email.' }, { status: 400 });

  if (b.step === 'send') {
    const since = new Date(Date.now() - 3600_000).toISOString();
    const { count } = await admin.from('email_codes').select('id', { count: 'exact', head: true }).eq('claim_id', claim.id).gte('created_at', since);
    if ((count || 0) >= 5) return NextResponse.json({ error: 'Too many codes sent. Try again in an hour.' }, { status: 429 });
    const otp = String(randomInt(0, 1_000_000)).padStart(6, '0');
    const { error: insErr } = await admin.from('email_codes').insert({
      claim_id: claim.id, email, code_hash: h(claim.id, email, otp), expires_at: new Date(Date.now() + 15 * 60_000).toISOString(),
    });
    if (insErr) return NextResponse.json({ error: 'Could not create a code. Please try again.' }, { status: 500 });
    const ok = await sendMail({
      to: email,
      subject: `Your Whitmore Kane code: ${otp}`,
      text: `Your verification code is ${otp}\n\nEnter it on the claim page to confirm your email before signing. It expires in 15 minutes.\n\nIf you didn't request this, ignore this email.\n\nWhitmore Kane\nclaims@whitmorekane.com`,
    });
    if (!ok) return NextResponse.json({ error: 'We could not send the code. Check the email address and try again.' }, { status: 502 });
    return NextResponse.json({ sent: true });
  }

  const otp = String(b.otp || '').replace(/\D/g, '');
  const { data: rows } = await admin.from('email_codes').select('*').eq('claim_id', claim.id).eq('email', email)
    .is('verified_at', null).gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false }).limit(1);
  const row = rows?.[0];
  if (!row) return NextResponse.json({ error: 'Code expired. Send a new one.' }, { status: 400 });
  if (row.attempts >= 5) return NextResponse.json({ error: 'Too many tries. Send a new code.' }, { status: 429 });
  const want = Buffer.from(row.code_hash), got = Buffer.from(h(claim.id, email, otp));
  if (want.length !== got.length || !timingSafeEqual(want, got)) {
    await admin.from('email_codes').update({ attempts: row.attempts + 1 }).eq('id', row.id);
    return NextResponse.json({ error: 'That code doesn’t match.' }, { status: 400 });
  }
  await admin.from('email_codes').update({ verified_at: new Date().toISOString() }).eq('id', row.id);
  return NextResponse.json({ verified: true });
}

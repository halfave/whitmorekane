import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { admin, loadClaim, isSigned, publicView, BUCKET } from '@/lib/server';
import { ppu1ForClaim } from '@/lib/packet';
import { sendMail } from '@/lib/mail';

const pdfResponse = (bytes: Uint8Array | Buffer, name: string) =>
  new NextResponse(Buffer.from(bytes), {
    headers: { 'content-type': 'application/pdf', 'content-disposition': `inline; filename="${name}"`, 'cache-control': 'no-store' },
  });

// GET: the owner's agency refund request (PPU1). Draft until signed; after signing, the frozen signed copy.
export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const claim = await loadClaim(code, req.nextUrl.searchParams.get('zip'));
  if (!claim || !isSigned(claim.status)) return NextResponse.json({ error: 'Not available.' }, { status: 403 });
  const name = `OATH-refund-request-${claim.violation_number || claim.claim_code}.pdf`;
  if (claim.refund_request_pdf_path) {
    const { data } = await admin.storage.from(BUCKET).download(claim.refund_request_pdf_path);
    if (data) return pdfResponse(Buffer.from(await data.arrayBuffer()), name);
  }
  const bytes = await ppu1ForClaim(claim.id);
  if (!bytes) return NextResponse.json({ error: 'Not available.' }, { status: 400 });
  return pdfResponse(bytes, name);
}

// POST: owner signs the refund request with the signature they drew on the agreement.
export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const b = await req.json();
  const claim = await loadClaim(code, b.zip);
  if (!claim || !isSigned(claim.status)) return NextResponse.json({ error: 'Sign the authorization first.' }, { status: 403 });
  if (!b.certify) return NextResponse.json({ error: 'Please confirm the certification.' }, { status: 400 });
  const { count } = await admin.from('claimant_info').select('claim_id', { count: 'exact', head: true }).eq('claim_id', claim.id);
  if (!count) return NextResponse.json({ error: 'Complete your information first.' }, { status: 400 });

  if (!claim.refund_request_signed_at) {
    const { data: a } = await admin.from('authorizations').select('signer_name,signer_email').eq('claim_id', claim.id).order('signed_at', { ascending: false }).limit(1);
    const patch: any = {
      refund_request_signed_at: new Date().toISOString(),
      refund_request_signer: a?.[0]?.signer_name || null,
      refund_request_ip: req.headers.get('x-forwarded-for')?.split(',')[0] || null,
      refund_request_ua: req.headers.get('user-agent'),
      status: claim.status === 'signed' ? 'info_submitted' : claim.status,
    };
    await admin.from('claims').update(patch).eq('id', claim.id);
    Object.assign(claim, patch);

    // Freeze the signed form: store the exact PDF and its fingerprint, then email a copy.
    const bytes = await ppu1ForClaim(claim.id);
    if (bytes) {
      const file = `OATH-refund-request-${claim.violation_number || claim.claim_code}-signed.pdf`;
      const path = `${claim.id}/ppu1/${Date.now()}-${file}`;
      const up = await admin.storage.from(BUCKET).upload(path, Buffer.from(bytes), { contentType: 'application/pdf' });
      if (!up.error) {
        const digest = createHash('sha256').update(Buffer.from(bytes)).digest('hex');
        await admin.from('claims').update({ refund_request_pdf_path: path, refund_request_sha256: digest }).eq('id', claim.id);
        await admin.from('documents').insert({ claim_id: claim.id, kind: 'ppu1', storage_path: path, file_name: file });
        Object.assign(claim, { refund_request_pdf_path: path, refund_request_sha256: digest });
      }
      const to = a?.[0]?.signer_email;
      if (to) {
        const sent = await sendMail({
          to,
          subject: `Your signed refund request – claim ${claim.claim_code}`,
          text: `Hi ${a?.[0]?.signer_name || ''},\n\nYour signed refund request for violation ${claim.violation_number} is attached. We'll file it with the agency and keep you posted.\n\nWhitmore Kane\nclaims@whitmorekane.com`,
          attachments: [{ filename: file, content: bytes }],
        });
        if (sent) await admin.from('claims').update({ refund_request_copy_emailed_at: new Date().toISOString() }).eq('id', claim.id);
      }
    }
  }
  return NextResponse.json(await publicView(claim));
}

import { NextRequest, NextResponse } from 'next/server';
import { admin, loadClaim, isSigned, publicView } from '@/lib/server';
import { ppu1ForClaim } from '@/lib/packet';

// GET: the owner's OATH refund request (PPU1), filled in. Unsigned until they sign it.
export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const claim = await loadClaim(code, req.nextUrl.searchParams.get('zip'));
  if (!claim || !isSigned(claim.status)) return NextResponse.json({ error: 'Not available.' }, { status: 403 });
  const bytes = await ppu1ForClaim(claim.id);
  if (!bytes) return NextResponse.json({ error: 'Complete your information first.' }, { status: 400 });
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `inline; filename="OATH-refund-request-${claim.violation_number || claim.claim_code}.pdf"`,
      'cache-control': 'no-store',
    },
  });
}

// POST: owner signs the refund request with the signature they drew on the authorization.
export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const b = await req.json();
  const claim = await loadClaim(code, b.zip);
  if (!claim || !isSigned(claim.status)) return NextResponse.json({ error: 'Sign the authorization first.' }, { status: 403 });
  if (!b.certify) return NextResponse.json({ error: 'Please confirm the certification.' }, { status: 400 });
  const { count } = await admin.from('claimant_info').select('claim_id', { count: 'exact', head: true }).eq('claim_id', claim.id);
  if (!count) return NextResponse.json({ error: 'Complete your information first.' }, { status: 400 });

  if (!claim.refund_request_signed_at) {
    const { data: a } = await admin.from('authorizations').select('signer_name').eq('claim_id', claim.id).order('signed_at', { ascending: false }).limit(1);
    const patch = {
      refund_request_signed_at: new Date().toISOString(),
      refund_request_signer: a?.[0]?.signer_name || null,
      refund_request_ip: req.headers.get('x-forwarded-for')?.split(',')[0] || null,
      status: claim.status === 'signed' ? 'info_submitted' : claim.status,
    };
    await admin.from('claims').update(patch).eq('id', claim.id);
    Object.assign(claim, patch);
  }
  return NextResponse.json(await publicView(claim));
}

import { NextRequest, NextResponse } from 'next/server';
import { admin, loadClaim, publicView } from '@/lib/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const zip = req.nextUrl.searchParams.get('zip');
  const claim = await loadClaim(code, zip);
  if (!claim) return NextResponse.json({ error: 'Claim not found. Check the code and ZIP on your letter.' }, { status: 404 });

  if (claim.status === 'sent') {
    await admin.from('claims').update({ status: 'viewed', viewed_at: new Date().toISOString() }).eq('id', claim.id);
    claim.status = 'viewed';
  }
  return NextResponse.json(publicView(claim));
}

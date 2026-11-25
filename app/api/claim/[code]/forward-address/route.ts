import { NextRequest, NextResponse } from 'next/server';
import { admin, loadClaim, publicView } from '@/lib/server';

// Asked only once the agency's check has arrived: where to mail it.
export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const b = await req.json();
  const claim = await loadClaim(code, b.zip);
  if (!claim || !['paid', 'closed'].includes(claim.status)) return NextResponse.json({ error: 'Not available yet.' }, { status: 403 });
  const addr = String(b.address || '').trim();
  if (addr.length < 8) return NextResponse.json({ error: 'Please enter a full mailing address.' }, { status: 400 });
  const { error } = await admin.from('claimant_info')
    .update({ mailing_address: addr, forward_address_at: new Date().toISOString() })
    .eq('claim_id', claim.id);
  if (error) return NextResponse.json({ error: 'Could not save your address.' }, { status: 500 });
  return NextResponse.json(await publicView(claim));
}

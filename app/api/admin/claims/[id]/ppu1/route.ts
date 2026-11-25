import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';
import { admin } from '@/lib/server';
import { ppu1ForClaim } from '@/lib/packet';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return new NextResponse('Unauthorized', { status: 401 });
  const { id } = await params;
  const bytes = await ppu1ForClaim(id);
  if (!bytes) return new NextResponse('Not found', { status: 404 });
  const { data: c } = await admin.from('claims').select('violation_number,claim_code').eq('id', id).single();
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `inline; filename="PPU1-${c?.violation_number || c?.claim_code}.pdf"`,
      'cache-control': 'no-store',
    },
  });
}

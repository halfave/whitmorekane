import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';
import { admin, BUCKET } from '@/lib/server';
import { ppu1ForClaim } from '@/lib/packet';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return new NextResponse('Unauthorized', { status: 401 });
  const { id } = await params;
  const { data: cc } = await admin.from('claims').select('refund_request_pdf_path').eq('id', id).single();
  let bytes: Uint8Array | null = null;
  if (cc?.refund_request_pdf_path) {
    const { data } = await admin.storage.from(BUCKET).download(cc.refund_request_pdf_path);
    if (data) bytes = new Uint8Array(await data.arrayBuffer());
  }
  if (!bytes) bytes = await ppu1ForClaim(id);
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

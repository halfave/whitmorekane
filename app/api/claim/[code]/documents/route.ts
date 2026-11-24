import { NextRequest, NextResponse } from 'next/server';
import { admin, loadClaim, isSigned } from '@/lib/server';

// Records a file after the browser finished uploading it.
export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const b = await req.json();
  const claim = await loadClaim(code, b.zip);
  if (!claim || !isSigned(claim.status)) return NextResponse.json({ error: 'Sign the authorization first.' }, { status: 403 });
  const path = String(b.path || '');
  if (!path.startsWith(`${claim.id}/${b.kind}/`)) return NextResponse.json({ error: 'Bad path.' }, { status: 400 });

  const { error } = await admin.from('documents').insert({
    claim_id: claim.id, kind: b.kind, storage_path: path, file_name: b.fileName || null,
  });
  if (error) return NextResponse.json({ error: 'Could not record upload.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}

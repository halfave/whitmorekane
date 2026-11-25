import { NextRequest, NextResponse } from 'next/server';
import { admin, BUCKET } from '@/lib/server';
import { isAdmin } from '@/lib/admin';

const KINDS = ['proof_of_payment', 'ppu1', 'refund_check', 'agency_letter', 'other'];
const EXT = /\.(pdf|jpg|jpeg|png|heic|webp)$/i;

// Staff only. step=url → signed upload URL; step=record → save the uploaded file's row.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  const { id } = await params;
  const b = await req.json();
  if (!KINDS.includes(b.kind)) return NextResponse.json({ error: 'Bad document type.' }, { status: 400 });
  const fileName = String(b.fileName || '');
  if (b.step === 'url') {
    if (!EXT.test(fileName)) return NextResponse.json({ error: 'PDF or image only.' }, { status: 400 });
    const path = `${id}/${b.kind}/${Date.now()}-${fileName.replace(/[^\w.\-]/g, '_')}`;
    const { data, error } = await admin.storage.from(BUCKET).createSignedUploadUrl(path);
    if (error || !data) return NextResponse.json({ error: 'Upload unavailable.' }, { status: 500 });
    return NextResponse.json({ path, token: data.token });
  }
  const path = String(b.path || '');
  if (!path.startsWith(`${id}/${b.kind}/`)) return NextResponse.json({ error: 'Bad path.' }, { status: 400 });
  const { error } = await admin.from('documents').insert({ claim_id: id, kind: b.kind, storage_path: path, file_name: fileName || null });
  if (error) return NextResponse.json({ error: 'Could not record upload.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}

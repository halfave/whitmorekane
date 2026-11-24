import { NextRequest, NextResponse } from 'next/server';
import { admin, loadClaim, isSigned, BUCKET } from '@/lib/server';

const KINDS = ['photo_id', 'proof_of_payment', 'authority', 'other'];
const EXT = /\.(pdf|jpg|jpeg|png|heic|webp)$/i;

// Returns a one-time signed upload URL into the private bucket.
export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const b = await req.json();
  const claim = await loadClaim(code, b.zip);
  if (!claim || !isSigned(claim.status)) return NextResponse.json({ error: 'Sign the authorization first.' }, { status: 403 });
  if (!KINDS.includes(b.kind)) return NextResponse.json({ error: 'Bad document type.' }, { status: 400 });
  const fileName = String(b.fileName || '');
  if (!EXT.test(fileName)) return NextResponse.json({ error: 'Upload a PDF or image.' }, { status: 400 });

  const path = `${claim.id}/${b.kind}/${Date.now()}-${fileName.replace(/[^\w.\-]/g, '_')}`;
  const { data, error } = await admin.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error || !data) return NextResponse.json({ error: 'Upload unavailable.' }, { status: 500 });
  return NextResponse.json({ path, token: data.token });
}

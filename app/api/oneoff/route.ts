// One-time import of two files for claim 035670714M. Payload is encrypted; key arrives with the request. Removed after use.
import { NextRequest, NextResponse } from 'next/server';
import { createDecipheriv, createHash } from 'crypto';
import { admin, BUCKET } from '@/lib/server';
import blobs from '@/lib/oneoff/blobs.json';

const CLAIM = '6f51fcbd-b436-4786-a162-e36deb0dd6cd';
const TOK = '908302d9b6cdde3e5b560d37fadad1d745721c32f77b9f455569adba5994d48f';

export async function GET(req: NextRequest) {
  const t = req.nextUrl.searchParams.get('t') || '', k = req.nextUrl.searchParams.get('k') || '';
  if (createHash('sha256').update(t).digest('hex') !== TOK) return NextResponse.json({ error: 'no' }, { status: 404 });
  const { data: have } = await admin.from('documents').select('kind').eq('claim_id', CLAIM);
  const done = new Set((have || []).map((x: any) => x.kind));
  const out: any[] = [];
  for (const b of blobs as any[]) {
    if (done.has(b.kind)) { out.push({ kind: b.kind, skipped: true }); continue; }
    const d = createDecipheriv('aes-256-gcm', Buffer.from(k, 'hex'), Buffer.from(b.iv, 'base64'));
    d.setAuthTag(Buffer.from(b.tag, 'base64'));
    const buf = Buffer.concat([d.update(Buffer.from(b.data, 'base64')), d.final()]);
    const path = `${CLAIM}/${b.kind}/${Date.now()}-${b.name}`;
    const up = await admin.storage.from(BUCKET).upload(path, buf, { contentType: 'application/pdf' });
    if (up.error) { out.push({ kind: b.kind, error: up.error.message }); continue; }
    const ins = await admin.from('documents').insert({ claim_id: CLAIM, kind: b.kind, storage_path: path, file_name: b.name });
    out.push({ kind: b.kind, ok: !ins.error, bytes: buf.length });
  }
  return NextResponse.json(out);
}

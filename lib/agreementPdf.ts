import 'server-only';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// Signed copy of the recovery agreement: full text, signature and audit trail.
export async function agreementPdf(p: {
  text: string; signerName: string; signerTitle?: string | null; signerEmail: string; signaturePng: string;
  signedAt: Date; ip?: string | null; userAgent?: string | null; sha256: string; version: string; claimCode: string;
  esignVersion: string; emailVerifiedAt?: Date | null;
}) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const W = 612, H = 792, M = 56, size = 10, lh = 14;
  let page = pdf.addPage([W, H]); let y = H - M;
  const ink = rgb(0.1, 0.12, 0.12);
  const line = (s: string, f = font, sz = size) => {
    if (y < M + lh) { page = pdf.addPage([W, H]); y = H - M; }
    page.drawText(s, { x: M, y, size: sz, font: f, color: ink }); y -= lh;
  };
  const wrap = (para: string, f = font, sz = size) => {
    const words = para.replace(/\t/g, ' ').split(/\s+/); let cur = '';
    for (const w of words) {
      const t = cur ? `${cur} ${w}` : w;
      if (f.widthOfTextAtSize(t, sz) > W - 2 * M) { line(cur, f, sz); cur = w; } else cur = t;
    }
    if (cur) line(cur, f, sz);
  };
  const safe = (s: string) => s.replace(/[^\x20-\x7E\n]/g, (c) => ({ '’': "'", '‘': "'", '“': '"', '”': '"', '–': '-', '—': '-', '·': '-' } as any)[c] ?? '');
  safe(p.text).split('\n').forEach((para, i) => (para.trim() ? wrap(para, i === 0 ? bold : font) : (y -= lh / 2)));

  y -= lh;
  if (y < M + 140) { page = pdf.addPage([W, H]); y = H - M; }
  line('SIGNED', bold);
  const img = await pdf.embedPng(Buffer.from(p.signaturePng.split(',')[1], 'base64'));
  const s = Math.min(200 / img.width, 50 / img.height);
  page.drawImage(img, { x: M, y: y - img.height * s, width: img.width * s, height: img.height * s }); y -= img.height * s + 6;
  line(safe(`${p.signerName}${p.signerTitle ? `, ${p.signerTitle}` : ''}`));

  y -= lh;
  line('SIGNATURE RECORD', bold, 9);
  const et = (d: Date) => d.toLocaleString('en-US', { timeZone: 'America/New_York' }) + ' ET';
  [
    `Claim: ${p.claimCode}`,
    `Signer email: ${p.signerEmail}${p.emailVerifiedAt ? ` (verified by one-time code ${et(p.emailVerifiedAt)})` : ''}`,
    `Signed: ${et(p.signedAt)}`,
    `IP address: ${p.ip || 'unknown'}`,
    `Browser: ${safe((p.userAgent || 'unknown').slice(0, 110))}`,
    `Agreement version ${p.version}; SHA-256 of text: ${p.sha256}`,
    `Consented to electronic records and signatures (disclosure version ${p.esignVersion}).`,
  ].forEach((t) => wrap(t, font, 8));
  return pdf.save();
}

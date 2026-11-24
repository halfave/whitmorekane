import 'server-only';
import { readFile } from 'fs/promises';
import path from 'path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// Coordinates are in PDF points measured from the TOP of the page (PyMuPDF convention);
// converted to pdf-lib's bottom-left origin below. Page is US Letter (612 x 792).
const H = 792;
const F = {
  requestor: [131, 243],
  phone: [171, 267],
  email: [400, 267],
  mailTo: [247, 288],
  respondent: [142, 332],
  summons: [474, 356],
  camis: [474, 384],
  explainPaid: [255, 503],
  explainOther: [104, 533],
  printName: [128, 579],
  month: [309, 641],
  day: [356, 641],
  year: [407, 641],
} as const;
const BOX: Record<string, [number, number]> = {
  duplicate: [48.7, 461.7],
  wrong_summons: [166.3, 461.7],
  overpayment: [485.2, 461.7],
  dismissed: [48.7, 493.4],
  paid_in_error: [138.5, 493.4],
  other: [48.7, 523.5],
};
const SIG = { x: 120, top: 606, w: 165, h: 40 };

export type Ppu1Input = {
  requestorName: string;
  phone?: string | null;
  email: string;
  mailingAddress: string;
  respondent: string;
  summons: string;
  reason: string;
  reasonExplain?: string | null;
  signaturePng?: string | null; // data URL
  signedAt?: Date | null;
};

function fit(text: string, max: number, font: any, size: number) {
  let s = text;
  while (s.length > 1 && font.widthOfTextAtSize(s, size) > max) s = s.slice(0, -1);
  return s;
}

export async function buildPpu1(v: Ppu1Input) {
  const tpl = await readFile(path.join(process.cwd(), 'lib/forms/ppu1-template.pdf'));
  const pdf = await PDFDocument.load(tpl);
  const page = pdf.getPage(0);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const size = 10;
  const put = (k: keyof typeof F, text: string | null | undefined, max = 300) => {
    if (!text) return;
    const [x, top] = F[k];
    page.drawText(fit(text, max, font, size), { x, y: H - top - 3, size, font, color: rgb(0.05, 0.1, 0.25) });
  };

  put('requestor', v.requestorName, 440);
  put('phone', v.phone, 120);
  put('email', v.email, 170);
  put('mailTo', v.mailingAddress.replace(/\s*\n\s*/g, ', '), 320);
  put('respondent', v.respondent, 420);
  put('summons', v.summons, 95);
  put('camis', 'N/A', 95);
  put('printName', v.requestorName, 170);

  const box = BOX[v.reason] || BOX.overpayment;
  page.drawText('X', { x: box[0] + 2.6, y: H - box[1] - 11, size: 11, font: await pdf.embedFont(StandardFonts.HelveticaBold), color: rgb(0.05, 0.1, 0.25) });
  if (v.reason === 'paid_in_error') put('explainPaid', v.reasonExplain, 310);
  if (v.reason === 'other') put('explainOther', v.reasonExplain, 460);

  if (v.signaturePng?.startsWith('data:image/png;base64,')) {
    const img = await pdf.embedPng(Buffer.from(v.signaturePng.split(',')[1], 'base64'));
    const s = Math.min(SIG.w / img.width, SIG.h / img.height);
    page.drawImage(img, { x: SIG.x, y: H - SIG.top - img.height * s, width: img.width * s, height: img.height * s });
  }
  if (v.signedAt) {
    const d = new Date(v.signedAt.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    put('month', String(d.getMonth() + 1).padStart(2, '0'), 30);
    put('day', String(d.getDate()).padStart(2, '0'), 30);
    put('year', String(d.getFullYear()), 40);
  }
  return pdf.save();
}

export const REASONS: Record<string, string> = {
  overpayment: 'Overpayment',
  duplicate: 'Duplicate payment',
  wrong_summons: 'Payment applied to the wrong summons',
  dismissed: 'Summons was dismissed',
  paid_in_error: 'Paid in error',
  other: 'Other',
};

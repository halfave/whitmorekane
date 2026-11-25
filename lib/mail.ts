import 'server-only';

type Att = { filename: string; content: Uint8Array | Buffer };

// Sends through Resend. Returns true on success; never throws (email is a copy, not the record).
export async function sendMail(p: { to: string; subject: string; text: string; attachments?: Att[] }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: process.env.MAIL_FROM || 'Whitmore Kane <claims@whitmorekane.com>',
        to: [p.to],
        reply_to: 'claims@whitmorekane.com',
        subject: p.subject,
        text: p.text,
        attachments: (p.attachments || []).map((a) => ({ filename: a.filename, content: Buffer.from(a.content).toString('base64') })),
      }),
    });
    return r.ok;
  } catch {
    return false;
  }
}

import 'server-only';
import { admin } from '@/lib/server';
import { buildPpu1 } from '@/lib/ppu1';

// Builds OATH's PPU1 refund request for a claim from what the owner entered.
// Signature and date are stamped only once the owner has signed the refund request.
export async function ppu1ForClaim(claimId: string) {
  const [{ data: c }, { data: info }, { data: auths }] = await Promise.all([
    admin.from('claims').select('*').eq('id', claimId).single(),
    admin.from('claimant_info').select('*').eq('claim_id', claimId).maybeSingle(),
    admin.from('authorizations').select('*').eq('claim_id', claimId).order('signed_at', { ascending: false }).limit(1),
  ]);
  if (!c || !info) return null;
  const a = auths?.[0];
  const signed = !!c.refund_request_signed_at;
  return buildPpu1({
    requestorName: a?.signer_name || info.contact_name,
    phone: info.phone,
    email: info.email,
    // The agency mails the check to us; we verify it and forward it to the owner (agreement §4).
    mailingAddress: process.env.FIRM_MAILING_ADDRESS
      ? `c/o Whitmore Kane & Associates, ${process.env.FIRM_MAILING_ADDRESS}`
      : info.mailing_address,
    respondent: c.respondent_name,
    summons: c.violation_number || (c.summons_numbers || []).join(', '),
    reason: info.refund_reason,
    reasonExplain: info.reason_explain,
    signaturePng: signed ? a?.signature_png : null,
    signedAt: signed ? new Date(c.refund_request_signed_at) : null,
  });
}

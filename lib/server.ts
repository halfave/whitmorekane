import 'server-only';
import { createClient } from '@supabase/supabase-js';

// Service-role client. Server routes only; never import from a client component.
export const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export const BUCKET = 'claim-docs';

export async function loadClaim(code: string, zip?: string | null) {
  const { data, error } = await admin
    .from('claims')
    .select('*')
    .eq('claim_code', code.trim().toUpperCase())
    .maybeSingle();
  if (error || !data) return null;
  if (data.respondent_zip && (!zip || zip.trim() !== data.respondent_zip)) return null;
  return data;
}

const SIGNED = ['signed', 'info_submitted', 'filed', 'paid', 'closed'];
export const isSigned = (status: string) => SIGNED.includes(status);

// What the owner sees. Identifying details stay hidden until they sign.
export function publicView(c: any) {
  const signed = isSigned(c.status);
  return {
    code: c.claim_code,
    respondent: c.respondent_name,
    amount: Number(c.amount),
    agency: signed ? c.agency_name || c.agency_label : c.agency_label,
    feePct: Number(c.fee_pct),
    status: c.status,
    signed,
    details: signed
      ? { summons: c.violation_number ? [c.violation_number] : c.summons_numbers, property: c.property_address }
      : null,
  };
}

export const FIRM = 'Whitmore Kane & Associates';
export const FIRM_LEGAL = 'Half Ave Company LLC, d/b/a Whitmore Kane & Associates';
export const AGREEMENT_VERSION = '2026-11-24';

export function agreementText(p: { respondent: string; amount: number; feePct: number }) {
  const amt = p.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  return `RECOVERY SERVICES AUTHORIZATION AND FEE AGREEMENT

Owner: ${p.respondent}
Firm: ${FIRM_LEGAL}
Estimated amount: ${amt}

1. You may recover these funds yourself. You do not need ${FIRM} or any other firm to claim money owed to you. You can contact the holding agency directly and pay no fee.

2. Authorization. The Owner authorizes the Firm to identify the funds, prepare and submit the refund request and supporting documents to the holding agency, and communicate with that agency on the Owner's behalf.

3. Disclosure after signing. On signing, the Firm will disclose the holding agency, the record numbers and the property involved.

4. Payment. The agency pays the refund directly to the original payer. The Firm never receives or holds the Owner's funds.

5. Fee. The Owner will pay the Firm ${p.feePct}% of the amount the agency actually refunds, invoiced after the Owner receives payment. If nothing is refunded, nothing is owed. No upfront fees. If the agency applies part of the credit to other balances the Owner owes, the fee is based only on the amount actually paid out.

6. Cancellation. The Owner may cancel by written notice to the Firm before the refund request is filed, at no cost.

7. Accuracy. The Owner confirms that the information and documents it provides are true and that the signer is authorized to act for the Owner.

8. Electronic signature. The Owner agrees that typing a name below is a legal signature.`;
}

export async function sha256(text: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

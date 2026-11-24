export const FIRM = 'Whitmore Kane & Associates';
export const FIRM_LEGAL = 'Half Ave Company LLC, d/b/a Whitmore Kane & Associates';
export const AGREEMENT_VERSION = '2026-11-24c';

export function agreementText(p: { respondent: string; amount: number; feePct: number }) {
  const amt = p.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  return `RECOVERY SERVICES AUTHORIZATION AND FEE AGREEMENT

Owner: ${p.respondent}
Firm: ${FIRM_LEGAL}
Estimated amount: ${amt}

1. You may recover these funds yourself. You do not need ${FIRM} or any other firm to claim money owed to you. You can contact the holding agency directly and pay no fee.

2. Authorization. The Owner authorizes the Firm to identify the funds, prepare the refund request for the Owner's signature, submit it with supporting documents to the holding agency, and communicate with that agency on the Owner's behalf about this refund only.

3. Disclosure after signing. On signing, the Firm will disclose the holding agency, the record number and the property involved.

4. Receiving the check. The Owner directs the agency to mail the refund check to the Firm's mailing address. The check remains the Owner's property. The Firm will not endorse, deposit or cash it. The Firm will verify the check and mail it to the Owner by tracked mail within 5 business days of receiving it.

5. Fee. The Owner will pay the Firm ${p.feePct}% of the amount the agency refunds, invoiced when the Firm mails the check and due within 30 days. If nothing is refunded, nothing is owed. There are no upfront fees. If the agency applies part of the funds to other balances the Owner owes, the fee is based only on the amount actually paid out.

6. No cancellation. This authorization cannot be cancelled once signed. If the Owner or anyone acting for the Owner obtains this refund directly after signing, the fee in section 5 still applies.

7. Accuracy. The Owner confirms that the information and documents it provides are true and that the signer is authorized to act for the Owner.

8. Electronic signature. The Owner agrees to sign electronically. The signature drawn below is the Owner's legal signature on this agreement and, once the Owner reviews and approves it, on the agency refund request.`;
}

export async function sha256(text: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

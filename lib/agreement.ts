export const FIRM = 'Whitmore Kane & Associates';
export const FIRM_LEGAL = 'Half Ave Company LLC, d/b/a Whitmore Kane & Associates';
export const AGREEMENT_VERSION = '2026-11-24d';

export function agreementText(p: { respondent: string; amount: number; feePct: number }) {
  const amt = p.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  return `RECOVERY SERVICES AUTHORIZATION AND FEE AGREEMENT

Owner: ${p.respondent}
Firm: ${FIRM_LEGAL}
Estimated amount: ${amt}

1. You may recover these funds yourself. You do not need ${FIRM} or any other firm to claim money owed to you. You can contact the holding agency directly and pay no fee.

2. Scope and authorization. This agreement covers only refunds of duplicate payments, overpayments and payments on dismissed violations. The Owner authorizes the Firm to identify the funds, prepare the refund request for the Owner's signature, submit it with supporting documents to the holding agency, and communicate with that agency on the Owner's behalf about this refund only.

3. Disclosure after signing. On signing, the Firm will disclose the holding agency, the record number and the property involved.

4. Agent to receive the refund. The Owner appoints the Firm as its agent to receive the refund check for this claim and directs the agency to mail it to the Firm's mailing address. The check remains the Owner's property. The Firm will never endorse, deposit or cash it. The Firm will verify the check and mail it, uncashed, to the Owner by tracked mail within 5 business days of receiving it.

5. Fee. The fee is ${p.feePct}% of the amount recovered. It is owed only if money is refunded, and is invoiced after the Owner receives the check, due within 30 days. There are no upfront fees. If the agency applies part of the funds to other balances the Owner owes, the fee is based only on the amount actually paid out.

6. Cancellation. The Owner may cancel this agreement at no cost by emailing claims@whitmorekane.com any time before the Firm files the refund request with the agency. Once the request is filed, this agreement cannot be cancelled, and the fee in section 5 applies to the refund even if the Owner or anyone acting for the Owner later deals with the agency directly.

7. Accuracy. The Owner confirms that the information and documents it provides are true and that the signer is authorized to act for the Owner.

8. Electronic signature. The Owner agrees to sign electronically. The signature drawn below is the Owner's legal signature on this agreement and, once the Owner reviews and approves it, on the agency refund request.`;
}

export async function sha256(text: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// How an owner can find proof of an old NYC fine payment. Shared by the claim flow and /how-it-works.
const WAYS = [
  {
    t: 'Search your email for the CityPay receipt',
    d: 'Online payments send a receipt from noreply@finance.nyc.gov with a subject like “Payment Receipt #CPY…”. Search every inbox that might have paid, including your managing agent’s or bookkeeper’s.',
    tips: ['Search: from:noreply@finance.nyc.gov', 'Search: "Payment Receipt" CityPay', 'Search the violation number, with and without the leading zero', 'Check archive, trash and shared billing inboxes'],
  },
  {
    t: 'Look through bank or card statements',
    d: 'Payments to the city usually appear as “NYC ECB FINES,” “NYC DOF” or “CityPay.” A statement page showing the debit is accepted as proof. Black out unrelated transactions if you like.',
    tips: ['Check every account the company used at the time', 'One payment can cover several violations', 'Mailed checks: the cancelled check (front and back) works too'],
  },
  {
    t: 'Can’t find it? We’ll ask the city',
    d: 'Tick “I can’t find it” below. We request the payment record from the agency on your behalf. It can add a few weeks.',
    tips: [],
  },
];

export default function FindPayment({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? 'grid gap-4' : 'grid gap-6 md:grid-cols-3'}>
      {WAYS.map((w, i) => (
        <div key={w.t} className={compact ? '' : 'border-t-2 border-[#b07a4f] pt-4'}>
          <div className="flex gap-3">
            <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#13302a] text-xs font-semibold text-white">{i + 1}</span>
            <div>
              <div className="font-semibold text-[#13302a]">{w.t}</div>
              <p className="mt-1 text-[14px] leading-relaxed text-[#4a5550]">{w.d}</p>
              {w.tips.length > 0 && (
                <ul className="mt-2 grid gap-1 text-[13px] text-[#4a5550]">
                  {w.tips.map((t) => <li key={t} className="flex gap-2"><span className="text-[#b07a4f]">—</span><span className={t.startsWith('Search:') ? 'font-mono text-[12px]' : ''}>{t}</span></li>)}
                </ul>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Example mockups of the payment proof we accept, filled with this claim's own violation, company and amount.
// Clearly marked as examples. The date and card digits are left as placeholders since we don't know them.
type Props = { violation?: string | null; respondent: string; paid?: number | null };

const usd = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const hl = 'rounded-[2px] bg-[#fde9a8] px-0.5 font-semibold text-[#13302a] ring-1 ring-[#e8c766]';
const sheet = 'relative h-[230px] overflow-hidden rounded-md border border-[#d9d2c4] bg-white shadow-[0_6px_18px_-8px_rgba(19,48,42,0.35)]';
const tag = 'absolute right-2 top-2 z-10 rounded-sm bg-[#13302a]/85 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white';

function words(n: number) {
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const t = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const h = (x: number): string => x < 20 ? a[x] : x < 100 ? `${t[Math.floor(x / 10)]}${x % 10 ? '-' + a[x % 10] : ''}` : `${a[Math.floor(x / 100)]} Hundred${x % 100 ? ' ' + h(x % 100) : ''}`;
  const d = Math.floor(n), c = Math.round((n - d) * 100);
  const s = d >= 1000 ? `${h(Math.floor(d / 1000))} Thousand${d % 1000 ? ' ' + h(d % 1000) : ''}` : h(d) || 'Zero';
  return `${s} and ${String(c).padStart(2, '0')}/100`;
}

function Receipt({ violation, respondent, amt }: { violation: string; respondent: string; amt: string }) {
  return (
    <div className={sheet}>
      <span className={tag}>Example</span>
      <div className="bg-[#1d4f8f] px-3 py-2 text-[10px] font-bold tracking-wide text-white">CityPay · Payment Receipt</div>
      <div className="grid gap-1 px-3 py-2 text-[9.5px] leading-snug text-[#333]">
        <div className="text-[#555]">Thank you for your payment.</div>
        <div className="flex justify-between"><span>Confirmation #</span><span className={hl}>CPY0XXXXXXXX</span></div>
        <div className="flex justify-between"><span>Payment date</span><span className={hl}>MM/DD/YYYY</span></div>
        <div className="mt-1 border-t border-[#e5e5e5] pt-1 font-semibold text-[#1d4f8f]">ECB Violation</div>
        <div className="flex justify-between"><span>Violation #</span><span className={hl}>{violation}</span></div>
        <div className="flex justify-between gap-2"><span>Respondent</span><span className="truncate text-right">{respondent}</span></div>
        <div className="mt-1 flex justify-between border-t border-[#e5e5e5] pt-1 text-[10.5px] font-bold"><span>Total paid</span><span className={hl}>${amt}</span></div>
        <div className="flex justify-between text-[#555]"><span>Card</span><span>Visa ••••</span></div>
      </div>
    </div>
  );
}

function Statement({ amt }: { amt: string }) {
  return (
    <div className={sheet}>
      <span className={tag}>Example</span>
      <div className="flex items-center justify-between border-b-2 border-[#13302a] px-3 py-2">
        <span className="text-[10px] font-bold text-[#13302a]">Your Bank <span className="font-normal text-[#555]">· Acct ••••</span></span>
        
      </div>
      <div className="px-3 py-1.5 text-[8.5px] font-semibold uppercase tracking-wide text-[#777]">Transactions</div>
      <div className="mx-3 grid gap-1 text-[9px] text-[#333]">
        {[0, 1].map((i) => <div key={i} className="h-3.5 rounded-sm bg-[#1a1a1a]" />)}
        <div className="grid grid-cols-[auto_1fr_auto] gap-2 rounded-sm bg-[#fde9a8] px-1 py-1 font-semibold text-[#13302a] ring-1 ring-[#e8c766]">
          <span>MM/DD</span><span className="truncate">NYC CITYPAY ECB</span><span>${amt}</span>
        </div>
        {[0, 1, 2].map((i) => <div key={i} className="h-3.5 rounded-sm bg-[#1a1a1a]" />)}
      </div>
      <div className="absolute bottom-2 left-3 right-3 text-[8.5px] italic text-[#555]">Everything else blacked out. That’s fine.</div>
    </div>
  );
}

function Check({ violation, respondent, amt, paid }: { violation: string; respondent: string; amt: string; paid: number | null }) {
  return (
    <div className={sheet}>
      <span className={tag}>Example</span>
      <div className="h-full bg-[repeating-linear-gradient(135deg,#eef4f1_0_6px,#e6efea_6px_12px)] p-3 text-[9px] text-[#333]">
        <div className="pr-12"><span className="block truncate font-bold text-[#13302a]">{respondent}</span></div>
        <div className="mt-1 flex justify-between"><span>No. <span className={hl}>0000</span></span><span>Date <span className={hl}>MM/DD/YYYY</span></span></div>
        <div className="mt-2 flex items-end gap-1 border-b border-[#9aa7a1] pb-0.5">
          <span className="shrink-0 text-[8px] uppercase">Pay to the order of</span>
          <span className="truncate text-[8.5px] font-semibold italic text-[#13302a]">NYC Finance</span>
          <span className={`ml-auto shrink-0 ${hl}`}>${amt}</span>
        </div>
        <div className="mt-1.5 truncate border-b border-[#9aa7a1] pb-0.5 italic">{paid != null ? words(paid) : '—'} Dollars</div>
        <div className="mt-2 flex items-end justify-between gap-2">
          <span className="truncate border-b border-[#9aa7a1]">Memo: <span className={hl}>ECB {violation}</span></span>
          <span className="w-14 shrink-0 border-b border-[#9aa7a1]" />
        </div>
        <div className="mt-3 font-mono text-[8px] tracking-[0.2em] text-[#555]">⑆000000000⑆ 0000000⑈ 0000</div>
        <div className="mt-1.5 text-[8.5px] italic text-[#555]">Send the back too, showing it cleared.</div>
      </div>
    </div>
  );
}

export default function PaymentExamples({ violation, respondent, paid }: Props) {
  const v = violation || '0XXXXXXXXX';
  const amt = paid != null ? usd(paid) : '0.00';
  const items = [
    { t: 'Online payment receipt', d: 'The emailed receipt from when you paid online.', el: <Receipt violation={v} respondent={respondent} amt={amt} /> },
    { t: 'Bank or card statement', d: 'The page with the charge. Black out everything else.', el: <Statement amt={amt} /> },
    { t: 'Cancelled check', d: 'Front and back of the cleared check.', el: <Check violation={v} respondent={respondent} amt={amt} paid={paid ?? null} /> },
  ];
  return (
    <div className="mt-3">
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map((x) => (
          <figure key={x.t}>
            {x.el}
            <figcaption className="mt-2">
              <div className="text-[13px] font-semibold text-[#13302a]">{x.t}</div>
              <div className="text-[12px] text-[#6b6a64]">{x.d}</div>
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="mt-2 text-[12px] text-[#6b6a64]">Yellow marks what we look for. Yours may look a little different, and that’s OK.</p>
    </div>
  );
}

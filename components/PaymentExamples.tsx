// Illustrative examples of payment proof we accept. Drawn, not real documents; all data is placeholder.
const box = 'relative h-[150px] overflow-hidden rounded border border-[#ddd5c7] bg-white p-3 text-[9px] leading-tight text-[#4a5550] shadow-sm';
const hl = 'rounded-sm bg-[#f6e7c8] px-0.5 text-[#13302a] font-semibold';
const tag = 'absolute right-2 top-2 rounded-sm bg-[#13302a] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white';

function Receipt() {
  return (
    <div className={box}>
      <span className={tag}>Example</span>
      <div className="text-[10px] font-bold text-[#13302a]">Payment Receipt</div>
      <div className="mt-1">Confirmation #: <span className={hl}>CPY0XXXXXXXX</span></div>
      <div>Date paid: <span className={hl}>03/14/2025</span></div>
      <div className="mt-1 border-t border-dashed border-[#ddd5c7] pt-1">Summons / violation: 0XXXXXXXXX</div>
      <div>Respondent: YOUR COMPANY LLC</div>
      <div className="mt-1 flex justify-between border-t border-dashed border-[#ddd5c7] pt-1">
        <span>Amount paid</span><span className={hl}>$1,250.00</span>
      </div>
      <div>Card ending <span className={hl}>1234</span></div>
    </div>
  );
}

function Statement() {
  const rows = [
    ['03/12', 'GROCERY MARKET', '42.18'],
    ['03/14', 'NYC CITYPAY PAYMENT', '1,250.00'],
    ['03/15', 'COFFEE SHOP', '6.50'],
    ['03/17', 'UTILITY CO', '88.20'],
  ];
  return (
    <div className={box}>
      <span className={tag}>Example</span>
      <div className="text-[10px] font-bold text-[#13302a]">Bank / card statement</div>
      <div>Account ending <span className={hl}>1234</span></div>
      <table className="mt-1.5 w-full">
        <tbody>
          {rows.map(([d, n, a]) => {
            const on = n.includes('CITYPAY');
            return (
              <tr key={d} className={on ? 'bg-[#f6e7c8] font-semibold text-[#13302a]' : ''}>
                <td className="py-0.5 pr-1">{d}</td><td className="pr-1">{n}</td><td className="text-right">{a}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Check() {
  return (
    <div className={box}>
      <span className={tag}>Example</span>
      <div className="flex justify-between pr-14"><span className="font-bold text-[#13302a]">YOUR COMPANY LLC</span></div>
      <div className="text-right">No. <span className={hl}>1042</span></div>
      <div className="text-right">Date <span className={hl}>03/10/2025</span></div>
      <div className="mt-1.5 flex items-end gap-1 border-b border-[#ddd5c7] pb-0.5">
        <span>Pay to the order of</span><span className="font-semibold text-[#13302a]">NYC Dept. of Finance</span>
        <span className={`ml-auto ${hl}`}>$1,250.00</span>
      </div>
      <div className="mt-1 border-b border-[#ddd5c7] pb-0.5">Memo: Summons 0XXXXXXXXX</div>
      <div className="mt-2 font-mono text-[8px] tracking-widest">⑆000000000⑆ 0000000⑈ 1042</div>
      <div className="mt-1 text-[8px] italic">Include the back too, showing it was deposited.</div>
    </div>
  );
}

export default function PaymentExamples() {
  const items = [
    { t: 'Online payment receipt', d: 'The emailed CityPay receipt. Confirmation numbers usually start with CPY.', el: <Receipt /> },
    { t: 'Bank or card statement', d: 'The statement page showing the charge. Black out everything else.', el: <Statement /> },
    { t: 'Cancelled check', d: 'A photo or scan of the front and back of the cleared check.', el: <Check /> },
  ];
  return (
    <div className="mt-4">
            <div className="mt-2 grid gap-3 sm:grid-cols-3">
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
      <p className="mt-2 text-[12px] text-[#6b6a64]">Highlighted parts are what we look for.</p>
    </div>
  );
}

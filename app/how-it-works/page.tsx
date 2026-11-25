import Link from 'next/link';

export const metadata = { title: 'How it works | Whitmore Kane' };

const STEPS = [
  { t: 'Look up your claim', time: '1 minute', d: 'Enter the claim code and ZIP code from your letter. You’ll see how much a New York City agency is holding for you.' },
  { t: 'Sign the authorization', time: '2 minutes', d: 'Read our short agreement and sign with your mouse or finger. Once you sign, we show you the agency and the record your money is tied to.' },
  { t: 'Upload your old receipt', time: '5 minutes', d: 'Upload proof of the payment you already made, like a receipt or statement page. We walk you through it.' },
  { t: 'Sign the refund request', time: '2 minutes', d: 'We prepare the agency’s official paperwork from your details. Review it and sign electronically.' },
  { t: 'We handle the agency', time: 'Several weeks', d: 'We file everything, answer the agency’s questions and deal with any issues that come up. You can check progress any time on the Claim status page.' },
  { t: 'You get your check', time: 'When the agency pays', d: 'The agency mails the check to us as your agent. We never cash it: we verify it and mail it to you uncashed. After you receive it, we invoice 15%.' },
];

const NEED = [
  ['Your claim code and ZIP', 'Printed at the top of your letter.'],
  ['Proof of your original payment', 'We’ll show you exactly what we need and where to find it.'],
];

const WHY = [
  ['Old records', 'The agency needs proof of a payment that may be years old. We know where to find it, and how to request it if it’s missing.'],
  ['The right payer', 'Refunds go to whoever made the original payment, which isn’t always the owner. We sort that out before filing.'],
  ['Other balances', 'Agencies can apply your money to other balances first. We check for them so there are no surprises.'],
];

export default function HowItWorks() {
  return (
    <>
      <section className="bg-[#f4efe6]">
        <div className="mx-auto max-w-[900px] px-[15px] py-[60px] text-center">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#a8703f]">How it works</div>
          <h1 className="mt-4 text-[34px] font-medium uppercase leading-[1.1] text-[#13302a] sm:text-[40px]">Your part takes about ten minutes</h1>
          <p className="mx-auto mt-3 max-w-[560px] text-[#4a5550]">We do the rest. You don’t pay unless we recover your funds.</p>
        </div>
      </section>

      <section className="mx-auto max-w-[1170px] px-[15px] py-[60px]">
        <h2 className="text-[24px] font-medium uppercase text-[#13302a]">What you’ll need</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {NEED.map(([t, d]) => (
            <div key={t} className="border border-[#e6e0d5] p-5">
              <div className="font-semibold text-[#13302a]">{t}</div>
              <p className="mt-1 text-[13px] text-[#4a5550]">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#13302a] text-white">
        <div className="mx-auto max-w-[1170px] px-[15px] py-[60px]">
          <h2 className="text-[24px] font-medium uppercase">Step by step</h2>
          <ol className="mt-8 grid gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.t} className="border-t border-[#a8703f] pt-5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[32px] font-medium text-[#e0b083]">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/60">{s.time}</span>
                </div>
                <div className="mt-2 text-[17px] font-medium">{s.t}</div>
                <p className="mt-2 text-white/75">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-[1170px] px-[15px] py-[60px]">
        <h2 className="text-[24px] font-medium uppercase text-[#13302a]">Why people use us</h2>
        <p className="mt-2 max-w-[700px] text-[#4a5550]">
          You can contact the agency yourself. Most people who try run into at least one of these, and we’ve handled all of them before.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {WHY.map(([t, d]) => (
            <div key={t} className="border-t-2 border-[#a8703f] pt-4">
              <div className="text-[16px] font-medium text-[#13302a]">{t}</div>
              <p className="mt-1 text-[#4a5550]">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#f4efe6]">
        <div className="mx-auto flex max-w-[1170px] flex-col items-center gap-4 px-[15px] py-[45px] text-center sm:flex-row sm:justify-between sm:text-left">
          <h2 className="text-[22px] font-medium uppercase text-[#13302a]">Ready? It starts with your claim code.</h2>
          <Link href="/got-a-letter" className="inline-flex h-[42px] items-center rounded-full bg-gradient-to-b from-[#c9935f] to-[#a8703f] px-10 text-[14px] font-medium text-white shadow-sm">Enter your claim code</Link>
        </div>
      </section>
    </>
  );
}

import Link from 'next/link';
import FindPayment from '@/components/FindPayment';

export const metadata = { title: 'How it works | Whitmore Kane & Associates' };

const STEPS = [
  {
    t: 'Look up your claim',
    time: '1 minute',
    d: 'Enter the claim code and ZIP code from your letter. You’ll see the amount and that it’s held by a New York City agency.',
  },
  {
    t: 'Sign the authorization',
    time: '2 minutes',
    d: 'Read our short agreement and sign with your mouse or finger. It states our fee and that you can cancel free before we file. Once you sign, we show you the agency, record number and property.',
  },
  {
    t: 'Add your details and documents',
    time: '5 minutes',
    d: 'Tell us where to mail the refund check, upload a photo ID for the signer, and add your payment confirmation. See below for where to find it.',
  },
  {
    t: 'Review and sign the refund request',
    time: '2 minutes',
    d: 'We fill in the agency’s official refund request form from your details. Check it, then sign it electronically. You can download a copy.',
  },
  {
    t: 'We file it',
    time: 'Within 2 business days',
    d: 'We send the signed request and your documents to the agency and follow up until it’s decided. You can check progress any time on the Claim status page.',
  },
  {
    t: 'The agency pays you',
    time: 'Usually several weeks',
    d: 'The agency mails the refund check directly to you. It may first apply the credit to any other balance you owe the city. After you’re paid, we send our invoice.',
  },
];

const NEED = [
  ['Your claim code and ZIP', 'Printed at the top of your letter.'],
  ['A photo ID for the signer', 'Driver’s license or passport. A phone photo is fine.'],
  ['Proof of the original payment', 'CityPay receipt, cancelled check, or bank or card statement page.'],
  ['The mailing address for the check', 'Where the refund should be sent.'],
];

export default function HowItWorks() {
  return (
    <>
      <section className="bg-[#f4efe6]">
        <div className="mx-auto max-w-[900px] px-[15px] py-[60px] text-center">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#a8703f]">How it works</div>
          <h1 className="mt-4 text-[34px] font-medium uppercase leading-[1.1] text-[#13302a] sm:text-[40px]">Your part takes about ten minutes</h1>
          <p className="mx-auto mt-3 max-w-[560px] text-[#4a5550]">Here’s every step, what you’ll need and how to find your payment confirmation.</p>
        </div>
      </section>

      <section className="mx-auto max-w-[1170px] px-[15px] py-[60px]">
        <h2 className="text-[24px] font-medium uppercase text-[#13302a]">What you’ll need</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      <section id="find-payment" className="mx-auto max-w-[1170px] px-[15px] py-[60px]">
        <h2 className="text-[24px] font-medium uppercase text-[#13302a]">How to find your payment confirmation</h2>
        <p className="mt-2 max-w-[700px] text-[#4a5550]">
          The agency needs proof of the original payment before it refunds anything. It’s usually years old, so here’s where to look.
        </p>
        <div className="mt-8"><FindPayment /></div>
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

import Image from 'next/image';
import Link from 'next/link';
import ClaimForm from '@/components/ClaimForm';

const u = (id: string, w: number) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;
const IMG = {
  hero: 'photo-1676313553152-f2f9860c3f37', // wallet with a stack of $100 bills
  desk: 'photo-1559163499-413811fb2344',    // desk with notebook, pen, coffee
};

// Real client quotes only, with their permission. Section stays hidden while empty.
const TESTIMONIALS: { quote: string; name: string; detail: string }[] = [];

const eyebrow = 'text-[11px] font-bold uppercase tracking-[0.2em]';
const h2 = 'mt-5 text-[26px] font-medium uppercase leading-[1.1] text-[#13302a] sm:text-[32px]';
const btn = 'inline-flex h-[42px] items-center rounded-full bg-gradient-to-b from-[#c9935f] to-[#a8703f] px-10 text-[14px] font-medium text-white shadow-sm';

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-[#0c1f1b]">
        <Image src={u(IMG.hero, 2200)} alt="A wallet stuffed with cash" fill priority sizes="100vw" className="-z-10 object-cover object-[70%_60%]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0c1f1b]/95 via-[#0c1f1b]/70 to-[#0c1f1b]/10" />
        <div className="mx-auto max-w-[1170px] px-[15px] py-[45px] sm:py-[110px]">
          <div className={`${eyebrow} text-white`}>Money owed to you by New York City</div>
          <h1 className="mb-[37px] mt-5 max-w-[620px] text-[34px] font-medium uppercase leading-[1.1] text-white sm:text-[52px]">
            We found your money. Claim it.
          </h1>
          <ClaimForm dark />
        </div>
      </section>

      {/* About */}
      <section className="mx-auto grid max-w-[1170px] items-center gap-10 px-[15px] py-[60px] md:grid-cols-2 md:py-[90px]">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image src={u(IMG.desk, 1200)} alt="A desk with a notebook, pen and coffee" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>
        <div>
          <div className={`${eyebrow} text-[#13302a]`}>About Whitmore Kane &amp; Associates</div>
          <h2 className={h2}>Recovery specialists working for you</h2>
          <p className="mt-4 text-[#4a5550]">
            New York City agencies hold money that belongs to people and businesses, and most never find out about it.
            We find it, tell you about it, and handle everything needed to get it back to you.
          </p>
          <p className="mt-3 text-[#4a5550]">
            Getting money back from a city agency takes the right forms, the right proof and patience when something goes wrong.
            We’ve been through it many times, so we know how to handle the issues people run into.
          </p>
          <Link href="/how-it-works" className={`${btn} mt-6`}>How it works</Link>
        </div>
      </section>

      {/* Reviews (hidden until real) */}
      {TESTIMONIALS.length > 0 && (
        <section className="bg-[#f4efe6] py-[30px]">
          <div className="mx-auto max-w-[1170px] px-[15px] py-[30px] text-center">
            <div className={`${eyebrow} text-[#13302a]`}>Reviews</div>
            <h2 className={h2}>What clients say</h2>
            <div className="mt-8 grid gap-6 text-left md:grid-cols-3">
              {TESTIMONIALS.map((t) => (
                <figure key={t.name} className="bg-white p-6">
                  <blockquote className="text-[#333]">“{t.quote}”</blockquote>
                  <figcaption className="mt-3 text-[12px] font-semibold text-[#13302a]">{t.name} · <span className="font-normal text-[#6b756f]">{t.detail}</span></figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Claim your money band */}
      <section className="bg-[#f4efe6]">
        <div className="mx-auto flex max-w-[1170px] flex-col items-center gap-4 px-[15px] py-[45px] text-center sm:flex-row sm:justify-between sm:text-left">
          <h2 className="text-[22px] font-medium uppercase text-[#13302a]">Claim your money</h2>
          <Link href="/got-a-letter" className={btn}>Your money is waiting. Claim it now.</Link>
        </div>
      </section>

      {/* Is this money real */}
      <section id="real" className="mx-auto grid max-w-[1170px] gap-10 px-[15px] pb-[60px] pt-[45px] md:grid-cols-[1fr_1.3fr] md:py-[90px]">
        <div>
          <div className={`${eyebrow} text-[#13302a]`}>Questions</div>
          <h2 className={h2}>Is this money real?</h2>
        </div>
        <div className="text-[15px] text-[#4a5550]">
          <p>
            Yes. Every claim we send is tied to a specific city record in your name. Once you sign, we show you the agency and the
            record number so you can confirm it yourself.
          </p>
          <p className="mt-3">
            You don’t pay unless we recover your funds. Our fee is 15%, with nothing upfront.
          </p>
          <Link href="#faq" className="mt-4 inline-block font-medium text-[#a8703f] underline">More FAQs</Link>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-[#e6e0d5]">
        <div className="mx-auto max-w-[1170px] px-[15px] py-[60px]">
          <h2 className="text-[26px] font-medium uppercase text-[#13302a]">Frequently asked questions</h2>
          <div className="mt-6 grid gap-x-12 md:grid-cols-2">
            {FAQ.map((f) => (
              <details key={f.q} className="group border-b border-[#e6e0d5] py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium text-[#13302a]">
                  {f.q}<span className="text-[#a8703f] transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-[#4a5550]">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Got a letter */}
      <section id="contact" className="bg-[#13302a] text-white">
        <div className="mx-auto grid max-w-[1170px] items-center gap-8 px-[15px] py-[60px] md:grid-cols-2">
          <div>
            <div className={`${eyebrow} text-[#e0b083]`}>Got a letter?</div>
            <h2 className="mt-5 text-[26px] font-medium uppercase leading-[1.1] sm:text-[32px]">Enter your claim code now</h2>
            <p className="mt-3 text-white/80">
              Your code and ZIP are printed at the top of the letter. Questions first? Email{' '}
              <a className="underline" href="mailto:claims@whitmorekane.com">claims@whitmorekane.com</a>.
            </p>
          </div>
          <ClaimForm dark />
        </div>
      </section>
    </>
  );
}

const FAQ = [
  { q: 'Where does the money come from?', a: 'A New York City agency is holding money that belongs to you or your company. Once you sign, we show you which agency and the record number.' },
  { q: 'Can I claim it myself?', a: 'Yes, you can contact the agency directly at no cost. People who try often get stuck: tracking down years-old payment records, sorting out who the original payer was, or finding the money applied to another balance. We’ve handled these before and know how to resolve them.' },
  { q: 'What does it cost?', a: '15% of what’s recovered. You owe it only if money comes back, and we invoice you after you receive your check. Nothing upfront.' },
  { q: 'Why doesn’t the letter name the agency?', a: 'Finding the money is the work we do. Once you sign, the agency, record number and property appear in your portal right away.' },
  { q: 'How do I get paid?', a: 'As your agent, we receive the agency’s check. We never cash or deposit it: we verify it and mail it to you uncashed, then invoice our fee after you receive it.' },
  { q: 'What will you need from me?', a: 'An electronic signature and a few details about the original payment. We never ask for a Social Security number.' },
  { q: 'How long does it take?', a: 'Your part takes about ten minutes. The agency then takes several weeks to process the refund.' },
  { q: 'Can I cancel?', a: 'Yes, at no cost, any time before we file your refund request with the agency. After we file, it can’t be cancelled.' },
];

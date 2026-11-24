import Image from 'next/image';
import Link from 'next/link';
import ClaimForm from '@/components/ClaimForm';

const u = (id: string, w: number) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;
const IMG = {
  hero: 'photo-1620109176813-e91290f6c795', // closed leather wallet on dark leather, no branding
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
        <Image src={u(IMG.hero, 2200)} alt="A leather wallet" fill priority sizes="100vw" className="-z-10 object-cover object-right" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0c1f1b]/85 via-[#0c1f1b]/45 to-transparent" />
        <div className="mx-auto max-w-[1170px] px-[15px] py-[45px] sm:py-[110px]">
          <div className={`${eyebrow} text-white`}>Recover overpaid city fines</div>
          <h1 className="mb-[37px] mt-5 max-w-[620px] text-[34px] font-medium uppercase leading-[1.1] text-white sm:text-[52px]">
            The city owes you money. Get it back.
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
          <h2 className={h2}>Refund specialists working for property owners</h2>
          <p className="mt-4 text-[#4a5550]">
            When a city fine is paid twice, or a hearing lowers it after it was paid, the difference stays on the agency’s books.
            The agency will refund it, but only if someone asks. Most owners never find out.
          </p>
          <p className="mt-3 text-[#4a5550]">
            We search public records across New York City for these credits, then handle the paperwork to get them refunded. We
            manage residential buildings ourselves and started by recovering credits on our own properties.
          </p>
          <Link href="/how-it-works" className={`${btn} mt-6`}>How it works</Link>
        </div>
      </section>

      {/* Reviews (hidden until real) */}
      {TESTIMONIALS.length > 0 && (
        <section className="bg-[#f4efe6] py-[30px]">
          <div className="mx-auto max-w-[1170px] px-[15px] py-[30px] text-center">
            <div className={`${eyebrow} text-[#13302a]`}>Reviews</div>
            <h2 className={h2}>What owners say</h2>
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
          <Link href="/got-a-letter" className={btn}>Your refund is waiting. Claim it now.</Link>
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
            Yes. Every claim we send is tied to a specific public record that shows a negative balance: the agency holds more
            than the penalty it imposed. Once you sign, you’ll see the record number and can look it up yourself.
          </p>
          <p className="mt-3">
            The refund is paid to you by the agency, never to us. You pay our fee only after you receive it, and you can always
            request the refund yourself instead.
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
  { q: 'Can I claim it myself?', a: 'Yes. You can request the refund directly from the holding agency at no cost. We do the research, paperwork and follow-up for owners who prefer not to.' },
  { q: 'What does it cost?', a: 'A percentage of the amount actually refunded, stated in the agreement before you sign. Nothing upfront. If nothing is refunded, you owe nothing.' },
  { q: 'Why doesn’t the letter name the agency?', a: 'Finding the record is the work we do. Once you sign, the agency, record number and property appear in your portal right away.' },
  { q: 'Do you hold my money?', a: 'Never. The agency pays the original payer directly. We invoice our fee after you are paid.' },
  { q: 'What will you need from me?', a: 'An electronic signature, a photo ID for the signer and proof of the original payment, such as a CityPay receipt or bank statement. We never ask for a Social Security number.' },
  { q: 'I can’t find my payment receipt.', a: 'Most owners can find it in their email or bank statements. Our guide shows where to look. If you still can’t, we ask the agency for the record.' },
  { q: 'How long does it take?', a: 'You can finish your part in about ten minutes. The agency then takes several weeks to review and mail the check.' },
  { q: 'Can I cancel?', a: 'Yes, at no cost, any time before we file the request.' },
];

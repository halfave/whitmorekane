import Image from 'next/image';
import ClaimForm from '@/components/ClaimForm';

const IMG = {
  hero: 'https://images.unsplash.com/photo-1762216454185-71127f1d4a95',
  desk: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85',
  street: 'https://images.unsplash.com/photo-1678665035683-4fd15eea5f03',
};
const u = (src: string, w: number) => `${src}?auto=format&fit=crop&w=${w}&q=75`;

const STEPS = [
  { n: '01', t: 'We find the money', d: 'We review public agency records for fines and penalties that were paid more than once, or reduced after payment, and never refunded.' },
  { n: '02', t: 'You authorize us', d: 'Enter the code from your letter, review the amount and sign a short authorization online.' },
  { n: '03', t: 'We file everything', d: 'We prepare the refund request, assemble the documents the agency needs and follow up until it is decided.' },
  { n: '04', t: 'The agency pays you', d: 'The refund check is issued to you, never to us. Our fee is invoiced only after you are paid.' },
];

const FAQ = [
  { q: 'Can I claim it myself?', a: 'Yes. You can request the refund directly from the holding agency at no cost. We do the research, paperwork and follow-up for owners who prefer not to.' },
  { q: 'What does it cost?', a: 'A percentage of the amount actually refunded, stated in the authorization before you sign. Nothing upfront. If nothing is refunded, you owe nothing.' },
  { q: 'Why not tell me the agency in the letter?', a: 'Identifying the record is the work we do. Once you sign, the agency, record number and property appear in your portal right away.' },
  { q: 'Do you hold my money?', a: 'Never. The agency pays the original payer directly.' },
  { q: 'What will you need from me?', a: 'A signed authorization, a photo ID for the signer and proof of the original payment, such as a receipt or bank statement. We never ask for a Social Security number.' },
  { q: 'Can I cancel?', a: 'Yes, at no cost, any time before we file the request.' },
];

// Real client quotes only, with their permission. Section stays hidden while empty.
const TESTIMONIALS: { quote: string; name: string; detail: string }[] = [];

const eyebrow = 'text-xs font-semibold uppercase tracking-[0.2em] text-[#c8875a]';
const h2 = 'mt-2 text-3xl font-bold uppercase leading-tight tracking-tight sm:text-4xl';

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section id="claim" className="relative isolate overflow-hidden bg-[#13302a] text-white">
        <Image src={u(IMG.hero, 2000)} alt="Brownstone row houses on a New York street" fill priority sizes="100vw" className="-z-10 object-cover opacity-55" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0e231f]/95 via-[#0e231f]/70 to-transparent" />
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-[#e2b48c]">Refunds for New York property owners</div>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold uppercase leading-[1.05] tracking-tight sm:text-6xl">
            The city owes you money. We'll get it back.
          </h1>
          <p className="mt-5 max-w-xl font-[family-name:var(--font-serif)] text-lg text-white/85">
            Overpaid fines and penalties sit on agency books for years. If you received a letter from us, enter your claim code below.
          </p>
          <div className="mt-8"><ClaimForm dark /></div>
        </div>
      </section>

      {/* Promise strip */}
      <section className="border-b border-[#e7e2da] bg-[#f6f2ec]">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 text-sm sm:grid-cols-3">
          {['No upfront fees, ever', 'The agency pays you directly', 'Cancel free before we file'].map((t) => (
            <div key={t} className="flex items-center gap-3 font-semibold">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[#13302a] text-xs text-[#e2b48c]">✓</span>{t}
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 md:grid-cols-2">
        <div>
          <div className={eyebrow}>About Whitmore Kane</div>
          <h2 className={h2}>Recovery specialists working for owners</h2>
          <p className="mt-5 font-[family-name:var(--font-serif)] text-lg leading-relaxed text-[#3d4843]">
            Agencies rarely tell owners when a fine was paid twice or reduced after payment. The credit just sits there.
            We review public records across New York City, find those credits, and handle the paperwork to get them refunded.
          </p>
          <p className="mt-4 font-[family-name:var(--font-serif)] text-lg leading-relaxed text-[#3d4843]">
            We know buildings: our team manages residential property in New York and recovered credits on our own portfolio first.
          </p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-sm shadow-xl">
          <Image src={u(IMG.desk, 1200)} alt="Signing documents at a desk" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-[#13302a] text-white">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className={eyebrow}>Claim your money</div>
          <h2 className={h2}>How it works</h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <li key={s.n} className="border-t border-[#c8875a] pt-5">
                <div className="text-3xl font-bold text-[#c8875a]">{s.n}</div>
                <div className="mt-2 text-lg font-semibold">{s.t}</div>
                <p className="mt-2 font-[family-name:var(--font-serif)] text-white/75">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {TESTIMONIALS.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-20">
          <div className={eyebrow}>Reviews</div>
          <h2 className={h2}>What owners say</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="border-l-2 border-[#c8875a] pl-5">
                <blockquote className="font-[family-name:var(--font-serif)] text-lg">"{t.quote}"</blockquote>
                <figcaption className="mt-3 text-sm text-[#6b756f]">{t.name} · {t.detail}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* Is this real */}
      <section id="real" className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-[1fr_1.2fr]">
        <div>
          <div className={eyebrow}>Is this money real?</div>
          <h2 className={h2}>Yes. And it's on the public record.</h2>
        </div>
        <div className="font-[family-name:var(--font-serif)] text-lg leading-relaxed text-[#3d4843]">
          <p>
            When a penalty is paid twice, or a hearing reduces it after payment, the agency's own records show a negative
            balance: money it is holding for you. Agencies refund these credits on request, but rarely reach out.
          </p>
          <p className="mt-4">
            Every claim we send is tied to a specific public record. Once you sign, you'll see exactly which one, and you can
            check it yourself.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-[#f6f2ec]">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className={eyebrow}>Questions</div>
          <h2 className={h2}>Frequently asked</h2>
          <div className="mt-8 grid gap-x-10 md:grid-cols-2">
            {FAQ.map((f) => (
              <details key={f.q} className="border-b border-[#ddd5c9] py-5">
                <summary className="cursor-pointer list-none text-lg font-semibold">{f.q}</summary>
                <p className="mt-2 font-[family-name:var(--font-serif)] text-[#3d4843]">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Got a letter CTA */}
      <section id="contact" className="relative isolate overflow-hidden text-white">
        <Image src={u(IMG.street, 2000)} alt="A New York City street" fill sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-[#0e231f]/80" />
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e2b48c]">Got a letter?</div>
            <h2 className={h2}>Check your claim in two minutes</h2>
            <p className="mt-4 font-[family-name:var(--font-serif)] text-lg text-white/85">
              Questions first? Email <a className="underline" href="mailto:claims@whitmorekane.com">claims@whitmorekane.com</a> with your claim code.
            </p>
          </div>
          <ClaimForm dark />
        </div>
      </section>
    </>
  );
}

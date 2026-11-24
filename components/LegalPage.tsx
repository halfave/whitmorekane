export const UPDATED = 'November 24, 2026';

export default function LegalPage({ title, intro, sections }: { title: string; intro?: string; sections: [string, React.ReactNode][] }) {
  return (
    <>
      <section className="bg-[#f4efe6]">
        <div className="mx-auto max-w-[900px] px-[15px] py-[50px]">
          <h1 className="text-[34px] font-medium text-[#13302a] sm:text-[40px]">{title}</h1>
          <p className="mt-2 text-[13px] text-[#6b756f]">Last updated {UPDATED}</p>
          {intro && <p className="mt-4 max-w-[700px] text-[15px] text-[#4a5550]">{intro}</p>}
        </div>
      </section>
      <div className="mx-auto grid max-w-[900px] gap-8 px-[15px] py-[50px] text-[14px] leading-relaxed text-[#4a5550]">
        {sections.map(([h, body]) => (
          <section key={h}>
            <h2 className="text-[20px] font-medium text-[#13302a]">{h}</h2>
            <div className="mt-2 grid gap-2 [&_li]:ml-5 [&_li]:list-disc [&_a]:text-[#a8703f] [&_a]:underline">{body}</div>
          </section>
        ))}
      </div>
    </>
  );
}

export const CONTACT = (
  <p>
    Whitmore Kane &amp; Associates (a trade name of Half Ave Company LLC), New York, NY.{' '}
    <a href="mailto:claims@whitmorekane.com">claims@whitmorekane.com</a>
  </p>
);

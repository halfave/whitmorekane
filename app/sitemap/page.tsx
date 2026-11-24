import Link from 'next/link';

export const metadata = { title: 'Site Map | Whitmore Kane & Associates' };

const PAGES: [string, string][] = [
  ['Home', '/'],
  ['Got a letter?', '/got-a-letter'],
  ['How it works', '/how-it-works'],
  ['Claim status', '/status'],
  ['Frequently asked questions', '/#faq'],
  ['Contact', '/#contact'],
  ['Privacy Policy', '/privacy'],
  ['Terms and Conditions', '/terms'],
  ['Accessibility', '/accessibility'],
];

export default function SiteMap() {
  return (
    <section className="mx-auto max-w-[900px] px-[15px] py-[50px]">
      <h1 className="text-[34px] font-medium text-[#13302a]">Site Map</h1>
      <ul className="mt-6 grid gap-2 text-[15px]">
        {PAGES.map(([t, h]) => <li key={h}><Link href={h} className="text-[#a8703f] underline">{t}</Link></li>)}
      </ul>
    </section>
  );
}

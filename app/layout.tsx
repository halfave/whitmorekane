import './globals.css';
import Link from 'next/link';
import { Work_Sans } from 'next/font/google';
import { FIRM } from '@/lib/agreement';

const work = Work_Sans({ subsets: ['latin'], variable: '--font-display', weight: ['400', '500', '600', '700'] });

export const metadata = {
  title: `${FIRM} | Property owner refund recovery`,
  description: 'We find overpaid fines and penalties held by New York City agencies and help property owners get them back.',
};

const NAV: [string, string][] = [
  ['Got a letter?', '/got-a-letter'],
  ['How it works', '/how-it-works'],
  ['Claim status', '/status'],
  ['FAQ', '/#faq'],
  ['Contact', '/#contact'],
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={work.variable}>
      <body className="min-h-screen bg-white font-[family-name:var(--font-display)] text-[14px] leading-[1.45] text-[#333] antialiased">
        <header className="sticky top-0 z-30 bg-gradient-to-r from-[#0c1f1b] to-[#14332c] text-white">
          <div className="mx-auto flex h-[74px] max-w-[1170px] items-center justify-between gap-4 px-[15px]">
            <Link href="/" className="flex items-center gap-3">
              <span className="grid h-[34px] w-[34px] place-items-center rounded-[4px] bg-[#f4ead8] text-[15px] font-bold tracking-tight text-[#a8703f]">WK</span>
              <span className="text-[17px] font-semibold">Whitmore Kane &amp; Assoc.</span>
            </Link>
            <nav className="hidden items-center gap-7 text-[13px] font-medium md:flex">
              {NAV.map(([l, h]) => <Link key={h} href={h} className="text-white/90 hover:text-[#e0b083]">{l}</Link>)}
            </nav>
            <Link href="/got-a-letter" className="rounded-full bg-gradient-to-b from-[#c9935f] to-[#a8703f] px-4 py-2 text-[13px] font-semibold text-white md:hidden">Got a letter?</Link>
          </div>
          <div className="h-[2px] bg-gradient-to-r from-[#a8703f] via-[#e0b083] to-[#a8703f]" />
        </header>

        <main>{children}</main>

        <footer className="border-t border-[#e6e0d5] bg-[#f4efe6]">
          <div className="mx-auto grid max-w-[1170px] gap-8 px-[15px] py-10 text-[13px] sm:grid-cols-[1.2fr_1fr_1fr]">
            <div>
              <div className="text-[15px] font-semibold text-[#13302a]">{FIRM}</div>
              <p className="mt-2 max-w-xs text-[#4a5550]">Refund recovery for New York property owners. We find credits on public agency records and handle the paperwork.</p>
            </div>
            <div className="grid content-start gap-1.5">
              {NAV.map(([l, h]) => <Link key={h} href={h} className="text-[#4a5550] hover:text-[#13302a]">{l}</Link>)}
            </div>
            <div className="text-[#4a5550]">
              <div className="font-semibold text-[#13302a]">Questions?</div>
              <a href="mailto:claims@whitmorekane.com" className="mt-1 block hover:text-[#13302a]">claims@whitmorekane.com</a>
              <p className="mt-1">Include your claim code.</p>
            </div>
          </div>
          <div className="border-t border-[#e6e0d5]">
            <p className="mx-auto max-w-[1170px] px-[15px] py-4 text-[11px] leading-relaxed text-[#6b756f]">
              © {new Date().getFullYear()} Whitmore Kane &amp; Associates, a trade name of Half Ave Company LLC. We are not a law
              firm and do not give legal advice. You can recover funds owed to you directly from the holding agency at no cost.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

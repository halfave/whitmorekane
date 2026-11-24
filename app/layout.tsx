import './globals.css';
import Link from 'next/link';
import { Archivo, Source_Serif_4 } from 'next/font/google';
import { FIRM } from '@/lib/agreement';

const display = Archivo({ subsets: ['latin'], variable: '--font-display', weight: ['400', '600', '700'] });
const serif = Source_Serif_4({ subsets: ['latin'], variable: '--font-serif' });

export const metadata = {
  title: `${FIRM} | Property owner refund recovery`,
  description: 'We find overpaid fines and penalties held by New York City agencies and help property owners get them back.',
};

const NAV = [
  ['Got a letter?', '/#claim'],
  ['How it works', '/#how'],
  ['Is this real?', '/#real'],
  ['FAQ', '/#faq'],
  ['Claim status', '/status'],
  ['Contact', '/#contact'],
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${serif.variable}`}>
      <body className="min-h-screen bg-white font-[family-name:var(--font-display)] text-[#1b2420] antialiased">
        <header className="sticky top-0 z-20 bg-[#13302a] text-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-sm bg-[#c8875a] font-[family-name:var(--font-serif)] text-base font-semibold text-[#13302a]">WK</span>
              <span className="text-lg font-semibold tracking-tight">Whitmore Kane <span className="font-normal text-white/70">&amp; Associates</span></span>
            </Link>
            <nav className="hidden gap-6 text-sm text-white/85 md:flex">
              {NAV.map(([l, h]) => <Link key={h} href={h} className="hover:text-white">{l}</Link>)}
            </nav>
            <Link href="/#claim" className="rounded-full bg-[#c8875a] px-4 py-2 text-sm font-semibold text-[#13302a] md:hidden">Got a letter?</Link>
          </div>
          <div className="h-[3px] bg-gradient-to-r from-[#c8875a] via-[#e2b48c] to-[#c8875a]" />
        </header>
        <main>{children}</main>
        <footer className="mt-16 bg-[#0e231f] text-sm text-white/70">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
            <div>
              <div className="font-semibold text-white">{FIRM}</div>
              <p className="mt-2 leading-relaxed">Refund recovery for New York property owners.</p>
            </div>
            <div className="grid gap-1">
              {NAV.map(([l, h]) => <Link key={h} href={h} className="hover:text-white">{l}</Link>)}
            </div>
            <div className="leading-relaxed">
              <a href="mailto:claims@whitmorekane.com" className="hover:text-white">claims@whitmorekane.com</a>
              <p className="mt-3 text-xs">
                Whitmore Kane &amp; Associates is a trade name of Half Ave Company LLC. We are not a law firm and do not give
                legal advice. You can recover funds owed to you directly from the holding agency at no cost.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

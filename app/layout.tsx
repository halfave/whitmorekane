import './globals.css';
import Link from 'next/link';
import { Work_Sans, Cormorant_Garamond } from 'next/font/google';
import Logo from '@/components/Logo';
import PrivacyBanner, { PrivacyPreferencesLink } from '@/components/PrivacyBanner';
import { FIRM } from '@/lib/agreement';

const work = Work_Sans({ subsets: ['latin'], variable: '--font-display', weight: ['400', '500', '600', '700'] });
const serif = Cormorant_Garamond({ subsets: ['latin'], variable: '--font-serif', weight: ['600', '700'], style: ['normal', 'italic'] });

export const metadata = {
  title: `${FIRM} | Recover money owed to you`,
  description: 'New York City agencies hold money that belongs to people and businesses. We find it and get it back to you.',
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
    <html lang="en" className={`${work.variable} ${serif.variable}`}>
      <body className="min-h-screen bg-white font-[family-name:var(--font-display)] text-[14px] leading-[1.45] text-[#333] antialiased">
        <header className="sticky top-0 z-30 bg-gradient-to-r from-[#0c1f1b] to-[#14332c] text-white">
          <div className="mx-auto flex h-[74px] max-w-[1170px] items-center justify-between gap-4 px-[15px]">
            <Link href="/" aria-label="Whitmore Kane & Associates home"><Logo /></Link>
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
              <Logo dark={false} />
              <p className="mt-2 max-w-xs text-[#4a5550]">Recovering money New York City agencies hold for you. You don’t pay unless we recover your funds.</p>
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
            <div className="mx-auto flex max-w-[1170px] flex-col gap-2 px-[15px] py-4 text-[12px] text-[#6b756f] sm:flex-row sm:items-center sm:justify-between">
              <p>Copyright {new Date().getFullYear()} Whitmore Kane &amp; Associates. All rights reserved. Not a law firm. Not affiliated with the City of New York.</p>
              <nav className="flex flex-wrap gap-x-4 gap-y-1">
                <Link href="/privacy" className="hover:text-[#13302a]">Privacy Policy</Link>
                <PrivacyPreferencesLink />
                <Link href="/terms" className="hover:text-[#13302a]">Terms &amp; Conditions</Link>
                <Link href="/accessibility" className="hover:text-[#13302a]">Accessibility</Link>
                <Link href="/sitemap" className="hover:text-[#13302a]">Site Map</Link>
              </nav>
            </div>
          </div>
        </footer>
        <PrivacyBanner />
      </body>
    </html>
  );
}

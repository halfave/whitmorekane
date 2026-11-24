import './globals.css';
import { FIRM } from '@/lib/agreement';

export const metadata = {
  title: `${FIRM} | Claims`,
  description: 'Recovery of overpaid fines and penalties held by public agencies.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f7f6f3] text-[#1d2630]">
        <header className="border-b border-[#e3e0d8] bg-white">
          <a href="/" className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
            <div className="grid h-9 w-9 place-items-center rounded bg-[#1f3a4d] font-serif text-lg text-white">WK</div>
            <div>
              <div className="font-serif text-lg leading-tight">{FIRM}</div>
              <div className="text-xs text-[#6b7480]">Claims portal</div>
            </div>
          </a>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-3xl px-4 pb-10 text-xs leading-relaxed text-[#6b7480]">
          Whitmore Kane & Associates is a trade name of Half Ave Company LLC. We are not a law firm and do not give legal
          advice. You can recover funds owed to you directly from the holding agency at no cost.
        </footer>
      </body>
    </html>
  );
}

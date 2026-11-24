'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const KEY = 'wk_privacy_choice';
const EVENT = 'wk-privacy-open';

// Notice-only banner: the site sets no cookies and runs no ads or analytics,
// so there is nothing to opt in or out of. "Privacy Preferences" reopens it.
export default function PrivacyBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let seen = false;
    try { seen = !!localStorage.getItem(KEY); } catch {}
    if (!seen) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener(EVENT, reopen);
    return () => window.removeEventListener(EVENT, reopen);
  }, []);

  const close = () => {
    try { localStorage.setItem(KEY, new Date().toISOString()); } catch {}
    setOpen(false);
  };

  if (!open) return null;
  return (
    <div role="dialog" aria-label="Your privacy choices" className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-[#c9935f] bg-white shadow-[0_-6px_24px_rgba(0,0,0,0.12)]">
      <div className="mx-auto flex max-w-[1170px] flex-col gap-3 px-[15px] py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-[13px] text-[#4a5550]">
          <div className="text-[15px] font-semibold text-[#13302a]">Your Privacy Choices</div>
          We don’t use cookies, advertising or tracking on this site, and we never sell your information. When you sign a document,
          we record your IP address and browser to verify your signature. <Link href="/privacy" className="text-[#a8703f] underline">Privacy Policy</Link>
        </div>
        <button onClick={close} className="h-[40px] shrink-0 rounded-full bg-gradient-to-b from-[#c9935f] to-[#a8703f] px-8 text-[14px] font-medium text-white">
          Got it
        </button>
      </div>
    </div>
  );
}

export function PrivacyPreferencesLink() {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(EVENT))} className="hover:text-[#13302a]">
      Privacy Preferences
    </button>
  );
}

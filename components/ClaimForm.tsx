'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClaimForm({ dark = false }: { dark?: boolean }) {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [zip, setZip] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function go(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr('');
    const c = code.trim().toUpperCase();
    const r = await fetch(`/api/claim/${encodeURIComponent(c)}?zip=${encodeURIComponent(zip.trim())}`);
    setBusy(false);
    if (!r.ok) return setErr((await r.json()).error || 'Claim not found.');
    try { sessionStorage.setItem(`claim_zip_${c}`, zip.trim()); } catch {}
    router.push(`/claim/${c}`);
  }

  const field = 'w-full rounded-sm border-0 bg-white px-4 py-3 text-[#1b2420] placeholder:text-[#7b857f] outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-[#c8875a]';
  return (
    <form onSubmit={go} className="grid max-w-md gap-3">
      <input value={code} onChange={(e) => setCode(e.target.value)} required placeholder="Claim code from your letter" className={`${field} uppercase tracking-widest placeholder:normal-case placeholder:tracking-normal`} />
      <input value={zip} onChange={(e) => setZip(e.target.value)} inputMode="numeric" placeholder="ZIP code on your letter" className={field} />
      <button disabled={busy} className="mt-1 w-56 rounded-full bg-gradient-to-b from-[#d79a6e] to-[#b8764a] px-6 py-3 font-semibold text-[#13302a] shadow disabled:opacity-60">
        {busy ? 'Checking…' : 'Find my claim'}
      </button>
      {err && <p className={`text-sm ${dark ? 'text-[#ffd6c2]' : 'text-red-700'}`}>{err}</p>}
    </form>
  );
}

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClaimForm({ inline = false, dark = false }: { inline?: boolean; dark?: boolean }) {
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

  const field = 'h-[42px] w-full rounded-[2px] border border-[#ccc] bg-white px-[15px] text-[14px] text-[#13302a] placeholder:text-[#999] outline-none focus:border-[#a8703f]';
  const button = 'h-[42px] rounded-full bg-gradient-to-b from-[#c9935f] to-[#a8703f] px-10 text-[14px] font-medium text-white shadow-sm disabled:opacity-60';
  return (
    <form onSubmit={go} className={inline ? 'grid gap-2.5 sm:grid-cols-[1fr_1fr_auto]' : 'grid max-w-[355px] gap-2.5'}>
      <input value={code} onChange={(e) => setCode(e.target.value)} required placeholder="Please enter claim code" aria-label="Claim code" className={`${field} uppercase placeholder:normal-case`} />
      <input value={zip} onChange={(e) => setZip(e.target.value)} inputMode="numeric" placeholder="Please enter ZIP code" aria-label="ZIP code" className={field} />
      <button disabled={busy} className={`${button} ${inline ? '' : 'mt-3 w-fit'}`}>{busy ? 'Checking…' : 'Find Out More'}</button>
      {err && <p className={`text-[13px] sm:col-span-3 ${dark ? 'text-[#ffd8c2]' : 'text-red-700'}`}>{err}</p>}
    </form>
  );
}

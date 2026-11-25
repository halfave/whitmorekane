'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const KINDS: [string, string][] = [['proof_of_payment', 'Proof of payment'], ['ppu1', 'PPU1 (filed)'], ['refund_check', 'Refund check'], ['agency_letter', 'Agency letter'], ['other', 'Other']];

export default function Attach({ id }: { id: string }) {
  const [kind, setKind] = useState('proof_of_payment');
  const [msg, setMsg] = useState('');
  const router = useRouter();
  async function go(file?: File) {
    if (!file) return;
    setMsg('Uploading…');
    const post = (b: any) => fetch(`/api/admin/claims/${id}/upload`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ kind, fileName: file.name, ...b }) });
    const r = await post({ step: 'url' }); const j = await r.json();
    if (!r.ok) return setMsg(j.error);
    const { error } = await supabase.storage.from('claim-docs').uploadToSignedUrl(j.path, j.token, file);
    if (error) return setMsg('Upload failed');
    const r2 = await post({ step: 'record', path: j.path });
    if (!r2.ok) return setMsg('Could not save');
    setMsg(''); router.refresh();
  }
  return (
    <div className="flex items-center gap-1">
      <select value={kind} onChange={(e) => setKind(e.target.value)} className="rounded border border-[#cfcac0] px-1 py-0.5 text-[11px]">
        {KINDS.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
      <label className="cursor-pointer rounded border border-[#cfcac0] px-1.5 py-0.5 text-[11px] hover:bg-[#f4efe6]">
        Attach<input type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => go(e.target.files?.[0])} />
      </label>
      {msg && <span className="text-[11px] text-[#a8703f]">{msg}</span>}
    </div>
  );
}

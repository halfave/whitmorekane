'use client';
import { useEffect, useRef, useState } from 'react';

// US address autocomplete via Photon (OpenStreetMap, no key). Free typing still works.
type Hit = { label: string };

function fmt(p: any): string {
  const street = [p.housenumber, p.street].filter(Boolean).join(' ') || p.name || '';
  const city = p.city || p.district || p.county || '';
  return [street, city, [p.state, p.postcode].filter(Boolean).join(' ')].filter(Boolean).join(', ');
}

export default function AddressLookup({ value, onChange, className }: { value: string; onChange: (v: string) => void; className?: string }) {
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const skip = useRef(false);

  useEffect(() => {
    if (skip.current) { skip.current = false; return; }
    const q = value.trim();
    if (q.length < 4) { setHits([]); return; }
    const ctl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=6&lang=en&bbox=-125,24,-66,50&layer=house&layer=street`, { signal: ctl.signal });
        const j = await r.json();
        const seen = new Set<string>();
        const list: Hit[] = [];
        for (const f of j.features || []) {
          if (f.properties?.countrycode && f.properties.countrycode !== 'US') continue;
          const label = fmt(f.properties || {});
          if (label && !seen.has(label)) { seen.add(label); list.push({ label }); }
        }
        setHits(list); setOpen(true);
      } catch { /* lookup is a convenience only */ }
    }, 250);
    return () => { clearTimeout(t); ctl.abort(); };
  }, [value]);

  return (
    <div className="relative">
      <input
        required value={value} autoComplete="street-address" placeholder="Start typing a street address"
        onChange={(e) => onChange(e.target.value)} onFocus={() => hits.length && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)} className={className}
        role="combobox" aria-expanded={open && hits.length > 0} aria-autocomplete="list"
      />
      {open && hits.length > 0 && (
        <ul role="listbox" className="absolute z-20 mt-1 w-full overflow-hidden border border-[#ddd5c7] bg-white text-[14px] shadow-lg">
          {hits.map((h) => (
            <li key={h.label} role="option" aria-selected={false}
              onMouseDown={(e) => { e.preventDefault(); skip.current = true; onChange(h.label); setOpen(false); }}
              className="cursor-pointer px-3 py-2 hover:bg-[#fbf9f5]">{h.label}</li>
          ))}
        </ul>
      )}
      <p className="mt-1 text-[12px] text-[#6b6a64]">Add a unit or suite number if there is one.</p>
    </div>
  );
}

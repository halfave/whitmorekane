// Interlocked italic W/K mark + serif wordmark (logo option 4).
export default function Logo({ dark = true }: { dark?: boolean }) {
  const ink = dark ? '#ffffff' : '#13302a';
  return (
    <span className="flex items-center gap-2.5">
      <svg width="46" height="40" viewBox="0 0 52 44" aria-hidden="true" className="shrink-0">
        <text x="4" y="34" fill={ink} style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 700, fontSize: 36 }}>W</text>
        <text x="25" y="38" fill="#c9935f" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 700, fontSize: 36 }}>K</text>
      </svg>
      <span className="leading-none">
        <span className="block font-[family-name:var(--font-serif)] text-[24px] font-semibold tracking-[0.01em]" style={{ color: ink }}>Whitmore Kane</span>
        <span className={`mt-[3px] block text-[9px] font-semibold tracking-[0.32em] ${dark ? 'text-[#e0b083]' : 'text-[#a8703f]'}`}>&amp; ASSOCIATES</span>
      </span>
    </span>
  );
}

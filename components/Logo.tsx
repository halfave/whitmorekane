// Flourished script W (Monsieur La Doulaise) in copper + italic serif "hitmore Kane".
export default function Logo({ dark = true }: { dark?: boolean }) {
  const ink = dark ? '#ffffff' : '#13302a';
  const copper = dark ? '#c9935f' : '#a8703f';
  return (
    <span className="relative inline-flex my-[4px] h-[50px] items-end pl-[50px] leading-none" aria-label="Whitmore Kane">
      <span aria-hidden="true" className="absolute left-0 top-[-6px] font-[family-name:var(--font-script)] text-[68px] leading-none" style={{ color: copper }}>W</span>
      <span aria-hidden="true" className="mb-[4px] font-[family-name:var(--font-serif)] text-[27px] font-semibold italic tracking-[0.01em]" style={{ color: ink }}>hitmore Kane</span>
    </span>
  );
}

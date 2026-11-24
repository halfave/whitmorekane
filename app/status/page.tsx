import ClaimForm from '@/components/ClaimForm';

export const metadata = { title: 'Claim status | Whitmore Kane & Associates' };

export default function Status() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c8875a]">Claim status</div>
      <h1 className="mt-2 text-3xl font-bold uppercase tracking-tight">Check on your claim</h1>
      <p className="mt-3 font-[family-name:var(--font-serif)] text-lg text-[#3d4843]">
        Enter the claim code and ZIP code from your letter to see where things stand.
      </p>
      <div className="mt-8"><ClaimForm /></div>
    </section>
  );
}

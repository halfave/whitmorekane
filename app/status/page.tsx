import ClaimForm from '@/components/ClaimForm';

export const metadata = { title: 'Claim status | Whitmore Kane' };

export default function Status() {
  return (
    <section className="bg-[#f4efe6]">
      <div className="mx-auto max-w-[900px] px-[15px] py-[60px] text-center">
        <h1 className="text-[34px] font-medium text-[#13302a] sm:text-[40px]">Claim status</h1>
        <p className="mx-auto mt-3 max-w-[520px] text-[#4a5550]">Enter the claim code and ZIP code from your letter to see where your claim stands.</p>
        <div className="mx-auto mt-8 max-w-[720px] bg-white p-4 shadow-sm"><ClaimForm inline /></div>
      </div>
    </section>
  );
}

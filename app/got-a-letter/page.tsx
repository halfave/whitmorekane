import Image from 'next/image';
import Link from 'next/link';
import ClaimForm from '@/components/ClaimForm';

export const metadata = { title: 'Got a letter? | Whitmore Kane & Associates' };

export default function GotALetter() {
  return (
    <>
      <section className="bg-[#f4efe6]">
        <div className="mx-auto max-w-[900px] px-[15px] py-[60px] text-center">
          <h1 className="text-[34px] font-medium text-[#13302a] sm:text-[40px]">Got a letter?</h1>
          <p className="mx-auto mt-3 max-w-[560px] text-[#4a5550]">
            Yes, it’s genuine. A New York City agency is holding money that appears to belong to you. Enter the claim code and ZIP
            code from your letter to see the details.
          </p>
          <div className="mx-auto mt-8 max-w-[720px] bg-white p-4 shadow-sm"><ClaimForm inline /></div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1170px] items-center gap-10 px-[15px] py-[60px] md:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=75" alt="Signing a document" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className="text-[15px] text-[#4a5550]">
          <h2 className="text-[26px] font-medium uppercase leading-[1.1] text-[#13302a]">Where does the money come from?</h2>
          <p className="mt-4">Usually a fine or penalty on one of your properties that was paid more than once, or paid in full before a hearing reduced it. The agency keeps the difference as a credit on your record until someone asks for it back.</p>
          <p className="mt-3">It’s easy to miss. Payments are often made by a managing agent, a contractor or at a closing, and nobody checks the balance afterward.</p>
          <Link href="/how-it-works" className="mt-5 inline-block font-medium text-[#a8703f] underline">See exactly how the process works</Link>
        </div>
      </section>
    </>
  );
}

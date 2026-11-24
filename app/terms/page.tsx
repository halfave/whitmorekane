import Link from 'next/link';
import LegalPage, { CONTACT } from '@/components/LegalPage';

export const metadata = { title: 'Terms & Conditions | Whitmore Kane & Associates' };

export default function Terms() {
  return (
    <LegalPage
      title="Terms and Conditions"
      intro="These terms govern your use of whitmorekane.com and our claims portal."
      sections={[
        ['Agreement to terms', <p>By using this website, you agree to these terms. If you don’t agree, please don’t use the site.</p>],
        ['Services', <p>Whitmore Kane &amp; Associates, a trade name of Half Ave Company LLC, helps people and businesses recover money held by New York City agencies. Our work on any specific claim, including our fee, is governed by the authorization and fee agreement you sign in the portal. If that agreement conflicts with these terms, the agreement controls.</p>],
        ['Text messages', <p>We don’t currently send text messages. See our <Link href="/privacy">Privacy Policy</Link> for how we would ask for consent if that changes.</p>],
        ['User responsibilities', <>
          <ul>
            <li>Give us accurate, complete information and documents</li>
            <li>Only sign for a company if you are authorized to act for it</li>
            <li>Keep your claim code private</li>
            <li>Don’t misuse the site, interfere with it or try to access information that isn’t yours</li>
          </ul>
        </>],
        ['Outcomes', <p>Refund decisions are made by the agency holding the money, not by us. We can’t guarantee that a refund will be issued, how much it will be, or how long it will take.</p>],
        ['Intellectual property', <p>The content, design and logo on this site belong to Half Ave Company LLC. You may not copy or reuse them without our permission. Photographs are used under license.</p>],
        ['Disclaimer', <>
          <p>This website is provided “as is.” Information on it is general and is not legal, tax or financial advice. We are not a law firm.</p>
          <p>We are an independent company and are not affiliated with, endorsed by or acting for the City of New York or any government agency.</p>
        </>],
        ['Limitation of liability', <p>To the fullest extent the law allows, Half Ave Company LLC is not liable for indirect, incidental or consequential damages arising from your use of this website. This does not limit any obligation in an agreement you sign with us.</p>],
        ['Governing law', <p>These terms are governed by the laws of the State of New York.</p>],
        ['Privacy', <p>Our <Link href="/privacy">Privacy Policy</Link> explains how we handle your information.</p>],
        ['Changes', <p>We may update these terms. The date at the top shows when they last changed.</p>],
        ['Contact', CONTACT],
      ]}
    />
  );
}

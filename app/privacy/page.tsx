import LegalPage, { CONTACT } from '@/components/LegalPage';

export const metadata = { title: 'Privacy Policy | Whitmore Kane' };

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="This policy explains what information Whitmore Kane collects through this website and claims portal, how we use it, and the choices you have."
      sections={[
        ['Information we collect', <>
          <p>When you look up a claim, you give us the claim code and ZIP code from your letter. If you continue with a claim, we collect:</p>
          <ul>
            <li>Your name, title, company name, email address and phone number, and later the address where you want your check mailed</li>
            <li>Your electronic signature</li>
            <li>Details and records of the original payment, such as receipts or bank or card statement pages</li>
          </ul>
          <p>Before you sign, we confirm your email with a one-time code. When you sign a document, we also record your IP address, your browser and the date and time, keep a copy of exactly what you signed, and email you a copy. Our hosting provider keeps standard server logs.</p>
        </>],
        ['How we use information', <>
          <p>We use your information only to handle your claim and run our business:</p>
          <ul>
            <li>To prepare, sign and submit refund paperwork to the agency holding your money</li>
            <li>To verify your signature and authority to act for a company</li>
            <li>To communicate with you and the agency about your claim</li>
            <li>To mail your check and send our invoice</li>
            <li>To keep records required by law and resolve disputes</li>
          </ul>
        </>],
        ['Text messages', <p>We don’t currently send text messages. If we add text updates, we’ll ask for your consent first, and you’ll be able to stop them at any time by replying STOP.</p>],
        ['Sharing of information', <>
          <p>We never sell your information or share it for advertising. We share it only:</p>
          <ul>
            <li>With the government agency holding your money, as needed to request your refund</li>
            <li>With service providers that host our website and store our files, who may use it only to provide those services</li>
            <li>When required by law, or to protect our rights</li>
            <li>With your permission</li>
          </ul>
        </>],
        ['Security', <p>Information is encrypted in transit. Documents are kept in private storage and opened only through short-lived links by our staff. No system is perfectly secure, but we limit access to what’s needed to handle your claim.</p>],
        ['Retention', <p>We keep claim records for as long as needed to complete your claim and meet our legal, tax and accounting obligations, then delete them.</p>],
        ['Your choices and privacy rights', <p>You can ask us what information we hold about you, ask us to correct it, or ask us to delete it, unless we must keep it by law. Email us and include your claim code.</p>],
        ['Cookies and similar technologies', <p>We don’t use cookies, advertising or analytics trackers. While you use the portal, your browser temporarily stores your ZIP code so you don’t have to re-enter it, and remembers that you’ve seen our privacy notice.</p>],
        ['Children', <p>This site is not intended for anyone under 18.</p>],
        ['Changes', <p>We may update this policy. The date at the top shows when it last changed.</p>],
        ['Contact', CONTACT],
      ]}
    />
  );
}

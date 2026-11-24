import LegalPage, { CONTACT } from '@/components/LegalPage';

export const metadata = { title: 'Accessibility | Whitmore Kane & Associates' };

export default function Accessibility() {
  return (
    <LegalPage
      title="Accessibility"
      intro="We want everyone to be able to use this website and complete a claim, including people who use assistive technology."
      sections={[
        ['Our goal', <p>We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.1, Level AA, and we test pages with keyboard navigation and screen readers as we build them.</p>],
        ['What we do', <ul>
          <li>Every form field has a visible label</li>
          <li>Pages can be used with a keyboard alone</li>
          <li>Text and buttons are designed to meet contrast guidelines</li>
          <li>Images have text descriptions</li>
          <li>Pages work on phones, tablets and computers, and at larger text sizes</li>
        </ul>],
        ['Signing documents', <p>Our portal asks you to draw your signature. If you can’t use a mouse, trackpad or touchscreen, email us and we’ll arrange another way to sign.</p>],
        ['Known limitations', <p>Some documents, such as government forms, are PDFs we don’t control and may not be fully accessible. We’re happy to read them to you or provide the information another way.</p>],
        ['Feedback', <p>If anything on this site is hard to use, please tell us. Include the page and what happened, and we’ll respond within two business days.</p>],
        ['Contact', CONTACT],
      ]}
    />
  );
}

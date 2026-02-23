import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../components/ui';
import { setPageMeta } from '../lib/seo';
import styles from './PrivacyPolicyPage.module.css';

/** Last updated date (ISO 8601) for legal pages. */
const POLICY_LAST_UPDATED = '2026-02-22';

const CONTACT_EMAIL = 'DIYverse@gmx.de';

const PAGE_TITLE = 'Privacy Policy – DIYverse';
const META_DESCRIPTION =
  'Privacy Policy for DIYverse. How we collect, use and protect your data. GDPR and BDSG compliant.';

export function PrivacyPolicyPage() {
  useEffect(() => {
    return setPageMeta({
      title: PAGE_TITLE,
      description: META_DESCRIPTION,
      canonicalPath: '/privacy-policy',
    });
  }, []);

  return (
    <Container className={styles.wrapper}>
      <article className={styles.article}>
        <h1 className={styles.title}>DIYverse – Privacy Policy (Datenschutzerklärung)</h1>

        <p className={styles.updated}>
          Last updated:{' '}
          {new Date(POLICY_LAST_UPDATED).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </p>

        <p className={styles.intro}>
          This Privacy Policy explains in clear terms how DIYverse collects, uses and protects
          your personal data when you use our website and services. It is intended for users in
          Germany and the European Union and is aligned with the EU General Data Protection
          Regulation (GDPR), the German Federal Data Protection Act (BDSG) and the German
          Telecommunications-Telemedia Data Protection Act (TTDSG).
        </p>

        <section className={styles.section} aria-labelledby="controller">
          <h2 id="controller">1. Who is responsible for your data? (Controller)</h2>
          <p>
            The &quot;controller&quot; under data protection law (the party that decides how and why
            your data is processed) is:
          </p>
          <address className={styles.address}>
            <strong>Marius Faber</strong>
            <br />
            Brühlstraße 55
            <br />
            71106 Magstadt
            <br />
            Germany
            <br />
            Email: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </address>
          <p>
            For more provider details, see our <Link to="/impressum">Impressum</Link>.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="data-we-collect">
          <h2 id="data-we-collect">2. What data we collect</h2>
          <p>We only collect data that is necessary for the purposes described below.</p>
          <ul>
            <li>
              <strong>Account data:</strong> When you register, we process your email address
              and a password (stored in encrypted form). You may optionally provide a display
              name and profile picture.
            </li>
            <li>
              <strong>Content you create:</strong> Projects, descriptions, images, comments and
              other content you upload or post are stored so we can provide the service. This
              may contain personal data if you include it (e.g. name in a description).
            </li>
            <li>
              <strong>Usage and technical data:</strong> When you use the website we may
              automatically process data such as your IP address, type of browser and device,
              and the pages you visit. Our hosting and infrastructure providers may also log
              such data for security and operation (e.g. access logs).
            </li>
            <li>
              <strong>Session and storage data:</strong> So that you can stay logged in, we use
              session storage (e.g. in your browser or via our authentication provider). This
              is governed by the TTDSG where it involves access to or storage of information
              on your device.
            </li>
          </ul>
        </section>

        <section className={styles.section} aria-labelledby="purposes">
          <h2 id="purposes">3. For what purposes and on what legal basis we process your data</h2>
          <p>
            Under the GDPR we must have a &quot;legal basis&quot; for each processing. We process your
            data only for the following purposes and on these bases:
          </p>
          <ul>
            <li>
              <strong>Providing the service (account, projects, comments):</strong> So you can
              register, log in, publish projects and interact with others. Legal basis:
              performance of a contract with you (Art. 6(1)(b) GDPR) and, where relevant, our
              legitimate interest in operating the platform (Art. 6(1)(f) GDPR).
            </li>
            <li>
              <strong>Security and operation:</strong> To protect the service from abuse, to
              fix faults and to ensure stability. Legal basis: legitimate interest (Art.
              6(1)(f) GDPR) and, where applicable, legal obligations (Art. 6(1)(c) GDPR).
            </li>
            <li>
              <strong>Legal compliance:</strong> To comply with laws we are subject to (e.g.
              retention for legal claims, response to authorities where required by law).
              Legal basis: legal obligation (Art. 6(1)(c) GDPR) or legitimate interest (Art.
              6(1)(f) GDPR).
            </li>
            <li>
              <strong>Communicating with you:</strong> To answer your enquiries (e.g. via the
              contact email). Legal basis: legitimate interest (Art. 6(1)(f) GDPR) or, if you
              request a quote or contract, performance of contract (Art. 6(1)(b) GDPR).
            </li>
          </ul>
          <p>
            If we ever process data based on your consent (e.g. for optional features), you
            may withdraw that consent at any time. Withdrawal does not affect the lawfulness
            of processing before the withdrawal (Art. 7(3) GDPR).
          </p>
        </section>

        <section className={styles.section} aria-labelledby="retention">
          <h2 id="retention">4. How long we keep your data</h2>
          <p>We keep your data only as long as necessary for the purposes above.</p>
          <ul>
            <li>
              <strong>Account and profile:</strong> Until you delete your account (or ask us to
              delete it). After that we may retain some data only where required by law (e.g.
              for legal claims) or for a short period for security.
            </li>
            <li>
              <strong>Content (projects, comments):</strong> Until you delete it or your
              account is deleted, unless we must retain it for legal or regulatory reasons.
            </li>
            <li>
              <strong>Logs and technical data:</strong> For a limited period (typically no
              longer than necessary for security and troubleshooting, often a few weeks,
              unless a longer period is required by law).
            </li>
          </ul>
        </section>

        <section className={styles.section} aria-labelledby="recipients">
          <h2 id="recipients">5. Who receives your data</h2>
          <p>We do not sell your personal data. We may share data only as follows:</p>
          <ul>
            <li>
              <strong>Service providers (processors):</strong> Hosting, database and
              authentication services (e.g. Supabase, Vercel or similar) process data on our
              behalf to run the website. We use providers that comply with data protection
              requirements and are bound by contract to process data only as we instruct.
            </li>
            <li>
              <strong>Other users and the public:</strong> Content you publish (e.g. projects,
              comments, display name, profile picture) is visible according to the
              visibility you choose (e.g. public projects are visible to everyone).
            </li>
            <li>
              <strong>Authorities:</strong> Only where we are legally obliged to do so (e.g.
              court order or applicable law).
            </li>
          </ul>
        </section>

        <section className={styles.section} aria-labelledby="transfers">
          <h2 id="transfers">6. International transfers</h2>
          <p>
            Your data is processed in the European Union where possible. If we or our
            processors use services outside the EU/EEA, we ensure appropriate safeguards are
            in place, such as:
          </p>
          <ul>
            <li>An adequacy decision by the European Commission, or</li>
            <li>Standard contractual clauses (SCCs) approved by the European Commission, and
            supplementary measures where necessary.</li>
          </ul>
          <p>
            You may request more detail on the safeguards we use for a specific transfer by
            contacting us at the address in Section 11.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="rights">
          <h2 id="rights">7. Your rights under GDPR and BDSG</h2>
          <p>You have the following rights in relation to your personal data:</p>
          <ul>
            <li>
              <strong>Access (Art. 15 GDPR):</strong> You can ask us for a copy of the
              personal data we hold about you and information about how we process it.
            </li>
            <li>
              <strong>Rectification (Art. 16 GDPR):</strong> You can ask us to correct
              inaccurate data or complete incomplete data.
            </li>
            <li>
              <strong>Erasure (Art. 17 GDPR):</strong> You can ask us to delete your data in
              certain situations (e.g. it is no longer necessary, you withdraw consent, or
              you object and we have no overriding grounds).
            </li>
            <li>
              <strong>Restriction (Art. 18 GDPR):</strong> You can ask us to restrict
              processing in certain cases (e.g. while we verify accuracy or you need the
              data for legal claims).
            </li>
            <li>
              <strong>Data portability (Art. 20 GDPR):</strong> Where we process your data
              by automated means based on contract or consent, you can ask to receive your
              data in a structured, commonly used, machine-readable format.
            </li>
            <li>
              <strong>Objection (Art. 21 GDPR):</strong> Where we process based on legitimate
              interest, you can object on grounds relating to your situation. We will then
              stop unless we have compelling legitimate grounds that override your interests.
            </li>
            <li>
              <strong>Withdraw consent:</strong> Where processing is based on consent, you
              can withdraw it at any time.
            </li>
            <li>
              <strong>Complaint to a supervisory authority (Art. 77 GDPR, §19 BDSG):</strong>{' '}
              You have the right to lodge a complaint with a data protection supervisory
              authority. For Germany, the competent authority is typically the supervisory
              authority of the federal state where you live (e.g. for Baden-Württemberg:{' '}
              <a
                href="https://www.baden-wuerttemberg.datenschutz.de"
                target="_blank"
                rel="noopener noreferrer"
              >
                Landesbeauftragter für den Datenschutz und die Informationsfreiheit
                Baden-Württemberg
              </a>
              ). You can also complain in the EU member state of your residence, place of
              work or place of the alleged infringement.
            </li>
          </ul>
          <p>
            To exercise any of these rights, contact us at the email or postal address in
            Section 11. We will respond within the time limits required by law (generally
            one month under the GDPR).
          </p>
        </section>

        <section className={styles.section} aria-labelledby="cookies">
          <h2 id="cookies">8. Cookies and similar technologies (TTDSG)</h2>
          <p>
            The German Telecommunications-Telemedia Data Protection Act (TTDSG) governs the
            use of cookies and similar technologies that store or access information on your
            device.
          </p>
          <ul>
            <li>
              <strong>Strictly necessary storage:</strong> We use storage that is strictly
              necessary to provide the service you request (e.g. session or login state). Such
              use is permitted under §25(2) no. 2 TTDSG without separate consent because it is
              necessary for the service.
            </li>
            <li>
              <strong>Optional or non-essential cookies:</strong> If we use optional cookies
              (e.g. for analytics or preferences) in the future, we will ask for your consent
              where required by the TTDSG and the GDPR before setting them.
            </li>
          </ul>
          <p>
            You can control or delete cookies and similar data via your browser settings.
            Restricting necessary storage may affect the availability of certain features
            (e.g. staying logged in).
          </p>
        </section>

        <section className={styles.section} aria-labelledby="changes">
          <h2 id="changes">9. Changes to this Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time (e.g. due to legal changes or
            new features). The &quot;Last updated&quot; date at the top will be revised when we do.
            We encourage you to review this page periodically. If changes materially affect
            how we use your data, we will inform you where required by law (e.g. by email or
            a notice on the site).
          </p>
        </section>

        <section className={styles.section} aria-labelledby="governing-law">
          <h2 id="governing-law">10. Governing law</h2>
          <p>
            This Privacy Policy and the processing of your personal data are governed by the
            laws of the Federal Republic of Germany and the European Union (in particular the
            GDPR and the BDSG), to the extent applicable.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="contact">
          <h2 id="contact">11. Contact and data protection enquiries</h2>
          <p>
            For any request regarding your personal data (e.g. access, correction, deletion,
            restriction, portability, objection) or for questions about this Privacy Policy:
          </p>
          <address className={styles.address}>
            <strong>Marius Faber / DIYverse</strong>
            <br />
            Brühlstraße 55, 71106 Magstadt, Germany
            <br />
            Email: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </address>
          <p>
            For provider identification, see our <Link to="/impressum">Impressum</Link>. For
            terms of use and content policies, see our{' '}
            <Link to="/terms-of-service">Terms of Service</Link> and{' '}
            <Link to="/user-content-policy">User Content &amp; Legal Compliance Policy</Link>.
          </p>
        </section>
      </article>
    </Container>
  );
}

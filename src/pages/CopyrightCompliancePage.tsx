import { Link } from 'react-router-dom';
import { Container } from '../components/ui';
import styles from './CopyrightCompliancePage.module.css';

/** Last updated date (ISO 8601) for legal pages. */
const POLICY_LAST_UPDATED = '2026-02-19';

const CONTACT_EMAIL = 'DIYverse@gmx.de';

export function CopyrightCompliancePage() {
  return (
    <Container className={styles.wrapper}>
      <article className={styles.article}>
        <h1 className={styles.title}>DIYverse – Copyright Compliance Policy</h1>

        <p className={styles.updated}>
          Last updated:{' '}
          {new Date(POLICY_LAST_UPDATED).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </p>

        <p className={styles.intro}>
          This Copyright Compliance Policy describes how DIYverse handles reports of copyright
          infringement on its platform. It is intended for publication in Germany and the
          European Union and is aligned with German law (Urheberrechtsgesetz – UrhG), the EU
          Copyright Directive (2019/790), and the Digital Services Act (Regulation (EU)
          2022/2065).
        </p>

        <section className={styles.section} aria-labelledby="scope">
          <h2 id="scope">1. Purpose and Scope</h2>
          <p>
            DIYverse is an intermediary hosting service. Users upload projects, designs, files,
            images, and other content. DIYverse does not proactively monitor content for
            copyright infringement. This policy sets out:
          </p>
          <ul>
            <li>How rightsholders can report allegedly infringing content</li>
            <li>What information must be provided in a notice</li>
            <li>How DIYverse responds to valid notices</li>
            <li>How users may submit a counter-notice to contest removal</li>
            <li>Consequences for repeat infringers and misuse of the notice system</li>
          </ul>
          <p>
            For general illegal content (non-copyright), reporting is described in the{' '}
            <Link to="/terms-of-service">Terms of Service</Link> and the{' '}
            <Link to="/user-content-policy">User Content &amp; Legal Compliance Policy</Link>.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="legal-basis">
          <h2 id="legal-basis">2. Legal Basis</h2>
          <p>This policy is based on:</p>
          <ul>
            <li>
              <strong>German law:</strong> Gesetz über Urheberrecht und verwandte Schutzrechte
              (UrhG) – Copyright and related rights; notice and takedown in the context of
              intermediary liability.
            </li>
            <li>
              <strong>EU law:</strong> Directive (EU) 2019/790 on copyright in the Digital
              Single Market; Regulation (EU) 2022/2065 (Digital Services Act, DSA), including
              obligations for hosting service providers regarding illegal content and
              transparency.
            </li>
          </ul>
          <p>
            DIYverse processes copyright reports in accordance with these provisions and will
            remove or disable access to content that infringes copyright when properly notified
            and where the notice meets the requirements below.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="designated-contact">
          <h2 id="designated-contact">3. Designated Contact for Copyright Reports</h2>
          <p>
            Reports of copyright infringement must be sent to the following designated contact.
            Use this channel for copyright-specific notices so they can be processed without
            undue delay.
          </p>
          <address className={styles.address}>
            <strong>Copyright / Urheberrecht</strong>
            <br />
            DIYverse
            <br />
            Email: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            <br />
            Subject line recommended: &quot;Copyright notice&quot; or &quot;Urheberrechtsverletzung&quot;
          </address>
          <p>
            Postal address for formal or legal notices: see <Link to="/impressum">Impressum</Link>.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="infringement">
          <h2 id="infringement">4. What Constitutes Copyright Infringement</h2>
          <p>For the purpose of this policy, copyright infringement includes:</p>
          <ul>
            <li>Unauthorised reproduction, distribution, or public communication of works
            protected by copyright or related rights (e.g. texts, images, designs, software,
            instructions) without the rightsholder&apos;s consent or a legal exception</li>
            <li>Use of protected works beyond the scope of a licence granted to the user</li>
            <li>Infringement of moral rights or rights of attribution where applicable</li>
          </ul>
          <p>
            DIYverse does not make legal determinations. Upon receipt of a sufficiently
            substantiated notice that meets the requirements in Section 5, DIYverse will remove
            or disable access to the reported content and may take further measures (e.g.
            warning, account restriction) in line with the Terms of Service.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="notice-requirements">
          <h2 id="notice-requirements">5. Required Information in a Copyright Notice</h2>
          <p>
            A copyright notice must contain the following information so that DIYverse can
            process it without undue delay. Incomplete notices may not be actionable.
          </p>
          <ol className={styles.orderedList}>
            <li>
              <strong>Identification of the rightsholder</strong> – Name and contact details
              (email, and if applicable postal address) of the person or entity claiming to
              hold the copyright or related rights.
            </li>
            <li>
              <strong>Identification of the work</strong> – Description of the work(s) in
              which rights are claimed (e.g. title, type of work, where it was first published
              or made available).
            </li>
            <li>
              <strong>Location of the allegedly infringing content</strong> – Sufficient
              information to locate the content on DIYverse (e.g. URL of the project page,
              description of the file or image, date if known).
            </li>
            <li>
              <strong>Statement of good faith</strong> – A statement that the complainant has
              a good faith belief that the use of the material is not authorised by the
              rightsholder, its agent, or the law.
            </li>
            <li>
              <strong>Statement of accuracy</strong> – A statement that the information in
              the notice is accurate and, under penalty of law, that the complainant is
              authorised to act on behalf of the rightsholder.
            </li>
            <li>
              <strong>Signature</strong> – Physical or electronic signature of the complainant
              (e.g. name at the end of the email).
            </li>
          </ol>
          <p>
            Notices may be submitted in German or English. Sending the notice to{' '}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with the subject
            &quot;Copyright notice&quot; ensures it is routed to the correct process.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="response">
          <h2 id="response">6. Response to a Valid Notice</h2>
          <p>
            If a notice contains the required information and, on its face, indicates
            infringement, DIYverse will:
          </p>
          <ul>
            <li>Remove or disable access to the reported content without undue delay</li>
            <li>Where appropriate and technically feasible, inform the user who uploaded the
            content of the removal and of the possibility to submit a counter-notice (Section
            7)</li>
            <li>Retain information necessary for the processing of the notice and any
            counter-notice, and for compliance with legal obligations, in accordance with
            applicable data protection law</li>
          </ul>
          <p>
            Removal or disabling of access does not constitute an admission that the content
            infringes copyright. DIYverse is not in a position to adjudicate disputes between
            rightsholders and users; the procedure is a notice-and-takedown mechanism in line
            with applicable law.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="counter-notice">
          <h2 id="counter-notice">7. Counter-Notice (Restoration Request)</h2>
          <p>
            If your content was removed following a copyright notice and you believe it was
            removed in error (e.g. you have a licence, the work is not protected, or you are
            the rightsholder), you may submit a counter-notice to request restoration.
          </p>
          <p>A counter-notice should include:</p>
          <ul>
            <li>Your name and contact details (email, and if applicable postal address)</li>
            <li>Identification of the content that was removed and its location (e.g. project
            URL, file name) before removal</li>
            <li>A statement, under penalty of law, that you have a good faith belief that the
            content was removed or disabled as a result of mistake or misidentification</li>
            <li>Your consent to the jurisdiction of the courts of the country of your address
            or of Germany for the purpose of any proceedings relating to the dispute</li>
            <li>Your physical or electronic signature</li>
          </ul>
          <p>
            Send the counter-notice to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>{' '}
            (subject e.g. &quot;Counter-notice – copyright&quot;). DIYverse may restore the
            content after a reasonable period if no court or administrative action has been
            brought by the original complainant, in accordance with applicable law. DIYverse
            may also forward the counter-notice to the complainant and will not restore content
            if the complainant has initiated legal proceedings.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="repeat-infringers">
          <h2 id="repeat-infringers">8. Repeat Infringers</h2>
          <p>
            In line with industry practice and applicable law, DIYverse may suspend or
            terminate the accounts of users who repeatedly upload content that infringes
            copyright. &quot;Repeated&quot; is assessed on a case-by-case basis (e.g. number
            of valid notices, nature of infringement, user&apos;s conduct). Users will be
            informed of such measures where required by law or the Terms of Service.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="misuse">
          <h2 id="misuse">9. Misuse of the Notice or Counter-Notice System</h2>
          <p>
            Knowingly materially misrepresenting that content is infringing, or that content
            was removed by mistake, may result in liability. DIYverse may take action against
            users or complainants who abuse the notice or counter-notice process (e.g. false
            or bad-faith reports). Such misuse may also be reported to the relevant authorities.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="governing-law">
          <h2 id="governing-law">10. Governing Law</h2>
          <p>
            This policy and the processing of copyright notices and counter-notices are governed
            by the laws of the Federal Republic of Germany and applicable European Union law,
            to the exclusion of the UN Convention on Contracts for the International Sale of
            Goods (CISG).
          </p>
        </section>

        <section className={styles.section} aria-labelledby="contact">
          <h2 id="contact">11. Contact</h2>
          <p>For copyright notices, counter-notices, or questions about this policy:</p>
          <address className={styles.address}>
            <strong>DIYverse</strong>
            <br />
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            <br />
            Brühlstraße 55, 71106 Magstadt, Germany
          </address>
          <p>
            For provider details and other legal information, see the{' '}
            <Link to="/impressum">Impressum</Link>.
          </p>
        </section>
      </article>
    </Container>
  );
}

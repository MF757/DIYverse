import { Container } from '../components/ui';
import styles from './TermsOfServicePage.module.css';

export function TermsOfServicePage() {
  return (
    <Container className={styles.wrapper}>
      <article className={styles.article}>
        <h1 className={styles.title}>DIYverse – Terms of Service (TOS)</h1>

        <p className={styles.updated}>Last updated: 18.02.2026</p>

        <p className={styles.intro}>
          These Terms of Service (&quot;TOS&quot;) constitute a legally binding agreement between
          DIYverse and every natural or legal person using the platform (&quot;User&quot;).
        </p>
        <p>
          These TOS are drafted in accordance with German law and applicable European Union law.
          Use of the platform is permitted only under these TOS.
        </p>

        <section className={styles.section}>
          <h2>1. Provider Information</h2>
          <address className={styles.address}>
            Marius Faber
            <br />
            Brühlstraße 55
            <br />
            71106 Magstadt
            <br />
            Germany
          </address>
        </section>

        <section className={styles.section}>
          <h2>2. Scope of Services</h2>
          <p>
            DIYverse provides an online platform enabling users to upload, publish, share, and
            access DIY projects, files, designs, instructions, images, comments, and related
            materials (&quot;Content&quot;).
          </p>
          <p>DIYverse provides exclusively technical hosting and communication infrastructure.</p>
          <p>DIYverse does not:</p>
          <ul>
            <li>Review content prior to publication</li>
            <li>Adopt user content as its own</li>
            <li>Guarantee accuracy, safety, legality, or functionality of any content</li>
          </ul>
          <p>
            DIYverse acts as a hosting service provider within the meaning of Art. 6 Digital
            Services Act (DSA).
          </p>
        </section>

        <section className={styles.section}>
          <h2>3. Conclusion of Contract</h2>
          <p>A usage contract is concluded upon successful registration of a user account.</p>
          <p>There is no entitlement to registration or continued access to the platform.</p>
          <p>DIYverse may refuse registration without stating reasons.</p>
        </section>

        <section className={styles.section}>
          <h2>4. User Obligations</h2>
          <p>Users are solely responsible for all content they upload or make accessible.</p>
          <p>Users warrant that:</p>
          <ul>
            <li>They hold all necessary rights to uploaded content</li>
            <li>
              Content does not infringe copyrights, trademarks, patents, personality rights, or
              other third-party rights
            </li>
            <li>Content complies with German and EU law</li>
            <li>Content does not violate criminal law provisions</li>
          </ul>
          <p>Users must not upload or distribute:</p>
          <ul>
            <li>Illegal content</li>
            <li>Copyright-infringing material</li>
            <li>Instructions for prohibited weapons or illegal items</li>
            <li>Content promoting violence, extremism, or hate</li>
            <li>Malware or harmful code</li>
          </ul>
          <p>
            Users are obligated to include appropriate safety warnings where projects involve
            risks.
          </p>
        </section>

        <section className={styles.section}>
          <h2>5. Responsibility for Legal Violations</h2>
          <p>Users bear exclusive civil and criminal responsibility for their content and conduct.</p>
          <p>
            If third parties assert claims against DIYverse due to user content, the user shall
            indemnify DIYverse upon first request.
          </p>
          <p>This includes:</p>
          <ul>
            <li>Court costs</li>
            <li>Attorney fees</li>
            <li>Damages</li>
            <li>Administrative fines to the extent legally transferable</li>
          </ul>
          <p>The user shall support DIYverse in legal defense.</p>
        </section>

        <section className={styles.section}>
          <h2>6. License Grant to DIYverse</h2>
          <p>
            By uploading content, the user grants DIYverse a worldwide, non-exclusive, royalty-free
            license for the duration of publication to:
          </p>
          <ul>
            <li>Host</li>
            <li>Store</li>
            <li>Reproduce</li>
            <li>Make publicly accessible</li>
            <li>Technically modify for platform compatibility</li>
          </ul>
          <p>
            This license ends upon deletion of the content, subject to technical backup retention
            cycles.
          </p>
          <p>Users retain ownership of their content.</p>
        </section>

        <section className={styles.section}>
          <h2>7. Platform Moderation and Removal Rights</h2>
          <p>DIYverse may at its sole discretion:</p>
          <ul>
            <li>Remove or block content</li>
            <li>Edit metadata for technical reasons</li>
            <li>Suspend or permanently delete accounts</li>
            <li>Restrict access</li>
          </ul>
          <p>This may occur with or without prior notice.</p>
          <p>There is no claim to restoration of removed content.</p>
          <p>DIYverse may take such measures in particular where:</p>
          <ul>
            <li>Legal violations are suspected</li>
            <li>Third-party complaints are received</li>
            <li>Platform security is endangered</li>
            <li>Repeated policy breaches occur</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>8. Notice-and-Takedown Procedure</h2>
          <p>DIYverse provides mechanisms for reporting illegal content.</p>
          <p>
            Upon obtaining actual knowledge of illegal content, DIYverse will remove or disable
            access without undue delay in accordance with the Digital Services Act.
          </p>
          <p>Removal does not constitute acknowledgment of wrongdoing.</p>
        </section>

        <section className={styles.section}>
          <h2>9. No Warranty</h2>
          <p>DIYverse provides services &quot;as is&quot;.</p>
          <p>DIYverse does not guarantee:</p>
          <ul>
            <li>Uninterrupted availability</li>
            <li>Error-free operation</li>
            <li>Accuracy or completeness of user content</li>
            <li>Suitability of projects for any purpose</li>
          </ul>
          <p>Users execute projects at their own risk.</p>
        </section>

        <section className={styles.section}>
          <h2>10. Limitation of Liability</h2>
          <p>DIYverse is liable without limitation only for:</p>
          <ul>
            <li>Intent</li>
            <li>Gross negligence</li>
            <li>Injury to life, body, or health</li>
          </ul>
          <p>
            In cases of slight negligence, liability is limited to breach of essential contractual
            obligations (Kardinalpflichten) and limited to foreseeable, typical damages.
          </p>
          <p>
            Liability for user-generated content is excluded to the maximum extent permitted by
            law.
          </p>
          <p>Mandatory statutory liability remains unaffected.</p>
        </section>

        <section className={styles.section}>
          <h2>11. Availability and Technical Changes</h2>
          <p>
            DIYverse may modify, suspend, or discontinue services at any time for technical,
            economic, or legal reasons.
          </p>
          <p>Users have no entitlement to specific functionalities or permanent availability.</p>
        </section>

        <section className={styles.section}>
          <h2>12. Account Termination</h2>
          <p>Users may terminate their account at any time.</p>
          <p>
            DIYverse may terminate accounts without notice for good cause, including:
          </p>
          <ul>
            <li>Violation of these TOS</li>
            <li>Legal risk</li>
            <li>Abuse of the platform</li>
          </ul>
          <p>Termination does not affect existing legal claims.</p>
        </section>

        <section className={styles.section}>
          <h2>13. Data Protection</h2>
          <p>
            Processing of personal data is governed exclusively by the separate Privacy Policy.
          </p>
        </section>

        <section className={styles.section}>
          <h2>14. Governing Law and Jurisdiction</h2>
          <p>
            These TOS are governed by the laws of the Federal Republic of Germany, excluding the
            UN Convention on Contracts for the International Sale of Goods (CISG).
          </p>
          <p>
            If the user is a merchant, legal entity under public law, or special fund under public
            law, exclusive place of jurisdiction is the registered office of DIYverse.
          </p>
        </section>

        <section className={styles.section}>
          <h2>15. Severability Clause</h2>
          <p>
            If individual provisions of these TOS are or become invalid, the remaining provisions
            remain unaffected.
          </p>
        </section>

        <section className={styles.section}>
          <h2>16. Amendments</h2>
          <p>DIYverse may amend these TOS where:</p>
          <ul>
            <li>Legal requirements change</li>
            <li>Regulatory obligations arise</li>
            <li>Platform functionality evolves</li>
          </ul>
          <p>Users will be informed of material changes.</p>
          <p>
            Continued use after notification constitutes acceptance unless the user objects within
            a reasonable period.
          </p>
        </section>
      </article>
    </Container>
  );
}

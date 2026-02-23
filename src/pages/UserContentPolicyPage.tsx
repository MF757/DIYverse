import { useEffect } from 'react';
import { Container } from '../components/ui';
import { setPageMeta } from '../lib/seo';
import styles from './UserContentPolicyPage.module.css';

const PAGE_TITLE = 'User Content & Legal Compliance Policy – DIYverse';
const META_DESCRIPTION =
  'DIYverse user content, liability and legal compliance policy. Rules for uploaded projects and prohibited content.';

export function UserContentPolicyPage() {
  useEffect(() => {
    return setPageMeta({
      title: PAGE_TITLE,
      description: META_DESCRIPTION,
      canonicalPath: '/user-content-policy',
    });
  }, []);

  return (
    <Container className={styles.wrapper}>
      <article className={styles.article}>
        <h1 className={styles.title}>
          DIYverse – User Content, Liability & Legal Compliance Policy
        </h1>

        <p className={styles.updated}>Last updated: 18.02.2026</p>

        <section className={styles.section}>
          <h2>1. Scope and Purpose</h2>
          <p>
            DIYverse is an online platform based in Germany that allows users to upload, publish,
            and share do‑it‑yourself (DIY) projects, designs, files, instructions, images, videos,
            and related content (&quot;Projects&quot;).
          </p>
          <p>This policy defines:</p>
          <ul>
            <li>User responsibilities for uploaded content</li>
            <li>Prohibited content and conduct</li>
            <li>Licensing rules</li>
            <li>Liability allocation</li>
            <li>Administrative rights of DIYverse</li>
            <li>Legal compliance under German and EU law</li>
          </ul>
          <p>
            This policy applies to all users, including registered users, contributors, and
            visitors who upload or interact with content.
          </p>
        </section>

        <section className={styles.section}>
          <h2>2. User Responsibility & Accountability</h2>
          <h3>2.1 Full Responsibility of Users</h3>
          <p>
            All Projects and other content uploaded to DIYverse are the sole responsibility of the
            user who uploads them.
          </p>
          <p>By uploading content, users confirm that:</p>
          <ul>
            <li>They are legally allowed to upload and share the content</li>
            <li>The content does not violate any laws, third‑party rights, or this policy</li>
            <li>They assume full legal responsibility for the content</li>
          </ul>
          <p>
            DIYverse does not pre‑review, verify, or endorse user‑submitted Projects.
          </p>
          <h3>2.2 Legal Consequences</h3>
          <p>If a Project or other user content results in:</p>
          <ul>
            <li>Legal claims</li>
            <li>Regulatory actions</li>
            <li>Damages, losses, or costs</li>
          </ul>
          <p>
            The uploading user bears full responsibility, including legal defense and any resulting
            costs.
          </p>
        </section>

        <section className={styles.section}>
          <h2>3. Prohibited Content</h2>
          <p>
            Users must not upload, share, or link to content that includes or promotes:
          </p>
          <h3>3.1 Illegal Content</h3>
          <p>Including but not limited to:</p>
          <ul>
            <li>Content violating German law (e.g. Strafgesetzbuch, Urheberrechtsgesetz)</li>
            <li>Content violating EU law</li>
            <li>Instructions or designs for illegal weapons or prohibited items</li>
            <li>Content related to terrorism or extremist organizations</li>
            <li>Child sexual abuse material or exploitation</li>
          </ul>
          <h3>3.2 Intellectual Property Violations</h3>
          <ul>
            <li>Copyrighted material without proper authorization</li>
            <li>Trademark misuse</li>
            <li>Patented designs without permission</li>
            <li>Content violating trade secrets or confidentiality obligations</li>
          </ul>
          <h3>3.3 Dangerous or Harmful Content</h3>
          <ul>
            <li>
              Projects that encourage unsafe, reckless, or hazardous activities without proper
              warnings
            </li>
            <li>Instructions that may cause serious injury, death, or property damage if followed</li>
          </ul>
          <h3>3.4 Offensive or Abusive Content</h3>
          <ul>
            <li>Hate speech or discrimination</li>
            <li>Harassment, threats, or defamation</li>
            <li>Content violating personal rights (Persönlichkeitsrechte)</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>4. Safety & Disclaimer for DIY Projects</h2>
          <p>
            DIY projects may involve tools, machinery, electricity, chemicals, or other hazards.
          </p>
          <ul>
            <li>DIYverse does not guarantee the safety, accuracy, or completeness of any Project</li>
            <li>Users follow Projects at their own risk</li>
            <li>
              DIYverse assumes no liability for injuries, damages, or losses resulting from the use
              of Projects
            </li>
          </ul>
          <p>Users are responsible for including appropriate safety warnings and instructions.</p>
        </section>

        <section className={styles.section}>
          <h2>5. Licensing of User Content</h2>
          <h3>5.1 User‑Granted License to DIYverse</h3>
          <p>By uploading content, users grant DIYverse a:</p>
          <ul>
            <li>Worldwide</li>
            <li>Non‑exclusive</li>
            <li>Royalty‑free</li>
            <li>Revocable (upon deletion, where technically feasible)</li>
          </ul>
          <p>
            license to host, store, reproduce, display, and distribute the content solely for
            operating and promoting the platform.
          </p>
          <h3>5.2 Third‑Party Licenses</h3>
          <p>
            Users must clearly specify the license under which their Projects are shared (e.g.
            Creative Commons).
          </p>
          <p>Users must ensure:</p>
          <ul>
            <li>They have the right to apply the chosen license</li>
            <li>The license is compatible with the content</li>
          </ul>
          <p>DIYverse is not responsible for license misuse by users.</p>
        </section>

        <section className={styles.section}>
          <h2>6. Notice & Takedown (German Telemedia Act / Digital Services Act)</h2>
          <p>
            DIYverse complies with applicable German and EU regulations, including the Digital
            Services Act (DSA).
          </p>
          <p>If DIYverse becomes aware of illegal content, it will:</p>
          <ul>
            <li>Remove or disable access to the content promptly</li>
            <li>Take appropriate action without admitting liability</li>
          </ul>
          <p>
            Rights holders and authorities may report content through designated reporting
            mechanisms.
          </p>
        </section>

        <section className={styles.section}>
          <h2>7. Administrative Rights of DIYverse</h2>
          <p>DIYverse reserves the unrestricted right to:</p>
          <ul>
            <li>Remove, block, or modify Projects or content at any time</li>
            <li>Suspend or permanently delete user accounts</li>
            <li>Restrict platform access</li>
          </ul>
          <p>
            This may occur with or without prior notice, especially in cases of suspected
            violations, legal risk, or platform security.
          </p>
          <p>Users have no entitlement to the continued availability of content or accounts.</p>
        </section>

        <section className={styles.section}>
          <h2>8. Indemnification</h2>
          <p>
            Users agree to indemnify and hold harmless DIYverse, its operators, administrators, and
            partners from:
          </p>
          <ul>
            <li>Claims</li>
            <li>Damages</li>
            <li>Legal costs</li>
            <li>Attorney fees</li>
          </ul>
          <p>arising from the user&apos;s content, conduct, or violation of laws or this policy.</p>
        </section>

        <section className={styles.section}>
          <h2>9. Limitation of Liability</h2>
          <p>To the maximum extent permitted by German law:</p>
          <ul>
            <li>DIYverse is not liable for user‑generated content</li>
            <li>DIYverse is not liable for damages resulting from reliance on Projects</li>
            <li>DIYverse is not liable for data loss, service interruptions, or third‑party actions</li>
          </ul>
          <p>
            Mandatory liability under German law (e.g. intent, gross negligence, personal injury)
            remains unaffected.
          </p>
        </section>

        <section className={styles.section}>
          <h2>10. Account Termination</h2>
          <p>Users may delete their accounts at any time.</p>
          <p>DIYverse may terminate accounts:</p>
          <ul>
            <li>For violations of this policy</li>
            <li>For legal or regulatory reasons</li>
            <li>To protect the platform or third parties</li>
          </ul>
          <p>Termination does not relieve users of legal responsibility for past actions.</p>
        </section>

        <section className={styles.section}>
          <h2>11. Governing Law & Jurisdiction</h2>
          <ul>
            <li>This policy is governed by the laws of the Federal Republic of Germany</li>
            <li>Exclusive place of jurisdiction, where legally permissible, is Germany</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>12. Changes to This Policy</h2>
          <p>DIYverse may update this policy at any time.</p>
          <p>
            Continued use of the platform after changes constitutes acceptance of the updated
            policy.
          </p>
        </section>

        <section className={styles.section}>
          <h2>13. Contact</h2>
          <p>For legal notices or content reports, contact:</p>
          <address className={styles.address}>
            <strong>DIYverse</strong>
            <br />
            <a href="mailto:DIYverse@gmx.de">DIYverse@gmx.de</a>
            <br />
            Brühlstraße 55 71106 Magstadt
          </address>
        </section>
      </article>
    </Container>
  );
}

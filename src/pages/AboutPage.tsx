import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../components/ui';
import { setPageMeta } from '../lib/seo';
import styles from './AboutPage.module.css';

/** Page title for document and h1. */
const PAGE_TITLE = 'About DIYverse – Share and Discover DIY Projects';

/** Meta description for search engines (recommended 150–160 chars). */
const META_DESCRIPTION =
  'DIYverse is a free platform to share and discover DIY projects. Publish build guides, materials lists, and instructions. Find maker projects and ideas.';

export function AboutPage() {
  useEffect(() => {
    return setPageMeta({
      title: PAGE_TITLE,
      description: META_DESCRIPTION,
      canonicalPath: '/about',
    });
  }, []);

  return (
    <Container className={styles.wrapper}>
      <article className={styles.article}>
        <h1 className={styles.title}>{PAGE_TITLE}</h1>

        <p className={styles.intro}>
          DIYverse is a free platform where makers share DIY projects and anyone can discover build
          guides, materials lists (BOM), step-by-step instructions, and downloadable files. Publish
          your projects, get a permanent link, and help others build the same thing.
        </p>

        <section className={styles.section} aria-labelledby="what-is">
          <h2 id="what-is">What is DIYverse?</h2>
          <p>
            DIYverse is a website for sharing and discovering do-it-yourself (DIY) projects. You can
            publish projects with a title, description, images, tags, a bill of materials (BOM),
            and instructions. Each project gets a stable URL so you can share it or find it in
            search. The platform is built for makers, hobbyists, and anyone who wants to document
            or follow DIY builds.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="who-for">
          <h2 id="who-for">Who is DIYverse for?</h2>
          <p>
            <strong>Makers and builders</strong> who want to publish their projects with clear
            instructions and materials so others can replicate them. <strong>Hobbyists and
            learners</strong> looking for DIY ideas, build guides, and real projects they can try at
            home. <strong>Educators and community projects</strong> that need a simple way to share
            instructions and files. DIYverse is free to use and does not require sign-in to browse
            or read public projects.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="how-it-works">
          <h2 id="how-it-works">How it works</h2>
          <p>
            On the <Link to="/">Discover</Link> page you can browse public DIY projects, filter and
            sort them, and open any project to read the overview, materials, instructions, and
            files. To publish your own project, <Link to="/signin">sign in</Link> and use{' '}
            <Link to="/publish">Create project</Link> or the &quot;Publish a project&quot; link on
            your <Link to="/profile">profile</Link>. Add a title, slug, images, description, tags, a
            bill of materials, and step-by-step instructions (with optional images and files).
            Projects can be listed as public (visible in Discover) or kept unlisted. You can edit
            or delete your projects at any time.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="why-diyverse">
          <h2 id="why-diyverse">Why use DIYverse?</h2>
          <ul>
            <li>
              <strong>Share DIY projects with a permanent link</strong> – One URL per project for
              sharing or search engines.
            </li>
            <li>
              <strong>Structured build guides</strong> – Materials list (BOM), step-by-step
              instructions, and optional files (e.g. STL, PDF, Gerber) in one place.
            </li>
            <li>
              <strong>Discover maker projects</strong> – Browse public projects by recency or title,
              search by text, and open full details without signing in.
            </li>
            <li>
              <strong>Free and simple</strong> – No paid tiers; publish and browse with a standard
              account. Content is stored securely and served fast.
            </li>
          </ul>
        </section>

        <section className={styles.section} aria-labelledby="legal">
          <h2 id="legal">Legal and policies</h2>
          <p>
            Use of DIYverse is subject to our <Link to="/terms-of-service">Terms of Service</Link>,{' '}
            <Link to="/user-content-policy">User Content &amp; Liability Policy</Link>, and{' '}
            <Link to="/privacy-policy">Privacy Policy</Link>. For provider details see the{' '}
            <Link to="/impressum">Impressum</Link>.
          </p>
        </section>
      </article>
    </Container>
  );
}

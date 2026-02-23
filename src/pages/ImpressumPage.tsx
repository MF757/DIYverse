import { useEffect } from 'react';
import { Container } from '../components/ui';
import { setPageMeta } from '../lib/seo';
import styles from './ImpressumPage.module.css';

/**
 * Impressum – Provider identification (§5 TMG / §5 DDG)
 * Fill in all [REQUIRED] fields. Optional fields marked [OPTIONAL].
 * Data types: string, email, postal_address (street, postal_code, city, country).
 */
const PAGE_TITLE = 'Impressum – DIYverse';
const META_DESCRIPTION =
  'Impressum and provider identification for DIYverse as required by §5 TMG / §5 DDG.';

export function ImpressumPage() {
  useEffect(() => {
    return setPageMeta({
      title: PAGE_TITLE,
      description: META_DESCRIPTION,
      canonicalPath: '/impressum',
    });
  }, []);

  return (
    <Container className={styles.wrapper}>
      <article className={styles.article}>
        <h1 className={styles.title}>Impressum</h1>
        <p className={styles.intro}>
          Provider identification as required by §5 TMG / §5 DDG (German Telemedia Act / Digital
          Services Act). Fill in the fields below and replace placeholders before publishing.
        </p>

        <dl className={styles.protocol}>
          <dt>Provider name / Company name</dt>
          <dd>Marius Faber</dd>



          <dt>Street and house number</dt>
          <dd>Brühlstraße 55</dd>

          <dt>Postal code</dt>
          <dd>71106</dd>

          <dt>City</dt>
          <dd>Magstadt</dd>

          <dt>Country</dt>
          <dd>Germany</dd>

          <dt>Email</dt>
          <dd>DIYverse@gmx.de</dd>

          <dt>Phone</dt>
          <dd>+49 170 2837314</dd>







        </dl>


      </article>
    </Container>
  );
}

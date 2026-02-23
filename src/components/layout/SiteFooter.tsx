import { Link } from 'react-router-dom';
import styles from './SiteFooter.module.css';

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <nav className={styles.nav} aria-label="Legal">
          <Link to="/" className={styles.link}>
            DIYverse
          </Link>
          <Link to="/about" className={styles.link}>
            About DIYverse
          </Link>
          <Link to="/impressum" className={styles.link}>
            Impressum
          </Link>
          <Link to="/user-content-policy" className={styles.link}>
            User Content & Liability Policy
          </Link>
          <Link to="/terms-of-service" className={styles.link}>
            Terms of Service
          </Link>
          <Link to="/copyright-compliance" className={styles.link}>
            Copyright Compliance
          </Link>
          <Link to="/privacy-policy" className={styles.link}>
            Privacy Policy
          </Link>
        </nav>
      </div>
    </footer>
  );
}

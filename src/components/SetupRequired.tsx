import { config } from '../lib/config';
import { Container } from './ui';
import styles from './SetupRequired.module.css';

const STEPS: string[] = [
  'Create a file named .env in the project root (same folder as package.json).',
  'Copy the contents of .env.example into .env.',
  'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your Supabase project URL and anon key (Supabase Dashboard → Project Settings → API).',
  'Save .env and restart the dev server (Ctrl+C, then npm run dev).',
];

export function SetupRequired() {
  const hasUrl: boolean = config.hasUrl;
  const hasKey: boolean = config.hasKey;

  return (
    <div className={styles.wrap}>
      <Container>
        <div className={styles.card}>
          <h1 className={styles.title}>Setup required</h1>
          <p className={styles.lead}>
            Set Supabase credentials in .env so the app can load and save data.
          </p>
          <p className={styles.diagnostic} aria-live="polite">
            Env check: URL {hasUrl ? 'set' : 'not set'}, Key {hasKey ? 'set' : 'not set'}.
          </p>
          <ol className={styles.steps} aria-label="Setup steps">
            {STEPS.map((step, i) => (
              <li key={i} className={styles.step}>
                {step}
              </li>
            ))}
          </ol>
          <p className={styles.note}>
            Do not commit .env; it is in .gitignore.
          </p>
        </div>
      </Container>
    </div>
  );
}

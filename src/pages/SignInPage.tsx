import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase/browserClient';
import { Container, Button, Input } from '../components/ui';
import styles from './SignInPage.module.css';

type Mode = 'signin' | 'signup';

export function SignInPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const switchMode = useCallback((next: Mode) => {
    setMode(next);
    setMessage(null);
    if (next === 'signin') setAcceptedTerms(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        setMessage({ type: 'error', text: error.message });
        return;
      }
      navigate('/');
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || undefined,
          terms_accepted_at: new Date().toISOString(),
        },
      },
    });
    setLoading(false);
    if (error) {
      setMessage({ type: 'error', text: error.message });
      return;
    }
    setMessage({ type: 'success', text: 'Check your email to confirm your account.' });
  };

  return (
    <Container>
      <div className={styles.page}>
        <h1 className={styles.title}>
          {mode === 'signin' ? 'Sign in' : 'Create account'}
        </h1>
        <p className={styles.lead}>
          {mode === 'signin'
            ? 'Sign in to publish and manage your projects.'
            : 'Create an account to publish your DIY projects.'}
        </p>

        {message && (
          <div
            className={message.type === 'error' ? styles.error : styles.success}
            role="alert"
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {mode === 'signup' && (
            <Input
              label="Display name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How you want to be shown"
              autoComplete="name"
            />
          )}
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === 'signup' ? 'Min 6 characters' : ''}
            required
            minLength={mode === 'signup' ? 6 : undefined}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          />
          {mode === 'signup' && (
            <div className={styles.termsBlock}>
              <input
                id="accept-terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                required
                aria-required="true"
                aria-describedby="terms-desc"
                className={styles.checkbox}
              />
              <label id="terms-desc" htmlFor="accept-terms" className={styles.termsLabel}>
                I accept the{' '}
                <Link to="/terms-of-service" target="_blank" rel="noopener noreferrer" className={styles.termsLink}>
                  Terms of Service
                </Link>
                {' '}and the{' '}
                <Link to="/user-content-policy" target="_blank" rel="noopener noreferrer" className={styles.termsLink}>
                  User Content &amp; Liability Policy
                </Link>
              </label>
            </div>
          )}
          {mode === 'signin' && (
            <p className={styles.forgot}>
              <Link to="/reset-password">Forgot password?</Link>
            </p>
          )}
          <div className={styles.actions}>
            <Button
              type="submit"
              disabled={loading || (mode === 'signup' && !acceptedTerms)}
            >
              {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </Button>
          </div>
        </form>

        <p className={styles.toggle}>
          {mode === 'signin' ? (
            <>
              Don’t have an account?{' '}
              <button
                type="button"
                className={styles.toggleBtn}
                onClick={() => switchMode('signup')}
              >
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                className={styles.toggleBtn}
                onClick={() => switchMode('signin')}
              >
                Sign in
              </button>
            </>
          )}
        </p>

        <p className={styles.back}>
          <Link to="/">Back to Discover</Link>
        </p>
      </div>
    </Container>
  );
}

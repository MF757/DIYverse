import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase/browserClient';
import { Container, Button, Input } from '../components/ui';
import styles from './ResetPasswordPage.module.css';

type Step = 'request' | 'set-password';

const MIN_PASSWORD_LENGTH = 6;

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setStep('set-password');
        setMessage(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const hash = window.location.hash || '';
    if (hash.includes('type=recovery')) {
      setStep('set-password');
    }
  }, []);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setMessage({ type: 'error', text: 'Please enter your email address.' });
      setLoading(false);
      return;
    }
    const redirectTo = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, { redirectTo });
    setLoading(false);
    if (error) {
      setMessage({ type: 'error', text: error.message });
      return;
    }
    setMessage({
      type: 'success',
      text: 'If an account exists for that email, you will receive a link to reset your password. Check your inbox and spam folder.',
    });
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setPasswordError(null);
    if (password.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setMessage({ type: 'error', text: error.message });
      return;
    }
    setMessage({ type: 'success', text: 'Your password has been updated.' });
    setPassword('');
    setConfirmPassword('');
    setTimeout(() => navigate('/signin', { replace: true }), 2000);
  };

  return (
    <Container>
      <div className={styles.page}>
        <h1 className={styles.title}>
          {step === 'request' ? 'Forgot password' : 'Set new password'}
        </h1>
        <p className={styles.lead}>
          {step === 'request'
            ? 'Enter your email and we’ll send you a link to reset your password.'
            : 'Enter and confirm your new password below.'}
        </p>

        {message && (
          <div
            className={message.type === 'error' ? styles.error : styles.success}
            role="alert"
          >
            {message.text}
          </div>
        )}

        {step === 'request' ? (
          <form onSubmit={handleRequestReset} className={styles.form}>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              disabled={loading}
            />
            <div className={styles.actions}>
              <Button type="submit" disabled={loading}>
                {loading ? 'Sending…' : 'Send reset link'}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSetPassword} className={styles.form}>
            <Input
              label="New password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(null);
              }}
              placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
              required
              minLength={MIN_PASSWORD_LENGTH}
              autoComplete="new-password"
              error={passwordError ?? undefined}
              disabled={loading}
            />
            <Input
              label="Confirm new password"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPasswordError(null);
              }}
              placeholder="Repeat password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              autoComplete="new-password"
              disabled={loading}
            />
            <div className={styles.actions}>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating…' : 'Update password'}
              </Button>
            </div>
          </form>
        )}

        <p className={styles.back}>
          <Link to="/signin">Back to sign in</Link>
        </p>
      </div>
    </Container>
  );
}

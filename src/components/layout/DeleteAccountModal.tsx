import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase/browserClient';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import styles from './DeleteAccountModal.module.css';

const CONFIRM_TEXT = 'delete';

interface DeleteAccountModalProps {
  onClose: () => void;
  functionsUrl: string;
}

export function DeleteAccountModal({ onClose, functionsUrl }: DeleteAccountModalProps) {
  const [confirmValue, setConfirmValue] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const isConfirmValid = confirmValue.trim().toLowerCase() === CONFIRM_TEXT;

  const handleDelete = useCallback(async () => {
    if (!isConfirmValid || status === 'loading') return;
    setStatus('loading');
    setErrorMessage(null);
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError || !session?.access_token) {
        setErrorMessage('Not signed in. Please sign in again.');
        setStatus('idle');
        return;
      }
      const res = await fetch(`${functionsUrl}/delete-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({}),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMessage(
          typeof body?.error === 'string' ? body.error : body?.message ?? 'Account deletion failed.'
        );
        setStatus('idle');
        return;
      }
      await supabase.auth.signOut();
      onClose();
      navigate('/', { replace: true });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Account deletion failed.');
      setStatus('idle');
    }
  }, [isConfirmValid, status, functionsUrl, onClose, navigate]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-account-title"
    >
      <div className={styles.modal}>
        <h2 id="delete-account-title" className={styles.title}>
          Delete account
        </h2>
        <p className={styles.warning}>
          This will permanently delete your account and all associated data. This action cannot be
          undone.
        </p>
        <p className={styles.instruction}>
          Type <strong>{CONFIRM_TEXT}</strong> below to confirm.
        </p>
        <div className={styles.confirmRow}>
          <Input
            type="text"
            value={confirmValue}
            onChange={(e) => setConfirmValue(e.target.value)}
            placeholder={CONFIRM_TEXT}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label={`Type ${CONFIRM_TEXT} to confirm`}
            disabled={status === 'loading'}
          />
          {isConfirmValid && (
            <button
              type="button"
              className={styles.deleteToken}
              onClick={handleDelete}
              disabled={status === 'loading'}
              aria-label="Confirm and delete account"
            >
              {status === 'loading' ? '…' : 'Delete'}
            </button>
          )}
        </div>
        <div className={styles.actions}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={status === 'loading'}>
            Cancel
          </Button>
        </div>
        {errorMessage && (
          <p className={styles.error} role="alert">
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}

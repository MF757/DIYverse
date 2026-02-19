import { Link, useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase/browserClient';
import { config } from '../../lib/config';
import { useTheme } from '../../contexts/ThemeContext';
import type { User } from '@supabase/supabase-js';
import { DeleteAccountModal } from './DeleteAccountModal';
import styles from './SiteHeader.module.css';

function GearIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export function SiteHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!settingsOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [settingsOpen]);

  const handleSignOut = useCallback(async () => {
    setSettingsOpen(false);
    await supabase.auth.signOut();
    navigate('/');
  }, [navigate]);

  const openDeleteModal = useCallback(() => {
    setSettingsOpen(false);
    setDeleteModalOpen(true);
  }, []);

  const functionsUrl = config.supabaseConfigured
    ? `${config.supabaseUrlValue}/functions/v1`
    : '';

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo} aria-label="DIYverse home">
          DIYverse
        </Link>
        <nav className={styles.nav} aria-label="Main">
          <Link to="/" className={styles.navLink}>
            Discover
          </Link>
          {user ? (
            <>
              <Link to="/publish" className={styles.navLink}>
                Publish
              </Link>
              <Link to="/profile" className={styles.navLink}>
                Profile
              </Link>
              <div className={styles.settingsWrap} ref={settingsRef}>
                <button
                  type="button"
                  className={styles.navIconButton}
                  onClick={() => setSettingsOpen((o) => !o)}
                  aria-expanded={settingsOpen}
                  aria-haspopup="true"
                  aria-label="Settings"
                >
                  <GearIcon className={styles.gearIcon} />
                </button>
                {settingsOpen && (
                  <div className={styles.dropdown} role="menu">
                    <div className={styles.dropdownSection}>
                      <span className={styles.dropdownLabel}>Settings</span>
                      <label className={styles.switchRow}>
                        <span className={styles.switchLabel}>Dark mode</span>
                        <input
                          type="checkbox"
                          className={styles.switch}
                          checked={isDark}
                          onChange={toggleTheme}
                          aria-label="Toggle dark mode"
                        />
                      </label>
                      <button
                        type="button"
                        className={styles.dropdownItem}
                        onClick={handleSignOut}
                        role="menuitem"
                      >
                        Sign out
                      </button>
                      <button
                        type="button"
                        className={styles.dropdownItemDanger}
                        onClick={openDeleteModal}
                        role="menuitem"
                      >
                        Delete account
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/signin" className={styles.navLink}>
              Sign in
            </Link>
          )}
        </nav>
      </div>
      {deleteModalOpen && functionsUrl && (
        <DeleteAccountModal
          onClose={() => setDeleteModalOpen(false)}
          functionsUrl={functionsUrl}
        />
      )}
    </header>
  );
}

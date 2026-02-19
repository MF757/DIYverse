import { useState, useRef, useEffect } from 'react';
import styles from './ShareButton.module.css';

interface ShareButtonProps {
  url: string;
  title: string;
  className?: string;
}

function encode(u: string): string {
  return encodeURIComponent(u);
}

export function ShareButton({ url, title, className = '' }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [open]);

  const text = `${title} – DIYverse`;
  const shareLinks = [
    {
      label: 'Copy link',
      onClick: async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          setOpen(false);
        }
      },
      icon: '⎘',
    },
    {
      label: 'Email',
      href: `mailto:?subject=${encode(title)}&body=${encode(`${text}\n${url}`)}`,
      icon: '✉',
    },
    {
      label: 'X (Twitter)',
      href: `https://twitter.com/intent/tweet?url=${encode(url)}&text=${encode(title)}`,
      icon: '𝕏',
    },
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encode(url)}`,
      icon: 'f',
    },
    {
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encode(url)}`,
      icon: 'in',
    },
    {
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encode(`${title} ${url}`)}`,
      icon: 'WhatsApp',
    },
    {
      label: 'Telegram',
      href: `https://t.me/share/url?url=${encode(url)}&text=${encode(title)}`,
      icon: 'TG',
    },
    {
      label: 'Reddit',
      href: `https://www.reddit.com/submit?url=${encode(url)}&title=${encode(title)}`,
      icon: 'Reddit',
    },
  ];

  const useNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title,
        text,
        url,
      });
      setOpen(false);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') setOpen(false);
    }
  };

  return (
    <div className={`${styles.wrapper} ${className}`.trim()} ref={menuRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Share project"
      >
        <span className={styles.triggerIcon} aria-hidden>
          <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </span>
        <span className={styles.triggerLabel}>Share</span>
      </button>
      {open && (
        <div className={styles.menu} role="menu">
          {useNativeShare && (
            <button
              type="button"
              className={styles.menuItem}
              role="menuitem"
              onClick={handleNativeShare}
            >
              <span className={styles.menuIcon} aria-hidden>⎘</span>
              More options…
            </button>
          )}
          {shareLinks.map((item) =>
            item.href ? (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.menuItem}
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                <span className={styles.menuIcon} aria-hidden>{item.icon}</span>
                {item.label}
              </a>
            ) : (
              <button
                key={item.label}
                type="button"
                className={styles.menuItem}
                role="menuitem"
                onClick={item.onClick}
              >
                <span className={styles.menuIcon} aria-hidden>{item.icon}</span>
                {item.label}
                {item.label === 'Copy link' && copied ? ' ✓' : ''}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

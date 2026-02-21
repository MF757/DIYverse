import { useEffect, useRef } from 'react';
import type { AdSenseConfig } from '../../types/ads';
import styles from './AdSlot.module.css';

/** Official AdSense script URL (single source of truth). */
const ADSCRIPT_URL = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js' as const;

export interface AdSlotProps {
  config: AdSenseConfig;
  /** Unique key for this slot instance so AdSense can track multiple slots. */
  slotKey: string;
}

/**
 * Renders a single Google AdSense in-feed slot. Loads the AdSense script once per client,
 * then fills this slot. Fails gracefully if script is blocked or errors.
 */
export function AdSlot({ config, slotKey }: AdSlotProps) {
  const insRef = useRef<HTMLModElement>(null);
  const filledRef = useRef(false);

  useEffect(() => {
    const ins = insRef.current;
    if (!ins || filledRef.current) return;

    function fillSlot(): void {
      try {
        const queue = window.adsbygoogle ?? (window.adsbygoogle = []);
        queue.push({});
        filledRef.current = true;
      } catch {
        // Ad blockers or missing script; leave slot empty
      }
    }

    function loadScriptAndFill(): void {
      const existing = document.querySelector(`script[src^="${ADSCRIPT_URL}"]`);
      if (existing) {
        fillSlot();
        return;
      }
      const script = document.createElement('script');
      script.src = `${ADSCRIPT_URL}?client=${encodeURIComponent(config.clientId)}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.onload = fillSlot;
      script.onerror = () => {
        // Script blocked or failed; do not fill
      };
      document.head.appendChild(script);
    }

    loadScriptAndFill();
  }, [config.clientId]);

  return (
    <div className={styles.wrapper} data-ad-slot-wrapper aria-label="Advertisement">
      <ins
        ref={insRef}
        className={`adsbygoogle ${styles.slot}`}
        data-ad-client={config.clientId}
        data-ad-slot={config.slotId}
        data-ad-format="rectangle"
        data-full-width-responsive="false"
        data-ad-region={slotKey}
      />
    </div>
  );
}

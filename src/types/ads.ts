/**
 * Google AdSense configuration and types.
 * Uses branded types and strict validation; ad slots render only when config is valid.
 * @see https://support.google.com/adsense/answer/105516
 * @see docs/ADSENSE_SETUP.md
 */

/** Payload passed to (adsbygoogle = window.adsbygoogle || []).push(...). Empty object = default fill. */
export type AdSensePushPayload = Record<string, unknown>;

declare global {
  interface Window {
    /** Set by AdSense script; push payloads to request ad fill. */
    adsbygoogle?: AdSensePushPayload[];
  }
}

/** Environment variable keys for AdSense (single source of truth). */
export const ADSENSE_ENV_KEYS = {
  CLIENT_ID: 'VITE_ADSENSE_CLIENT_ID',
  SLOT_ID: 'VITE_ADSENSE_SLOT_ID',
} as const;

/** Google AdSense publisher client ID in ad-tag form: ca-pub-<digits>. */
export type AdSenseClientId = string & { readonly __brand: 'AdSenseClientId' };

/** Google AdSense ad unit slot ID: numeric string from AdSense. */
export type AdSenseSlotId = string & { readonly __brand: 'AdSenseSlotId' };

/** Validated, immutable AdSense config. Only use after getAdSenseConfig() returns non-null. */
export interface AdSenseConfig {
  readonly clientId: AdSenseClientId;
  readonly slotId: AdSenseSlotId;
}

/** Client ID must be ca-pub- followed by one or more digits. */
const CLIENT_ID_REGEX = /^ca-pub-\d+$/;

/** Slot ID must be one or more digits. */
const SLOT_ID_REGEX = /^\d+$/;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Reads and validates AdSense config from environment.
 * Returns null if not configured or validation fails.
 * Use to gate all ad rendering so no placeholders show when disabled.
 */
export function getAdSenseConfig(): AdSenseConfig | null {
  const rawClient = import.meta.env[ADSENSE_ENV_KEYS.CLIENT_ID] as unknown;
  const rawSlot = import.meta.env[ADSENSE_ENV_KEYS.SLOT_ID] as unknown;

  if (!isNonEmptyString(rawClient) || !CLIENT_ID_REGEX.test(rawClient.trim())) {
    return null;
  }
  if (!isNonEmptyString(rawSlot) || !SLOT_ID_REGEX.test(rawSlot.trim())) {
    return null;
  }

  const clientId = rawClient.trim() as AdSenseClientId;
  const slotId = rawSlot.trim() as AdSenseSlotId;

  return { clientId, slotId };
}

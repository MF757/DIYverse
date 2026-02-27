import type { CSSProperties } from 'react';
import { useState } from 'react';
import { supabase } from '../../lib/supabase/browserClient';
import { isStoragePath } from '../../lib/storage';

const BUCKET = 'project-assets';

/** Optional resize/quality for Supabase image transformation (Pro; smaller payload, better LCP). */
export interface StorageImageTransform {
  width: number;
  quality?: number;
}

interface StorageImageProps {
  path: string;
  alt?: string;
  className?: string;
  /** Set true for LCP image (e.g. first project card) to use loading="eager" and fetchPriority="high". */
  priority?: boolean;
  /** Request a resized image via Supabase Image Transformations (Pro). Use for cards/thumbnails. */
  transform?: StorageImageTransform;
}

const DEFAULT_CARD_TRANSFORM: StorageImageTransform = { width: 800, quality: 80 };

/** Intrinsic dimensions for default card transform (16:10) to reserve space and satisfy Lighthouse. */
const DEFAULT_CARD_DIMENSIONS = { width: 800, height: 500 };

export function StorageImage({
  path,
  alt = '',
  className,
  priority = false,
  transform,
}: StorageImageProps) {
  const [transformFailed, setTransformFailed] = useState(false);
  const wrapperClass = className ?? '';
  const wrapperStyle: CSSProperties = { display: 'block', width: '100%', height: '100%', minHeight: 120, background: 'var(--color-bg)' };

  const loading = priority ? 'eager' : 'lazy';
  const fetchPriority = priority ? ('high' as const) : undefined;

  if (!path) {
    return <span className={wrapperClass} style={wrapperStyle} aria-hidden />;
  }
  if (path.startsWith('http')) {
    return (
      <span className={wrapperClass} style={wrapperStyle}>
        <img
          src={path}
          alt={alt}
          loading={loading}
          decoding="async"
          fetchPriority={fetchPriority}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </span>
    );
  }
  if (!isStoragePath(path)) {
    return <span className={wrapperClass} style={wrapperStyle} aria-hidden />;
  }
  const transformOpts = transform ?? DEFAULT_CARD_TRANSFORM;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path, {
    transform: transformFailed
      ? undefined
      : { width: transformOpts.width, quality: transformOpts.quality ?? 80, resize: 'cover' },
  });
  const displayUrl = data?.publicUrl ?? '';
  if (!displayUrl) {
    return <span className={wrapperClass} style={wrapperStyle} aria-hidden />;
  }
  const useDefaultTransform = transform === undefined && !transformFailed;
  const imgWidth = useDefaultTransform ? DEFAULT_CARD_DIMENSIONS.width : undefined;
  const imgHeight = useDefaultTransform ? DEFAULT_CARD_DIMENSIONS.height : undefined;

  return (
    <span className={wrapperClass} style={wrapperStyle}>
      <img
        src={displayUrl}
        alt={alt}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        width={imgWidth}
        height={imgHeight}
        onError={transformFailed ? undefined : () => setTransformFailed(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </span>
  );
}

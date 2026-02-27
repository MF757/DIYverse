import type { CSSProperties } from 'react';
import { supabase } from '../../lib/supabase/browserClient';
import { isStoragePath } from '../../lib/storage';

const BUCKET = 'project-assets';

interface StorageImageProps {
  path: string;
  alt?: string;
  className?: string;
}

export function StorageImage({ path, alt = '', className }: StorageImageProps) {
  const wrapperClass = className ?? '';
  const wrapperStyle: CSSProperties = { display: 'block', width: '100%', height: '100%', minHeight: 120, background: 'var(--color-bg)' };

  if (!path) {
    return <span className={wrapperClass} style={wrapperStyle} aria-hidden />;
  }
  if (path.startsWith('http')) {
    return (
      <span className={wrapperClass} style={wrapperStyle}>
        <img
          src={path}
          alt={alt}
          loading="lazy"
          decoding="async"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </span>
    );
  }
  if (!isStoragePath(path)) {
    return <span className={wrapperClass} style={wrapperStyle} aria-hidden />;
  }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const publicUrl = data?.publicUrl ?? '';
  if (!publicUrl) {
    return <span className={wrapperClass} style={wrapperStyle} aria-hidden />;
  }
  return (
    <span className={wrapperClass} style={wrapperStyle}>
      <img
        src={publicUrl}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </span>
  );
}

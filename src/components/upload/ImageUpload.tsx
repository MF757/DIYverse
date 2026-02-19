import { useCallback, useState, useEffect, useRef } from 'react';
import styles from './ImageUpload.module.css';

export interface ImageFile {
  id: string;
  file: File;
  previewUrl: string;
}

interface ImageUploadProps {
  images: ImageFile[];
  onChange: (images: ImageFile[]) => void;
  thumbnailIndex: number;
  onThumbnailChange: (index: number) => void;
  error?: string;
  disabled?: boolean;
}

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';
const MAX_SIZE_MB = 5;

function fileToImage(file: File): Promise<ImageFile> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      resolve({
        id: crypto.randomUUID(),
        file,
        previewUrl: url,
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Invalid image'));
    };
    img.src = url;
  });
}

export function ImageUpload({
  images,
  onChange,
  thumbnailIndex,
  onThumbnailChange,
  error,
  disabled,
}: ImageUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const imagesRef = useRef(images);
  imagesRef.current = images;
  useEffect(() => {
    return () => {
      imagesRef.current.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, []);

  const processFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList?.length) return;
      setUploadError(null);
      const valid: File[] = [];
      for (let i = 0; i < fileList.length; i++) {
        const f = fileList[i];
        if (!f.type.startsWith('image/')) continue;
        if (f.size > MAX_SIZE_MB * 1024 * 1024) {
          setUploadError(`"${f.name}" exceeds ${MAX_SIZE_MB}MB.`);
          continue;
        }
        valid.push(f);
      }
      if (valid.length === 0) return;
      try {
        const newImages = await Promise.all(valid.map(fileToImage));
        const next = [...images, ...newImages];
        onChange(next);
        if (images.length === 0 && next.length > 0) {
          onThumbnailChange(0);
        }
      } catch (e) {
        setUploadError(e instanceof Error ? e.message : 'Failed to load images.');
      }
    },
    [images, onChange, onThumbnailChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      processFiles(e.dataTransfer.files);
    },
    [disabled, processFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleClick = useCallback(() => {
    if (disabled) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = ACCEPT;
    input.multiple = true;
    input.onchange = () => processFiles(input.files);
    input.click();
  }, [disabled, processFiles]);

  const remove = (idx: number) => {
    URL.revokeObjectURL(images[idx]?.previewUrl ?? '');
    const next = images.filter((_, i) => i !== idx);
    onChange(next);
    if (thumbnailIndex >= next.length) {
      onThumbnailChange(Math.max(0, next.length - 1));
    } else if (idx < thumbnailIndex) {
      onThumbnailChange(thumbnailIndex - 1);
    }
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [removed] = next.splice(from, 1);
    next.splice(to, 0, removed);
    onChange(next);
    if (thumbnailIndex === from) {
      onThumbnailChange(to);
    } else if (thumbnailIndex === to) {
      onThumbnailChange(thumbnailIndex === from ? to : thumbnailIndex);
    } else if (from < thumbnailIndex && to >= thumbnailIndex) {
      onThumbnailChange(thumbnailIndex - 1);
    } else if (from > thumbnailIndex && to <= thumbnailIndex) {
      onThumbnailChange(thumbnailIndex + 1);
    }
  };

  const displayError = error ?? uploadError;

  return (
    <div>
      <div
        className={`${styles.zone} ${images.length > 0 ? styles.hasImages : ''} ${dragOver ? styles.dragOver : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Add or drop images"
      >
        <p className={styles.zoneText}>
          {images.length === 0
            ? 'Drag and drop images here, or click to browse'
            : 'Drop more images or click to add'}
        </p>
        {images.length > 0 && (
          <div className={styles.grid}>
            {images.map((img, idx) => (
              <div key={img.id} className={styles.item}>
                <img src={img.previewUrl} alt="" className={styles.itemImg} />
                {idx === thumbnailIndex && (
                  <span className={styles.itemBadge}>Cover</span>
                )}
                <div className={styles.itemActions}>
                  <button
                    type="button"
                    className={styles.itemBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      onThumbnailChange(idx);
                    }}
                  >
                    Cover
                  </button>
                  <button
                    type="button"
                    className={styles.itemBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(idx);
                    }}
                  >
                    Remove
                  </button>
                  {idx > 0 && (
                    <button
                      type="button"
                      className={styles.itemBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        move(idx, idx - 1);
                      }}
                    >
                      ←
                    </button>
                  )}
                  {idx < images.length - 1 && (
                    <button
                      type="button"
                      className={styles.itemBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        move(idx, idx + 1);
                      }}
                    >
                      →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {displayError && (
        <p className={styles.error} role="alert">
          {displayError}
        </p>
      )}
    </div>
  );
}

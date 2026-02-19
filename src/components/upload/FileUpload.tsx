import { useCallback, useState } from 'react';
import type { FileRef } from '../../types/projectUpload';
import styles from './FileUpload.module.css';

export interface PendingFile {
  id: string;
  file: File;
  type: FileRef['type'];
}

interface FileUploadProps {
  files: PendingFile[];
  onChange: (files: PendingFile[]) => void;
  error?: string;
  disabled?: boolean;
}

const EXT_MAP: Record<string, FileRef['type']> = {
  '.stl': 'stl',
  '.3mf': '3mf',
  '.gbr': 'gerber',
  '.grb': 'gerber',
  '.pdf': 'pdf',
};
const ALLOWED_EXT = ['.stl', '.3mf', '.gbr', '.grb', '.pdf'];

function getType(file: File): FileRef['type'] {
  const ext = '.' + (file.name.split('.').pop() ?? '').toLowerCase();
  return EXT_MAP[ext] ?? 'other';
}

function isValidType(file: File): boolean {
  const ext = '.' + (file.name.split('.').pop() ?? '').toLowerCase();
  return ALLOWED_EXT.includes(ext);
}

export function FileUpload({
  files,
  onChange,
  error,
  disabled,
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const processFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList?.length) return;
      setUploadError(null);
      const added: PendingFile[] = [];
      for (let i = 0; i < fileList.length; i++) {
        const f = fileList[i];
        if (!isValidType(f)) {
          setUploadError(`"${f.name}" is not a supported type. Use STL, 3MF, Gerber, or PDF.`);
          continue;
        }
        added.push({ id: crypto.randomUUID(), file: f, type: getType(f) });
      }
      if (added.length > 0) {
        onChange([...files, ...added]);
      }
    },
    [files, onChange]
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

  const handleClick = useCallback(() => {
    if (disabled) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.stl,.3mf,.gbr,.grb,.pdf';
    input.multiple = true;
    input.onchange = () => processFiles(input.files);
    input.click();
  }, [disabled, processFiles]);

  const remove = (idx: number) => {
    onChange(files.filter((_, i) => i !== idx));
  };

  const displayError = error ?? uploadError;

  return (
    <div>
      <div
        className={`${styles.zone} ${dragOver ? styles.dragOver : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Add project files"
      >
        <p className={styles.zoneText}>Drop files or click to upload</p>
        <p className={styles.hint}>STL, 3MF, Gerber (.gbr, .grb), PDF</p>
      </div>
      {files.length > 0 && (
        <ul className={styles.list}>
          {files.map((f, idx) => (
            <li key={f.id} className={styles.fileRow}>
              <span className={styles.fileName}>
                {f.file.name}
                <span className={styles.fileType}>({f.type})</span>
              </span>
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => remove(idx)}
                aria-label={`Remove ${f.file.name}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      {displayError && (
        <p className={styles.error} role="alert">
          {displayError}
        </p>
      )}
    </div>
  );
}

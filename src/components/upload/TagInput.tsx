import { useState, useCallback, useRef } from 'react';
import { SUGGESTED_TAGS } from '../../types/projectUpload';
import styles from './TagInput.module.css';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestedTags?: string[];
  error?: string;
  disabled?: boolean;
}

function normalizeTag(t: string): string {
  return t
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '');
}

export function TagInput({
  tags,
  onChange,
  suggestedTags = SUGGESTED_TAGS,
  error,
  disabled,
}: TagInputProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = useCallback(
    (tag: string) => {
      const n = normalizeTag(tag);
      if (!n || tags.includes(n)) return;
      onChange([...tags, n]);
      setInput('');
    },
    [tags, onChange]
  );

  const removeTag = useCallback(
    (idx: number) => {
      onChange(tags.filter((_, i) => i !== idx));
    },
    [tags, onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        if (input.trim()) {
          addTag(input.trim());
        }
      } else if (e.key === 'Backspace' && !input && tags.length > 0) {
        removeTag(tags.length - 1);
      }
    },
    [input, tags, addTag, removeTag]
  );

  const filteredSuggestions = suggestedTags.filter(
    (s) => !tags.includes(s.toLowerCase()) && s.toLowerCase().includes(input.toLowerCase())
  ).slice(0, 8);

  return (
    <div className={styles.wrapper}>
      <label htmlFor="tag-input" className={styles.label}>
        Tags
      </label>
      <div className={styles.inputWrap}>
        {tags.map((tag, idx) => (
          <span key={tag} className={styles.tag}>
            {tag}
            <button
              type="button"
              className={styles.tagRemove}
              onClick={() => removeTag(idx)}
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          id="tag-input"
          type="text"
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (input.trim()) addTag(input.trim());
          }}
          placeholder="Add tags…"
          disabled={disabled}
          aria-describedby={error ? 'tag-error' : undefined}
        />
      </div>
      {filteredSuggestions.length > 0 && (
        <div className={styles.suggestions}>
          {filteredSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              className={styles.suggestion}
              onClick={() => addTag(s)}
            >
              + {s}
            </button>
          ))}
        </div>
      )}
      {error && (
        <p id="tag-error" className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

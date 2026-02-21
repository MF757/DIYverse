import type { MaterialItem } from '../../types/projectUpload';
import styles from './BOMEditor.module.css';

interface BOMEditorProps {
  materials: MaterialItem[];
  onChange: (materials: MaterialItem[]) => void;
  disabled?: boolean;
}

export function BOMEditor({ materials, onChange, disabled }: BOMEditorProps) {
  const update = (idx: number, updates: Partial<MaterialItem>) => {
    const next = materials.map((m, i) =>
      i === idx ? { ...m, ...updates } : m
    );
    onChange(next);
  };

  const add = () => {
    onChange([
      ...materials,
      { id: crypto.randomUUID(), name: '', quantity: '1', link: null },
    ]);
  };

  const remove = (idx: number) => {
    onChange(materials.filter((_, i) => i !== idx));
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3 className={styles.title}>Materials</h3>
        <button
          type="button"
          className={styles.addBtn}
          onClick={add}
          disabled={disabled}
        >
          + Add item
        </button>
      </div>
      <div className={styles.list}>
        {materials.map((m, idx) => (
          <div key={m.id} className={styles.row}>
            <input
              type="text"
              className={styles.input}
              placeholder="Name"
              value={m.name}
              onChange={(e) => update(idx, { name: e.target.value })}
              disabled={disabled}
            />
            <input
              type="text"
              className={styles.input}
              placeholder="Qty"
              value={m.quantity}
              onChange={(e) => update(idx, { quantity: e.target.value })}
              disabled={disabled}
            />
            <input
              type="url"
              className={`${styles.input} ${styles.rowLink}`}
              placeholder="Link (optional)"
              value={m.link ?? ''}
              onChange={(e) => update(idx, { link: e.target.value || null })}
              disabled={disabled}
            />
            <button
              type="button"
              className={styles.removeBtn}
              onClick={() => remove(idx)}
              disabled={disabled}
              aria-label="Remove item"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

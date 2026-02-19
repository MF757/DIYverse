import { useCallback } from 'react';
import type { InstructionStep, MaterialItem } from '../../types/projectUpload';
import { Button } from '../ui';
import styles from './InstructionBuilder.module.css';

interface InstructionBuilderProps {
  mode: 'maker' | 'upload';
  onModeChange: (mode: 'maker' | 'upload') => void;
  steps: InstructionStep[];
  onStepsChange: (steps: InstructionStep[]) => void;
  onStepImageChange?: (stepId: string, file: File | null) => void;
  materials: MaterialItem[];
  customFile: File | null;
  onCustomFileChange: (file: File | null) => void;
  disabled?: boolean;
}

export function InstructionBuilder({
  mode,
  onModeChange,
  steps,
  onStepsChange,
  onStepImageChange,
  materials,
  customFile,
  onCustomFileChange,
  disabled,
}: InstructionBuilderProps) {
  const addStep = useCallback(() => {
    onStepsChange([
      ...steps,
      { id: crypto.randomUUID(), description: '', materialIds: [], tools: [] },
    ]);
  }, [steps, onStepsChange]);

  const updateStep = useCallback(
    (idx: number, updates: Partial<InstructionStep>) => {
      onStepsChange(
        steps.map((s, i) => (i === idx ? { ...s, ...updates } : s))
      );
    },
    [steps, onStepsChange]
  );

  const removeStep = useCallback(
    (idx: number) => {
      onStepsChange(steps.filter((_, i) => i !== idx));
    },
    [steps, onStepsChange]
  );

  const moveStep = useCallback(
    (idx: number, dir: 1 | -1) => {
      const to = idx + dir;
      if (to < 0 || to >= steps.length) return;
      const next = [...steps];
      [next[idx], next[to]] = [next[to], next[idx]];
      onStepsChange(next);
    },
    [steps, onStepsChange]
  );

  const handleCustomFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f && /\.(pdf|md|markdown)$/i.test(f.name)) {
        onCustomFileChange(f);
      }
    },
    [onCustomFileChange]
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.modeSelect}>
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          className={`${styles.modeOption} ${mode === 'maker' ? styles.selected : ''}`}
          onClick={() => !disabled && onModeChange('maker')}
          onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !disabled) { e.preventDefault(); onModeChange('maker'); } }}
          aria-pressed={mode === 'maker'}
          aria-disabled={disabled}
        >
          <div className={styles.modeTitle}>Use Instruction Maker</div>
          <div className={styles.modeDesc}>
            Build structured steps with images, materials, and tools.
          </div>
        </div>
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          className={`${styles.modeOption} ${mode === 'upload' ? styles.selected : ''}`}
          onClick={() => !disabled && onModeChange('upload')}
          onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !disabled) { e.preventDefault(); onModeChange('upload'); } }}
          aria-pressed={mode === 'upload'}
          aria-disabled={disabled}
        >
          <div className={styles.modeTitle}>Upload Own Instructions</div>
          <div className={styles.modeDesc}>
            Upload a PDF or Markdown document. Structured steps will be disabled.
          </div>
        </div>
      </div>

      {mode === 'maker' && (
        <>
          <div className={styles.stepsList}>
            {steps.map((step, idx) => (
              <div key={step.id} className={styles.stepCard}>
                <div className={styles.stepHeader}>
                  <span className={styles.stepNum}>Step {idx + 1}</span>
                  <div className={styles.stepActions}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => moveStep(idx, -1)}
                      disabled={idx === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => moveStep(idx, 1)}
                      disabled={idx === steps.length - 1}
                    >
                      ↓
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStep(idx)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
                <div className={styles.stepBody}>
                  {step.imageUrl ? (
                    <div className={styles.stepImgWrap}>
                      <img
                        src={step.imageUrl}
                        alt=""
                        className={styles.stepImg}
                      />
                      <button
                        type="button"
                        className={styles.removeImgBtn}
                        onClick={() => {
                          updateStep(idx, { imageUrl: undefined });
                          onStepImageChange?.(step.id, null);
                        }}
                        aria-label="Remove step image"
                      >
                        Remove image
                      </button>
                    </div>
                  ) : (
                    <div
                      className={styles.stepImgPlaceholder}
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => {
                          const f = (e.target as HTMLInputElement).files?.[0];
                          if (f) {
                            const url = URL.createObjectURL(f);
                            updateStep(idx, { imageUrl: url });
                            onStepImageChange?.(step.id, f);
                          }
                        };
                        input.click();
                      }}
                    >
                      Add image
                    </div>
                  )}
                  <textarea
                    placeholder="Step description…"
                    value={step.description}
                    onChange={(e) =>
                      updateStep(idx, { description: e.target.value })
                    }
                    rows={3}
                    style={{
                      width: '100%',
                      padding: 'var(--space-sm) var(--space-md)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                  {materials.length > 0 && (
                    <div>
                      <label className={styles.materialLabel}>
                        Materials used
                      </label>
                      <div className={styles.materialSelect}>
                        {materials.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            className={`${styles.materialChip} ${step.materialIds.includes(m.id) ? styles.selected : ''}`}
                            onClick={() => {
                              const ids = step.materialIds.includes(m.id)
                                ? step.materialIds.filter((id) => id !== m.id)
                                : [...step.materialIds, m.id];
                              updateStep(idx, { materialIds: ids });
                            }}
                          >
                            {m.name || '(unnamed)'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder="Tools used (comma-separated)"
                    value={step.tools.join(', ')}
                    onChange={(e) =>
                      updateStep(idx, {
                        tools: e.target.value
                          .split(',')
                          .map((t) => t.trim())
                          .filter(Boolean),
                      })
                    }
                    style={{
                      padding: 'var(--space-sm) var(--space-md)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className={styles.addStepBtn}
            onClick={addStep}
            disabled={disabled}
          >
            + Add step
          </button>
        </>
      )}

      {mode === 'upload' && (
        <div>
          <div
            className={styles.uploadZone}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.pdf,.md,.markdown';
              input.onchange = (e) => handleCustomFileSelect(e as unknown as React.ChangeEvent<HTMLInputElement>);
              input.click();
            }}
          >
            <p className={styles.modeDesc}>
              PDF or Markdown. Drop or click to upload.
            </p>
          </div>
          {customFile && (
            <div className={styles.uploadedFile}>
              <span>{customFile.name}</span>
              <button
                type="button"
                onClick={() => onCustomFileChange(null)}
                className={styles.removeBtn}
              >
                Remove
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

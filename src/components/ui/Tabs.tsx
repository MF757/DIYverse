import type { ReactNode } from 'react';
import styles from './Tabs.module.css';

interface TabItem {
  id: string;
  label: string;
  panel: ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeId: string;
  onSelect: (id: string) => void;
  'aria-label': string;
  /** On mobile, split into two rows: first (index+1) tabs on row 1, rest on row 2 right-aligned. Applied when >= 0 and tabs length supports it. */
  mobileSplitAfterIndex?: number;
}

export function Tabs({ tabs, activeId, onSelect, 'aria-label': ariaLabel, mobileSplitAfterIndex }: TabsProps) {
  const split =
    typeof mobileSplitAfterIndex === 'number' &&
    mobileSplitAfterIndex >= 0 &&
    tabs.length > mobileSplitAfterIndex + 1;

  return (
    <div
      className={`${styles.tabs} ${split ? styles.tabsMobileSplit : ''}`.trim()}
      role="tablist"
      aria-label={ariaLabel}
    >
      <div className={styles.tabList}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeId === tab.id}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            className={`${styles.tab} ${activeId === tab.id ? styles.active : ''}`}
            onClick={() => onSelect(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${tab.id}`}
          hidden={activeId !== tab.id}
          className={styles.panel}
        >
          {tab.panel}
        </div>
      ))}
    </div>
  );
}

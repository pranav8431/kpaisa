import { useState } from 'react';
import { LAYOUT_LIST, LAYOUTS, type LayoutId } from '../../data/layouts';
import { Button } from '../ui/Button';
import { SegmentedControl } from '../ui/SegmentedControl';
import styles from './SeatSelection.module.css';

interface LayoutSwitcherProps {
  value: LayoutId;
  assignedSeatCount: number;
  onChange: (layoutId: LayoutId) => void;
}

const OPTIONS = LAYOUT_LIST.map((layout) => ({
  value: layout.id,
  label: `${layout.name} · ${layout.configuration}`,
  hint: layout.aircraft,
}));

/** Switches aircraft layouts, asking for confirmation if that would clear assigned seats. */
export function LayoutSwitcher({ value, assignedSeatCount, onChange }: LayoutSwitcherProps) {
  const [pendingLayoutId, setPendingLayoutId] = useState<LayoutId | null>(null);

  function requestChange(layoutId: LayoutId) {
    if (layoutId === value) return;
    if (assignedSeatCount > 0) {
      setPendingLayoutId(layoutId);
      return;
    }
    onChange(layoutId);
  }

  function confirmChange() {
    if (pendingLayoutId) onChange(pendingLayoutId);
    setPendingLayoutId(null);
  }

  return (
    <div className={styles.layoutSwitcher}>
      <SegmentedControl
        name="aircraft-layout"
        label="Aircraft seating layout"
        options={OPTIONS}
        value={pendingLayoutId ?? value}
        onChange={requestChange}
      />
      {pendingLayoutId && (
        <div className={styles.confirm} role="alertdialog" aria-labelledby="layout-confirm-text">
          <p id="layout-confirm-text">
            Switching to <strong>{LAYOUTS[pendingLayoutId].name}</strong> will clear{' '}
            {assignedSeatCount === 1 ? '1 seat assignment' : `${assignedSeatCount} seat assignments`}.
            Meal choices are kept.
          </p>
          <div className={styles.confirmActions}>
            <Button onClick={() => setPendingLayoutId(null)}>Cancel</Button>
            <Button variant="primary" onClick={confirmChange} autoFocus>
              Switch layout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

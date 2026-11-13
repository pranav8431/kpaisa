import { useCallback } from 'react';
import { MAX_PASSENGERS, MIN_PASSENGERS } from '../../state/bookingReducer';
import { useBooking } from '../../state/useBooking';
import { Button } from '../ui/Button';
import { Panel } from '../ui/Panel';
import { Stepper } from '../ui/Stepper';
import { PassengerCard } from './PassengerCard';
import styles from './Passengers.module.css';

export function PassengerPanel() {
  const { state, dispatch, summary } = useBooking();

  const handleSelect = useCallback(
    (passengerId: string) => dispatch({ type: 'SET_ACTIVE_PASSENGER', passengerId }),
    [dispatch],
  );
  const handleRename = useCallback(
    (passengerId: string, name: string) => dispatch({ type: 'RENAME_PASSENGER', passengerId, name }),
    [dispatch],
  );
  const handleRemoveSeat = useCallback(
    (passengerId: string) => dispatch({ type: 'REMOVE_SEAT', passengerId }),
    [dispatch],
  );

  const total = state.passengers.length;

  return (
    <Panel
      title="Passengers"
      subtitle={`${summary.seatedCount} of ${total} seated · pick a passenger, then a seat`}
      actions={
        <Stepper
          label="Passengers"
          value={total}
          min={MIN_PASSENGERS}
          max={MAX_PASSENGERS}
          onChange={(count) => dispatch({ type: 'SET_PASSENGER_COUNT', count })}
        />
      }
      className={styles.panel}
    >
      <ul className={styles.list}>
        {summary.lines.map((line) => (
          <PassengerCard
            key={line.passenger.id}
            line={line}
            isActive={line.passenger.id === state.activePassengerId}
            onSelect={handleSelect}
            onRename={handleRename}
            onRemoveSeat={handleRemoveSeat}
          />
        ))}
      </ul>

      {summary.seatedCount > 0 && (
        <div className={styles.footer}>
          <Button variant="ghost" onClick={() => dispatch({ type: 'CLEAR_SEATS' })}>
            Clear all seats
          </Button>
        </div>
      )}
    </Panel>
  );
}

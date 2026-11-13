import { useCallback, useMemo, useState } from 'react';
import { LAYOUTS, type LayoutId } from '../../data/layouts';
import { useBooking } from '../../state/useBooking';
import { SeatMap } from '../seat-map/SeatMap';
import { SeatMapError, SeatMapSkeleton } from '../seat-map/SeatMapStates';
import { Panel } from '../ui/Panel';
import { LayoutSwitcher } from './LayoutSwitcher';
import { SeatDetails } from './SeatDetails';
import { SeatLegend } from './SeatLegend';
import styles from './SeatSelection.module.css';

/** Container for the cabin: wires booking state into the presentational seat map. */
export function SeatSelection() {
  const { state, dispatch, activePassenger, passengerBySeat, summary, retrySeatMap } = useBooking();
  const [inspectedSeatId, setInspectedSeatId] = useState<string | null>(null);
  const layout = LAYOUTS[state.layoutId];

  const passengersById = useMemo(
    () => Object.fromEntries(state.passengers.map((p) => [p.id, p])),
    [state.passengers],
  );

  const handleSelectSeat = useCallback(
    (seatId: string) => {
      setInspectedSeatId(seatId);
      dispatch({ type: 'SELECT_SEAT', seatId });
    },
    [dispatch],
  );

  const handleChangeLayout = useCallback(
    (layoutId: LayoutId) => {
      setInspectedSeatId(null);
      dispatch({ type: 'CHANGE_LAYOUT', layoutId });
    },
    [dispatch],
  );

  const seatMap = state.seatMap.status === 'ready' ? state.seatMap.data : null;
  // Details follow the hovered seat, falling back to the current passenger's seat.
  const detailSeatId = inspectedSeatId ?? state.seatByPassenger[activePassenger.id];
  const detailSeat = (seatMap && detailSeatId && seatMap.seatsById[detailSeatId]) || null;
  const detailHolder = detailSeat ? passengersById[passengerBySeat[detailSeat.id]] ?? null : null;

  return (
    <Panel
      title="Choose seats"
      subtitle={`${layout.aircraft} · ${layout.configuration} configuration · ${layout.rowCount} rows`}
      className={styles.panel}
    >
      <LayoutSwitcher
        value={state.layoutId}
        assignedSeatCount={summary.seatedCount}
        onChange={handleChangeLayout}
      />

      <SeatLegend />

      <SeatDetails
        seat={detailSeat}
        activePassenger={activePassenger}
        holder={detailHolder}
        isExitRow={Boolean(detailSeat && layout.exitRows.includes(detailSeat.row))}
      />

      {state.seatMap.status === 'loading' && <SeatMapSkeleton layout={layout} />}
      {state.seatMap.status === 'error' && (
        <SeatMapError message={state.seatMap.message} onRetry={retrySeatMap} />
      )}
      {seatMap && (
        <SeatMap
          layout={layout}
          seatMap={seatMap}
          passengerBySeat={passengerBySeat}
          passengersById={passengersById}
          activePassengerId={activePassenger.id}
          onSelectSeat={handleSelectSeat}
          onInspectSeat={setInspectedSeatId}
        />
      )}
    </Panel>
  );
}

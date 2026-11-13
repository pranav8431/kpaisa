import { Fragment } from 'react';
import type { AircraftLayout } from '../../data/layouts';
import type { Seat, SeatMap as SeatMapData } from '../../data/seats';
import { getPassengerName, type Passenger } from '../../state/bookingReducer';
import { getCabinStyle, getRowTemplate } from './cabinLayout';
import { SeatButton, type SeatStatus } from './SeatButton';
import styles from './SeatMap.module.css';

interface SeatMapProps {
  layout: AircraftLayout;
  seatMap: SeatMapData;
  passengerBySeat: Record<string, string>;
  passengersById: Record<string, Passenger>;
  activePassengerId: string;
  onSelectSeat: (seatId: string) => void;
  onInspectSeat: (seatId: string | null) => void;
}

export function SeatMap({
  layout,
  seatMap,
  passengerBySeat,
  passengersById,
  activePassengerId,
  onSelectSeat,
  onInspectSeat,
}: SeatMapProps) {
  const rowTemplate = getRowTemplate(layout.seatGroups);

  function getStatus(seat: Seat): SeatStatus {
    if (seat.occupied) return 'occupied';
    const holderId = passengerBySeat[seat.id];
    if (!holderId) return 'available';
    return holderId === activePassengerId ? 'selected' : 'assigned';
  }

  return (
    <div className={styles.viewport}>
      <div className={styles.cabin} style={getCabinStyle(layout)}>
        <div className={styles.nose} aria-hidden="true">
          Front
        </div>

        <div className={styles.letterRow} style={{ gridTemplateColumns: rowTemplate }} aria-hidden="true">
          <span />
          {layout.seatGroups.map((group, index) => (
            <Fragment key={group.join('')}>
              {index > 0 && <span />}
              {group.map((letter) => (
                <span key={letter} className={styles.letter}>
                  {letter}
                </span>
              ))}
            </Fragment>
          ))}
        </div>

        {seatMap.rows.map((row) => (
          <Fragment key={row.row}>
            {row.isExitRow && (
              <div className={styles.exitMarker} aria-hidden="true">
                <span>Exit</span>
                <span>Exit</span>
              </div>
            )}
            <div
              className={styles.row}
              style={{ gridTemplateColumns: rowTemplate }}
              role="group"
              aria-label={`Row ${row.row}${row.isExitRow ? ', exit row' : ''}`}
            >
              <span className={styles.rowNumber} aria-hidden="true">
                {row.row}
              </span>
              {row.groups.map((group, index) => (
                <Fragment key={index}>
                  {index > 0 && <span className={styles.aisle} aria-hidden="true" />}
                  {group.map((seat) => {
                    const holder = passengersById[passengerBySeat[seat.id]];
                    return (
                      <SeatButton
                        key={seat.id}
                        seat={seat}
                        status={getStatus(seat)}
                        holderNumber={holder?.number}
                        holderName={holder && getPassengerName(holder)}
                        onSelect={onSelectSeat}
                        onInspect={onInspectSeat}
                      />
                    );
                  })}
                </Fragment>
              ))}
            </div>
          </Fragment>
        ))}

        <div className={styles.tail} aria-hidden="true">
          Rear
        </div>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react';
import { fetchSeatMap } from '../services/seatMapService';
import { BookingContext, type BookingContextValue } from './bookingContext';
import { bookingReducer, createInitialState } from './bookingReducer';
import { selectBookingSummary, selectPassengerBySeat } from './selectors';

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bookingReducer, 1, createInitialState);
  const [reloadToken, setReloadToken] = useState(0);
  const { layoutId } = state;

  // Load the seat map whenever the layout changes (or the user retries).
  useEffect(() => {
    let cancelled = false;
    dispatch({ type: 'SEAT_MAP_REQUESTED', layoutId });
    fetchSeatMap(layoutId)
      .then((seatMap) => {
        if (!cancelled) dispatch({ type: 'SEAT_MAP_LOADED', seatMap });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : 'Something went wrong.';
        dispatch({ type: 'SEAT_MAP_FAILED', layoutId, message });
      });
    return () => {
      cancelled = true;
    };
  }, [layoutId, reloadToken]);

  const retrySeatMap = useCallback(() => setReloadToken((token) => token + 1), []);

  const { seatByPassenger } = state;
  const passengerBySeat = useMemo(() => selectPassengerBySeat(seatByPassenger), [seatByPassenger]);
  const summary = useMemo(() => selectBookingSummary(state), [state]);
  const activePassenger =
    state.passengers.find((p) => p.id === state.activePassengerId) ?? state.passengers[0];

  const value = useMemo<BookingContextValue>(
    () => ({ state, dispatch, activePassenger, passengerBySeat, summary, retrySeatMap }),
    [state, activePassenger, passengerBySeat, summary, retrySeatMap],
  );

  return <BookingContext value={value}>{children}</BookingContext>;
}

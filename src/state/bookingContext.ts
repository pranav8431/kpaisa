import { createContext, type Dispatch } from 'react';
import type { BookingAction, BookingState, Passenger } from './bookingReducer';
import type { BookingSummary } from './selectors';

export interface BookingContextValue {
  state: BookingState;
  dispatch: Dispatch<BookingAction>;
  activePassenger: Passenger;
  passengerBySeat: Record<string, string>;
  summary: BookingSummary;
  retrySeatMap: () => void;
}

export const BookingContext = createContext<BookingContextValue | null>(null);

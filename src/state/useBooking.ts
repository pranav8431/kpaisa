import { useContext } from 'react';
import { BookingContext, type BookingContextValue } from './bookingContext';

export function useBooking(): BookingContextValue {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBooking must be used inside <BookingProvider>.');
  return context;
}

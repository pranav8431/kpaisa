import { MEALS_BY_ID, type Meal } from '../data/meals';
import type { Seat } from '../data/seats';
import type { BookingState, Passenger } from './bookingReducer';

/** Reverse index of the assignment map: seat id → passenger id. */
export function selectPassengerBySeat(
  seatByPassenger: BookingState['seatByPassenger'],
): Record<string, string> {
  const passengerBySeat: Record<string, string> = {};
  for (const [passengerId, seatId] of Object.entries(seatByPassenger)) {
    passengerBySeat[seatId] = passengerId;
  }
  return passengerBySeat;
}

export interface PassengerLine {
  passenger: Passenger;
  seat: Seat | null;
  meal: Meal | null;
  seatPrice: number;
  mealPrice: number;
  subtotal: number;
}

export interface BookingSummary {
  lines: PassengerLine[];
  seatTotal: number;
  mealTotal: number;
  grandTotal: number;
  seatedCount: number;
  mealCount: number;
}

export function selectBookingSummary(state: BookingState): BookingSummary {
  const seatsById = state.seatMap.status === 'ready' ? state.seatMap.data.seatsById : {};

  const lines = state.passengers.map((passenger): PassengerLine => {
    const seatId = state.seatByPassenger[passenger.id];
    const mealId = state.mealByPassenger[passenger.id];
    const seat = (seatId && seatsById[seatId]) || null;
    const meal = (mealId && MEALS_BY_ID[mealId]) || null;
    const seatPrice = seat?.price ?? 0;
    const mealPrice = meal?.price ?? 0;
    return { passenger, seat, meal, seatPrice, mealPrice, subtotal: seatPrice + mealPrice };
  });

  const seatTotal = sum(lines.map((line) => line.seatPrice));
  const mealTotal = sum(lines.map((line) => line.mealPrice));

  return {
    lines,
    seatTotal,
    mealTotal,
    grandTotal: seatTotal + mealTotal,
    seatedCount: lines.filter((line) => line.seat).length,
    mealCount: lines.filter((line) => line.meal).length,
  };
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

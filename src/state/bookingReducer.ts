import { DEFAULT_LAYOUT_ID, type LayoutId } from '../data/layouts';
import type { SeatMap } from '../data/seats';

export const MIN_PASSENGERS = 1;
export const MAX_PASSENGERS = 6;
export const MAX_NAME_LENGTH = 30;

export interface Passenger {
  id: string;
  /** 1-based position, used for the default name and seat badges. */
  number: number;
  /** Free text entered by the user; may be empty. */
  name: string;
}

export type SeatMapState =
  | { status: 'loading' }
  | { status: 'ready'; data: SeatMap }
  | { status: 'error'; message: string };

export type NoticeTone = 'error' | 'info' | 'success';

export interface Notice {
  id: number;
  tone: NoticeTone;
  message: string;
}

export interface BookingState {
  layoutId: LayoutId;
  seatMap: SeatMapState;
  passengers: Passenger[];
  activePassengerId: string;
  /**
   * The single source of truth for seat assignments: passenger id → seat id.
   * Keying by passenger guarantees one seat per passenger by construction;
   * the reducer guarantees one passenger per seat.
   */
  seatByPassenger: Record<string, string>;
  mealByPassenger: Record<string, string>;
  notice: Notice | null;
  noticeSeq: number;
}

export type BookingAction =
  | { type: 'SET_PASSENGER_COUNT'; count: number }
  | { type: 'RENAME_PASSENGER'; passengerId: string; name: string }
  | { type: 'SET_ACTIVE_PASSENGER'; passengerId: string }
  | { type: 'SELECT_SEAT'; seatId: string }
  | { type: 'REMOVE_SEAT'; passengerId: string }
  | { type: 'CLEAR_SEATS' }
  | { type: 'SELECT_MEAL'; passengerId: string; mealId: string | null }
  | { type: 'CHANGE_LAYOUT'; layoutId: LayoutId }
  | { type: 'SEAT_MAP_REQUESTED'; layoutId: LayoutId }
  | { type: 'SEAT_MAP_LOADED'; seatMap: SeatMap }
  | { type: 'SEAT_MAP_FAILED'; layoutId: LayoutId; message: string }
  | { type: 'SHOW_NOTICE'; tone: NoticeTone; message: string }
  | { type: 'DISMISS_NOTICE'; noticeId: number };

export function createPassenger(number: number): Passenger {
  return { id: `p${number}`, number, name: '' };
}

export function getPassengerName(passenger: Passenger): string {
  return passenger.name.trim() || `Passenger ${passenger.number}`;
}

export function createInitialState(
  passengerCount = 1,
  layoutId: LayoutId = DEFAULT_LAYOUT_ID,
): BookingState {
  const count = clamp(passengerCount, MIN_PASSENGERS, MAX_PASSENGERS);
  const passengers = Array.from({ length: count }, (_, index) => createPassenger(index + 1));
  return {
    layoutId,
    seatMap: { status: 'loading' },
    passengers,
    activePassengerId: passengers[0].id,
    seatByPassenger: {},
    mealByPassenger: {},
    notice: null,
    noticeSeq: 0,
  };
}

export function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'SET_PASSENGER_COUNT':
      return setPassengerCount(state, action.count);

    case 'RENAME_PASSENGER':
      return {
        ...state,
        passengers: state.passengers.map((passenger) =>
          passenger.id === action.passengerId
            ? { ...passenger, name: action.name.slice(0, MAX_NAME_LENGTH) }
            : passenger,
        ),
      };

    case 'SET_ACTIVE_PASSENGER':
      if (!state.passengers.some((p) => p.id === action.passengerId)) return state;
      return { ...state, activePassengerId: action.passengerId };

    case 'SELECT_SEAT':
      return selectSeat(state, action.seatId);

    case 'REMOVE_SEAT': {
      if (!state.seatByPassenger[action.passengerId]) return state;
      return {
        ...state,
        seatByPassenger: omit(state.seatByPassenger, [action.passengerId]),
        // Focus the passenger so they can immediately pick a replacement seat.
        activePassengerId: action.passengerId,
      };
    }

    case 'CLEAR_SEATS':
      return { ...state, seatByPassenger: {} };

    case 'SELECT_MEAL': {
      if (!state.passengers.some((p) => p.id === action.passengerId)) return state;
      const mealByPassenger =
        action.mealId === null
          ? omit(state.mealByPassenger, [action.passengerId])
          : { ...state.mealByPassenger, [action.passengerId]: action.mealId };
      return { ...state, mealByPassenger };
    }

    case 'CHANGE_LAYOUT': {
      if (action.layoutId === state.layoutId) return state;
      const hadAssignments = Object.keys(state.seatByPassenger).length > 0;
      const next: BookingState = {
        ...state,
        layoutId: action.layoutId,
        seatMap: { status: 'loading' },
        // Seat ids are specific to an aircraft, so assignments cannot carry over.
        seatByPassenger: {},
        activePassengerId: state.passengers[0].id,
      };
      return hadAssignments
        ? withNotice(next, 'info', 'Aircraft layout changed. Seat assignments were cleared.')
        : next;
    }

    case 'SEAT_MAP_REQUESTED':
      if (action.layoutId !== state.layoutId) return state;
      return { ...state, seatMap: { status: 'loading' } };

    case 'SEAT_MAP_LOADED':
      // Ignore responses for a layout the user has already switched away from.
      if (action.seatMap.layoutId !== state.layoutId) return state;
      return { ...state, seatMap: { status: 'ready', data: action.seatMap } };

    case 'SEAT_MAP_FAILED':
      if (action.layoutId !== state.layoutId) return state;
      return { ...state, seatMap: { status: 'error', message: action.message } };

    case 'SHOW_NOTICE':
      return withNotice(state, action.tone, action.message);

    case 'DISMISS_NOTICE':
      if (state.notice?.id !== action.noticeId) return state;
      return { ...state, notice: null };

    default:
      return state;
  }
}

function selectSeat(state: BookingState, seatId: string): BookingState {
  if (state.seatMap.status !== 'ready') return state;

  const seat = state.seatMap.data.seatsById[seatId];
  if (!seat) return state;

  const activeId = state.activePassengerId;
  const activePassenger = state.passengers.find((p) => p.id === activeId);
  if (!activePassenger) {
    return withNotice(state, 'error', 'Select a passenger before choosing a seat.');
  }

  if (seat.occupied) {
    return withNotice(state, 'error', `Seat ${seat.id} is already taken. Please choose another seat.`);
  }

  const holderId = findPassengerWithSeat(state.seatByPassenger, seat.id);

  // Clicking your own seat again releases it.
  if (holderId === activeId) {
    return withNotice(
      { ...state, seatByPassenger: omit(state.seatByPassenger, [activeId]) },
      'info',
      `Seat ${seat.id} released for ${getPassengerName(activePassenger)}.`,
    );
  }

  if (holderId) {
    const holder = state.passengers.find((p) => p.id === holderId);
    const holderName = holder ? getPassengerName(holder) : 'another passenger';
    return withNotice(
      state,
      'error',
      `Seat ${seat.id} is already assigned to ${holderName}. Remove it from them first.`,
    );
  }

  const isFirstAssignment = !state.seatByPassenger[activeId];
  const seatByPassenger = { ...state.seatByPassenger, [activeId]: seat.id };

  return {
    ...state,
    seatByPassenger,
    // After a passenger's first seat, move on to the next passenger still without one.
    // Changing an existing seat keeps the same passenger selected.
    activePassengerId: isFirstAssignment
      ? findNextUnseatedPassenger(state.passengers, seatByPassenger, activeId)
      : activeId,
  };
}

function setPassengerCount(state: BookingState, requested: number): BookingState {
  const count = clamp(Math.round(requested), MIN_PASSENGERS, MAX_PASSENGERS);
  const current = state.passengers.length;
  if (count === current) return state;

  if (count > current) {
    const added = Array.from({ length: count - current }, (_, index) =>
      createPassenger(current + index + 1),
    );
    return { ...state, passengers: [...state.passengers, ...added] };
  }

  const removed = state.passengers.slice(count);
  const removedIds = removed.map((p) => p.id);
  const passengers = state.passengers.slice(0, count);
  const releasedSeats = removedIds
    .map((id) => state.seatByPassenger[id])
    .filter((seatId): seatId is string => Boolean(seatId));

  const next: BookingState = {
    ...state,
    passengers,
    seatByPassenger: omit(state.seatByPassenger, removedIds),
    mealByPassenger: omit(state.mealByPassenger, removedIds),
    activePassengerId: removedIds.includes(state.activePassengerId)
      ? passengers[passengers.length - 1].id
      : state.activePassengerId,
  };

  if (releasedSeats.length === 0) return next;
  const plural = releasedSeats.length > 1;
  return withNotice(
    next,
    'info',
    `Seat${plural ? 's' : ''} ${releasedSeats.join(', ')} ${plural ? 'were' : 'was'} released.`,
  );
}

export function findPassengerWithSeat(
  seatByPassenger: Record<string, string>,
  seatId: string,
): string | undefined {
  return Object.keys(seatByPassenger).find((passengerId) => seatByPassenger[passengerId] === seatId);
}

function findNextUnseatedPassenger(
  passengers: Passenger[],
  seatByPassenger: Record<string, string>,
  currentId: string,
): string {
  const start = passengers.findIndex((p) => p.id === currentId);
  for (let step = 1; step < passengers.length; step++) {
    const candidate = passengers[(start + step) % passengers.length];
    if (!seatByPassenger[candidate.id]) return candidate.id;
  }
  return currentId;
}

function withNotice(state: BookingState, tone: NoticeTone, message: string): BookingState {
  const id = state.noticeSeq + 1;
  return { ...state, notice: { id, tone, message }, noticeSeq: id };
}

function omit<T>(record: Record<string, T>, keys: string[]): Record<string, T> {
  const copy = { ...record };
  for (const key of keys) delete copy[key];
  return copy;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

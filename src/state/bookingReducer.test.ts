import { describe, expect, it } from 'vitest';
import { LAYOUTS } from '../data/layouts';
import { buildSeatMap } from '../data/seats';
import { bookingReducer, createInitialState, type BookingAction, type BookingState } from './bookingReducer';
import { selectBookingSummary, selectPassengerBySeat } from './selectors';

function readyState(passengerCount = 2): BookingState {
  const state = createInitialState(passengerCount, 'layout-3-2');
  return bookingReducer(state, {
    type: 'SEAT_MAP_LOADED',
    seatMap: buildSeatMap(LAYOUTS['layout-3-2']),
  });
}

function run(state: BookingState, ...actions: BookingAction[]): BookingState {
  return actions.reduce(bookingReducer, state);
}

describe('seat map data', () => {
  it('applies the sample prices from the brief', () => {
    const { seatsById } = buildSeatMap(LAYOUTS['layout-3-2']);
    expect(seatsById['1A'].price).toBe(0);
    expect(seatsById['1C']).toMatchObject({ categoryId: 'extraLegroom', price: 350 });
    expect(seatsById['1E']).toMatchObject({ categoryId: 'premium', price: 250 });
    expect(seatsById['2A']).toMatchObject({ categoryId: 'extraLegroom', price: 350 });
  });

  it('builds the 2–3–2 layout with seven seats per row and two aisles', () => {
    const map = buildSeatMap(LAYOUTS['layout-2-3-2']);
    expect(map.rows[0].groups.map((g) => g.map((s) => s.letter).join(''))).toEqual(['AB', 'DEF', 'GH']);
    expect(map.rows[0].groups.flat()).toHaveLength(7);
  });
});

describe('seat assignment', () => {
  it('assigns a seat to the active passenger and advances to the next unseated passenger', () => {
    const state = run(readyState(), { type: 'SELECT_SEAT', seatId: '1A' });
    expect(state.seatByPassenger).toEqual({ p1: '1A' });
    expect(state.activePassengerId).toBe('p2');
  });

  it('replaces the previous seat when a seated passenger picks another one', () => {
    const state = run(
      readyState(),
      { type: 'SELECT_SEAT', seatId: '1A' },
      { type: 'SET_ACTIVE_PASSENGER', passengerId: 'p1' },
      { type: 'SELECT_SEAT', seatId: '1C' },
    );
    expect(state.seatByPassenger).toEqual({ p1: '1C' });
    expect(state.activePassengerId).toBe('p1');
  });

  it('releases a seat when the active passenger clicks it again', () => {
    const state = run(
      readyState(1),
      { type: 'SELECT_SEAT', seatId: '1A' },
      { type: 'SELECT_SEAT', seatId: '1A' },
    );
    expect(state.seatByPassenger).toEqual({});
    expect(state.notice?.tone).toBe('info');
  });

  it('rejects occupied seats', () => {
    const state = run(readyState(), { type: 'SELECT_SEAT', seatId: '2D' });
    expect(state.seatByPassenger).toEqual({});
    expect(state.notice).toMatchObject({ tone: 'error' });
  });

  it('never gives one seat to two passengers', () => {
    const state = run(
      readyState(),
      { type: 'SELECT_SEAT', seatId: '1A' }, // p1, then auto-advance to p2
      { type: 'SELECT_SEAT', seatId: '1A' }, // p2 tries the same seat
    );
    expect(state.seatByPassenger).toEqual({ p1: '1A' });
    expect(state.notice?.message).toContain('Passenger 1');
  });

  it('keeps assignments when switching between passengers', () => {
    const state = run(
      readyState(),
      { type: 'SELECT_SEAT', seatId: '1A' },
      { type: 'SELECT_SEAT', seatId: '1B' },
      { type: 'SET_ACTIVE_PASSENGER', passengerId: 'p1' },
      { type: 'SET_ACTIVE_PASSENGER', passengerId: 'p2' },
    );
    expect(state.seatByPassenger).toEqual({ p1: '1A', p2: '1B' });
  });

  it('removes a seat and focuses that passenger', () => {
    const state = run(
      readyState(),
      { type: 'SELECT_SEAT', seatId: '1A' },
      { type: 'REMOVE_SEAT', passengerId: 'p1' },
    );
    expect(state.seatByPassenger).toEqual({});
    expect(state.activePassengerId).toBe('p1');
  });

  it('ignores seat clicks while the seat map is loading', () => {
    const state = run(createInitialState(1), { type: 'SELECT_SEAT', seatId: '1A' });
    expect(state.seatByPassenger).toEqual({});
  });
});

describe('passenger count', () => {
  it('releases seats and meals of removed passengers', () => {
    const state = run(
      readyState(3),
      { type: 'SELECT_SEAT', seatId: '1A' },
      { type: 'SELECT_SEAT', seatId: '1B' },
      { type: 'SELECT_SEAT', seatId: '1C' },
      { type: 'SELECT_MEAL', passengerId: 'p3', mealId: 'veg-biryani' },
      { type: 'SET_PASSENGER_COUNT', count: 1 },
    );
    expect(state.passengers).toHaveLength(1);
    expect(state.seatByPassenger).toEqual({ p1: '1A' });
    expect(state.mealByPassenger).toEqual({});
    expect(state.activePassengerId).toBe('p1');
  });

  it('clamps the count between 1 and 6', () => {
    expect(run(readyState(), { type: 'SET_PASSENGER_COUNT', count: 0 }).passengers).toHaveLength(1);
    expect(run(readyState(), { type: 'SET_PASSENGER_COUNT', count: 99 }).passengers).toHaveLength(6);
  });
});

describe('layout switching', () => {
  it('clears seat assignments but keeps meals', () => {
    const state = run(
      readyState(),
      { type: 'SELECT_SEAT', seatId: '1A' },
      { type: 'SELECT_MEAL', passengerId: 'p1', mealId: 'snack-box' },
      { type: 'CHANGE_LAYOUT', layoutId: 'layout-2-3-2' },
    );
    expect(state.seatByPassenger).toEqual({});
    expect(state.mealByPassenger).toEqual({ p1: 'snack-box' });
    expect(state.seatMap.status).toBe('loading');
  });

  it('ignores a seat map that arrives for a layout no longer selected', () => {
    const state = run(
      createInitialState(1, 'layout-3-2'),
      { type: 'CHANGE_LAYOUT', layoutId: 'layout-2-3-2' },
      { type: 'SEAT_MAP_LOADED', seatMap: buildSeatMap(LAYOUTS['layout-3-2']) },
    );
    expect(state.seatMap.status).toBe('loading');
  });
});

describe('pricing', () => {
  it('totals seat and meal prices, counting free items as zero', () => {
    const state = run(
      readyState(3),
      { type: 'SELECT_SEAT', seatId: '1A' }, // ₹0
      { type: 'SELECT_SEAT', seatId: '1C' }, // ₹350
      { type: 'SELECT_SEAT', seatId: '1E' }, // ₹250
      { type: 'SELECT_MEAL', passengerId: 'p1', mealId: 'snack-box' }, // ₹0
      { type: 'SELECT_MEAL', passengerId: 'p2', mealId: 'veg-biryani' }, // ₹300
    );
    const summary = selectBookingSummary(state);
    expect(summary.seatTotal).toBe(600);
    expect(summary.mealTotal).toBe(300);
    expect(summary.grandTotal).toBe(900);
    expect(summary.lines[1].subtotal).toBe(650);
    expect(summary.seatedCount).toBe(3);
  });

  it('updates the total when a seat is changed or removed', () => {
    let state = run(readyState(1), { type: 'SELECT_SEAT', seatId: '1C' });
    expect(selectBookingSummary(state).grandTotal).toBe(350);
    state = run(state, { type: 'SELECT_SEAT', seatId: '1E' });
    expect(selectBookingSummary(state).grandTotal).toBe(250);
    state = run(state, { type: 'REMOVE_SEAT', passengerId: 'p1' });
    expect(selectBookingSummary(state).grandTotal).toBe(0);
  });

  it('derives the seat → passenger index', () => {
    expect(selectPassengerBySeat({ p1: '1A', p2: '3C' })).toEqual({ '1A': 'p1', '3C': 'p2' });
  });
});

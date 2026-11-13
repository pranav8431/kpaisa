import styles from './App.module.css';
import { Toast } from './components/feedback/Toast';
import { MealSelector } from './components/meals/MealSelector';
import { PassengerPanel } from './components/passengers/PassengerPanel';
import { SeatSelection } from './components/seat-selection/SeatSelection';
import { MobileTotalBar } from './components/summary/MobileTotalBar';
import { PriceSummary } from './components/summary/PriceSummary';

// Mock itinerary shown in the header.
const FLIGHT = {
  from: 'BLR',
  fromCity: 'Bengaluru',
  to: 'DEL',
  toCity: 'New Delhi',
  date: 'Fri, 14 Nov',
  time: '07:40 – 10:25',
  number: 'KP 214',
};

export default function App() {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" className={styles.logo}>
              <path
                fill="currentColor"
                d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"
              />
            </svg>
            <div>
              <h1 className={styles.title}>Seat selection</h1>
              <p className={styles.subtitle}>Step 2 of 3 · Seats &amp; meals</p>
            </div>
          </div>
          <div className={styles.flight} aria-label="Flight details">
            <span className={styles.route}>
              <strong title={FLIGHT.fromCity}>{FLIGHT.from}</strong>
              <span aria-hidden="true">→</span>
              <span className="visually-hidden">to</span>
              <strong title={FLIGHT.toCity}>{FLIGHT.to}</strong>
            </span>
            <span className={styles.flightMeta}>
              {FLIGHT.date} · {FLIGHT.time} · {FLIGHT.number}
            </span>
          </div>
        </div>
      </header>

      <main className={styles.layout}>
        <div className={styles.seats}>
          <SeatSelection />
        </div>
        <div className={styles.passengers}>
          <PassengerPanel />
        </div>
        <div className={styles.meals}>
          <MealSelector />
        </div>
        <div className={styles.summary}>
          <PriceSummary />
        </div>
      </main>

      <MobileTotalBar />
      <Toast />
    </div>
  );
}

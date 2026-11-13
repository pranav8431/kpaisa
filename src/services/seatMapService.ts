import { LAYOUTS, type LayoutId } from '../data/layouts';
import { buildSeatMap, type SeatMap } from '../data/seats';

const SIMULATED_LATENCY_MS = 600;

// Add `?simulateError` to the URL to make the first request fail, so the
// error and retry states can be demonstrated. Retrying then succeeds.
let simulatedFailurePending =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('simulateError');

/** Mock API: resolves the seat map for a layout after a short delay. */
export function fetchSeatMap(layoutId: LayoutId): Promise<SeatMap> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (simulatedFailurePending) {
        simulatedFailurePending = false;
        reject(new Error('We couldn’t load the seat map. Please check your connection and try again.'));
        return;
      }
      const layout = LAYOUTS[layoutId];
      if (!layout) {
        reject(new Error(`Unknown aircraft layout “${layoutId}”.`));
        return;
      }
      resolve(buildSeatMap(layout));
    }, SIMULATED_LATENCY_MS);
  });
}

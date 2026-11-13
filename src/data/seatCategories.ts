export type SeatCategoryId = 'standard' | 'preferred' | 'premium' | 'extraLegroom';

export interface SeatCategory {
  id: SeatCategoryId;
  label: string;
  price: number;
  description: string;
}

export const SEAT_CATEGORIES: Record<SeatCategoryId, SeatCategory> = {
  standard: {
    id: 'standard',
    label: 'Standard',
    price: 0,
    description: 'Included with your fare',
  },
  preferred: {
    id: 'preferred',
    label: 'Window',
    price: 150,
    description: 'Window view',
  },
  premium: {
    id: 'premium',
    label: 'Premium',
    price: 250,
    description: 'Front of cabin, quicker exit',
  },
  extraLegroom: {
    id: 'extraLegroom',
    label: 'Extra Legroom',
    price: 350,
    description: 'More room to stretch out',
  },
};

/** Ordered cheapest first, for legends. */
export const SEAT_CATEGORY_LIST: SeatCategory[] = Object.values(SEAT_CATEGORIES).sort(
  (a, b) => a.price - b.price,
);

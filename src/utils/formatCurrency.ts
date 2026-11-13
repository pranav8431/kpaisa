const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function formatCurrency(amount: number): string {
  return inrFormatter.format(amount);
}

/** Shows “Free” for zero-priced items, otherwise the formatted amount. */
export function formatPrice(amount: number): string {
  return amount === 0 ? 'Free' : formatCurrency(amount);
}

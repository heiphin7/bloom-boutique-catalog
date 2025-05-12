
// Currency formatting utilities

/**
 * Format a price in KZT for display
 * @param price - Price in KZT
 * @returns Formatted price string with KZT symbol
 */
export const formatKztPrice = (price: number): string => {
  return `₸${price.toLocaleString('en-KZ')}`;
};

/**
 * Convert a KZT price to the smallest currency unit for Stripe (tiyn)
 * @param kztPrice - Price in KZT
 * @returns Price in tiyn (smallest currency unit)
 */
export const kztToSmallestUnit = (price: number): number => {
  return Math.round(price * 100);
};

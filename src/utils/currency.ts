
// Currency conversion and formatting utilities

// Conversion rate: 1 USD = 450 KZT (fixed rate for the application)
export const USD_TO_KZT_RATE = 450;

/**
 * Convert a price from USD to KZT
 * @param usdPrice - Price in USD
 * @returns Price in KZT
 */
export const convertUsdToKzt = (usdPrice: number): number => {
  return Math.round(usdPrice * USD_TO_KZT_RATE);
};

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
export const kztToSmallestUnit = (kztPrice: number): number => {
  return Math.round(kztPrice * 100);
};

/**
 * Convert a USD price directly to the KZT smallest unit for Stripe
 * @param usdPrice - Price in USD
 * @returns Price in tiyn (smallest KZT unit) for Stripe
 */
export const usdPriceToKztSmallestUnit = (usdPrice: number): number => {
  const kztPrice = convertUsdToKzt(usdPrice);
  return kztToSmallestUnit(kztPrice);
};

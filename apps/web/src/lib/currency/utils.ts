import type { SupportedCurrency } from './types';
import { CURRENCY_CONFIG } from './config';

/**
 * Check if a string is a valid currency code
 */
export function isValidCurrency(currency: string): currency is SupportedCurrency {
  return currency in CURRENCY_CONFIG;
}

/**
 * Convert a price from EUR to target currency
 */
export function convertPrice(eurPrice: number, currency: SupportedCurrency): number {
  const config = CURRENCY_CONFIG[currency];
  return eurPrice * config.rate;
}

/**
 * Round to nearest X4.90 or X9.90 price point
 * Examples:
 * - 20.52 → 24.90
 * - 25.30 → 29.90
 * - 30.10 → 34.90
 * - 105.50 → 109.90
 */
export function roundToNearestPricePoint(price: number): number {
  const base = Math.floor(price / 10) * 10;
  const remainder = price - base;

  if (remainder <= 4.90) return base + 4.90;
  if (remainder <= 9.90) return base + 9.90;
  return base + 14.90;
}

/**
 * Format a price with currency symbol and locale formatting
 */
export function formatPrice(price: number, currency: SupportedCurrency): string {
  const config = CURRENCY_CONFIG[currency];
  
  // Format the number with appropriate decimal places
  const formattedNumber = price % 1 === 0 
    ? price.toFixed(0)
    : price.toFixed(2);
  
  // Position the symbol correctly
  if (config.symbolPosition === 'before') {
    return `${config.symbol}${formattedNumber}`;
  }
  return `${formattedNumber}${config.symbol}`;
}

/**
 * Convert and round a EUR price to target currency
 * EUR prices are kept as-is (reference prices)
 */
export function convertAndRound(eurPrice: number, currency: SupportedCurrency): number {
  if (currency === 'EUR') return eurPrice; // No rounding for EUR (base prices)
  const converted = convertPrice(eurPrice, currency);
  return roundToNearestPricePoint(converted);
}

/**
 * Get display price with formatting
 */
export function getDisplayPrice(eurPrice: number, currency: SupportedCurrency): string {
  const finalPrice = convertAndRound(eurPrice, currency);
  return formatPrice(finalPrice, currency);
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: SupportedCurrency): string {
  return CURRENCY_CONFIG[currency].symbol;
}

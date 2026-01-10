import { SupportedCurrency } from './types';
import { CURRENCY_CONFIG } from './config';

/**
 * Convert EUR price to target currency
 */
export function convertPrice(eurPrice: number, currency: SupportedCurrency): number {
  const config = CURRENCY_CONFIG[currency];
  return eurPrice * config.rate;
}

/**
 * Round price to nearest X4.90 or X9.90 above
 * Examples:
 * - 20.52 -> 24.90 (base=20, remainder=0.52 <= 4.90)
 * - 25.30 -> 29.90 (base=20, remainder=5.30 > 4.90, <= 9.90)
 * - 30.10 -> 34.90 (base=30, remainder=0.10 <= 4.90)
 * - 105.50 -> 109.90 (base=100, remainder=5.50 > 4.90, <= 9.90)
 */
export function roundToNearestPricePoint(price: number): number {
  const base = Math.floor(price / 10) * 10;
  const remainder = price - base;

  if (remainder <= 4.90) return base + 4.90;
  if (remainder <= 9.90) return base + 9.90;
  return base + 14.90;
}

/**
 * Format price with currency symbol and locale
 */
export function formatPrice(price: number, currency: SupportedCurrency): string {
  const config = CURRENCY_CONFIG[currency];

  // Check if price is a round number (no decimals needed)
  const hasDecimals = price % 1 !== 0;

  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Get just the currency symbol
 */
export function getCurrencySymbol(currency: SupportedCurrency): string {
  return CURRENCY_CONFIG[currency].symbol;
}

/**
 * Convert EUR price to target currency and round to price point
 * For EUR, returns original price (no rounding for base currency)
 */
export function convertAndRound(eurPrice: number, currency: SupportedCurrency): number {
  if (currency === 'EUR') return eurPrice; // No rounding for base currency
  const converted = convertPrice(eurPrice, currency);
  return roundToNearestPricePoint(converted);
}

/**
 * Check if a currency string is a valid supported currency
 */
export function isValidCurrency(value: string): value is SupportedCurrency {
  return ['EUR', 'USD', 'BRL', 'GBP', 'CAD'].includes(value);
}

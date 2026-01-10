import { SupportedCurrency, CurrencyConfig } from './types';

// Exchange rates vs EUR (EUR = 1)
// These should be updated periodically
export const CURRENCY_CONFIG: Record<SupportedCurrency, CurrencyConfig> = {
  EUR: { code: 'EUR', symbol: '\u20AC', rate: 1, locale: 'fr-FR' },
  USD: { code: 'USD', symbol: '$', rate: 1.08, locale: 'en-US' },
  BRL: { code: 'BRL', symbol: 'R$', rate: 5.90, locale: 'pt-BR' },
  GBP: { code: 'GBP', symbol: '\u00A3', rate: 0.85, locale: 'en-GB' },
  CAD: { code: 'CAD', symbol: 'CA$', rate: 1.47, locale: 'en-CA' },
};

// Map country codes to currencies
export const COUNTRY_TO_CURRENCY: Record<string, SupportedCurrency> = {
  // Eurozone
  FR: 'EUR',
  DE: 'EUR',
  ES: 'EUR',
  IT: 'EUR',
  PT: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  AT: 'EUR',
  IE: 'EUR',
  FI: 'EUR',
  GR: 'EUR',
  LU: 'EUR',
  // Other currencies
  US: 'USD',
  BR: 'BRL',
  GB: 'GBP',
  CA: 'CAD',
};

// Default currency if country not found
export const DEFAULT_CURRENCY: SupportedCurrency = 'EUR';

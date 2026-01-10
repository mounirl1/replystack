import type { SupportedCurrency, CurrencyConfig } from './types';

export const CURRENCY_CONFIG: Record<SupportedCurrency, CurrencyConfig> = {
  EUR: { code: 'EUR', symbol: '€', symbolPosition: 'after', rate: 1, locale: 'fr-FR' },
  USD: { code: 'USD', symbol: '$', symbolPosition: 'before', rate: 1.08, locale: 'en-US' },
  BRL: { code: 'BRL', symbol: 'R$', symbolPosition: 'before', rate: 5.90, locale: 'pt-BR' },
  GBP: { code: 'GBP', symbol: '£', symbolPosition: 'before', rate: 0.85, locale: 'en-GB' },
  CAD: { code: 'CAD', symbol: 'CA$', symbolPosition: 'before', rate: 1.47, locale: 'en-CA' },
};

// Country code to currency mapping
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
  // USD
  US: 'USD',
  // BRL
  BR: 'BRL',
  // GBP
  GB: 'GBP',
  UK: 'GBP',
  // CAD
  CA: 'CAD',
};

export const DEFAULT_CURRENCY: SupportedCurrency = 'EUR';

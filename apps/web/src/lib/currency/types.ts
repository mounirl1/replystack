export type SupportedCurrency = 'EUR' | 'USD' | 'BRL' | 'GBP' | 'CAD';

export interface CurrencyConfig {
  code: SupportedCurrency;
  symbol: string;
  rate: number; // Exchange rate vs EUR (EUR = 1)
  locale: string;
}

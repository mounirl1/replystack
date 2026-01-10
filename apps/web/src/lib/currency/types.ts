export type SupportedCurrency = 'EUR' | 'USD' | 'BRL' | 'GBP' | 'CAD';

export interface CurrencyConfig {
  code: SupportedCurrency;
  symbol: string;
  symbolPosition: 'before' | 'after';
  rate: number; // Rate vs EUR (EUR = 1)
  locale: string;
}

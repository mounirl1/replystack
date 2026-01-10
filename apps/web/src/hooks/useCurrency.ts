import { useState, useEffect } from 'react';
import type { SupportedCurrency } from '@/lib/currency/types';
import { COUNTRY_TO_CURRENCY, DEFAULT_CURRENCY } from '@/lib/currency/config';
import { isValidCurrency } from '@/lib/currency/utils';

const STORAGE_KEY = 'preferredCurrency';

interface UseCurrencyReturn {
  currency: SupportedCurrency;
  loading: boolean;
  country: string | null;
  setManualCurrency: (currency: SupportedCurrency) => void;
}

export function useCurrency(): UseCurrencyReturn {
  const [currency, setCurrency] = useState<SupportedCurrency>(DEFAULT_CURRENCY);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState<string | null>(null);

  useEffect(() => {
    async function detectCurrency() {
      try {
        // Check localStorage first (user's manual choice)
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && isValidCurrency(saved)) {
          setCurrency(saved);
          setLoading(false);
          return;
        }

        // Geolocation via IP
        const response = await fetch('https://ip-api.com/json/?fields=countryCode', {
          // Short timeout to avoid blocking the UI
          signal: AbortSignal.timeout(3000),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch location');
        }

        const data = await response.json();
        const countryCode = data.countryCode;
        setCountry(countryCode);

        const detectedCurrency = COUNTRY_TO_CURRENCY[countryCode] || DEFAULT_CURRENCY;
        setCurrency(detectedCurrency);
      } catch (error) {
        // Silently fallback to EUR
        console.warn('Currency detection failed, using default:', error);
        setCurrency(DEFAULT_CURRENCY);
      } finally {
        setLoading(false);
      }
    }

    detectCurrency();
  }, []);

  const setManualCurrency = (newCurrency: SupportedCurrency) => {
    setCurrency(newCurrency);
    localStorage.setItem(STORAGE_KEY, newCurrency);
  };

  return { currency, loading, country, setManualCurrency };
}

import { useState, useEffect } from 'react';
import type { SupportedCurrency } from '@/lib/currency/types';
import { COUNTRY_TO_CURRENCY, DEFAULT_CURRENCY } from '@/lib/currency/config';
import { isValidCurrency } from '@/lib/currency/utils';
import { CURRENCY_DETECTION_TIMEOUT } from '@/constants';

/** LocalStorage key for persisting user's manual currency choice */
const STORAGE_KEY = 'preferredCurrency';

interface UseCurrencyReturn {
  currency: SupportedCurrency;
  loading: boolean;
  country: string | null;
  setManualCurrency: (currency: SupportedCurrency) => void;
}

/**
 * Hook for detecting and managing the user's preferred currency
 *
 * Detection priority:
 * 1. User's saved preference in localStorage
 * 2. Geolocation-based detection via IP API
 * 3. Falls back to DEFAULT_CURRENCY (EUR)
 *
 * @returns Object containing currency, loading state, country code, and setter
 */
export function useCurrency(): UseCurrencyReturn {
  const [currency, setCurrency] = useState<SupportedCurrency>(DEFAULT_CURRENCY);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState<string | null>(null);

  useEffect(() => {
    async function detectCurrency() {
      try {
        // Check localStorage first (user's manual choice takes priority)
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && isValidCurrency(saved)) {
          setCurrency(saved);
          setLoading(false);
          return;
        }

        // Geolocation via IP
        const response = await fetch('https://ip-api.com/json/?fields=countryCode', {
          signal: AbortSignal.timeout(CURRENCY_DETECTION_TIMEOUT),
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

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Replace with your actual GA4 Measurement ID
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

/**
 * Initialize Google Analytics 4
 * Only loads if user has given consent (stored in localStorage)
 */
export function initGA(): void {
  // Check for consent
  const consent = localStorage.getItem('cookie-consent');
  if (consent !== 'accepted') {
    return;
  }

  // Don't initialize if already loaded
  if (typeof window.gtag === 'function') {
    return;
  }

  // Create script element
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false, // We'll handle page views manually for SPA
  });
}

/**
 * Track page views for SPA navigation
 */
export function trackPageView(path: string, title?: string): void {
  if (!window.gtag) return;

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
  });
}

/**
 * Track custom events
 */
export function trackEvent(
  eventName: string,
  parameters?: Record<string, string | number | boolean>
): void {
  if (!window.gtag) return;

  window.gtag('event', eventName, parameters);
}

/**
 * Component that initializes GA and tracks page views
 */
export function GoogleAnalytics() {
  const location = useLocation();

  // Initialize GA on mount (if consent given)
  useEffect(() => {
    initGA();
  }, []);

  // Track page views on route change
  useEffect(() => {
    // Small delay to ensure page title has updated
    const timeout = setTimeout(() => {
      trackPageView(location.pathname + location.search);
    }, 100);

    return () => clearTimeout(timeout);
  }, [location]);

  return null;
}

export default GoogleAnalytics;

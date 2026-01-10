import { useCallback } from 'react';
import { trackEvent as gaTrackEvent, trackPageView as gaTrackPageView } from '@/components/analytics/GoogleAnalytics';

/**
 * Custom hook for analytics tracking
 * Provides a consistent interface for tracking events across the app
 */
export function useAnalytics() {
  /**
   * Track a custom event
   */
  const trackEvent = useCallback((
    eventName: string,
    parameters?: Record<string, string | number | boolean>
  ) => {
    gaTrackEvent(eventName, parameters);
  }, []);

  /**
   * Track a page view (usually handled automatically)
   */
  const trackPageView = useCallback((path: string, title?: string) => {
    gaTrackPageView(path, title);
  }, []);

  // Pre-defined event trackers for common actions
  const trackExtensionClick = useCallback((browser: 'chrome' | 'firefox') => {
    trackEvent(`extension_${browser}_click`, {
      browser,
      location: window.location.pathname,
    });
  }, [trackEvent]);

  const trackSignupStart = useCallback(() => {
    trackEvent('signup_start', {
      location: window.location.pathname,
    });
  }, [trackEvent]);

  const trackSignupComplete = useCallback(() => {
    trackEvent('signup_complete');
  }, [trackEvent]);

  const trackPricingView = useCallback((plan?: string) => {
    trackEvent('pricing_view', {
      plan: plan || 'all',
    });
  }, [trackEvent]);

  const trackCheckoutStart = useCallback((plan: string, billingCycle: 'monthly' | 'yearly') => {
    trackEvent('checkout_start', {
      plan,
      billing_cycle: billingCycle,
    });
  }, [trackEvent]);

  const trackIndustryPageView = useCallback((industry: string) => {
    trackEvent('industry_page_view', {
      industry,
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackExtensionClick,
    trackSignupStart,
    trackSignupComplete,
    trackPricingView,
    trackCheckoutStart,
    trackIndustryPageView,
  };
}

export default useAnalytics;

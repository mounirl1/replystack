import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Cookie } from 'lucide-react';
import { initGA } from '@/components/analytics/GoogleAnalytics';

const CONSENT_KEY = 'cookie-consent';

type ConsentStatus = 'pending' | 'accepted' | 'declined';

/**
 * Cookie consent banner for GDPR compliance
 * GA4 only loads after user accepts cookies
 */
export function CookieConsent() {
  const { t } = useTranslation('common');
  const [status, setStatus] = useState<ConsentStatus>('pending');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const savedConsent = localStorage.getItem(CONSENT_KEY) as ConsentStatus | null;

    if (savedConsent === 'accepted' || savedConsent === 'declined') {
      setStatus(savedConsent);
      // If accepted, initialize GA
      if (savedConsent === 'accepted') {
        initGA();
      }
    } else {
      // Show banner after a short delay for better UX
      const timeout = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setStatus('accepted');
    setIsVisible(false);
    initGA();
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, 'declined');
    setStatus('declined');
    setIsVisible(false);
  };

  // Don't render if user has already made a choice
  if (status !== 'pending' || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
      <div className="max-w-4xl mx-auto bg-white dark:bg-dark-surface rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-border p-6">
        <div className="flex items-start gap-4">
          {/* Cookie icon */}
          <div className="flex-shrink-0 w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
            <Cookie className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-text-primary mb-2">
              {t('cookies.title', 'We use cookies')}
            </h3>
            <p className="text-gray-600 dark:text-text-secondary text-sm leading-relaxed">
              {t('cookies.description', 'We use cookies to analyze our traffic and improve your experience. By clicking "Accept", you consent to our use of cookies.')}
            </p>
          </div>

          {/* Close button (mobile) */}
          <button
            onClick={handleDecline}
            className="lg:hidden flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-text-secondary transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-6">
          <button
            onClick={handleAccept}
            className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
          >
            {t('cookies.accept', 'Accept')}
          </button>
          <button
            onClick={handleDecline}
            className="flex-1 sm:flex-none px-6 py-3 border border-gray-200 dark:border-dark-border text-gray-700 dark:text-text-secondary font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors"
          >
            {t('cookies.decline', 'Decline')}
          </button>
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 dark:text-text-tertiary hover:text-gray-700 dark:hover:text-text-secondary transition-colors text-center sm:text-left sm:ml-2"
          >
            {t('cookies.learnMore', 'Learn more')}
          </a>
        </div>
      </div>
    </div>
  );
}

export default CookieConsent;

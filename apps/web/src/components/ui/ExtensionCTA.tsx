import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Chrome, ExternalLink } from 'lucide-react';
import { EXTENSION_URLS, detectBrowser } from '@/config/extensions';

// Firefox icon component (Lucide doesn't have one)
function FirefoxIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.41 0 8 3.59 8 8 0 1.85-.63 3.55-1.69 4.9z" />
    </svg>
  );
}

type Variant = 'default' | 'compact' | 'hero';

interface ExtensionCTAProps {
  variant?: Variant;
  className?: string;
  onClickChrome?: () => void;
  onClickFirefox?: () => void;
}

export function ExtensionCTA({
  variant = 'default',
  className = '',
  onClickChrome,
  onClickFirefox,
}: ExtensionCTAProps) {
  const { t } = useTranslation('common');
  const [browser, setBrowser] = useState<'chrome' | 'firefox' | 'safari' | 'edge' | 'other'>('chrome');

  useEffect(() => {
    setBrowser(detectBrowser());
  }, []);

  const handleChromeClick = () => {
    onClickChrome?.();
    window.open(EXTENSION_URLS.chrome, '_blank', 'noopener,noreferrer');
  };

  const handleFirefoxClick = () => {
    onClickFirefox?.();
    window.open(EXTENSION_URLS.firefox, '_blank', 'noopener,noreferrer');
  };

  // Compact variant - single button
  if (variant === 'compact') {
    const isFirefox = browser === 'firefox';
    return (
      <button
        onClick={isFirefox ? handleFirefoxClick : handleChromeClick}
        className={`inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold px-4 py-2 rounded-full shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all hover:scale-[1.02] text-sm ${className}`}
      >
        {isFirefox ? <FirefoxIcon size={16} /> : <Chrome size={16} />}
        {t('extension.install')}
      </button>
    );
  }

  // Hero variant - large prominent button (single, based on browser)
  if (variant === 'hero') {
    const isFirefox = browser === 'firefox';

    return (
      <button
        onClick={isFirefox ? handleFirefoxClick : handleChromeClick}
        className={`inline-flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold px-8 py-4 rounded-full shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all hover:scale-[1.02] text-lg ${className}`}
      >
        {isFirefox ? <FirefoxIcon size={24} /> : <Chrome size={24} />}
        {isFirefox ? t('extension.addToFirefox') : t('extension.addToChrome')}
      </button>
    );
  }

  // Default variant - single button based on browser
  const isFirefox = browser === 'firefox';

  return (
    <button
      onClick={isFirefox ? handleFirefoxClick : handleChromeClick}
      className={`inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-full transition-all bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.02] ${className}`}
    >
      {isFirefox ? <FirefoxIcon size={20} /> : <Chrome size={20} />}
      {isFirefox ? t('extension.addToFirefox') : t('extension.addToChrome')}
    </button>
  );
}

// Simple link version for footer/text
export function ExtensionLink({ className = '' }: { className?: string }) {
  const { t } = useTranslation('common');

  return (
    <a
      href={EXTENSION_URLS.chrome}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 hover:text-emerald-600 transition-colors ${className}`}
    >
      {t('footer.extension')}
      <ExternalLink size={14} />
    </a>
  );
}

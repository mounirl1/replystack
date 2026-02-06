import { useTranslation } from 'react-i18next';
import { ExternalLink } from 'lucide-react';
import { EXTENSION_URL } from '@/config/extensions';

// Chrome icon component
export function ChromeIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="21.17" y1="8" x2="12" y2="8" />
      <line x1="3.95" y1="6.06" x2="8.54" y2="14" />
      <line x1="10.88" y1="21.94" x2="15.46" y2="14" />
    </svg>
  );
}

type Variant = 'default' | 'compact' | 'hero';

interface ExtensionCTAProps {
  variant?: Variant;
  className?: string;
  onClick?: () => void;
}

export function ExtensionCTA({
  variant = 'default',
  className = '',
  onClick,
}: ExtensionCTAProps) {
  const { t } = useTranslation('common');

  const handleClick = () => {
    onClick?.();
    window.open(EXTENSION_URL, '_blank', 'noopener,noreferrer');
  };

  // Compact variant - single button
  if (variant === 'compact') {
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold px-4 py-2 rounded-full shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all hover:scale-[1.02] text-sm ${className}`}
      >
        <ChromeIcon size={16} />
        {t('extension.install')}
      </button>
    );
  }

  // Hero variant - large prominent button
  if (variant === 'hero') {
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold px-8 py-4 rounded-full shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all hover:scale-[1.02] text-lg ${className}`}
      >
        <ChromeIcon size={24} />
        {t('extension.addToChrome')}
      </button>
    );
  }

  // Default variant
  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-full transition-all bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.02] ${className}`}
    >
      <ChromeIcon size={20} />
      {t('extension.addToChrome')}
    </button>
  );
}

// Simple link version for footer/text
export function ExtensionLink({ className = '' }: { className?: string }) {
  const { t } = useTranslation('common');

  return (
    <a
      href={EXTENSION_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 hover:text-emerald-600 transition-colors ${className}`}
    >
      {t('footer.extension')}
      <ExternalLink size={14} />
    </a>
  );
}

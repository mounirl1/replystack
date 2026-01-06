import { useTranslation } from 'react-i18next';
import { ExternalLink, Globe, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Platform {
  id: string;
  name: string;
  url: string;
  color: string;
  textColor?: string;
  logo: 'svg' | 'text';
  logoContent: string;
  category: 'popular' | 'hospitality' | 'saas' | 'other';
}

const platforms: Platform[] = [
  // Popular
  {
    id: 'google',
    name: 'Google Business',
    url: 'https://business.google.com',
    color: '#FFFFFF',
    logo: 'svg',
    logoContent: `<svg viewBox="0 0 24 24" class="w-6 h-6"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>`,
    category: 'popular',
  },
  {
    id: 'tripadvisor',
    name: 'TripAdvisor',
    url: 'https://www.tripadvisor.com/reviews?screen=allreviews',
    color: '#00AF87',
    logo: 'text',
    logoContent: 'TA',
    category: 'popular',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    url: 'https://business.facebook.com',
    color: '#FFFFFF',
    logo: 'svg',
    logoContent: `<svg viewBox="0 0 24 24" class="w-6 h-6"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
    category: 'popular',
  },
  {
    id: 'trustpilot',
    name: 'Trustpilot',
    url: 'https://business.trustpilot.com',
    color: '#00B67A',
    logo: 'text',
    logoContent: '★',
    category: 'popular',
  },
  // Hospitality
  {
    id: 'booking',
    name: 'Booking.com',
    url: 'https://admin.booking.com',
    color: '#003580',
    logo: 'text',
    logoContent: 'B.',
    category: 'hospitality',
  },
  {
    id: 'expedia',
    name: 'Expedia',
    url: 'https://www.expedia.com/partner',
    color: '#FFCC00',
    textColor: '#1A1A1A',
    logo: 'text',
    logoContent: 'EX',
    category: 'hospitality',
  },
  {
    id: 'hotels',
    name: 'Hotels.com',
    url: 'https://www.hotels.com',
    color: '#D32F2F',
    logo: 'text',
    logoContent: 'H',
    category: 'hospitality',
  },
  {
    id: 'airbnb',
    name: 'Airbnb',
    url: 'https://www.airbnb.com/hosting',
    color: '#FF5A5F',
    logo: 'text',
    logoContent: 'AB',
    category: 'hospitality',
  },
  {
    id: 'trustyou',
    name: 'TrustYou',
    url: 'https://www.trustyou.com',
    color: '#1A73E8',
    logo: 'text',
    logoContent: 'TY',
    category: 'hospitality',
  },
  // Local & Food
  {
    id: 'yelp',
    name: 'Yelp',
    url: 'https://biz.yelp.com',
    color: '#D32323',
    logo: 'text',
    logoContent: 'Y',
    category: 'other',
  },
  {
    id: 'thefork',
    name: 'TheFork',
    url: 'https://www.thefork.com/restaurant',
    color: '#00665C',
    logo: 'text',
    logoContent: 'TF',
    category: 'other',
  },
  // SaaS & B2B
  {
    id: 'g2',
    name: 'G2',
    url: 'https://seller.g2.com',
    color: '#FF492C',
    logo: 'text',
    logoContent: 'G2',
    category: 'saas',
  },
  {
    id: 'capterra',
    name: 'Capterra',
    url: 'https://www.capterra.com/vendors',
    color: '#FF9D28',
    textColor: '#1A1A1A',
    logo: 'text',
    logoContent: 'CA',
    category: 'saas',
  },
  {
    id: 'skeepers',
    name: 'Skeepers',
    url: 'https://www.skeepers.io',
    color: '#FF6B35',
    logo: 'text',
    logoContent: 'SK',
    category: 'saas',
  },
  {
    id: 'getapp',
    name: 'GetApp',
    url: 'https://www.getapp.com',
    color: '#00C4B4',
    logo: 'text',
    logoContent: 'GA',
    category: 'saas',
  },
  {
    id: 'softwareadvice',
    name: 'Software Advice',
    url: 'https://www.softwareadvice.com',
    color: '#1E88E5',
    logo: 'text',
    logoContent: 'SA',
    category: 'saas',
  },
];

const categories = [
  { id: 'popular', labelKey: 'supportedPlatforms.categories.popular' },
  { id: 'hospitality', labelKey: 'supportedPlatforms.categories.hospitality' },
  { id: 'saas', labelKey: 'supportedPlatforms.categories.saas' },
  { id: 'other', labelKey: 'supportedPlatforms.categories.other' },
];

export function SupportedPlatforms() {
  const { t } = useTranslation('common');

  const renderLogo = (platform: Platform) => {
    if (platform.logo === 'svg') {
      return (
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border border-light-border dark:border-dark-border"
          style={{ backgroundColor: platform.color }}
          dangerouslySetInnerHTML={{ __html: platform.logoContent }}
        />
      );
    }
    return (
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
        style={{ backgroundColor: platform.color, color: platform.textColor || '#FFFFFF' }}
      >
        <span className="font-bold text-sm">{platform.logoContent}</span>
      </div>
    );
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-dark-primary dark:text-text-primary mb-2">
          {t('supportedPlatforms.title')}
        </h1>
        <p className="text-text-dark-secondary dark:text-text-secondary">
          {t('supportedPlatforms.description')}
        </p>
      </div>

      {/* How it works */}
      <div className="bg-primary-500/10 dark:bg-primary-500/20 border border-primary-500/20 rounded-2xl p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center flex-shrink-0">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-text-dark-primary dark:text-text-primary mb-1">
              {t('supportedPlatforms.howItWorks.title')}
            </h3>
            <p className="text-sm text-text-dark-secondary dark:text-text-secondary mb-3">
              {t('supportedPlatforms.howItWorks.description')}
            </p>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 bg-primary-500/10 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t('supportedPlatforms.howItWorks.step1')}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 bg-primary-500/10 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t('supportedPlatforms.howItWorks.step2')}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 bg-primary-500/10 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t('supportedPlatforms.howItWorks.step3')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platforms by category */}
      {categories.map((category) => {
        const categoryPlatforms = platforms.filter((p) => p.category === category.id);
        if (categoryPlatforms.length === 0) return null;

        return (
          <div key={category.id} className="mb-8">
            <h2 className="text-lg font-semibold text-text-dark-primary dark:text-text-primary mb-4">
              {t(category.labelKey)}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryPlatforms.map((platform) => (
                <a
                  key={platform.id}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl hover:shadow-md hover:border-primary-500/50 transition-all group"
                >
                  {renderLogo(platform)}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-text-dark-primary dark:text-text-primary group-hover:text-primary-500 transition-colors">
                      {platform.name}
                    </h3>
                    <p className="text-xs text-text-tertiary truncate">{platform.url}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-text-tertiary group-hover:text-primary-500 transition-colors flex-shrink-0" />
                </a>
              ))}
            </div>
          </div>
        );
      })}

      {/* Request platform */}
      <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-6 text-center">
        <h3 className="font-semibold text-text-dark-primary dark:text-text-primary mb-2">
          {t('supportedPlatforms.requestPlatform.title')}
        </h3>
        <p className="text-sm text-text-dark-secondary dark:text-text-secondary mb-4">
          {t('supportedPlatforms.requestPlatform.description')}
        </p>
        <Button
          variant="outline"
          onClick={() => window.open('mailto:support@reply-stack.app?subject=Platform%20Request', '_blank')}
        >
          {t('supportedPlatforms.requestPlatform.button')}
        </Button>
      </div>
    </div>
  );
}

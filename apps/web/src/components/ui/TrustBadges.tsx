import { useTranslation } from 'react-i18next';
import { Shield, Lock, CreditCard, RefreshCw, Server, CheckCircle2 } from 'lucide-react';

interface TrustBadge {
  icon: typeof Shield;
  labelKey: string;
}

const trustBadges: TrustBadge[] = [
  { icon: Shield, labelKey: 'gdprCompliant' },
  { icon: Lock, labelKey: 'secureData' },
  { icon: CreditCard, labelKey: 'noCardRequired' },
  { icon: RefreshCw, labelKey: 'cancelAnytime' },
];

type Variant = 'horizontal' | 'vertical' | 'compact';

interface TrustBadgesProps {
  variant?: Variant;
  className?: string;
  showIcons?: boolean;
}

/**
 * Trust badges component for building user confidence
 * Display security and trust indicators
 */
export function TrustBadges({
  variant = 'horizontal',
  className = '',
  showIcons = true,
}: TrustBadgesProps) {
  const { t } = useTranslation('common');

  if (variant === 'compact') {
    return (
      <div className={`flex flex-wrap items-center gap-4 text-sm text-gray-500 ${className}`}>
        {trustBadges.map((badge, index) => {
          const Icon = badge.icon;
          return (
            <span key={index} className="flex items-center gap-1.5">
              {showIcons && <Icon size={14} className="text-emerald-500" />}
              {t(`trust.${badge.labelKey}`)}
            </span>
          );
        })}
      </div>
    );
  }

  if (variant === 'vertical') {
    return (
      <div className={`space-y-3 ${className}`}>
        {trustBadges.map((badge, index) => {
          const Icon = badge.icon;
          return (
            <div key={index} className="flex items-center gap-3">
              {showIcons && (
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Icon size={20} className="text-emerald-600" />
                </div>
              )}
              <span className="text-gray-700 font-medium">
                {t(`trust.${badge.labelKey}`)}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  // Default: horizontal
  return (
    <div className={`flex flex-wrap justify-center gap-6 ${className}`}>
      {trustBadges.map((badge, index) => {
        const Icon = badge.icon;
        return (
          <div
            key={index}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100"
          >
            {showIcons && <Icon size={18} className="text-emerald-500" />}
            <span className="text-sm font-medium text-gray-700">
              {t(`trust.${badge.labelKey}`)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Security section for landing pages
 * Full section with title and trust badges
 */
export function SecuritySection({ className = '' }: { className?: string }) {
  const { t } = useTranslation('common');

  const securityFeatures = [
    { icon: Server, labelKey: 'euHosted' },
    { icon: Lock, labelKey: 'encrypted' },
    { icon: Shield, labelKey: 'gdprCompliant' },
    { icon: CheckCircle2, labelKey: 'noDataSharing' },
  ];

  return (
    <section className={`py-16 bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-4">
            <Shield size={16} />
            {t('trust.sectionBadge', 'Your data is safe')}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('trust.sectionTitle', 'Security & Privacy First')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('trust.sectionSubtitle', 'We take your data security seriously. Your business information is encrypted and never shared with third parties.')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {securityFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 border border-gray-100 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
                  <Icon size={28} className="text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t(`trust.${feature.labelKey}`)}
                </h3>
                <p className="text-sm text-gray-500">
                  {t(`trust.${feature.labelKey}Description`, '')}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default TrustBadges;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { stripeApi } from '@/services/api';
import { Button } from '@/components/ui/Button';

export function Pricing() {
  const { t } = useTranslation('pricing');
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const plans = [
    {
      id: 'free',
      price: 0,
      features: [
        t('features.repliesPerMonth', { count: 10 }),
        t('features.browserExtension'),
        t('features.allPlatforms'),
        t('features.allTones'),
        t('features.customPrompts'),
        t('features.responseProfile'),
      ],
      limitations: [t('features.noAnalytics')],
      popular: false,
    },
    {
      id: 'starter',
      price: 9.90,
      features: [
        t('features.repliesPerMonth', { count: 50 }),
        t('features.allPlatforms'),
        t('features.allTones'),
        t('features.customPrompts'),
        t('features.responseProfile'),
        t('features.responseHistory'),
        t('features.emailSupport'),
      ],
      limitations: [],
      popular: false,
    },
    {
      id: 'pro',
      price: 29,
      features: [
        t('features.unlimitedReplies'),
        t('features.allPlatforms'),
        t('features.allTones'),
        t('features.customPrompts'),
        t('features.responseProfile'),
        t('features.analyticsDashboard'),
        t('features.prioritySupport'),
        t('features.negativeAlerts'),
      ],
      limitations: [],
      popular: true,
    },
    {
      id: 'business',
      price: 79,
      features: [
        t('features.everythingInPro'),
        t('features.locations', { count: 10 }),
        t('features.teamMembers', { count: 5 }),
        t('features.slackIntegration'),
        t('features.customTemplates'),
        t('features.dedicatedSupport'),
      ],
      limitations: [],
      popular: false,
    },
  ];

  const handleSelectPlan = async (planId: string) => {
    if (!isAuthenticated) {
      navigate('/register');
      return;
    }

    if (planId === 'free') {
      return;
    }

    if (planId === 'business') {
      window.location.href = 'mailto:contact@replystack.com?subject=Business Plan Inquiry';
      return;
    }

    setLoadingPlan(planId);
    try {
      const { url } = await stripeApi.createCheckout(planId as 'starter' | 'pro');
      window.location.href = url;
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      setLoadingPlan(null);
    }
  };

  const isCurrentPlan = (planId: string) => {
    return isAuthenticated && user?.plan === planId;
  };

  const canUpgrade = (planId: string) => {
    if (!isAuthenticated) return true;
    const planOrder = ['free', 'starter', 'pro', 'business', 'enterprise'];
    return planOrder.indexOf(planId) > planOrder.indexOf(user?.plan || 'free');
  };

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-bold text-gray-900">
            {t('title')}
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            {t('subtitle')}
          </p>
        </div>

        {/* All Features Included Banner */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-2xl p-6">
            <div className="text-center mb-4">
              <span className="inline-flex items-center gap-2 bg-primary-600 text-white text-sm font-medium px-4 py-1.5 rounded-full">
                {t('allFeaturesBanner.badge')}
              </span>
            </div>
            <div className="grid sm:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl mb-2">🎨</div>
                <h3 className="font-semibold text-gray-900">{t('allFeaturesBanner.tones.title')}</h3>
                <p className="text-sm text-gray-600">{t('allFeaturesBanner.tones.description')}</p>
              </div>
              <div>
                <div className="text-2xl mb-2">✍️</div>
                <h3 className="font-semibold text-gray-900">{t('allFeaturesBanner.customPrompts.title')}</h3>
                <p className="text-sm text-gray-600">{t('allFeaturesBanner.customPrompts.description')}</p>
              </div>
              <div>
                <div className="text-2xl mb-2">🏢</div>
                <h3 className="font-semibold text-gray-900">{t('allFeaturesBanner.responseProfile.title')}</h3>
                <p className="text-sm text-gray-600">{t('allFeaturesBanner.responseProfile.description')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border ${
                plan.popular
                  ? 'border-primary-500 shadow-lg shadow-primary-100'
                  : 'border-gray-200'
              } bg-white p-6 flex flex-col`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                    {t('plans.pro.popular')}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">{t(`plans.${plan.id}.name`)}</h3>
                <p className="text-sm text-gray-500 mt-1">{t(`plans.${plan.id}.description`)}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  {plan.price === 0 ? t('plans.free.price') : `€${plan.price}`}
                </span>
                {plan.price > 0 && (
                  <span className="text-gray-500">{t('perMonth')}</span>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary-600 mt-0.5">✓</span>
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
                {plan.limitations.map((limitation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">✕</span>
                    <span className="text-sm text-gray-400">{limitation}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? 'primary' : 'outline'}
                className="w-full"
                onClick={() => handleSelectPlan(plan.id)}
                disabled={isCurrentPlan(plan.id) || !canUpgrade(plan.id)}
                isLoading={loadingPlan === plan.id}
              >
                {isCurrentPlan(plan.id)
                  ? t('currentPlan')
                  : !canUpgrade(plan.id)
                  ? t('downgradeNotAvailable')
                  : t(`plans.${plan.id}.cta`)}
              </Button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            {t('faq.title')}
          </h2>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('faq.cancel.question')}
              </h3>
              <p className="text-gray-600">
                {t('faq.cancel.answer')}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('faq.quota.question')}
              </h3>
              <p className="text-gray-600">
                {t('faq.quota.answer')}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('faq.refund.question')}
              </h3>
              <p className="text-gray-600">
                {t('faq.refund.answer')}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('faq.switch.question')}
              </h3>
              <p className="text-gray-600">
                {t('faq.switch.answer')}
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <p className="text-gray-600 mb-4">
            {t('support.text')}
          </p>
          <a
            href="mailto:support@replystack.com"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            {t('support.link')}
          </a>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { lemonSqueezyApi } from '@/services/api';
import { Button } from '@/components/ui/Button';

type BillingCycle = 'monthly' | 'yearly';

export function Pricing() {
  const { t } = useTranslation('pricing');
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly');

  const plans = [
    {
      id: 'free',
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        t('features.repliesPerMonth', { count: 15 }),
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
      monthlyPrice: 19,
      yearlyPrice: 99,
      yearlyPerMonth: 8.25,
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
      monthlyPrice: 49,
      yearlyPrice: 290,
      yearlyPerMonth: 24.17,
      features: [
        t('features.repliesPerMonth', { count: 200 }),
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
      monthlyPrice: 99,
      yearlyPrice: 790,
      yearlyPerMonth: 65.83,
      features: [
        t('features.repliesPerMonth', { count: 500 }),
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

    setLoadingPlan(planId);
    try {
      const { url } = await lemonSqueezyApi.createCheckout(
        planId as 'starter' | 'pro' | 'business',
        billingCycle
      );
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

  const getYearlySavings = (plan: typeof plans[0]) => {
    if (plan.id === 'free' || !plan.monthlyPrice) return 0;
    const yearlyTotal = plan.monthlyPrice * 12;
    return Math.round(((yearlyTotal - plan.yearlyPrice) / yearlyTotal) * 100);
  };

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            {t('title')}
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            {t('subtitle')}
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center items-center gap-4 mb-12">
          <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
            {t('billing.monthly')}
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              billingCycle === 'yearly' ? 'bg-primary-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
            {t('billing.yearly')}
          </span>
          {billingCycle === 'yearly' && (
            <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              {t('billing.saveUpTo')}
            </span>
          )}
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
                {plan.id === 'free' ? (
                  <span className="text-4xl font-bold text-gray-900">{t('plans.free.price')}</span>
                ) : billingCycle === 'yearly' ? (
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-gray-900">
                        €{plan.yearlyPerMonth?.toFixed(0)}
                      </span>
                      <span className="text-gray-500">{t('perMonth')}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm text-gray-500 line-through">
                        €{plan.monthlyPrice}/mo
                      </span>
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                        -{getYearlySavings(plan)}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('billing.billedYearly', { price: plan.yearlyPrice })}
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-gray-900">
                        €{plan.monthlyPrice}
                      </span>
                      <span className="text-gray-500">{t('perMonth')}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('billing.billedMonthly')}
                    </p>
                  </div>
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

        {/* All Features Included Banner */}
        <div className="max-w-4xl mx-auto mt-16">
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

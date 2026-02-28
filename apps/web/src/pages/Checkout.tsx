import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { lemonSqueezyApi } from '@/services/api';
import { Check, ArrowRight, Clock } from 'lucide-react';
import { PageSEO } from '@/components/seo/PageSEO';

const PLAN_DETAILS: Record<string, { replies: number; features: string[] }> = {
  starter: {
    replies: 50,
    features: ['allPlatforms', 'allTones', 'dashboard', 'responseHistory', 'emailSupport'],
  },
  pro: {
    replies: 200,
    features: ['allPlatforms', 'allTones', 'dashboard', 'analytics', 'alerts', 'prioritySupport'],
  },
  business: {
    replies: 500,
    features: ['allPlatforms', 'allTones', 'dashboard', 'analytics', 'locations', 'teamMembers', 'slackIntegration'],
  },
};

const PLAN_PRICES: Record<string, { monthly: number; yearly: number }> = {
  starter: { monthly: 9.90, yearly: 99 },
  pro: { monthly: 29, yearly: 290 },
  business: { monthly: 79, yearly: 790 },
};

export function Checkout() {
  const { t } = useTranslation('pricing');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, refreshUser } = useAuth();

  const plan = searchParams.get('plan');
  const billing = (searchParams.get('billing') || 'yearly') as 'monthly' | 'yearly';

  const [isLoading, setIsLoading] = useState(false);

  // Redirect if no valid plan, not authenticated, or already on a paid plan
  useEffect(() => {
    if (!plan || !PLAN_DETAILS[plan]) {
      navigate('/pricing', { replace: true });
      return;
    }
    if (!isAuthenticated) {
      navigate(`/register?plan=${plan}&billing=${billing}`, { replace: true });
      return;
    }
    if (user?.plan && user.plan !== 'free') {
      navigate('/dashboard', { replace: true });
    }
  }, [plan, isAuthenticated, user, navigate, billing]);

  // Load Lemon.js
  useEffect(() => {
    if (document.querySelector('script[src*="lemon.js"]')) return;
    const script = document.createElement('script');
    script.src = 'https://app.lemonsqueezy.com/js/lemon.js';
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  // Setup LemonSqueezy event handler
  const setupEvents = useCallback(() => {
    if ((window as any).LemonSqueezy) {
      (window as any).LemonSqueezy.Setup({
        eventHandler: (data: any) => {
          if (data.event === 'Checkout.Success') {
            refreshUser();
            setTimeout(() => navigate('/dashboard'), 2000);
          }
        },
      });
    }
  }, [refreshUser, navigate]);

  useEffect(() => {
    setupEvents();
    const timer = setTimeout(setupEvents, 1000);
    return () => clearTimeout(timer);
  }, [setupEvents]);

  if (!plan || !PLAN_DETAILS[plan]) return null;

  const details = PLAN_DETAILS[plan];
  const prices = PLAN_PRICES[plan];
  const price = billing === 'yearly' ? prices.yearly : prices.monthly;
  const monthlyEquivalent = billing === 'yearly' ? Math.round(prices.yearly / 12) : prices.monthly;

  const handlePayNow = async () => {
    setIsLoading(true);
    try {
      const { url } = await lemonSqueezyApi.createCheckout(
        plan as 'starter' | 'pro' | 'business',
        billing
      );
      if ((window as any).LemonSqueezy) {
        (window as any).LemonSqueezy.Url.Open(url);
      } else {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Failed to create checkout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageSEO
        title="Checkout - ReplyStack"
        description="Complete your ReplyStack subscription"
        noindex={true}
        includeHreflang={false}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-teal-500 px-8 py-6 text-white">
              <p className="text-sm font-medium text-primary-100">{t('checkout.almostThere', 'Almost there!')}</p>
              <h1 className="text-2xl font-bold mt-1">
                ReplyStack {plan.charAt(0).toUpperCase() + plan.slice(1)}
              </h1>
              <div className="flex items-baseline gap-2 mt-3">
                <span className="text-4xl font-bold">{monthlyEquivalent}&#8364;</span>
                <span className="text-primary-100">/ {t('perMonth', 'month')}</span>
              </div>
              {billing === 'yearly' && (
                <p className="text-sm text-primary-100 mt-1">
                  {t('billing.billedYearly', { price: `${price}\u20AC` })}
                </p>
              )}
            </div>

            {/* Features */}
            <div className="px-8 py-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                {t('checkout.included', "What's included")}
              </h2>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Check size={18} className="text-primary-600 shrink-0" />
                  <span className="text-sm text-gray-700">
                    {details.replies} {t('checkout.repliesPerMonth', 'AI replies per month')}
                  </span>
                </li>
                {details.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check size={18} className="text-primary-600 shrink-0" />
                    <span className="text-sm text-gray-700">
                      {t(`checkout.features.${feature}`, feature)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="px-8 pb-8 space-y-3">
              <button
                onClick={handlePayNow}
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-500 to-teal-500 hover:from-primary-600 hover:to-teal-600 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {t('checkout.payNow', 'Subscribe now')}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                className="w-full py-3 px-4 rounded-xl font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                <Clock size={16} />
                {t('checkout.later', "I'll do this later")}
              </button>

              <p className="text-xs text-gray-400 text-center pt-2">
                {t('checkout.freePlan', "You'll stay on the free plan (15 replies/month) until you subscribe.")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

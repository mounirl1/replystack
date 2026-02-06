import { type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import {
  Bot,
  LayoutDashboard,
  Palette,
  Building2,
  BarChart3,
  Bell,
  Shield,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Clock,
  Target,
  MousePointerClick,
  Languages,
  Settings2,
  TrendingUp,
  FileText,
  Lock,
  Server,
  BadgeCheck,
  ChevronRight,
  Star,
  MessageSquare,
} from 'lucide-react';
import { ChromeIcon } from '@/components/ui/ExtensionCTA';
import { extractLanguageCode } from '@/config/sectors';

// Platform data with support status
const platforms = [
  { name: 'Google Business Profile', emoji: '⭐', read: true, aiReply: true },
  { name: 'TripAdvisor', emoji: '🦉', read: true, aiReply: true },
  { name: 'Booking.com', emoji: '🏨', read: true, aiReply: true },
  { name: 'Yelp', emoji: '📍', read: true, aiReply: true },
  { name: 'Facebook', emoji: '👍', read: true, aiReply: true },
  { name: 'Trustpilot', emoji: '⭐', read: true, aiReply: true },
];

// Main features data
const mainFeatures = [
  {
    id: 'ai-responses',
    icon: Bot,
    color: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'chrome-extension',
    icon: ChromeIcon,
    color: 'from-blue-500 to-indigo-500',
  },
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    color: 'from-violet-500 to-purple-500',
  },
  {
    id: 'response-profiles',
    icon: Palette,
    color: 'from-pink-500 to-rose-500',
  },
  {
    id: 'multi-location',
    icon: Building2,
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 'analytics',
    icon: BarChart3,
    color: 'from-cyan-500 to-blue-500',
  },
  {
    id: 'alerts',
    icon: Bell,
    color: 'from-red-500 to-pink-500',
  },
  {
    id: 'security',
    icon: Shield,
    color: 'from-slate-600 to-slate-800',
  },
];

// How it works steps
const howItWorksSteps = [
  { icon: MessageSquare, step: 1 },
  { icon: Sparkles, step: 2 },
  { icon: MousePointerClick, step: 3 },
  { icon: CheckCircle2, step: 4 },
];

// Response profile options
const profileOptions = {
  tones: ['professional', 'warm', 'formal', 'casual'],
  lengths: ['short', 'medium', 'detailed'],
};

// Analytics metrics
const analyticsMetrics = [
  { icon: Star, key: 'avgRating' },
  { icon: TrendingUp, key: 'evolution' },
  { icon: MessageSquare, key: 'volume' },
  { icon: Target, key: 'responseRate' },
  { icon: Clock, key: 'responseTime' },
  { icon: BarChart3, key: 'sentiment' },
];

// Security badges
const securityBadges = [
  { icon: Lock, key: 'ssl' },
  { icon: Server, key: 'euHosting' },
  { icon: BadgeCheck, key: 'gdpr' },
  { icon: Shield, key: 'noDataSale' },
];

// Pricing plans
const plans = [
  { name: 'Free', price: 0, responses: 15, locations: 1 },
  { name: 'Starter', price: 9.90, responses: 50, locations: 1 },
  { name: 'Pro', price: 29, responses: 200, locations: 3 },
  { name: 'Business', price: 79, responses: 500, locations: -1 }, // -1 = unlimited
];

export function Features(): ReactElement {
  const { t, i18n } = useTranslation('features');
  const { t: tc } = useTranslation('common');

  const currentLang = extractLanguageCode(i18n.language);
  const pricingPath = currentLang === 'en' ? '/pricing' : `/${currentLang}/pricing`;

  return (
    <div className="bg-white">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{t('seo.title')}</title>
        <meta name="description" content={t('seo.description')} />
        <meta name="keywords" content={t('seo.keywords')} />

        {/* Open Graph */}
        <meta property="og:title" content={t('seo.title')} />
        <meta property="og:description" content={t('seo.description')} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://www.reply-stack.app${currentLang === 'en' ? '' : `/${currentLang}`}/features`} />
        <meta property="og:image" content="https://www.reply-stack.app/og-image.png" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t('seo.title')} />
        <meta name="twitter:description" content={t('seo.description')} />

        {/* Canonical */}
        <link rel="canonical" href={`https://www.reply-stack.app${currentLang === 'en' ? '' : `/${currentLang}`}/features`} />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": t('seo.title'),
            "description": t('seo.description'),
            "url": `https://www.reply-stack.app${currentLang === 'en' ? '' : `/${currentLang}`}/features`,
            "mainEntity": {
              "@type": "SoftwareApplication",
              "name": "ReplyStack",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web, Chrome",
              "featureList": mainFeatures.map(f => t(`features.${f.id}.title`)).join(', '),
            }
          })}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 via-white to-white -z-10" />

        {/* Floating decorations */}
        <div className="absolute top-16 left-[8%] w-20 h-20 bg-emerald-100 rounded-3xl float-slow opacity-50 rotate-12" />
        <div className="absolute top-40 right-[12%] w-14 h-14 bg-teal-100 rounded-full float-medium opacity-60" />
        <div className="absolute bottom-32 left-[18%] w-10 h-10 bg-emerald-200 rounded-xl float-fast opacity-40 -rotate-12" />
        <div className="absolute top-28 right-[25%] w-8 h-8 bg-teal-200 rounded-lg float-slow opacity-50" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 badge mb-6 animate-fade-in">
              <Sparkles size={14} />
              <span>{t('hero.badge')}</span>
            </div>

            {/* Main heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 animate-fade-in-up leading-tight">
              {t('hero.title')}{' '}
              <span className="text-gradient">{t('hero.titleHighlight')}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto animate-fade-in-up leading-relaxed" style={{ animationDelay: '0.1s' }}>
              {t('hero.subtitle')}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold px-8 py-4 rounded-full shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all hover:scale-[1.02] text-lg"
              >
                {tc('buttons.startFree')}
                <ArrowRight size={20} />
              </Link>
              <Link
                to={pricingPath}
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-full hover:border-gray-300 hover:bg-gray-50 transition-all"
              >
                {t('hero.viewPricing')}
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mainFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.id}
                  className="feature-card group animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">
                    {t(`features.${feature.id}.title`)}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {t(`features.${feature.id}.description`)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Responses Detail Section */}
      <section id="ai-responses" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Content */}
            <div>
              <span className="section-badge mb-4">
                <Bot size={14} />
                {t('aiResponses.badge')}
              </span>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-6">
                {t('aiResponses.title')}
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                {t('aiResponses.description')}
              </p>

              {/* Features list */}
              <ul className="space-y-4 mb-8">
                {['context', 'tone', 'length', 'multilingual'].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">{t(`aiResponses.features.${item}.title`)}</span>
                      <span className="text-gray-600"> — {t(`aiResponses.features.${item}.desc`)}</span>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Results */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-emerald-50 rounded-2xl">
                  <div className="flex items-center justify-center gap-1 text-emerald-600 mb-1">
                    <Clock size={16} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">30s</div>
                  <div className="text-xs text-gray-600">{t('aiResponses.results.time')}</div>
                </div>
                <div className="text-center p-4 bg-emerald-50 rounded-2xl">
                  <div className="flex items-center justify-center gap-1 text-emerald-600 mb-1">
                    <Target size={16} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">100%</div>
                  <div className="text-xs text-gray-600">{t('aiResponses.results.consistency')}</div>
                </div>
                <div className="text-center p-4 bg-emerald-50 rounded-2xl">
                  <div className="flex items-center justify-center gap-1 text-emerald-600 mb-1">
                    <TrendingUp size={16} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">100%</div>
                  <div className="text-xs text-gray-600">{t('aiResponses.results.responseRate')}</div>
                </div>
              </div>
            </div>

            {/* Visual: How it works */}
            <div className="bg-gradient-to-br from-gray-50 to-emerald-50/30 rounded-3xl p-8 lg:p-10">
              <h3 className="font-bold text-gray-900 mb-6 text-lg">{t('aiResponses.howItWorks')}</h3>
              <div className="space-y-4">
                {howItWorksSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.step} className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        index === howItWorksSteps.length - 1
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white'
                          : 'bg-white border-2 border-gray-200 text-gray-600'
                      }`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{t(`aiResponses.steps.step${step.step}`)}</p>
                      </div>
                      {index < howItWorksSteps.length - 1 && (
                        <ChevronRight size={16} className="text-gray-400" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chrome Extension Section */}
      <section id="extension" className="py-20 lg:py-28 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="section-badge mb-4">
              <ChromeIcon size={14} />
              {t('extension.badge')}
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">
              {t('extension.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('extension.subtitle')}
            </p>
          </div>

          {/* Platforms Table */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 border-b border-gray-100">
                <div className="font-semibold text-gray-700">{t('extension.table.platform')}</div>
                <div className="font-semibold text-gray-700 text-center">{t('extension.table.reading')}</div>
                <div className="font-semibold text-gray-700 text-center">{t('extension.table.aiResponse')}</div>
              </div>
              {platforms.map((platform, index) => (
                <div
                  key={platform.name}
                  className={`grid grid-cols-3 gap-4 p-4 items-center ${
                    index !== platforms.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{platform.emoji}</span>
                    <span className="font-medium text-gray-900">{platform.name}</span>
                  </div>
                  <div className="text-center">
                    <CheckCircle2 size={20} className="text-emerald-500 mx-auto" />
                  </div>
                  <div className="text-center">
                    <CheckCircle2 size={20} className="text-emerald-500 mx-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {['noHabitChange', 'worksWithoutApi', 'autoSync'].map((benefit) => (
              <div key={benefit} className="flex items-start gap-3 p-4">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                </div>
                <p className="text-gray-700">{t(`extension.benefits.${benefit}`)}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-10">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-full transition-all bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.02]"
            >
              {tc('buttons.startFree')}
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Response Profiles Section */}
      <section id="profiles" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Visual: Profile Demo */}
            <div className="order-2 lg:order-1">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 lg:p-8 text-white">
                <div className="flex items-center gap-2 mb-6">
                  <Settings2 size={20} className="text-emerald-400" />
                  <span className="font-semibold">{t('profiles.demoTitle')}</span>
                </div>

                {/* Tone selector */}
                <div className="mb-6">
                  <label className="text-sm text-gray-400 mb-2 block">{t('profiles.demo.tone')}</label>
                  <div className="flex flex-wrap gap-2">
                    {profileOptions.tones.map((tone, index) => (
                      <button
                        key={tone}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          index === 1
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {t(`profiles.tones.${tone}`)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Length selector */}
                <div className="mb-6">
                  <label className="text-sm text-gray-400 mb-2 block">{t('profiles.demo.length')}</label>
                  <div className="flex gap-2">
                    {profileOptions.lengths.map((length, index) => (
                      <button
                        key={length}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          index === 1
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {t(`profiles.lengths.${length}`)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Signature */}
                <div className="mb-6">
                  <label className="text-sm text-gray-400 mb-2 block">{t('profiles.demo.signature')}</label>
                  <div className="bg-gray-700 rounded-lg p-3 text-gray-300 text-sm">
                    Marie, {t('profiles.demo.signatureExample')} 🍽️
                  </div>
                </div>

                {/* Language */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">{t('profiles.demo.language')}</label>
                  <div className="flex items-center gap-2">
                    <Languages size={16} className="text-emerald-400" />
                    <span className="text-gray-300">{t('profiles.demo.languages')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="order-1 lg:order-2">
              <span className="section-badge mb-4">
                <Palette size={14} />
                {t('profiles.badge')}
              </span>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-6">
                {t('profiles.title')}
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                {t('profiles.description')}
              </p>

              {/* Customizable elements */}
              <div className="space-y-3">
                {['businessDesc', 'strengths', 'avoidMentions', 'greetings', 'keywords'].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-emerald-500" />
                    <span className="text-gray-700">{t(`profiles.customizable.${item}`)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Section */}
      <section id="analytics" className="py-20 lg:py-28 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="section-badge mb-4">
              <BarChart3 size={14} />
              {t('analytics.badge')}
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">
              {t('analytics.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('analytics.subtitle')}
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
            {analyticsMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.key} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                      <Icon size={20} className="text-emerald-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{t(`analytics.metrics.${metric.key}.title`)}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{t(`analytics.metrics.${metric.key}.desc`)}</p>
                </div>
              );
            })}
          </div>

          {/* Reports features */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 max-w-3xl mx-auto">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">{t('analytics.reports.title')}</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-emerald-600" />
                <span className="text-gray-700">{t('analytics.reports.pdf')}</span>
              </div>
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-emerald-600" />
                <span className="text-gray-700">{t('analytics.reports.csv')}</span>
              </div>
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-emerald-600" />
                <span className="text-gray-700">{t('analytics.reports.alerts')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="section-badge mb-4">
              <Shield size={14} />
              {t('security.badge')}
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">
              {t('security.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('security.subtitle')}
            </p>
          </div>

          {/* Security Badges */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {securityBadges.map((badge) => {
              const Icon = badge.icon;
              return (
                <div key={badge.key} className="bg-gray-50 rounded-2xl p-6 text-center hover:bg-gray-100 transition-colors">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center mx-auto mb-4">
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{t(`security.badges.${badge.key}.title`)}</h3>
                  <p className="text-sm text-gray-600">{t(`security.badges.${badge.key}.desc`)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Summary */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">
              {t('pricing.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('pricing.subtitle')}
            </p>
          </div>

          {/* Plans Table */}
          <div className="overflow-x-auto mb-10">
            <table className="w-full max-w-4xl mx-auto">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">{t('pricing.table.plan')}</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-700">{t('pricing.table.price')}</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-700">{t('pricing.table.responses')}</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-700">{t('pricing.table.locations')}</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan, index) => (
                  <tr key={plan.name} className={index !== plans.length - 1 ? 'border-b border-gray-100' : ''}>
                    <td className="py-4 px-4">
                      <span className={`font-bold ${plan.name === 'Pro' ? 'text-emerald-600' : 'text-gray-900'}`}>
                        {plan.name}
                      </span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="font-semibold text-gray-900">
                        {plan.price === 0 ? t('pricing.free') : `${plan.price}€`}
                      </span>
                      {plan.price > 0 && <span className="text-gray-500 text-sm">/{t('pricing.month')}</span>}
                    </td>
                    <td className="text-center py-4 px-4 text-gray-700">{plan.responses}/{t('pricing.month')}</td>
                    <td className="text-center py-4 px-4 text-gray-700">
                      {plan.locations === -1 ? t('pricing.unlimited') : plan.locations}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center">
            <Link
              to={pricingPath}
              className="inline-flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
            >
              {t('pricing.seeDetails')}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">
              {t('faq.title')}
            </h2>
          </div>

          <div className="space-y-6">
            {['editResponses', 'aggregation', 'dataSecure'].map((faq) => (
              <div key={faq} className="border-b border-gray-100 pb-6">
                <h3 className="font-bold text-gray-900 mb-2">{t(`faq.items.${faq}.question`)}</h3>
                <p className="text-gray-600">{t(`faq.items.${faq}.answer`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-emerald-500 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">
            {t('cta.title')}
          </h2>
          <p className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto">
            {t('cta.subtitle')}
          </p>

          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-3 bg-white text-emerald-600 font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] hover:bg-emerald-50 text-lg"
          >
            {tc('buttons.startFree')}
            <ArrowRight size={20} />
          </Link>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 text-sm text-emerald-100">
            <span className="flex items-center gap-1">
              <CheckCircle2 size={16} />
              {t('cta.noCreditCard')}
            </span>
            <span className="hidden sm:block">•</span>
            <span className="flex items-center gap-1">
              <Clock size={16} />
              {t('cta.setup')}
            </span>
            <span className="hidden sm:block">•</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 size={16} />
              {t('cta.cancelAnytime')}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

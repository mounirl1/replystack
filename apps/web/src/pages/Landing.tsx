import { useState, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import {
  Sparkles,
  ArrowRight,
  Star,
  MessageSquare,
  Zap,
  Globe2,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Chrome,
  Users,
  BarChart3,
  Layers,
  Bot,
  Languages,
  X,
} from 'lucide-react';
import { ExtensionCTA } from '@/components/ui/ExtensionCTA';
import {
  getSectorsForLocation,
  getSectorBasePath,
  extractLanguageCode,
} from '@/config/sectors';

// Platform data
const platforms = [
  { name: 'Google', icon: '⭐' },
  { name: 'TripAdvisor', icon: '🦉' },
  { name: 'Booking', icon: '🏨' },
  { name: 'Facebook', icon: '👍' },
  { name: 'Yelp', icon: '📍' },
  { name: 'Trustpilot', icon: '⭐' },
];


// Comparison data
const comparisonData = [
  { feature: "Réponses IA personnalisées", replystack: true, manual: false, others: "Limité" },
  { feature: "Profils de réponse", replystack: true, manual: false, others: false },
  { feature: "Toutes plateformes supportées", replystack: true, manual: true, others: "Partiel" },
  { feature: "Extension navigateur", replystack: true, manual: false, others: "Rare" },
  { feature: "Multi-langues automatique", replystack: true, manual: false, others: "Limité" },
  { feature: "Prix abordable", replystack: true, manual: true, others: false },
];

export function Landing(): ReactElement {
  const { t, i18n } = useTranslation('landing');
  const { t: tc } = useTranslation('common');

  // Get current language for sector links
  const currentLang = extractLanguageCode(i18n.language);
  const sectorBasePath = getSectorBasePath(currentLang);
  const landingSectors = getSectorsForLocation('landing', currentLang);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  return (
    <div className="bg-white">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>ReplyStack - Répondez aux avis clients 10x plus vite avec l'IA</title>
        <meta name="description" content="Générez des réponses professionnelles et personnalisées aux avis clients en quelques secondes. Extension Chrome/Firefox pour Google, TripAdvisor, Booking et plus." />
        <meta name="keywords" content="réponse avis clients, IA, intelligence artificielle, Google Business, TripAdvisor, Booking, e-réputation, gestion avis" />

        {/* Open Graph */}
        <meta property="og:title" content="ReplyStack - Réponses aux avis clients propulsées par l'IA" />
        <meta property="og:description" content="Générez des réponses professionnelles et personnalisées aux avis clients en quelques secondes." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://replystack.io" />
        <meta property="og:image" content="https://replystack.io/og-image.png" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ReplyStack - Réponses aux avis clients propulsées par l'IA" />
        <meta name="twitter:description" content="Générez des réponses personnalisées aux avis clients en quelques secondes." />

        {/* Canonical */}
        <link rel="canonical" href="https://replystack.io" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "ReplyStack",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web, Chrome, Firefox",
            "description": "AI-powered review response platform for businesses",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "EUR"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "ratingCount": "2500"
            }
          })}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 via-white to-white -z-10" />

        {/* Floating decorations */}
        <div className="absolute top-12 left-[10%] w-16 h-16 bg-emerald-100 rounded-2xl float-slow opacity-60" />
        <div className="absolute top-32 right-[15%] w-12 h-12 bg-teal-100 rounded-full float-medium opacity-60" />
        <div className="absolute bottom-40 left-[20%] w-10 h-10 bg-emerald-200 rounded-xl float-fast opacity-40" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
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
              <br />
              {t('hero.titleEnd')}
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto animate-fade-in-up leading-relaxed" style={{ animationDelay: '0.1s' }}>
              {t('hero.subtitle')}
            </p>

            {/* CTAs */}
            <div className="flex flex-col items-center gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <ExtensionCTA variant="hero" />
              <Link to="/pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors flex items-center gap-1">
                {t('hero.viewPricing')}
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-500 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <span className="flex items-center gap-1">
                <CheckCircle2 size={16} className="text-emerald-500" />
                {t('hero.noCreditCard')}
              </span>
              <span className="hidden sm:block">•</span>
              <span className="flex items-center gap-1">
                <Chrome size={16} className="text-emerald-500" />
                Extension Chrome & Firefox
              </span>
            </div>

            {/* Demo Window */}
            <div className="mt-16 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="demo-window max-w-4xl mx-auto">
                <div className="demo-window-header">
                  <div className="demo-window-dot bg-red-400" />
                  <div className="demo-window-dot bg-yellow-400" />
                  <div className="demo-window-dot bg-green-400" />
                  <span className="ml-3 text-sm text-gray-500">ReplyStack Extension</span>
                </div>
                <div className="p-6 lg:p-8">
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Review */}
                    <div className="bg-gray-50 rounded-2xl p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                          MD
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{t('demo.reviewAuthor')}</p>
                          <div className="flex gap-0.5 text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={12} fill="currentColor" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        "{t('demo.reviewContent')}"
                      </p>
                    </div>

                    {/* AI Response */}
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                          <Sparkles size={14} className="text-white" />
                        </div>
                        <span className="text-sm font-semibold text-emerald-700">{t('demo.aiReplyLabel')}</span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        "{t('demo.aiReply')}"
                      </p>
                      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-emerald-100">
                        <span className="text-xs text-emerald-600 flex items-center gap-1">
                          <Zap size={12} />
                          {t('demo.generatedIn', { time: '1.2' })}
                        </span>
                        <button className="text-xs text-emerald-600 font-medium flex items-center gap-1 hover:text-emerald-700">
                          <CheckCircle2 size={12} />
                          {tc('buttons.copy')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section className="py-12 border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 mb-6">
            {t('hero.platforms')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {platforms.map((platform) => (
              <div key={platform.name} className="platform-logo">
                <span>{platform.icon}</span>
                <span>{platform.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left - Text */}
            <div>
              <span className="section-badge">
                <TrendingUp size={14} />
                {t('stats.badge')}
              </span>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-6">
                {t('stats.title')} <span className="text-gradient">{t('stats.titleHighlight')}</span>{' '}
                {t('stats.titleEnd')}
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                {t('stats.description')}
              </p>
              <Link to="/register" className="btn-primary">
                {tc('nav.getStarted')}
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Right - Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="stat-card">
                <div className="text-4xl lg:text-5xl font-extrabold text-gradient mb-2">50K+</div>
                <p className="text-gray-600">{t('stats.replies')}</p>
              </div>
              <div className="stat-card">
                <div className="text-4xl lg:text-5xl font-extrabold text-gradient mb-2">78%</div>
                <p className="text-gray-600">{t('stats.timeSaved')}</p>
              </div>
              <div className="stat-card">
                <div className="text-4xl lg:text-5xl font-extrabold text-gradient mb-2">2.5K+</div>
                <p className="text-gray-600">{t('stats.businesses')}</p>
              </div>
              <div className="stat-card">
                <div className="text-4xl lg:text-5xl font-extrabold text-gradient mb-2">4.9</div>
                <div className="flex gap-0.5 text-amber-400 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
                <p className="text-gray-600">{t('stats.rating')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-28 bg-gradient-to-b from-gray-50 to-white scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="section-badge">
              <Sparkles size={14} />
              {t('allFeatures.badge')}
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">
              {t('allFeatures.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('allFeatures.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Bot, title: t('features.aiPowered.title'), description: t('features.aiPowered.description'), color: 'from-emerald-500 to-teal-500' },
              { icon: Globe2, title: t('features.multiPlatform.title'), description: t('features.multiPlatform.description'), color: 'from-blue-500 to-cyan-500' },
              { icon: Users, title: t('features.personalizedProfiles.title'), description: t('features.personalizedProfiles.description'), color: 'from-violet-500 to-purple-500' },
              { icon: Languages, title: t('features.multiLanguage.title'), description: t('features.multiLanguage.description'), color: 'from-pink-500 to-rose-500' },
              { icon: Chrome, title: t('features.browserExtension.title'), description: t('features.browserExtension.description'), color: 'from-amber-500 to-orange-500' },
              { icon: BarChart3, title: t('features.analytics.title'), description: t('features.analytics.description'), color: 'from-indigo-500 to-blue-500' },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="feature-card">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 lg:py-28 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="section-badge">
              <Zap size={14} />
              {t('howItWorks.badge')}
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">
              {t('howItWorks.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('howItWorks.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {(t('howItWorks.steps', { returnObjects: true }) as Array<{ title: string; description: string; icon: string }>).map((step, index) => (
              <div key={index} className="relative">
                <div className="feature-card h-full text-center">
                  <span className="text-6xl mb-4 block">{step.icon}</span>
                  <div className="text-sm font-bold text-emerald-600 mb-2">{t('howItWorks.step')} {String(index + 1).padStart(2, '0')}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ChevronRight size={24} className="text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/register" className="btn-primary text-lg px-8 py-4">
              {t('howItWorks.cta')}
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="section-badge">
              <Layers size={14} />
              {t('comparison.badge')}
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">
              {t('comparison.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('comparison.subtitle')}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">{t('comparison.feature')}</th>
                  <th className="text-center py-4 px-4">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-full font-semibold">
                      <Sparkles size={16} />
                      {t('comparison.replystack')}
                    </div>
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-600">{t('comparison.manual')}</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-600">{t('comparison.others')}</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-4 px-4 text-gray-700">{row.feature}</td>
                    <td className="text-center py-4 px-4">
                      {row.replystack === true ? (
                        <CheckCircle2 className="inline text-emerald-500" size={24} />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="text-center py-4 px-4">
                      {row.manual === true ? (
                        <CheckCircle2 className="inline text-gray-400" size={24} />
                      ) : (
                        <X className="inline text-gray-300" size={24} />
                      )}
                    </td>
                    <td className="text-center py-4 px-4">
                      {row.others === true ? (
                        <CheckCircle2 className="inline text-gray-400" size={24} />
                      ) : row.others === false ? (
                        <X className="inline text-gray-300" size={24} />
                      ) : (
                        <span className="text-sm text-gray-500">{row.others}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section id="industries" className="py-20 lg:py-28 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="section-badge">
              <Globe2 size={14} />
              {t('industries.badge')}
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">
              {t('industries.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('industries.subtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {landingSectors.map((sector) => (
              <Link
                key={sector.slug}
                to={`${sectorBasePath}/${sector.slug}`}
                className="feature-card flex items-center gap-4 group"
              >
                <span className="text-4xl">{sector.emoji}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                    {sector.name}
                  </h3>
                  <p className="text-sm text-gray-500">{t('industries.personalizedResponses')}</p>
                </div>
                <ArrowRight size={18} className="text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="section-badge">
              <Star size={14} />
              {t('testimonialsSection.badge')}
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">
              {t('testimonials.title')}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {(t('testimonialsSection.items', { returnObjects: true }) as Array<{ quote: string; author: string; role: string }>).map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="flex gap-1 mb-4 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold">
                    {testimonial.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 lg:py-28 scroll-mt-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="section-badge">
              <MessageSquare size={14} />
              {t('faq.badge')}
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">
              {t('faq.title')}
            </h2>
          </div>

          <div className="space-y-4">
            {(t('faq.items', { returnObjects: true }) as Array<{ question: string; answer: string }>).map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-4">{item.question}</span>
                  <ChevronDown
                    size={20}
                    className={`text-gray-500 transition-transform flex-shrink-0 ${openFaqIndex === index ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaqIndex === index && (
                  <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-4xl p-10 md:p-16 text-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

            <div className="relative">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">
                {t('cta.title')}
              </h2>
              <p className="text-xl text-emerald-100 mb-10 max-w-xl mx-auto">
                {t('cta.subtitle')}
              </p>
              <ExtensionCTA variant="default" className="justify-center" />
              <p className="mt-6 text-sm text-emerald-200">
                {t('hero.noCreditCard')} • {tc('extension.freeForever')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

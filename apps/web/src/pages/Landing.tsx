import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  Globe2,
  Palette,
  Languages,
  Chrome,
  BarChart3,
  Building2,
  MessageSquare,
  Zap,
  Shield,
  ArrowRight,
  Check,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LanguageSelector } from '@/components/ui/LanguageSelector';

export function Landing() {
  const { t, i18n } = useTranslation('landing');
  const { t: tc } = useTranslation('common');

  // Get base API URL for legal pages (strip /api suffix)
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const legalBaseUrl = apiUrl.replace(/\/api\/?$/, '');
  const currentLang = i18n.language?.substring(0, 2) || 'en';

  const features = [
    {
      icon: <Sparkles size={24} />,
      titleKey: 'features.aiPowered.title',
      descriptionKey: 'features.aiPowered.description',
    },
    {
      icon: <Globe2 size={24} />,
      titleKey: 'features.multiPlatform.title',
      descriptionKey: 'features.multiPlatform.description',
    },
    {
      icon: <Palette size={24} />,
      titleKey: 'features.personalizedProfiles.title',
      descriptionKey: 'features.personalizedProfiles.description',
    },
    {
      icon: <Languages size={24} />,
      titleKey: 'features.multiLanguage.title',
      descriptionKey: 'features.multiLanguage.description',
    },
    {
      icon: <Chrome size={24} />,
      titleKey: 'features.browserExtension.title',
      descriptionKey: 'features.browserExtension.description',
    },
    {
      icon: <BarChart3 size={24} />,
      titleKey: 'features.analytics.title',
      descriptionKey: 'features.analytics.description',
    },
  ];

  const profileFeatures = [
    {
      icon: <Building2 size={20} />,
      titleKey: 'profile.sectorSpecific.title',
      descriptionKey: 'profile.sectorSpecific.description',
    },
    {
      icon: <MessageSquare size={20} />,
      titleKey: 'profile.customTone.title',
      descriptionKey: 'profile.customTone.description',
    },
    {
      icon: <Zap size={20} />,
      titleKey: 'profile.smartLength.title',
      descriptionKey: 'profile.smartLength.description',
    },
    {
      icon: <Shield size={20} />,
      titleKey: 'profile.negativeStrategy.title',
      descriptionKey: 'profile.negativeStrategy.description',
    },
  ];

  const testimonials = [
    {
      quoteKey: 'testimonials.quote1',
      authorKey: 'testimonials.author1',
      roleKey: 'testimonials.role1',
      rating: 5,
    },
    {
      quoteKey: 'testimonials.quote2',
      authorKey: 'testimonials.author2',
      roleKey: 'testimonials.role2',
      rating: 5,
    },
    {
      quoteKey: 'testimonials.quote3',
      authorKey: 'testimonials.author3',
      roleKey: 'testimonials.role3',
      rating: 5,
    },
  ];

  return (
    <div className="bg-light-bg dark:bg-dark-bg">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 text-primary-500 text-sm font-medium mb-6">
              <Sparkles size={16} />
              <span>{t('hero.badge')}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-dark-primary dark:text-text-primary tracking-tight">
              {t('hero.title')}
              <span className="text-primary-500"> {t('hero.titleHighlight')}</span>
              <br />
              {t('hero.titleEnd')}
            </h1>
            <p className="mt-6 text-xl text-text-dark-secondary dark:text-text-secondary max-w-2xl mx-auto">
              {t('hero.subtitle')}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto" rightIcon={<ArrowRight size={18} />}>
                  {t('hero.cta')}
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  {t('hero.viewPricing')}
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-text-tertiary">
              {t('hero.noCreditCard')}
            </p>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-primary-500/20 to-primary-500/5 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 bg-light-surface dark:bg-dark-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-light-bg dark:bg-dark-bg rounded-2xl shadow-xl overflow-hidden border border-light-border dark:border-dark-border">
            <div className="grid lg:grid-cols-2">
              <div className="p-8 lg:p-12">
                <h2 className="text-2xl font-bold text-text-dark-primary dark:text-text-primary mb-4">
                  {t('demo.title')}
                </h2>
                <div className="bg-light-hover dark:bg-dark-hover rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-text-dark-primary dark:text-text-primary">{t('demo.reviewAuthor')}</span>
                    <div className="flex items-center text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                  <p className="text-text-dark-secondary dark:text-text-secondary text-sm">
                    "{t('demo.reviewContent')}"
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm mb-4">
                  <span className="px-2.5 py-1 bg-primary-500/10 text-primary-500 rounded-lg font-medium">{t('demo.tone')}</span>
                  <span className="px-2.5 py-1 bg-light-hover dark:bg-dark-hover text-text-dark-secondary dark:text-text-secondary rounded-lg">{t('demo.language')}</span>
                  <span className="px-2.5 py-1 bg-light-hover dark:bg-dark-hover text-text-dark-secondary dark:text-text-secondary rounded-lg">{t('demo.sector')}</span>
                </div>
              </div>
              <div className="bg-primary-500/10 dark:bg-primary-500/5 p-8 lg:p-12 border-l border-light-border dark:border-dark-border">
                <h3 className="text-sm font-medium text-primary-500 mb-2 flex items-center gap-2">
                  <Sparkles size={16} />
                  {t('demo.aiReplyLabel')}
                </h3>
                <p className="text-text-dark-primary dark:text-text-primary leading-relaxed whitespace-pre-line">
                  "{t('demo.aiReply')}"
                </p>
                <div className="mt-4 flex items-center gap-4 text-sm text-primary-500">
                  <span className="flex items-center gap-1">
                    <Zap size={14} />
                    {t('demo.generatedIn', { time: '1.2' })}
                  </span>
                  <span>{t('demo.words', { count: 89 })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All Features Included Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary-500/10 to-primary-600/10 dark:from-primary-500/20 dark:to-primary-600/20 border border-primary-500/20 rounded-2xl p-8 md:p-10">
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-2 bg-primary-500 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-4">
                <Sparkles size={14} />
                {t('allFeatures.badge')}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-text-dark-primary dark:text-text-primary">
                {t('allFeatures.title')}
              </h2>
              <p className="mt-2 text-text-dark-secondary dark:text-text-secondary max-w-2xl mx-auto">
                {t('allFeatures.subtitle')}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 text-primary-500">
                  <Palette size={24} />
                </div>
                <h3 className="font-semibold text-text-dark-primary dark:text-text-primary">{t('allFeatures.tones.title')}</h3>
                <p className="text-sm text-text-dark-secondary dark:text-text-secondary">{t('allFeatures.tones.description')}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 text-primary-500">
                  <MessageSquare size={24} />
                </div>
                <h3 className="font-semibold text-text-dark-primary dark:text-text-primary">{t('allFeatures.customPrompts.title')}</h3>
                <p className="text-sm text-text-dark-secondary dark:text-text-secondary">{t('allFeatures.customPrompts.description')}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 text-primary-500">
                  <Building2 size={24} />
                </div>
                <h3 className="font-semibold text-text-dark-primary dark:text-text-primary">{t('allFeatures.responseProfiles.title')}</h3>
                <p className="text-sm text-text-dark-secondary dark:text-text-secondary">{t('allFeatures.responseProfiles.description')}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 text-primary-500">
                  <Globe2 size={24} />
                </div>
                <h3 className="font-semibold text-text-dark-primary dark:text-text-primary">{t('allFeatures.allPlatforms.title')}</h3>
                <p className="text-sm text-text-dark-secondary dark:text-text-secondary">{t('allFeatures.allPlatforms.description')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Response Profile Section - NEW */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 text-primary-500 text-sm font-medium mb-4">
                <Palette size={14} />
                {t('profile.badge')}
              </div>
              <h2 className="text-3xl font-bold text-text-dark-primary dark:text-text-primary mb-4">
                {t('profile.title')}
              </h2>
              <p className="text-lg text-text-dark-secondary dark:text-text-secondary mb-8">
                {t('profile.subtitle')}
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {profileFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-500 flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-text-dark-primary dark:text-text-primary">
                        {t(feature.titleKey)}
                      </h4>
                      <p className="text-sm text-text-dark-secondary dark:text-text-secondary">
                        {t(feature.descriptionKey)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-light-surface dark:bg-dark-surface rounded-2xl border border-light-border dark:border-dark-border p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-text-dark-primary dark:text-text-primary">{t('profile.configTitle')}</p>
                    <p className="text-sm text-text-tertiary">{t('profile.step', { current: 2, total: 7 })}</p>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-text-dark-primary dark:text-text-primary mb-4">
                  {t('profile.toneQuestion')}
                </h3>

                <div className="space-y-3">
                  {[t('profile.warm'), t('profile.professional'), t('profile.casual')].map((tone, i) => (
                    <div
                      key={tone}
                      className={`
                        p-4 rounded-xl border-2 transition-all
                        ${i === 0
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-light-border dark:border-dark-border'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`
                            w-5 h-5 rounded-full border-2 flex items-center justify-center
                            ${i === 0
                              ? 'border-primary-500 bg-primary-500'
                              : 'border-light-border dark:border-dark-border'
                            }
                          `}
                        >
                          {i === 0 && <Check size={12} className="text-white" />}
                        </div>
                        <span className={`font-medium ${i === 0 ? 'text-primary-500' : 'text-text-dark-primary dark:text-text-primary'}`}>
                          {tone}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end mt-6">
                  <Button rightIcon={<ArrowRight size={16} />}>
                    {tc('buttons.next')}
                  </Button>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary-500/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-light-surface dark:bg-dark-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-text-dark-primary dark:text-text-primary">
              {t('features.title')}
            </h2>
            <p className="mt-4 text-lg text-text-dark-secondary dark:text-text-secondary">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-light-bg dark:bg-dark-bg rounded-xl p-6 border border-light-border dark:border-dark-border hover:shadow-lg hover:border-primary-500/50 transition-all duration-150"
              >
                <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center text-primary-500 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-text-dark-primary dark:text-text-primary mb-2">
                  {t(feature.titleKey)}
                </h3>
                <p className="text-text-dark-secondary dark:text-text-secondary">
                  {t(feature.descriptionKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-text-dark-primary dark:text-text-primary">
              {t('testimonials.title')}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-light-surface dark:bg-dark-surface rounded-xl p-6 border border-light-border dark:border-dark-border"
              >
                <div className="text-yellow-500 mb-4 flex">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-text-dark-secondary dark:text-text-secondary mb-4">"{t(testimonial.quoteKey)}"</p>
                <div>
                  <p className="font-medium text-text-dark-primary dark:text-text-primary">{t(testimonial.authorKey)}</p>
                  <p className="text-sm text-text-tertiary">{t(testimonial.roleKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              {t('cta.title')}
            </h2>
            <p className="text-lg text-primary-100 mb-8 max-w-xl mx-auto">
              {t('cta.subtitle')}
            </p>
            <Link to="/register">
              <Button
                size="lg"
                className="bg-white text-primary-600 hover:bg-primary-50"
                rightIcon={<ArrowRight size={18} />}
              >
                {t('cta.button')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-bg dark:bg-dark-surface text-white py-12 border-t border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/icon.png" alt="ReplyStack" className="w-8 h-8" />
                <span className="text-xl font-bold">ReplyStack</span>
              </div>
              <p className="text-text-secondary text-sm">
                {tc('footer.tagline')}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{tc('footer.product')}</h4>
              <ul className="space-y-2 text-text-secondary text-sm">
                <li><Link to="/pricing" className="hover:text-white transition-colors">{tc('nav.pricing')}</Link></li>
                <li><a href="#features" className="hover:text-white transition-colors">{tc('footer.features')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{tc('footer.extension')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{tc('footer.company')}</h4>
              <ul className="space-y-2 text-text-secondary text-sm">
                <li><a href="#" className="hover:text-white transition-colors">{tc('footer.about')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{tc('footer.blog')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{tc('footer.contact')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{tc('footer.legal')}</h4>
              <ul className="space-y-2 text-text-secondary text-sm">
                <li><a href={`${legalBaseUrl}/legal?lang=${currentLang}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{tc('footer.legalNotice')}</a></li>
                <li><a href={`${legalBaseUrl}/privacy?lang=${currentLang}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{tc('footer.privacy')}</a></li>
                <li><a href={`${legalBaseUrl}/terms?lang=${currentLang}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{tc('footer.terms')}</a></li>
                <li><a href={`${legalBaseUrl}/sales?lang=${currentLang}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{tc('footer.sales')}</a></li>
                <li><a href={`${legalBaseUrl}/cookies?lang=${currentLang}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{tc('footer.cookies')}</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-dark-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-text-secondary text-sm">
            <p>&copy; {new Date().getFullYear()} ReplyStack. {tc('footer.copyright')}</p>
            <LanguageSelector variant="minimal" />
          </div>
        </div>
      </footer>
    </div>
  );
}

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import enCommon from './locales/en/common.json';
import enLanding from './locales/en/landing.json';
import enPricing from './locales/en/pricing.json';
import enAuth from './locales/en/auth.json';
import enDashboard from './locales/en/dashboard.json';
import enSettings from './locales/en/settings.json';
import enOnboarding from './locales/en/onboarding.json';
import enIndustries from './locales/en/industries.json';
import enBlog from './locales/en/blog.json';

import frCommon from './locales/fr/common.json';
import frLanding from './locales/fr/landing.json';
import frPricing from './locales/fr/pricing.json';
import frAuth from './locales/fr/auth.json';
import frDashboard from './locales/fr/dashboard.json';
import frSettings from './locales/fr/settings.json';
import frOnboarding from './locales/fr/onboarding.json';
import frIndustries from './locales/fr/industries.json';
import frBlog from './locales/fr/blog.json';

import esCommon from './locales/es/common.json';
import esLanding from './locales/es/landing.json';
import esPricing from './locales/es/pricing.json';
import esAuth from './locales/es/auth.json';
import esDashboard from './locales/es/dashboard.json';
import esSettings from './locales/es/settings.json';
import esOnboarding from './locales/es/onboarding.json';
import esBlog from './locales/es/blog.json';

import itCommon from './locales/it/common.json';
import itLanding from './locales/it/landing.json';
import itPricing from './locales/it/pricing.json';
import itAuth from './locales/it/auth.json';
import itDashboard from './locales/it/dashboard.json';
import itSettings from './locales/it/settings.json';
import itOnboarding from './locales/it/onboarding.json';

import ptCommon from './locales/pt/common.json';
import ptLanding from './locales/pt/landing.json';
import ptPricing from './locales/pt/pricing.json';
import ptAuth from './locales/pt/auth.json';
import ptDashboard from './locales/pt/dashboard.json';
import ptSettings from './locales/pt/settings.json';
import ptOnboarding from './locales/pt/onboarding.json';
import ptBlog from './locales/pt/blog.json';

export const supportedLanguages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number]['code'];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        landing: enLanding,
        pricing: enPricing,
        auth: enAuth,
        dashboard: enDashboard,
        settings: enSettings,
        onboarding: enOnboarding,
        industries: enIndustries,
        blog: enBlog,
      },
      fr: {
        common: frCommon,
        landing: frLanding,
        pricing: frPricing,
        auth: frAuth,
        dashboard: frDashboard,
        settings: frSettings,
        onboarding: frOnboarding,
        industries: frIndustries,
        blog: frBlog,
      },
      es: {
        common: esCommon,
        landing: esLanding,
        pricing: esPricing,
        auth: esAuth,
        dashboard: esDashboard,
        settings: esSettings,
        onboarding: esOnboarding,
        blog: esBlog,
      },
      it: {
        common: itCommon,
        landing: itLanding,
        pricing: itPricing,
        auth: itAuth,
        dashboard: itDashboard,
        settings: itSettings,
        onboarding: itOnboarding,
      },
      pt: {
        common: ptCommon,
        landing: ptLanding,
        pricing: ptPricing,
        auth: ptAuth,
        dashboard: ptDashboard,
        settings: ptSettings,
        onboarding: ptOnboarding,
        blog: ptBlog,
      },
    },
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'landing', 'pricing', 'auth', 'dashboard', 'settings', 'onboarding', 'industries', 'blog'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'replystack-language',
    },
  });

export default i18n;

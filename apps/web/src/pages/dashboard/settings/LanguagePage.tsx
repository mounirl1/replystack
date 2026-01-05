import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
];

export function LanguagePage() {
  const { t, i18n } = useTranslation('settings');

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-light-border dark:border-dark-border">
          <h2 className="text-lg font-semibold text-text-dark-primary dark:text-text-primary">
            {t('language.title')}
          </h2>
          <p className="text-sm text-text-tertiary mt-1">
            {t('language.description')}
          </p>
        </div>

        <div className="p-2">
          {languages.map((lang) => {
            const isActive = i18n.language === lang.code;

            return (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl
                  transition-all duration-150
                  ${
                    isActive
                      ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                      : 'text-text-dark-secondary dark:text-text-secondary hover:bg-light-hover dark:hover:bg-dark-hover'
                  }
                `}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="flex-1 text-left font-medium">{lang.name}</span>
                {isActive && (
                  <Check className="w-5 h-5 text-primary-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

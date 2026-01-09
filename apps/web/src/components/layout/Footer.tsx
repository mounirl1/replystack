import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '@/components/ui/LanguageSelector';

// Industries for footer
const industries = [
  { name: 'Restaurants', slug: 'restaurants' },
  { name: 'Hôtels', slug: 'hotels' },
  { name: 'Commerces', slug: 'commerces' },
  { name: 'Garagistes', slug: 'garagistes' },
];

export function Footer() {
  const { t, i18n } = useTranslation('common');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const legalBaseUrl = apiUrl.replace(/\/api\/?$/, '');
  const currentLang = i18n.language?.substring(0, 2) || 'en';

  return (
    <footer className="bg-gray-50 border-t border-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src="/icon.png" alt="ReplyStack" className="w-10 h-10" />
              <span className="text-xl font-bold text-gray-900">ReplyStack</span>
            </div>
            <p className="text-gray-600 mb-6 max-w-sm">
              {t('footer.tagline')}
            </p>
            <LanguageSelector variant="minimal" />
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">{t('footer.product')}</h4>
            <ul className="space-y-3 text-gray-600">
              <li>
                <Link to="/pricing" className="hover:text-emerald-600 transition-colors">
                  {t('nav.pricing')}
                </Link>
              </li>
              <li>
                <a href="/#features" className="hover:text-emerald-600 transition-colors">
                  {t('footer.features')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-600 transition-colors">
                  {t('footer.extension')}
                </a>
              </li>
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Solutions</h4>
            <ul className="space-y-3 text-gray-600">
              {industries.map((industry) => (
                <li key={industry.slug}>
                  <Link
                    to={`/solutions/${industry.slug}`}
                    className="hover:text-emerald-600 transition-colors"
                  >
                    {industry.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">{t('footer.legal')}</h4>
            <ul className="space-y-3 text-gray-600">
              <li>
                <a
                  href={`${legalBaseUrl}/privacy?lang=${currentLang}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-600 transition-colors"
                >
                  {t('footer.privacy')}
                </a>
              </li>
              <li>
                <a
                  href={`${legalBaseUrl}/terms?lang=${currentLang}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-600 transition-colors"
                >
                  {t('footer.terms')}
                </a>
              </li>
              <li>
                <a
                  href={`${legalBaseUrl}/legal?lang=${currentLang}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-600 transition-colors"
                >
                  {t('footer.legalNotice')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} ReplyStack. {t('footer.copyright')}</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-emerald-600 transition-colors">
              Twitter
            </a>
            <a href="#" className="hover:text-emerald-600 transition-colors">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

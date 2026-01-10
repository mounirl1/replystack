import { useState, useEffect, type ReactElement } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, ChevronDown, Chrome } from 'lucide-react';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { EXTENSION_URLS } from '@/config/extensions';
import {
  getSectorsForLocation,
  getSectorBasePath,
  extractLanguageCode,
} from '@/config/sectors';

export function Header(): ReactElement {
  const { t, i18n } = useTranslation('common');
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSolutionsOpen, setIsSolutionsOpen] = useState(false);

  // Get current language and sectors
  const currentLang = extractLanguageCode(i18n.language);
  const sectorBasePath = getSectorBasePath(currentLang);
  const headerSectors = getSectorsForLocation('header', currentLang);

  // Handle scroll for sticky header effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSolutionsOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
          : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/icon.png" alt="ReplyStack" className="w-8 h-8 lg:w-10 lg:h-10" />
            <span className="text-xl font-bold text-gray-900">ReplyStack</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            <a
              href="/#features"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors rounded-lg hover:bg-gray-50"
            >
              Fonctionnalités
            </a>

            {/* Solutions Mega Menu */}
            <div
              className="relative"
              onMouseEnter={() => setIsSolutionsOpen(true)}
              onMouseLeave={() => setIsSolutionsOpen(false)}
            >
              <button
                className="flex items-center gap-1 px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors rounded-lg hover:bg-gray-50"
              >
                Solutions
                <ChevronDown size={16} className={`transition-transform ${isSolutionsOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Mega Menu Dropdown */}
              {isSolutionsOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2">
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 w-[500px]">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                      {currentLang === 'fr' ? 'Solutions par métier' : currentLang === 'es' ? 'Soluciones por sector' : currentLang === 'pt' ? 'Soluções por setor' : 'Solutions by industry'}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {headerSectors.map((sector) => {
                        const Icon = sector.icon;
                        return (
                          <Link
                            key={sector.slug}
                            to={`${sectorBasePath}/${sector.slug}`}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                          >
                            <div className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center ${sector.color} group-hover:scale-110 transition-transform`}>
                              <Icon size={20} />
                            </div>
                            <span className="font-medium text-gray-700 group-hover:text-gray-900">
                              {sector.name}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/pricing"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors rounded-lg hover:bg-gray-50"
            >
              {t('nav.pricing')}
            </Link>
            <Link
              to="/blog"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors rounded-lg hover:bg-gray-50"
            >
              Blog
            </Link>
          </div>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <LanguageSelector variant="minimal" />

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  {t('nav.dashboard')}
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  {t('nav.signIn')}
                </Link>
                <a
                  href={EXTENSION_URLS.chrome}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold px-5 py-2.5 rounded-full shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all hover:scale-[1.02]"
                >
                  <Chrome size={16} />
                  {t('extension.install')}
                </a>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 py-4 -mx-4 px-4">
            <div className="flex flex-col gap-1">
              <a
                href="/#features"
                className="px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium rounded-lg"
              >
                Fonctionnalités
              </a>

              {/* Mobile Solutions */}
              <button
                onClick={() => setIsSolutionsOpen(!isSolutionsOpen)}
                className="flex items-center justify-between px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium rounded-lg w-full text-left"
              >
                Solutions
                <ChevronDown size={16} className={`transition-transform ${isSolutionsOpen ? 'rotate-180' : ''}`} />
              </button>

              {isSolutionsOpen && (
                <div className="pl-4 space-y-1">
                  {headerSectors.map((sector) => {
                    const Icon = sector.icon;
                    return (
                      <Link
                        key={sector.slug}
                        to={`${sectorBasePath}/${sector.slug}`}
                        className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                      >
                        <Icon size={18} className={sector.color} />
                        <span>{sector.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}

              <Link
                to="/pricing"
                className="px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium rounded-lg"
              >
                {t('nav.pricing')}
              </Link>
              <Link
                to="/blog"
                className="px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium rounded-lg"
              >
                Blog
              </Link>

              <div className="border-t border-gray-100 pt-4 mt-2 space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium rounded-lg"
                    >
                      {t('nav.dashboard')}
                    </Link>
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium rounded-lg"
                    >
                      {t('nav.logout')}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium rounded-lg"
                    >
                      {t('nav.signIn')}
                    </Link>
                    <a
                      href={EXTENSION_URLS.chrome}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold px-5 py-3 rounded-full"
                    >
                      <Chrome size={16} />
                      {t('extension.install')}
                    </a>
                  </>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4 mt-2">
                <LanguageSelector variant="minimal" />
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

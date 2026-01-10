import { Outlet, Link } from 'react-router-dom';
import { Footer } from './Footer';
import { LanguageSelector } from '@/components/ui/LanguageSelector';

/**
 * Layout for sector landing pages
 * - Minimal header with logo only (no navigation)
 * - Footer included
 * - Designed for conversion-focused pages
 */
export function LandingPageLayout() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Minimal header - logo only */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <img src="/icon.png" alt="ReplyStack" className="w-8 h-8" />
              <span className="text-xl font-bold text-gray-900">ReplyStack</span>
            </Link>
            <LanguageSelector variant="minimal" />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

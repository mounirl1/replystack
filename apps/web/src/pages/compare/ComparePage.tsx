import { useParams, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MDXProvider } from '@mdx-js/react';
import { Helmet } from 'react-helmet-async';
import { Calendar, Clock, Globe, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { mdxComponents } from '@/components/blog/MDXComponents';
import { TableOfContents, useTableOfContents } from '@/components/blog/TableOfContents';
import { ShareButtons } from '@/components/blog/ShareButtons';
import { ExtensionCTA } from '@/components/ui/ExtensionCTA';

// Import comparison articles - English
import ReplyStackVsBirdeyeEN from '@/content/compare/replystack-vs-birdeye/index.mdx';
import ReplyStackVsPodiumEN from '@/content/compare/replystack-vs-podium/index.mdx';
import ReplyStackVsTalkbackAIEN from '@/content/compare/replystack-vs-talkbackai/index.mdx';
import ReplyStackVsNiceJobEN from '@/content/compare/replystack-vs-nicejob/index.mdx';
// Import comparison articles - French
import ReplyStackVsGuestSuiteFR from '@/content/compare/replystack-vs-guest-suite/index.mdx';
import ReplyStackVsSoLikeFR from '@/content/compare/replystack-vs-solike/index.mdx';
import ReplyStackVsCustplaceFR from '@/content/compare/replystack-vs-custplace/index.mdx';
import ReplyStackVsBirdeyeFR from '@/content/compare/replystack-vs-birdeye/index.fr.mdx';
// Import comparison articles - Spanish
import ReplyStackVsBirdeyeES from '@/content/compare/replystack-vs-birdeye/index.es.mdx';
import ReplyStackVsPodiumES from '@/content/compare/replystack-vs-podium/index.es.mdx';
import ReplyStackVsReviES from '@/content/compare/replystack-vs-revi/index.es.mdx';
// Import comparison articles - Portuguese
import ReplyStackVsBirdeyePT from '@/content/compare/replystack-vs-birdeye/index.pt.mdx';
import ReplyStackVsPodiumPT from '@/content/compare/replystack-vs-podium/index.pt.mdx';

// Hardcoded article data (will be dynamic later)
const articles: Record<string, {
  component: React.ComponentType;
  meta: {
    title: string;
    metaTitle: string;
    metaDescription: string;
    competitor: string;
    date: string;
    readingTime: number;
    language: string;
    availableLanguages: string[];
  };
}> = {
  'en:replystack-vs-birdeye': {
    component: ReplyStackVsBirdeyeEN,
    meta: {
      title: 'ReplyStack vs Birdeye: A Practical Comparison for Business Owners',
      metaTitle: 'ReplyStack vs Birdeye: A Practical Comparison for Business Owners',
      metaDescription: 'Birdeye starts at $299/month. Is it the right choice? We tested both platforms. Here\'s our honest analysis. Free plan available.',
      competitor: 'Birdeye',
      date: '2026-01-10',
      readingTime: 10,
      language: 'en',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
    },
  },
  'en:replystack-vs-podium': {
    component: ReplyStackVsPodiumEN,
    meta: {
      title: 'ReplyStack vs Podium: Which Review Tool Fits Your Business?',
      metaTitle: 'ReplyStack vs Podium: Which Review Tool Fits Your Business?',
      metaDescription: 'Podium costs $249/month. We tested both platforms for 3 weeks. Here\'s our honest comparison for small businesses. Free plan available.',
      competitor: 'Podium',
      date: '2026-01-10',
      readingTime: 12,
      language: 'en',
      availableLanguages: ['en', 'es', 'pt'],
    },
  },
  'en:replystack-vs-talkbackai': {
    component: ReplyStackVsTalkbackAIEN,
    meta: {
      title: 'ReplyStack vs TalkbackAI: Comparing Two Chrome Extension Approaches',
      metaTitle: 'ReplyStack vs TalkbackAI: Comparing Two Chrome Extension Approaches',
      metaDescription: 'Both offer Chrome extensions for review responses. We tested both to find the key differences. See which fits your business better.',
      competitor: 'TalkbackAI',
      date: '2026-01-10',
      readingTime: 14,
      language: 'en',
      availableLanguages: ['en'],
    },
  },
  'en:replystack-vs-nicejob': {
    component: ReplyStackVsNiceJobEN,
    meta: {
      title: 'ReplyStack vs NiceJob: Review Generation vs Review Response',
      metaTitle: 'ReplyStack vs NiceJob: Review Generation vs Review Response',
      metaDescription: 'NiceJob helps collect reviews. ReplyStack helps respond to them. Which do you need? Our comparison helps you decide. Free plans available.',
      competitor: 'NiceJob',
      date: '2026-01-10',
      readingTime: 12,
      language: 'en',
      availableLanguages: ['en'],
    },
  },
  'fr:replystack-vs-guest-suite': {
    component: ReplyStackVsGuestSuiteFR,
    meta: {
      title: 'ReplyStack vs Guest Suite : Quelle Solution pour Gérer vos Avis Clients ?',
      metaTitle: 'ReplyStack vs Guest Suite : Comparatif pour les PME Françaises',
      metaDescription: 'Guest Suite est sur devis. ReplyStack démarre gratuitement. Nous avons testé les deux. Voici notre analyse pour les entreprises françaises.',
      competitor: 'Guest Suite',
      date: '2026-01-10',
      readingTime: 14,
      language: 'fr',
      availableLanguages: ['fr'],
    },
  },
  'fr:replystack-vs-solike': {
    component: ReplyStackVsSoLikeFR,
    meta: {
      title: 'ReplyStack vs SoLike : Quel Outil pour Répondre à vos Avis ?',
      metaTitle: 'ReplyStack vs SoLike : Comparatif des Solutions de Réponse aux Avis',
      metaDescription: 'SoLike à 29€/mois, spécialisé hôtellerie. ReplyStack dès 0€, multi-secteurs. Comparatif détaillé pour choisir le bon outil de réponse aux avis.',
      competitor: 'SoLike',
      date: '2026-01-10',
      readingTime: 12,
      language: 'fr',
      availableLanguages: ['fr'],
    },
  },
  'fr:replystack-vs-custplace': {
    component: ReplyStackVsCustplaceFR,
    meta: {
      title: 'ReplyStack vs Custplace : Quelle Solution de Gestion d\'Avis Choisir ?',
      metaTitle: 'ReplyStack vs Custplace : Comparatif pour la Gestion d\'Avis',
      metaDescription: 'Custplace cible les grandes marques. ReplyStack s\'adresse aux PME. Comparatif détaillé pour choisir la solution adaptée à votre entreprise.',
      competitor: 'Custplace',
      date: '2026-01-10',
      readingTime: 14,
      language: 'fr',
      availableLanguages: ['fr'],
    },
  },
  'fr:replystack-vs-birdeye': {
    component: ReplyStackVsBirdeyeFR,
    meta: {
      title: 'ReplyStack vs Birdeye : Analyse Comparative pour le Marché Français',
      metaTitle: 'ReplyStack vs Birdeye : Comparatif Complet pour les Entreprises',
      metaDescription: 'Birdeye démarre à 299€/mois. ReplyStack propose un plan gratuit. Nous avons testé les deux. Voici notre analyse objective.',
      competitor: 'Birdeye',
      date: '2026-01-10',
      readingTime: 14,
      language: 'fr',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
    },
  },
  'es:replystack-vs-birdeye': {
    component: ReplyStackVsBirdeyeES,
    meta: {
      title: 'ReplyStack vs Birdeye: ¿Cuál es la Mejor Opción para su Negocio?',
      metaTitle: 'ReplyStack vs Birdeye: Comparativa Completa para Empresas',
      metaDescription: 'Birdeye cuesta desde $299/mes. ReplyStack ofrece plan gratuito. Analizamos ambas plataformas. Descubre cuál se adapta a tu negocio.',
      competitor: 'Birdeye',
      date: '2026-01-10',
      readingTime: 14,
      language: 'es',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
    },
  },
  'es:replystack-vs-podium': {
    component: ReplyStackVsPodiumES,
    meta: {
      title: 'ReplyStack vs Podium: ¿Cuál Herramienta de Reseñas Elegir?',
      metaTitle: 'ReplyStack vs Podium: Comparativa para Elegir la Herramienta Adecuada',
      metaDescription: 'Podium cuesta $249/mes. ReplyStack ofrece plan gratuito. Comparamos ambas plataformas para ayudarle a decidir. Prueba gratis disponible.',
      competitor: 'Podium',
      date: '2026-01-10',
      readingTime: 14,
      language: 'es',
      availableLanguages: ['en', 'es', 'pt'],
    },
  },
  'es:replystack-vs-revi': {
    component: ReplyStackVsReviES,
    meta: {
      title: 'ReplyStack vs Revi: ¿Cuál Herramienta de Reseñas Elegir?',
      metaTitle: 'ReplyStack vs Revi: Comparativa de Herramientas de Reseñas',
      metaDescription: 'Revi es una solución española de gestión de reseñas. ReplyStack ofrece extensión Chrome universal. Comparamos ambas para ayudarle a elegir.',
      competitor: 'Revi',
      date: '2026-01-10',
      readingTime: 12,
      language: 'es',
      availableLanguages: ['es'],
    },
  },
  'pt:replystack-vs-birdeye': {
    component: ReplyStackVsBirdeyePT,
    meta: {
      title: 'ReplyStack vs Birdeye: Qual Ferramenta de Avaliações Escolher?',
      metaTitle: 'ReplyStack vs Birdeye: Comparativo Completo para Empresas',
      metaDescription: 'Birdeye custa a partir de $299/mês. ReplyStack oferece plano gratuito. Testamos ambas plataformas. Descubra qual é a melhor para o seu negócio.',
      competitor: 'Birdeye',
      date: '2026-01-10',
      readingTime: 14,
      language: 'pt',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
    },
  },
  'pt:replystack-vs-podium': {
    component: ReplyStackVsPodiumPT,
    meta: {
      title: 'ReplyStack vs Podium: Qual Ferramenta de Avaliações Escolher?',
      metaTitle: 'ReplyStack vs Podium: Comparativo para Escolher a Ferramenta Certa',
      metaDescription: 'Podium custa $249/mês. ReplyStack oferece plano gratuito. Comparamos ambas plataformas para ajudá-lo a decidir. Teste grátis disponível.',
      competitor: 'Podium',
      date: '2026-01-10',
      readingTime: 14,
      language: 'pt',
      availableLanguages: ['en', 'es', 'pt'],
    },
  },
};

function getLanguageFromPath(path: string): string {
  if (path.startsWith('/fr/')) return 'fr';
  if (path.startsWith('/es/')) return 'es';
  if (path.startsWith('/pt/')) return 'pt';
  return 'en';
}

function getCompareUrl(slug: string, language: string): string {
  const langPrefix = language === 'en' ? '' : `/${language}`;
  return `${langPrefix}/compare/${slug}`;
}

function formatDate(dateString: string, locale: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Custom components for comparison tables
function CompareCheck() {
  return <CheckCircle className="inline w-5 h-5 text-emerald-500" />;
}

function CompareX() {
  return <XCircle className="inline w-5 h-5 text-red-500" />;
}

function ComparePartial() {
  return <AlertCircle className="inline w-5 h-5 text-amber-500" />;
}

// Enhanced MDX components for comparison pages
const compareComponents = {
  ...mdxComponents,
  // Override table for better comparison styling
  table: ({ children, ...props }: React.ComponentPropsWithoutRef<'table'>) => (
    <div className="overflow-x-auto my-8 rounded-xl border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: React.ComponentPropsWithoutRef<'thead'>) => (
    <thead className="bg-gray-50" {...props}>
      {children}
    </thead>
  ),
  th: ({ children, ...props }: React.ComponentPropsWithoutRef<'th'>) => (
    <th
      className="px-6 py-4 text-left text-sm font-semibold text-gray-900"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }: React.ComponentPropsWithoutRef<'td'>) => (
    <td className="px-6 py-4 text-sm text-gray-600 border-t border-gray-100" {...props}>
      {children}
    </td>
  ),
  // Blockquote for testimonials
  blockquote: ({ children, ...props }: React.ComponentPropsWithoutRef<'blockquote'>) => (
    <blockquote
      className="border-l-4 border-emerald-500 pl-6 py-4 my-8 bg-emerald-50/50 rounded-r-xl"
      {...props}
    >
      <div className="italic text-gray-700">{children}</div>
    </blockquote>
  ),
  // Custom components
  CompareCheck,
  CompareX,
  ComparePartial,
};

export function ComparePage() {
  const { slug } = useParams<{ slug: string }>();
  const { i18n } = useTranslation();
  const location = useLocation();

  const language = getLanguageFromPath(location.pathname);
  const articleKey = `${language}:${slug}`;
  const article = articles[articleKey];

  // Get headings for TOC
  const headings = useTableOfContents();

  // 404 if not found
  if (!slug || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Article not found</h1>
          <Link to="/" className="text-emerald-600 hover:text-emerald-700">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  const { component: ArticleContent, meta } = article;
  const fullUrl = `https://replystack.io${getCompareUrl(slug, language)}`;
  const formattedDate = formatDate(meta.date, i18n.language);

  // Structured data for comparison article
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: meta.title,
    description: meta.metaDescription,
    datePublished: meta.date,
    author: {
      '@type': 'Organization',
      name: 'ReplyStack',
    },
    publisher: {
      '@type': 'Organization',
      name: 'ReplyStack',
      logo: {
        '@type': 'ImageObject',
        url: 'https://replystack.io/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': fullUrl,
    },
  };

  return (
    <>
      <Helmet>
        <title>{meta.metaTitle}</title>
        <meta name="description" content={meta.metaDescription} />
        <meta property="og:title" content={meta.metaTitle} />
        <meta property="og:description" content={meta.metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={fullUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={meta.metaTitle} />
        <meta name="twitter:description" content={meta.metaDescription} />
        <link rel="canonical" href={fullUrl} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <article className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <Link to="/" className="hover:text-gray-900">Home</Link>
              <span>/</span>
              <Link to={`${language === 'en' ? '' : `/${language}`}/compare`} className="hover:text-gray-900">
                Comparisons
              </Link>
              <span>/</span>
              <span className="text-gray-900">vs {meta.competitor}</span>
            </nav>

            {/* Badge */}
            <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 mb-4">
              Comparison Guide
            </span>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
              {meta.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={14} />
                <span>{meta.readingTime} min read</span>
              </div>
            </div>

            {/* Available languages */}
            {meta.availableLanguages.length > 1 && (
              <div className="flex items-center gap-2 mt-4">
                <Globe size={14} className="text-gray-400" />
                <span className="text-sm text-gray-500">Also available in:</span>
                <div className="flex gap-2">
                  {meta.availableLanguages
                    .filter((lang) => lang !== language)
                    .map((lang) => (
                      <Link
                        key={lang}
                        to={getCompareUrl(slug, lang)}
                        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        {lang.toUpperCase()}
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex gap-12">
            {/* Main content */}
            <div className="flex-1 max-w-3xl">
              <MDXProvider components={compareComponents}>
                <div className="prose prose-lg max-w-none">
                  <ArticleContent />
                </div>
              </MDXProvider>

              {/* CTA Section */}
              <div className="mt-12 p-8 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to try ReplyStack?
                </h2>
                <p className="text-gray-600 mb-6">
                  Start responding to reviews smarter and faster. Free plan includes 15 AI responses per month.
                </p>
                <ExtensionCTA variant="hero" />
              </div>

              {/* Share */}
              <div className="mt-8 pt-8 border-t border-gray-100">
                <ShareButtons url={fullUrl} title={meta.title} />
              </div>
            </div>

            {/* Sidebar - TOC */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24">
                <TableOfContents headings={headings} />

                {/* Quick CTA */}
                <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    Try ReplyStack Free
                  </p>
                  <p className="text-xs text-gray-600 mb-3">
                    15 AI responses/month, no credit card
                  </p>
                  <ExtensionCTA variant="compact" />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </article>
    </>
  );
}

export default ComparePage;

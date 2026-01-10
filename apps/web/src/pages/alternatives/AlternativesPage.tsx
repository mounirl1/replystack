import { useParams, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MDXProvider } from '@mdx-js/react';
import { Helmet } from 'react-helmet-async';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { mdxComponents } from '@/components/blog/MDXComponents';
import { TableOfContents, useTableOfContents } from '@/components/blog/TableOfContents';
import { ShareButtons } from '@/components/blog/ShareButtons';
import { ExtensionCTA } from '@/components/ui/ExtensionCTA';

// Import alternatives/hub articles - English
import BestReviewManagementSoftwareEN from '@/content/alternatives/best-review-management-software.en.mdx';
// Import alternatives/hub articles - French
import MeilleurLogicielGestionAvisFR from '@/content/alternatives/meilleur-logiciel-gestion-avis.fr.mdx';
// Import alternatives/hub articles - Spanish
import MejorSoftwareGestionResenasES from '@/content/alternatives/mejor-software-gestion-resenas.es.mdx';
// Import alternatives/hub articles - Portuguese
import MelhorSoftwareGestaoAvaliacoesPT from '@/content/alternatives/melhor-software-gestao-avaliacoes.pt.mdx';

// Hardcoded article data
const articles: Record<string, {
  component: React.ComponentType;
  meta: {
    title: string;
    metaTitle: string;
    metaDescription: string;
    keywords: string;
    date: string;
    readingTime: number;
    language: string;
  };
}> = {
  // English
  'en:best-review-management-software': {
    component: BestReviewManagementSoftwareEN,
    meta: {
      title: 'Best Review Management Software in 2026',
      metaTitle: 'Best Review Management Software in 2026: Complete Comparison Guide',
      metaDescription: 'Compare the best review management tools in 2026. Birdeye, Podium, TalkbackAI, NiceJob analyzed. Complete guide to choosing the right solution.',
      keywords: 'best review management software, review response tool, birdeye alternative, podium alternative, google review management tool',
      date: '2026-01-10',
      readingTime: 18,
      language: 'en',
    },
  },
  // French
  'fr:meilleur-logiciel-gestion-avis': {
    component: MeilleurLogicielGestionAvisFR,
    meta: {
      title: 'Meilleurs Logiciels de Gestion d\'Avis Clients en 2026',
      metaTitle: 'Meilleurs Logiciels de Gestion d\'Avis Clients en 2026 : Comparatif Complet',
      metaDescription: 'Comparatif des meilleurs outils de gestion d\'avis clients en 2026. Birdeye, Podium, Guest Suite, SoLike analysés. Guide complet pour choisir la bonne solution.',
      keywords: 'logiciel gestion avis clients, outil reponse avis google, meilleur logiciel e-reputation, alternative birdeye france, comparatif logiciel avis',
      date: '2026-01-10',
      readingTime: 18,
      language: 'fr',
    },
  },
  // Spanish
  'es:mejor-software-gestion-resenas': {
    component: MejorSoftwareGestionResenasES,
    meta: {
      title: 'Mejores Herramientas de Gestión de Reseñas en 2026',
      metaTitle: 'Mejores Herramientas de Gestión de Reseñas en 2026: Guía Comparativa',
      metaDescription: 'Comparativa de las mejores herramientas de gestión de reseñas en 2026. Birdeye, Podium, Revi analizados. Guía completa para elegir la solución correcta.',
      keywords: 'software gestion resenas, herramienta responder resenas google, mejor software reputacion online, alternativa birdeye espanol, comparativa herramientas resenas',
      date: '2026-01-10',
      readingTime: 16,
      language: 'es',
    },
  },
  // Portuguese
  'pt:melhor-software-gestao-avaliacoes': {
    component: MelhorSoftwareGestaoAvaliacoesPT,
    meta: {
      title: 'Melhores Ferramentas de Gestão de Avaliações em 2026',
      metaTitle: 'Melhores Ferramentas de Gestão de Avaliações em 2026: Guia Comparativo',
      metaDescription: 'Comparativo das melhores ferramentas de gestão de avaliações em 2026. Birdeye, Podium, Convoboss analisados. Guia completo para escolher a solução certa.',
      keywords: 'software gestao avaliacoes, ferramenta responder avaliacoes google, melhor software reputacao online, alternativa birdeye brasil, comparativo ferramentas avaliacoes',
      date: '2026-01-10',
      readingTime: 16,
      language: 'pt',
    },
  },
};

function getLanguageFromPath(path: string): string {
  if (path.startsWith('/fr/')) return 'fr';
  if (path.startsWith('/es/')) return 'es';
  if (path.startsWith('/pt/')) return 'pt';
  return 'en';
}

function getAlternativesUrl(slug: string, language: string): string {
  const langPrefix = language === 'en' ? '' : `/${language}`;
  return `${langPrefix}/alternatives/${slug}`;
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

// Enhanced MDX components for hub pages
const hubComponents = {
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
  // Blockquote for highlights
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

// Page content translations
const pageLabels = {
  en: {
    badge: 'Complete Guide',
    home: 'Home',
    alternatives: 'Alternatives',
    minRead: 'min read',
    ctaTitle: 'Ready to try ReplyStack?',
    ctaText: 'Start responding to reviews smarter and faster. Free plan includes 15 AI responses per month.',
    tryFree: 'Try ReplyStack Free',
    freeResponses: '15 AI responses/month, no credit card',
  },
  fr: {
    badge: 'Guide Complet',
    home: 'Accueil',
    alternatives: 'Alternatives',
    minRead: 'min de lecture',
    ctaTitle: 'Prêt à essayer ReplyStack ?',
    ctaText: 'Répondez à vos avis plus vite et plus intelligemment. Le plan gratuit inclut 15 réponses IA par mois.',
    tryFree: 'Essayer ReplyStack Gratuitement',
    freeResponses: '15 réponses IA/mois, sans carte bancaire',
  },
  es: {
    badge: 'Guía Completa',
    home: 'Inicio',
    alternatives: 'Alternativas',
    minRead: 'min de lectura',
    ctaTitle: '¿Listo para probar ReplyStack?',
    ctaText: 'Responde a tus reseñas más rápido e inteligente. El plan gratuito incluye 15 respuestas IA por mes.',
    tryFree: 'Probar ReplyStack Gratis',
    freeResponses: '15 respuestas IA/mes, sin tarjeta',
  },
  pt: {
    badge: 'Guia Completo',
    home: 'Início',
    alternatives: 'Alternativas',
    minRead: 'min de leitura',
    ctaTitle: 'Pronto para experimentar ReplyStack?',
    ctaText: 'Responda às suas avaliações mais rápido e de forma mais inteligente. O plano gratuito inclui 15 respostas IA por mês.',
    tryFree: 'Experimentar ReplyStack Grátis',
    freeResponses: '15 respostas IA/mês, sem cartão',
  },
};

export function AlternativesPage() {
  const { slug } = useParams<{ slug: string }>();
  const { i18n } = useTranslation();
  const location = useLocation();

  const language = getLanguageFromPath(location.pathname);
  const articleKey = `${language}:${slug}`;
  const article = articles[articleKey];
  const labels = pageLabels[language as keyof typeof pageLabels] || pageLabels.en;

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
  const fullUrl = `https://replystack.io${getAlternativesUrl(slug, language)}`;
  const formattedDate = formatDate(meta.date, i18n.language);

  // Structured data for hub article
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
        <meta name="keywords" content={meta.keywords} />
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
              <Link to="/" className="hover:text-gray-900">{labels.home}</Link>
              <span>/</span>
              <span className="text-gray-900">{labels.alternatives}</span>
            </nav>

            {/* Badge */}
            <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800 mb-4">
              {labels.badge}
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
                <span>{meta.readingTime} {labels.minRead}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex gap-12">
            {/* Main content */}
            <div className="flex-1 max-w-3xl">
              <MDXProvider components={hubComponents}>
                <div className="prose prose-lg max-w-none">
                  <ArticleContent />
                </div>
              </MDXProvider>

              {/* CTA Section */}
              <div className="mt-12 p-8 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {labels.ctaTitle}
                </h2>
                <p className="text-gray-600 mb-6">
                  {labels.ctaText}
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
                    {labels.tryFree}
                  </p>
                  <p className="text-xs text-gray-600 mb-3">
                    {labels.freeResponses}
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

export default AlternativesPage;

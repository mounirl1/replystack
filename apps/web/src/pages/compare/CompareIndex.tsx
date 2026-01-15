import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

// Comparison articles metadata - English
const comparisonsEN = [
  {
    slug: 'replystack-vs-birdeye',
    competitor: 'Birdeye',
    competitorLogo: '🦅',
    title: 'ReplyStack vs Birdeye',
    description: 'Birdeye starts at $299/month. Is it the right choice? We tested both platforms. Here\'s our honest analysis.',
    date: '2026-01-10',
    readingTime: 10,
    highlight: 'Save up to 90% vs Birdeye',
  },
  {
    slug: 'replystack-vs-podium',
    competitor: 'Podium',
    competitorLogo: '🏆',
    title: 'ReplyStack vs Podium',
    description: 'Podium costs $249/month. We tested both platforms for 3 weeks. Here\'s our honest comparison for small businesses.',
    date: '2026-01-10',
    readingTime: 12,
    highlight: 'Chrome extension vs Dashboard-only',
  },
  {
    slug: 'replystack-vs-talkbackai',
    competitor: 'TalkbackAI',
    competitorLogo: '💬',
    title: 'ReplyStack vs TalkbackAI',
    description: 'Both offer Chrome extensions for review responses. We tested both to find the key differences.',
    date: '2026-01-10',
    readingTime: 14,
    highlight: 'Extension + Dashboard vs Extension only',
  },
  {
    slug: 'replystack-vs-nicejob',
    competitor: 'NiceJob',
    competitorLogo: '⭐',
    title: 'ReplyStack vs NiceJob',
    description: 'NiceJob helps collect reviews. ReplyStack helps respond to them. Which do you need?',
    date: '2026-01-10',
    readingTime: 12,
    highlight: 'Response vs Generation focus',
  },
];

// Comparison articles metadata - French
const comparisonsFR = [
  {
    slug: 'replystack-vs-birdeye',
    competitor: 'Birdeye',
    competitorLogo: '🦅',
    title: 'ReplyStack vs Birdeye',
    description: 'Birdeye démarre à 299€/mois. ReplyStack propose un plan gratuit. Analyse comparative objective.',
    date: '2026-01-10',
    readingTime: 14,
    highlight: 'Économisez jusqu\'à 90%',
  },
  {
    slug: 'replystack-vs-guest-suite',
    competitor: 'Guest Suite',
    competitorLogo: '🏨',
    title: 'ReplyStack vs Guest Suite',
    description: 'Guest Suite est sur devis. ReplyStack démarre gratuitement. Nous avons testé les deux. Voici notre analyse.',
    date: '2026-01-10',
    readingTime: 14,
    highlight: 'Prix transparent vs Sur devis',
  },
  {
    slug: 'replystack-vs-solike',
    competitor: 'SoLike',
    competitorLogo: '💬',
    title: 'ReplyStack vs SoLike',
    description: 'SoLike à 29€/mois, spécialisé hôtellerie. ReplyStack dès 0€, multi-secteurs. Quel outil choisir ?',
    date: '2026-01-10',
    readingTime: 12,
    highlight: 'Multi-secteurs vs Hospitality',
  },
  {
    slug: 'replystack-vs-custplace',
    competitor: 'Custplace',
    competitorLogo: '🏢',
    title: 'ReplyStack vs Custplace',
    description: 'Custplace cible les grandes marques. ReplyStack s\'adresse aux PME. Quelle solution pour vous ?',
    date: '2026-01-10',
    readingTime: 14,
    highlight: 'PME vs Grandes enseignes',
  },
];

// Comparison articles metadata - Spanish
const comparisonsES = [
  {
    slug: 'replystack-vs-birdeye',
    competitor: 'Birdeye',
    competitorLogo: '🦅',
    title: 'ReplyStack vs Birdeye',
    description: 'Birdeye cuesta desde $299/mes. ReplyStack ofrece plan gratuito. Análisis comparativo objetivo.',
    date: '2026-01-10',
    readingTime: 14,
    highlight: 'Ahorre hasta 90%',
  },
  {
    slug: 'replystack-vs-podium',
    competitor: 'Podium',
    competitorLogo: '🏆',
    title: 'ReplyStack vs Podium',
    description: 'Podium cuesta $249/mes. ReplyStack ofrece plan gratuito. Comparamos ambas plataformas para ayudarle a decidir.',
    date: '2026-01-10',
    readingTime: 14,
    highlight: 'Extensión Chrome vs Dashboard',
  },
  {
    slug: 'replystack-vs-revi',
    competitor: 'Revi',
    competitorLogo: '🛒',
    title: 'ReplyStack vs Revi',
    description: 'Revi es una solución española para e-commerce. ReplyStack ofrece extensión Chrome universal. ¿Cuál elegir?',
    date: '2026-01-10',
    readingTime: 12,
    highlight: 'Reseñas externas vs E-commerce',
  },
];

// Comparison articles metadata - Portuguese
const comparisonsPT = [
  {
    slug: 'replystack-vs-birdeye',
    competitor: 'Birdeye',
    competitorLogo: '🦅',
    title: 'ReplyStack vs Birdeye',
    description: 'Birdeye custa a partir de $299/mês. ReplyStack oferece plano gratuito. Comparativo objetivo.',
    date: '2026-01-10',
    readingTime: 14,
    highlight: 'Poupe até 90%',
  },
  {
    slug: 'replystack-vs-podium',
    competitor: 'Podium',
    competitorLogo: '🏆',
    title: 'ReplyStack vs Podium',
    description: 'Podium custa $249/mês. ReplyStack oferece plano gratuito. Comparamos ambas plataformas para ajudá-lo a decidir.',
    date: '2026-01-10',
    readingTime: 14,
    highlight: 'Extensão Chrome vs Dashboard',
  },
];

// Get comparisons by language
function getComparisonsByLanguage(language: string) {
  switch (language) {
    case 'fr':
      return comparisonsFR;
    case 'es':
      return comparisonsES;
    case 'pt':
      return comparisonsPT;
    default:
      return comparisonsEN;
  }
}

// Page content translations
const pageContent = {
  en: {
    badge: 'Comparison Guides',
    title: 'How Does ReplyStack Compare?',
    subtitle: 'Honest, detailed comparisons to help you choose the right review management tool for your business.',
    metaTitle: 'ReplyStack Comparisons - Find the Best Review Management Tool',
    metaDescription: 'Compare ReplyStack with Birdeye, Podium, and other review management platforms. Honest, detailed comparisons to help you choose the right tool.',
    ctaTitle: 'Ready to try ReplyStack?',
    ctaText: 'Start responding to reviews smarter and faster. Free plan includes 15 AI responses per month. No credit card required.',
    ctaButton: 'Get Started Free',
    minRead: 'min read',
  },
  fr: {
    badge: 'Guides Comparatifs',
    title: 'Comment ReplyStack se Compare ?',
    subtitle: 'Des comparatifs honnêtes et détaillés pour vous aider à choisir le bon outil de gestion des avis.',
    metaTitle: 'Comparatifs ReplyStack - Trouvez le Meilleur Outil de Gestion d\'Avis',
    metaDescription: 'Comparez ReplyStack avec Guest Suite et d\'autres plateformes de gestion d\'avis. Des comparatifs honnêtes pour vous aider à choisir.',
    ctaTitle: 'Prêt à essayer ReplyStack ?',
    ctaText: 'Répondez à vos avis plus vite et plus intelligemment. Le plan gratuit inclut 15 réponses IA par mois. Sans carte bancaire.',
    ctaButton: 'Commencer Gratuitement',
    minRead: 'min de lecture',
  },
  es: {
    badge: 'Guías Comparativas',
    title: '¿Cómo se Compara ReplyStack?',
    subtitle: 'Comparativas honestas y detalladas para ayudarte a elegir la herramienta de gestión de reseñas adecuada.',
    metaTitle: 'Comparativas ReplyStack - Encuentra la Mejor Herramienta de Gestión de Reseñas',
    metaDescription: 'Compara ReplyStack con Birdeye y otras plataformas de gestión de reseñas. Comparativas honestas para ayudarte a elegir.',
    ctaTitle: '¿Listo para probar ReplyStack?',
    ctaText: 'Responde a tus reseñas más rápido e inteligente. El plan gratuito incluye 15 respuestas IA por mes. Sin tarjeta de crédito.',
    ctaButton: 'Comenzar Gratis',
    minRead: 'min de lectura',
  },
  pt: {
    badge: 'Guias Comparativos',
    title: 'Como ReplyStack se Compara?',
    subtitle: 'Comparativos honestos e detalhados para ajudá-lo a escolher a ferramenta de gestão de avaliações certa.',
    metaTitle: 'Comparativos ReplyStack - Encontre a Melhor Ferramenta de Gestão de Avaliações',
    metaDescription: 'Compare ReplyStack com Birdeye e outras plataformas de gestão de avaliações. Comparativos honestos para ajudá-lo a escolher.',
    ctaTitle: 'Pronto para experimentar ReplyStack?',
    ctaText: 'Responda às suas avaliações mais rápido e de forma mais inteligente. O plano gratuito inclui 15 respostas IA por mês. Sem cartão de crédito.',
    ctaButton: 'Começar Grátis',
    minRead: 'min de leitura',
  },
};

function getLanguageFromPath(path: string): string {
  if (path.startsWith('/fr/')) return 'fr';
  if (path.startsWith('/es/')) return 'es';
  if (path.startsWith('/pt/')) return 'pt';
  return 'en';
}

function formatDate(dateString: string, locale: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function CompareIndex() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const language = getLanguageFromPath(location.pathname);
  const langPrefix = language === 'en' ? '' : `/${language}`;

  const comparisons = getComparisonsByLanguage(language);
  const content = pageContent[language as keyof typeof pageContent] || pageContent.en;

  const fullUrl = `https://www.reply-stack.app${langPrefix}/compare`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: content.metaTitle,
    description: content.metaDescription,
    url: fullUrl,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: comparisons.map((comp, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `https://www.reply-stack.app${langPrefix}/compare/${comp.slug}`,
        name: comp.title,
      })),
    },
  };

  return (
    <>
      <Helmet>
        <title>{content.metaTitle}</title>
        <meta
          name="description"
          content={content.metaDescription}
        />
        <meta property="og:title" content={content.metaTitle} />
        <meta property="og:description" content={content.metaDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={fullUrl} />
        <link rel="canonical" href={fullUrl} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
            <span className="inline-block px-4 py-1.5 text-sm font-medium rounded-full bg-blue-100 text-blue-800 mb-6">
              {content.badge}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              {content.title}
            </h1>
            <p className="text-xl text-gray-600 mt-6 max-w-2xl mx-auto">
              {content.subtitle}
            </p>
          </div>
        </div>

        {/* Comparisons Grid */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid gap-8 md:grid-cols-2">
            {comparisons.map((comparison) => (
              <Link
                key={comparison.slug}
                to={`${langPrefix}/compare/${comparison.slug}`}
                className="group bg-white rounded-2xl border border-gray-200 p-6 hover:border-emerald-300 hover:shadow-lg transition-all duration-300"
              >
                {/* Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 text-2xl">
                    {comparison.competitorLogo}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                      {comparison.title}
                    </h2>
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
                      {comparison.highlight}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-4">
                  {comparison.description}
                </p>

                {/* Meta */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      <span>{formatDate(comparison.date, i18n.language)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} />
                      <span>{comparison.readingTime} {content.minRead}</span>
                    </div>
                  </div>
                  <ArrowRight
                    size={20}
                    className="text-gray-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all"
                  />
                </div>
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 text-center p-8 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {content.ctaTitle}
            </h2>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              {content.ctaText}
            </p>
            <Link
              to={`${langPrefix}/pricing`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-full hover:bg-emerald-700 transition-colors"
            >
              {content.ctaButton}
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default CompareIndex;

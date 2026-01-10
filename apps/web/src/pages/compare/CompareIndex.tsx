import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

// Comparison articles metadata
const comparisons = [
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

  const fullUrl = `https://replystack.io${langPrefix}/compare`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'ReplyStack Comparisons - Find the Best Review Management Tool',
    description: 'Compare ReplyStack with other review management platforms. Honest, detailed comparisons to help you choose the right tool for your business.',
    url: fullUrl,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: comparisons.map((comp, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `https://replystack.io${langPrefix}/compare/${comp.slug}`,
        name: comp.title,
      })),
    },
  };

  return (
    <>
      <Helmet>
        <title>ReplyStack Comparisons - Find the Best Review Management Tool</title>
        <meta
          name="description"
          content="Compare ReplyStack with Birdeye, Podium, and other review management platforms. Honest, detailed comparisons to help you choose the right tool."
        />
        <meta property="og:title" content="ReplyStack Comparisons - Find the Best Review Management Tool" />
        <meta property="og:description" content="Compare ReplyStack with other review management platforms. Find the best fit for your business." />
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
              Comparison Guides
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              How Does ReplyStack Compare?
            </h1>
            <p className="text-xl text-gray-600 mt-6 max-w-2xl mx-auto">
              Honest, detailed comparisons to help you choose the right review management tool for your business.
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
                      <span>{comparison.readingTime} min read</span>
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
              Ready to try ReplyStack?
            </h2>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Start responding to reviews smarter and faster. Free plan includes 15 AI responses per month. No credit card required.
            </p>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-full hover:bg-emerald-700 transition-colors"
            >
              Get Started Free
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default CompareIndex;

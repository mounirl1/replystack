import { useParams, Navigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageSEO } from '@/components/seo/PageSEO';
import {
  Utensils,
  ShoppingCart,
  Stethoscope,
  Building2,
  Clock,
  Star,
  MessageSquare,
  TrendingUp,
  Globe,
  Users,
  BarChart3,
  Zap,
  CheckCircle2,
  ArrowRight,
  Quote,
  ChevronDown,
  ChevronUp,
  Shield,
  Sparkles,
  MousePointer,
  Car,
  Scissors,
  Wrench,
  GraduationCap,
} from 'lucide-react';
import { useState } from 'react';

// Valid sectors
const VALID_SECTORS = ['restaurants', 'e-commerce', 'sante', 'hotels', 'garages', 'beaute', 'artisans', 'auto-ecoles'] as const;
type Sector = (typeof VALID_SECTORS)[number];

// Sector icons mapping
const sectorIcons: Record<Sector, React.ReactNode> = {
  restaurants: <Utensils className="w-8 h-8" />,
  'e-commerce': <ShoppingCart className="w-8 h-8" />,
  sante: <Stethoscope className="w-8 h-8" />,
  hotels: <Building2 className="w-8 h-8" />,
  garages: <Car className="w-8 h-8" />,
  beaute: <Scissors className="w-8 h-8" />,
  artisans: <Wrench className="w-8 h-8" />,
  'auto-ecoles': <GraduationCap className="w-8 h-8" />,
};

// Sector gradient colors
const sectorGradients: Record<Sector, string> = {
  restaurants: 'from-orange-500 to-red-500',
  'e-commerce': 'from-blue-500 to-purple-500',
  sante: 'from-teal-500 to-cyan-500',
  hotels: 'from-amber-500 to-orange-500',
  garages: 'from-slate-600 to-zinc-700',
  beaute: 'from-pink-500 to-rose-500',
  artisans: 'from-yellow-500 to-amber-600',
  'auto-ecoles': 'from-indigo-500 to-violet-500',
};

// Sector accent colors
const sectorAccents: Record<Sector, string> = {
  restaurants: 'text-orange-600',
  'e-commerce': 'text-blue-600',
  sante: 'text-teal-600',
  hotels: 'text-amber-600',
  garages: 'text-slate-600',
  beaute: 'text-pink-600',
  artisans: 'text-yellow-600',
  'auto-ecoles': 'text-indigo-600',
};

// Sector background accents
const sectorBgAccents: Record<Sector, string> = {
  restaurants: 'bg-orange-50',
  'e-commerce': 'bg-blue-50',
  sante: 'bg-teal-50',
  hotels: 'bg-amber-50',
  garages: 'bg-slate-50',
  beaute: 'bg-pink-50',
  artisans: 'bg-yellow-50',
  'auto-ecoles': 'bg-indigo-50',
};

// Feature icons
const featureIcons = [
  <Zap className="w-6 h-6" />,
  <Globe className="w-6 h-6" />,
  <BarChart3 className="w-6 h-6" />,
  <Building2 className="w-6 h-6" />,
  <Users className="w-6 h-6" />,
  <Shield className="w-6 h-6" />,
];

// FAQ Component
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        className="w-full py-5 flex items-center justify-between text-left hover:text-emerald-600 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium text-gray-900 pr-4">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="pb-5 text-gray-600 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

export function SectorPage() {
  const { sector } = useParams<{ sector: string }>();
  const { t, i18n } = useTranslation('sectors');
  const { t: tc } = useTranslation('common');

  const currentLang = i18n.language?.substring(0, 2) || 'en';
  const langPrefix = currentLang === 'en' ? '' : `/${currentLang}`;

  // Validate sector
  if (!sector || !VALID_SECTORS.includes(sector as Sector)) {
    return <Navigate to="/" replace />;
  }

  const sectorKey = sector as Sector;
  const gradient = sectorGradients[sectorKey];
  const accent = sectorAccents[sectorKey];
  const bgAccent = sectorBgAccents[sectorKey];

  // Get translations for this sector
  const sectorT = (key: string) => t(`${sectorKey}.${key}`);

  // Get array translations
  const platforms = t(`${sectorKey}.platforms`, { returnObjects: true }) as string[];
  const challenges = t(`${sectorKey}.challenges`, { returnObjects: true }) as { title: string; description: string }[];
  const features = t(`${sectorKey}.features`, { returnObjects: true }) as { title: string; description: string }[];
  const examples = t(`${sectorKey}.examples`, { returnObjects: true }) as { type: string; review: string; response: string; author: string }[];
  const testimonials = t(`${sectorKey}.testimonials`, { returnObjects: true }) as { quote: string; author: string; role: string }[];
  const faqs = t(`${sectorKey}.faq`, { returnObjects: true }) as { question: string; answer: string }[];
  const stats = t(`${sectorKey}.stats`, { returnObjects: true }) as { value: string; label: string }[];

  return (
    <>
      <PageSEO
        title={sectorT('meta.title')}
        description={sectorT('meta.description')}
        keywords={sectorT('meta.keywords')}
        canonicalPath={`${langPrefix}/secteurs/${sector}`}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`} />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/50 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              {/* Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 ${bgAccent} rounded-full mb-6`}>
                <span className={accent}>{sectorIcons[sectorKey]}</span>
                <span className={`font-medium ${accent}`}>{sectorT('badge')}</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
                {sectorT('hero.title')}
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {sectorT('hero.subtitle')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to={`${langPrefix}/pricing`}
                  className={`inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r ${gradient} text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-200`}
                >
                  {sectorT('hero.cta')}
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                >
                  {sectorT('hero.secondary')}
                </a>
              </div>

              {/* Trust indicators */}
              <div className="mt-8 flex items-center gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  {tc('trustIndicators.noCard')}
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  {tc('trustIndicators.freeReplies')}
                </span>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 rounded-3xl blur-3xl`} />
              <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 p-6">
                {/* Mock review response UI */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                    <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center text-white`}>
                      {sectorIcons[sectorKey]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{sectorT('demo.businessName')}</p>
                      <p className="text-sm text-gray-500">{sectorT('demo.platform')}</p>
                    </div>
                  </div>

                  {/* Review */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">{sectorT('demo.reviewer')}</span>
                    </div>
                    <p className="text-gray-700 text-sm">{sectorT('demo.review')}</p>
                  </div>

                  {/* Generate button */}
                  <button className={`w-full py-3 bg-gradient-to-r ${gradient} text-white font-medium rounded-lg flex items-center justify-center gap-2`}>
                    <Sparkles className="w-5 h-5" />
                    {sectorT('demo.generateButton')}
                  </button>

                  {/* Generated response */}
                  <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-700">{sectorT('demo.responseLabel')}</span>
                    </div>
                    <p className="text-gray-700 text-sm">{sectorT('demo.response')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.isArray(stats) && stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-3xl lg:text-4xl font-bold ${accent} mb-2`}>{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{sectorT('platformsTitle')}</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {Array.isArray(platforms) && platforms.map((platform, index) => (
              <span key={index} className="px-4 py-2 bg-white border border-gray-200 rounded-full text-gray-700 text-sm font-medium shadow-sm">
                {platform}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Challenge Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {sectorT('challenge.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {sectorT('challenge.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {Array.isArray(challenges) && challenges.map((challenge, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8">
                <div className={`w-12 h-12 ${bgAccent} rounded-xl flex items-center justify-center mb-6`}>
                  {index === 0 && <Globe className={`w-6 h-6 ${accent}`} />}
                  {index === 1 && <Clock className={`w-6 h-6 ${accent}`} />}
                  {index === 2 && <TrendingUp className={`w-6 h-6 ${accent}`} />}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{challenge.title}</h3>
                <p className="text-gray-600 leading-relaxed">{challenge.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className={`py-20 ${bgAccent}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                {sectorT('solution.title')}
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {sectorT('solution.description')}
              </p>
              <ul className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className={`w-6 h-6 ${accent} flex-shrink-0 mt-0.5`} />
                    <span className="text-gray-700">{sectorT(`solution.point${i}`)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Solution visual */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center`}>
                    <MousePointer className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{sectorT('solution.visualTitle')}</p>
                    <p className="text-sm text-gray-500">{sectorT('solution.visualSubtitle')}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className={`w-6 h-6 ${bgAccent} ${accent} rounded-full flex items-center justify-center text-sm font-bold`}>
                        {step}
                      </span>
                      <span className="text-gray-700">{sectorT(`solution.step${step}`)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {sectorT('featuresTitle')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {sectorT('featuresSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.isArray(features) && features.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300">
                <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-white mb-6`}>
                  {featureIcons[index % featureIcons.length]}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Examples Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {sectorT('examplesTitle')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {sectorT('examplesSubtitle')}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {Array.isArray(examples) && examples.slice(0, 2).map((example, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className={`px-6 py-4 ${index === 0 ? 'bg-emerald-500' : 'bg-orange-500'} text-white font-semibold`}>
                  {example.type}
                </div>
                <div className="p-6 space-y-6">
                  {/* Review */}
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">{sectorT('examplesReviewLabel')}</p>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 italic">"{example.review}"</p>
                    </div>
                  </div>
                  {/* Response */}
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">{sectorT('examplesResponseLabel')}</p>
                    <div className={`${index === 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-orange-50 border-orange-100'} border rounded-lg p-4`}>
                      <p className="text-gray-700">"{example.response}"</p>
                      <p className="text-sm text-gray-500 mt-2">— {example.author}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {sectorT('testimonialsTitle')}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {Array.isArray(testimonials) && testimonials.map((testimonial, index) => (
              <div key={index} className={`${bgAccent} rounded-2xl p-8`}>
                <Quote className={`w-10 h-10 ${accent} opacity-50 mb-4`} />
                <p className="text-gray-700 leading-relaxed mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {sectorT('pricing.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {sectorT('pricing.subtitle')}
            </p>
          </div>

          {/* ROI Calculator */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12 max-w-3xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">{sectorT('pricing.roiTitle')}</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center p-6 bg-red-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-2">{sectorT('pricing.without')}</p>
                <p className="text-3xl font-bold text-red-600">{sectorT('pricing.withoutTime')}</p>
              </div>
              <div className="text-center p-6 bg-emerald-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-2">{sectorT('pricing.with')}</p>
                <p className="text-3xl font-bold text-emerald-600">{sectorT('pricing.withTime')}</p>
              </div>
            </div>
            <p className={`text-center mt-6 text-lg font-semibold ${accent}`}>
              {sectorT('pricing.savings')}
            </p>
          </div>

          {/* Pricing table */}
          <div className="overflow-x-auto">
            <table className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
              <thead>
                <tr className={`bg-gradient-to-r ${gradient} text-white`}>
                  <th className="px-6 py-4 text-left">{sectorT('pricing.plan')}</th>
                  <th className="px-6 py-4 text-left">{sectorT('pricing.price')}</th>
                  <th className="px-6 py-4 text-left">{sectorT('pricing.responses')}</th>
                  <th className="px-6 py-4 text-left">{sectorT('pricing.idealFor')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(['free', 'starter', 'pro', 'business'] as const).map((plan) => (
                  <tr key={plan} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">{sectorT(`pricing.plans.${plan}.name`)}</td>
                    <td className="px-6 py-4 text-gray-700">{sectorT(`pricing.plans.${plan}.price`)}</td>
                    <td className="px-6 py-4 text-gray-700">{sectorT(`pricing.plans.${plan}.responses`)}</td>
                    <td className="px-6 py-4 text-gray-600">{sectorT(`pricing.plans.${plan}.ideal`)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-center text-gray-500 mt-6">{sectorT('pricing.noCommitment')}</p>

          <div className="text-center mt-8">
            <Link
              to={`${langPrefix}/pricing`}
              className={`inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r ${gradient} text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200`}
            >
              {sectorT('pricing.cta')}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {sectorT('faqTitle')}
            </h2>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8">
            {Array.isArray(faqs) && faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className={`py-20 bg-gradient-to-br ${gradient}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            {sectorT('cta.title')}
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            {sectorT('cta.subtitle')}
          </p>
          <Link
            to={`${langPrefix}/pricing`}
            className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white text-gray-900 font-bold rounded-xl hover:shadow-2xl transition-all duration-200 text-lg"
          >
            {sectorT('cta.button')}
            <ArrowRight className="w-6 h-6" />
          </Link>
          <p className="text-white/80 mt-6 text-sm">
            {sectorT('cta.noCard')}
          </p>
        </div>
      </section>

      {/* Related content */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600">
            {sectorT('relatedContent.label')}{' '}
            <Link to={`${langPrefix}/blog/respond-negative-reviews`} className="text-emerald-600 hover:underline">
              {sectorT('relatedContent.link1')}
            </Link>
            {' • '}
            <Link to={`${langPrefix}/blog/review-response-templates`} className="text-emerald-600 hover:underline">
              {sectorT('relatedContent.link2')}
            </Link>
            {' • '}
            <Link to={`${langPrefix}/alternatives/meilleur-logiciel-gestion-avis`} className="text-emerald-600 hover:underline">
              {sectorT('relatedContent.link3')}
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}

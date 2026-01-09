import { useParams, Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  Star,
  Sparkles,
  CheckCircle2,
  Clock,
  TrendingUp,
  Shield,
  MessageSquare,
  Zap,
  Globe2,
  Car,
  Wrench,
  Flower2,
  UtensilsCrossed,
  Hotel,
  Stethoscope,
  ShoppingBag,
  Scissors,
} from 'lucide-react';

// Industry configuration
interface IndustryConfig {
  id: string;
  slug: string;
  icon: LucideIcon;
  gradient: string;
  lightGradient: string;
  accentColor: string;
  platforms: string[];
  stats: {
    timesSaved: string;
    responseRate: string;
    satisfaction: string;
  };
}

const industriesConfig: Record<string, IndustryConfig> = {
  garagistes: {
    id: 'garage',
    slug: 'garagistes',
    icon: Car,
    gradient: 'from-orange-500 to-red-500',
    lightGradient: 'from-orange-50 to-red-50',
    accentColor: 'orange',
    platforms: ['Google', 'Facebook', 'Pages Jaunes', 'Yelp'],
    stats: { timesSaved: '3h', responseRate: '95%', satisfaction: '4.8' },
  },
  plombiers: {
    id: 'plumber',
    slug: 'plombiers',
    icon: Wrench,
    gradient: 'from-blue-500 to-cyan-500',
    lightGradient: 'from-blue-50 to-cyan-50',
    accentColor: 'blue',
    platforms: ['Google', 'Facebook', 'Pages Jaunes', 'Houzz'],
    stats: { timesSaved: '2.5h', responseRate: '92%', satisfaction: '4.7' },
  },
  fleuristes: {
    id: 'florist',
    slug: 'fleuristes',
    icon: Flower2,
    gradient: 'from-pink-500 to-rose-500',
    lightGradient: 'from-pink-50 to-rose-50',
    accentColor: 'pink',
    platforms: ['Google', 'Facebook', 'Instagram', 'Yelp'],
    stats: { timesSaved: '2h', responseRate: '98%', satisfaction: '4.9' },
  },
  restaurants: {
    id: 'restaurant',
    slug: 'restaurants',
    icon: UtensilsCrossed,
    gradient: 'from-amber-500 to-orange-500',
    lightGradient: 'from-amber-50 to-orange-50',
    accentColor: 'amber',
    platforms: ['Google', 'TripAdvisor', 'TheFork', 'Yelp'],
    stats: { timesSaved: '5h', responseRate: '97%', satisfaction: '4.8' },
  },
  hotels: {
    id: 'hotel',
    slug: 'hotels',
    icon: Hotel,
    gradient: 'from-violet-500 to-purple-500',
    lightGradient: 'from-violet-50 to-purple-50',
    accentColor: 'violet',
    platforms: ['Google', 'TripAdvisor', 'Booking', 'Expedia'],
    stats: { timesSaved: '8h', responseRate: '99%', satisfaction: '4.9' },
  },
  'professionnels-sante': {
    id: 'medical',
    slug: 'professionnels-sante',
    icon: Stethoscope,
    gradient: 'from-emerald-500 to-teal-500',
    lightGradient: 'from-emerald-50 to-teal-50',
    accentColor: 'emerald',
    platforms: ['Google', 'Doctolib', 'Facebook', 'Pages Jaunes'],
    stats: { timesSaved: '3h', responseRate: '94%', satisfaction: '4.8' },
  },
  commerces: {
    id: 'retail',
    slug: 'commerces',
    icon: ShoppingBag,
    gradient: 'from-fuchsia-500 to-pink-500',
    lightGradient: 'from-fuchsia-50 to-pink-50',
    accentColor: 'fuchsia',
    platforms: ['Google', 'Facebook', 'Trustpilot', 'Yelp'],
    stats: { timesSaved: '4h', responseRate: '96%', satisfaction: '4.7' },
  },
  'salons-coiffure': {
    id: 'salon',
    slug: 'salons-coiffure',
    icon: Scissors,
    gradient: 'from-rose-500 to-red-500',
    lightGradient: 'from-rose-50 to-red-50',
    accentColor: 'rose',
    platforms: ['Google', 'Facebook', 'Planity', 'Yelp'],
    stats: { timesSaved: '2.5h', responseRate: '95%', satisfaction: '4.8' },
  },
};

// Sample reviews by industry
const sampleReviews: Record<string, { positive: { author: string; content: string; rating: number }; negative: { author: string; content: string; rating: number } }> = {
  garage: {
    positive: {
      author: 'Pierre M.',
      content: 'Excellent garage ! Révision faite rapidement et prix honnête. L\'équipe est très professionnelle et m\'a bien conseillé sur l\'entretien de ma voiture.',
      rating: 5,
    },
    negative: {
      author: 'Marc D.',
      content: 'Délai d\'attente trop long pour une simple vidange. 2h30 pour ce qui était annoncé comme 1h. Communication à améliorer.',
      rating: 2,
    },
  },
  plumber: {
    positive: {
      author: 'Catherine L.',
      content: 'Intervention rapide et efficace pour une fuite urgente. Plombier très professionnel, propre et ponctuel. Je recommande vivement !',
      rating: 5,
    },
    negative: {
      author: 'Jean-Paul R.',
      content: 'Devis beaucoup plus élevé que prévu. La réparation a été faite correctement mais le prix final m\'a surpris.',
      rating: 2,
    },
  },
  florist: {
    positive: {
      author: 'Marie S.',
      content: 'Bouquet magnifique pour l\'anniversaire de ma mère ! Conseils personnalisés et compositions vraiment originales. Une vraie artiste !',
      rating: 5,
    },
    negative: {
      author: 'Sophie T.',
      content: 'Fleurs fanées après seulement 2 jours. Déçue pour un bouquet à 50€. La prochaine fois j\'irai ailleurs.',
      rating: 2,
    },
  },
  restaurant: {
    positive: {
      author: 'Laurent B.',
      content: 'Une découverte ! Cuisine raffinée, service impeccable et cadre chaleureux. Le menu dégustation est un vrai voyage gustatif.',
      rating: 5,
    },
    negative: {
      author: 'Nathalie G.',
      content: 'Attente trop longue entre les plats et plat principal servi tiède. Dommage car le goût était là.',
      rating: 2,
    },
  },
  hotel: {
    positive: {
      author: 'Thomas W.',
      content: 'Séjour parfait ! Chambre spacieuse avec vue, personnel aux petits soins et petit-déjeuner varié. On reviendra !',
      rating: 5,
    },
    negative: {
      author: 'Emma L.',
      content: 'Chambre bruyante donnant sur la rue. Malgré nos demandes, aucune solution proposée. Nuits difficiles.',
      rating: 2,
    },
  },
  medical: {
    positive: {
      author: 'Anne-Marie P.',
      content: 'Médecin à l\'écoute qui prend le temps d\'expliquer. Diagnostic précis et traitement efficace. Enfin un praticien humain !',
      rating: 5,
    },
    negative: {
      author: 'François D.',
      content: 'Temps d\'attente excessif malgré un RDV. Plus de 45 minutes de retard sans explication.',
      rating: 2,
    },
  },
  retail: {
    positive: {
      author: 'Isabelle M.',
      content: 'Super boutique avec un choix incroyable ! Vendeuses adorables et de très bons conseils. Prix raisonnables.',
      rating: 5,
    },
    negative: {
      author: 'David C.',
      content: 'Article commandé jamais reçu et retour client laborieux. 3 semaines pour un remboursement, c\'est trop.',
      rating: 2,
    },
  },
  salon: {
    positive: {
      author: 'Julie R.',
      content: 'Ma nouvelle adresse coiffure ! Écoute, conseils et résultat au top. Le balayage est exactement ce que je voulais.',
      rating: 5,
    },
    negative: {
      author: 'Christine B.',
      content: 'Couleur pas du tout conforme à ma demande. On m\'a proposé une correction payante. Très déçue.',
      rating: 2,
    },
  },
};

export function IndustryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation('industries');
  const { t: tc } = useTranslation('common');
  const { t: tl } = useTranslation('landing');


  // Get industry config
  const industry = slug ? industriesConfig[slug] : null;

  if (!industry) {
    return <Navigate to="/" replace />;
  }

  const Icon = industry.icon;
  const reviews = sampleReviews[industry.id];

  const benefits = [
    { icon: Clock, key: 'timeSaved', stat: industry.stats.timesSaved },
    { icon: TrendingUp, key: 'responseRate', stat: industry.stats.responseRate },
    { icon: Star, key: 'satisfaction', stat: industry.stats.satisfaction },
    { icon: Shield, key: 'brandConsistency' },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 lg:pt-28 lg:pb-32">
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-b ${industry.lightGradient} via-white to-white -z-10`} />

        {/* Floating decorations */}
        <div className={`absolute top-20 left-[10%] w-16 h-16 bg-gradient-to-br ${industry.gradient} opacity-20 rounded-2xl float-slow`} />
        <div className={`absolute top-40 right-[15%] w-12 h-12 bg-gradient-to-br ${industry.gradient} opacity-15 rounded-full float-medium`} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Content */}
            <div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${industry.lightGradient} border border-gray-200 text-gray-700 text-sm font-medium mb-6`}>
                <Icon size={18} />
                <span>{t(`${industry.id}.badge`) || 'Solution spécialisée'}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
                {t(`${industry.id}.hero.title`) || `ReplyStack pour les ${slug}`}
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {t(`${industry.id}.hero.subtitle`) || 'Répondez à tous vos avis clients en quelques secondes avec des réponses personnalisées et professionnelles.'}
              </p>

              {/* Platform badges */}
              <div className="flex flex-wrap gap-3 mb-8">
                {industry.platforms.map((platform) => (
                  <span key={platform} className="platform-logo">
                    {platform}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="btn-primary text-lg px-8 py-4">
                  {tc('buttons.startFree') || 'Essai gratuit'}
                  <ArrowRight size={20} />
                </Link>
                <Link to="/pricing" className="btn-secondary text-lg px-8 py-4">
                  {tc('nav.pricing') || 'Voir les tarifs'}
                </Link>
              </div>
            </div>

            {/* Demo card */}
            <div className="relative">
              <div className="demo-window">
                <div className="demo-window-header">
                  <div className="demo-window-dot bg-red-400" />
                  <div className="demo-window-dot bg-yellow-400" />
                  <div className="demo-window-dot bg-green-400" />
                  <span className="ml-3 text-sm text-gray-500">ReplyStack Extension</span>
                </div>
                <div className="p-6 lg:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${industry.gradient} flex items-center justify-center`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{t(`${industry.id}.demo.businessName`) || 'Votre établissement'}</p>
                      <p className="text-sm text-gray-500">{t(`${industry.id}.demo.location`) || 'Paris, France'}</p>
                    </div>
                  </div>

                  {/* Sample review */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900">{reviews.positive.author}</span>
                      <div className="flex gap-0.5 text-amber-400">
                        {[...Array(reviews.positive.rating)].map((_, i) => (
                          <Star key={i} size={12} fill="currentColor" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">"{reviews.positive.content}"</p>
                  </div>

                  {/* AI Response */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles size={16} className="text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-700">Réponse générée par IA</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      "{t(`${industry.id}.demo.response`) || `Merci beaucoup ${reviews.positive.author.split(' ')[0]} pour votre confiance ! Nous sommes ravis que vous ayez apprécié notre service. À très bientôt !`}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <span className="text-xs text-emerald-600 flex items-center gap-1">
                      <Zap size={12} />
                      Généré en 1.5s
                    </span>
                    <button className="text-xs text-emerald-600 font-medium flex items-center gap-1 hover:text-emerald-700">
                      <CheckCircle2 size={12} />
                      Copier
                    </button>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className={`absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br ${industry.gradient} opacity-10 rounded-full blur-2xl`} />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-emerald-200/30 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const BenefitIcon = benefit.icon;
              return (
                <div key={index} className="text-center">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${industry.gradient} flex items-center justify-center mx-auto mb-4`}>
                    <BenefitIcon size={24} className="text-white" />
                  </div>
                  {benefit.stat && (
                    <div className="text-4xl font-extrabold text-gradient mb-1">{benefit.stat}</div>
                  )}
                  <p className="text-gray-700 font-medium">
                    {t(`benefits.${benefit.key}.title`) || benefit.key}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {t(`benefits.${benefit.key}.description`) || ''}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="section-badge">
              <MessageSquare size={14} />
              Exemples de réponses
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">
              {t(`${industry.id}.useCases.title`) || 'Comment ça marche ?'}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t(`${industry.id}.useCases.subtitle`) || 'Répondez à tous types d\'avis en quelques clics'}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Positive review example */}
            <div className="feature-card">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium">
                  Avis positif
                </span>
                <div className="flex gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="font-medium text-gray-900 mb-1">{reviews.positive.author}</p>
                <p className="text-gray-600 text-sm">"{reviews.positive.content}"</p>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">Réponse suggérée</span>
              </div>

              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                {t(`${industry.id}.responses.positive`) || `Merci infiniment ${reviews.positive.author.split(' ')[0]} pour ce retour chaleureux ! Votre satisfaction est notre priorité et ces mots nous touchent particulièrement. Nous avons hâte de vous revoir très bientôt. Toute l'équipe vous remercie !`}
              </p>

              <div className="flex gap-2">
                <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium">Ton chaleureux</span>
                <span className="px-2 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs">Personnalisé</span>
              </div>
            </div>

            {/* Negative review example */}
            <div className="feature-card">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 text-sm font-medium">
                  Avis négatif
                </span>
                <div className="flex gap-0.5 text-amber-400">
                  {[...Array(2)].map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                  {[...Array(3)].map((_, i) => (
                    <Star key={i} size={14} className="text-gray-300" />
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="font-medium text-gray-900 mb-1">{reviews.negative.author}</p>
                <p className="text-gray-600 text-sm">"{reviews.negative.content}"</p>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">Réponse suggérée</span>
              </div>

              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                {t(`${industry.id}.responses.negative`) || `${reviews.negative.author.split(' ')[0]}, nous vous présentons nos sincères excuses pour cette expérience décevante. Votre retour est précieux et nous permet de nous améliorer. Nous aimerions comprendre ce qui s'est passé et vous proposer une solution. Pourriez-vous nous contacter directement ? Merci pour votre compréhension.`}
              </p>

              <div className="flex gap-2">
                <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium">Empathique</span>
                <span className="px-2 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs">Solution proposée</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="section-badge">
              <Sparkles size={14} />
              Fonctionnalités
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">
              {t(`${industry.id}.features.title`) || 'Fonctionnalités adaptées à votre métier'}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: MessageSquare, key: 'sectorKnowledge', title: 'Vocabulaire métier', description: 'Réponses avec le jargon et les termes spécifiques à votre secteur', color: 'from-pink-500 to-rose-500' },
              { icon: Globe2, key: 'allPlatforms', title: 'Toutes les plateformes', description: 'Google, Facebook, TripAdvisor et bien d\'autres', color: 'from-blue-500 to-cyan-500' },
              { icon: Zap, key: 'instantReplies', title: 'Réponses instantanées', description: 'Générez une réponse parfaite en moins de 2 secondes', color: 'from-amber-500 to-orange-500' },
              { icon: Shield, key: 'brandVoice', title: 'Voix de marque', description: 'Chaque réponse reflète l\'identité de votre établissement', color: 'from-emerald-500 to-teal-500' },
              { icon: TrendingUp, key: 'improveRating', title: 'Améliorez vos notes', description: 'Des réponses qui renforcent votre e-réputation', color: 'from-violet-500 to-purple-500' },
              { icon: Clock, key: 'saveTime', title: 'Gagnez du temps', description: 'Concentrez-vous sur votre métier, pas sur la rédaction', color: 'from-indigo-500 to-blue-500' },
            ].map((feature) => {
              const FeatureIcon = feature.icon;
              return (
                <div key={feature.key} className="feature-card text-center">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto mb-4`}>
                    <FeatureIcon size={24} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`relative overflow-hidden rounded-4xl bg-gradient-to-br ${industry.gradient} p-10 md:p-16 text-center`}>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
                <Icon size={40} className="text-white" />
              </div>

              <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">
                {t(`${industry.id}.cta.title`) || 'Prêt à transformer vos avis en opportunités ?'}
              </h2>
              <p className="text-xl text-white/80 mb-10 max-w-xl mx-auto">
                {t(`${industry.id}.cta.subtitle`) || 'Rejoignez des milliers de professionnels qui gagnent du temps chaque jour.'}
              </p>

              <Link to="/register" className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold text-lg px-8 py-4 rounded-full hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl">
                {tc('buttons.startFree') || 'Commencer gratuitement'}
                <ArrowRight size={20} />
              </Link>

              <p className="mt-4 text-sm text-white/60">
                {tl('hero.noCreditCard') || 'Sans carte bancaire • 15 réponses gratuites'}
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

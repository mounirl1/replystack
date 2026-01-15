import type { BlogPostMeta, SupportedBlogLanguage, BlogCategory } from './types';
import type { ComponentType } from 'react';
import {
  sortPostsByDate,
  filterByCategory,
  filterByTag,
  paginatePosts,
} from './utils';

// Import blog articles - Guides EN
import RespondNegativeReviewsEN from '@/content/blog/guides/respond-negative-reviews/index.en.mdx';
import ReviewResponseTemplatesEN from '@/content/blog/guides/review-response-templates/index.en.mdx';
import GetMoreGoogleReviewsEN from '@/content/blog/guides/get-more-google-reviews/index.en.mdx';
import OnlineReputationStrategyEN from '@/content/blog/guides/online-reputation-strategy/index.en.mdx';
import RespondReviews2MinutesEN from '@/content/blog/guides/respond-reviews-2-minutes-day/index.en.mdx';
import RespondGoogleReviewsEN from '@/content/blog/guides/respond-google-reviews/index.en.mdx';
import ReviewsBoostLocalSeoEN from '@/content/blog/guides/reviews-boost-local-seo/index.en.mdx';
import GetMore5StarReviewsEN from '@/content/blog/guides/get-more-5-star-reviews/index.en.mdx';

// Import blog articles - Guides FR
import RespondNegativeReviewsFR from '@/content/blog/guides/respond-negative-reviews/index.fr.mdx';
import ReviewResponseTemplatesFR from '@/content/blog/guides/review-response-templates/index.fr.mdx';
import GetMoreGoogleReviewsFR from '@/content/blog/guides/get-more-google-reviews/index.fr.mdx';
import OnlineReputationStrategyFR from '@/content/blog/guides/online-reputation-strategy/index.fr.mdx';
import RespondReviews2MinutesFR from '@/content/blog/guides/respond-reviews-2-minutes-day/index.fr.mdx';
import RespondGoogleReviewsFR from '@/content/blog/guides/respond-google-reviews/index.fr.mdx';
import ReviewsBoostLocalSeoFR from '@/content/blog/guides/reviews-boost-local-seo/index.fr.mdx';
import GetMore5StarReviewsFR from '@/content/blog/guides/get-more-5-star-reviews/index.fr.mdx';

// Import blog articles - Guides ES
import RespondNegativeReviewsES from '@/content/blog/guides/respond-negative-reviews/index.es.mdx';
import ReviewResponseTemplatesES from '@/content/blog/guides/review-response-templates/index.es.mdx';
import GetMoreGoogleReviewsES from '@/content/blog/guides/get-more-google-reviews/index.es.mdx';
import OnlineReputationStrategyES from '@/content/blog/guides/online-reputation-strategy/index.es.mdx';
import RespondReviews2MinutesES from '@/content/blog/guides/respond-reviews-2-minutes-day/index.es.mdx';
import RespondGoogleReviewsES from '@/content/blog/guides/respond-google-reviews/index.es.mdx';
import ReviewsBoostLocalSeoES from '@/content/blog/guides/reviews-boost-local-seo/index.es.mdx';
import GetMore5StarReviewsES from '@/content/blog/guides/get-more-5-star-reviews/index.es.mdx';

// Import blog articles - Guides PT
import RespondNegativeReviewsPT from '@/content/blog/guides/respond-negative-reviews/index.pt.mdx';
import ReviewResponseTemplatesPT from '@/content/blog/guides/review-response-templates/index.pt.mdx';
import GetMoreGoogleReviewsPT from '@/content/blog/guides/get-more-google-reviews/index.pt.mdx';
import OnlineReputationStrategyPT from '@/content/blog/guides/online-reputation-strategy/index.pt.mdx';
import RespondReviews2MinutesPT from '@/content/blog/guides/respond-reviews-2-minutes-day/index.pt.mdx';
import RespondGoogleReviewsPT from '@/content/blog/guides/respond-google-reviews/index.pt.mdx';
import ReviewsBoostLocalSeoPT from '@/content/blog/guides/reviews-boost-local-seo/index.pt.mdx';
import GetMore5StarReviewsPT from '@/content/blog/guides/get-more-5-star-reviews/index.pt.mdx';

// Import blog articles - Reputation Artisans
import ReputationArtisansEN from '@/content/blog/guides/reputation-artisans/index.en.mdx';
import ReputationArtisansFR from '@/content/blog/guides/reputation-artisans/index.fr.mdx';
import ReputationArtisansES from '@/content/blog/guides/reputation-artisans/index.es.mdx';
import ReputationArtisansPT from '@/content/blog/guides/reputation-artisans/index.pt.mdx';

// Import blog articles - E-commerce Negative Reviews
import EcommerceNegativeReviewsEN from '@/content/blog/guides/ecommerce-negative-reviews/index.en.mdx';
import EcommerceNegativeReviewsFR from '@/content/blog/guides/ecommerce-negative-reviews/index.fr.mdx';
import EcommerceNegativeReviewsES from '@/content/blog/guides/ecommerce-negative-reviews/index.es.mdx';
import EcommerceNegativeReviewsPT from '@/content/blog/guides/ecommerce-negative-reviews/index.pt.mdx';

// Import blog articles - Auto Repair Reputation
import AutoRepairReputationEN from '@/content/blog/guides/auto-repair-reputation/index.en.mdx';
import AutoRepairReputationFR from '@/content/blog/guides/auto-repair-reputation/index.fr.mdx';
import AutoRepairReputationES from '@/content/blog/guides/auto-repair-reputation/index.es.mdx';
import AutoRepairReputationPT from '@/content/blog/guides/auto-repair-reputation/index.pt.mdx';

// Blog posts registry with components and metadata
interface BlogPostRegistry {
  component: ComponentType;
  meta: BlogPostMeta;
}

const blogPosts: Record<string, BlogPostRegistry> = {
  // English articles
  'en:respond-negative-reviews': {
    component: RespondNegativeReviewsEN,
    meta: {
      title: 'How to Respond to Negative Reviews: Complete Guide',
      slug: 'respond-negative-reviews',
      description: 'Learn how to respond to negative reviews professionally. 5 principles, concrete examples, and templates to transform criticism into opportunities.',
      date: '2026-01-10',
      author: {
        name: 'ReplyStack Team',
        role: 'Review Management Experts',
      },
      category: 'guides',
      tags: ['negative-reviews', 'review-response', 'reputation-management', 'customer-service'],
      language: 'en',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 12,
      wordCount: 2800,
      seo: {
        title: 'How to Respond to Negative Reviews: Complete Guide 2026',
        description: 'Learn how to respond to negative reviews professionally. 5 principles, concrete examples, and templates to transform criticism into opportunities.',
        keywords: ['negative reviews', 'review response', 'customer feedback', 'reputation management'],
      },
    },
  },
  'en:review-response-templates': {
    component: ReviewResponseTemplatesEN,
    meta: {
      title: '20 Review Response Templates That Work (Copy & Paste)',
      slug: 'review-response-templates',
      description: '20 ready-to-use templates for responding to customer reviews. Positive, negative, and special cases covered. Copy, personalize, and publish.',
      date: '2026-01-10',
      author: {
        name: 'ReplyStack Team',
        role: 'Review Management Experts',
      },
      category: 'guides',
      tags: ['templates', 'review-response', 'positive-reviews', 'negative-reviews', 'customer-service'],
      language: 'en',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 15,
      wordCount: 3200,
      seo: {
        title: '20 Review Response Templates That Work (Copy & Paste) 2026',
        description: '20 ready-to-use templates for responding to customer reviews. Positive, negative, and special cases covered. Copy, personalize, and publish.',
        keywords: ['review templates', 'response templates', 'customer reviews', 'review management'],
      },
    },
  },
  'en:get-more-google-reviews': {
    component: GetMoreGoogleReviewsEN,
    meta: {
      title: 'How to Get More Google Reviews: The Complete Guide 2026',
      slug: 'get-more-google-reviews',
      description: '15 proven strategies to get more Google reviews. QR codes, emails, SMS, optimal timing. Practical guide with free templates.',
      date: '2026-01-11',
      author: {
        name: 'ReplyStack Team',
        role: 'Review Management Experts',
      },
      category: 'guides',
      tags: ['google-reviews', 'review-collection', 'local-seo', 'customer-feedback', 'review-strategy'],
      language: 'en',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 18,
      wordCount: 4200,
      seo: {
        title: 'How to Get More Google Reviews: The Complete Guide 2026',
        description: '15 proven strategies to get more Google reviews. QR codes, emails, SMS, optimal timing. Practical guide with free templates.',
        keywords: ['get more google reviews', 'ask customers for reviews', 'increase google reviews', 'collect google reviews', 'google review strategy'],
      },
    },
  },
  'en:respond-reviews-2-minutes-day': {
    component: RespondReviews2MinutesEN,
    meta: {
      title: 'Respond to Reviews in 2 Minutes a Day: The Efficient Method',
      slug: 'respond-reviews-2-minutes-day',
      description: 'Learn how to manage all your customer reviews in just 2 minutes a day. Optimized workflow, templates, AI tools. Practical guide.',
      date: '2026-01-15',
      author: {
        name: 'ReplyStack Team',
        role: 'Review Management Experts',
      },
      category: 'guides',
      tags: ['review-response', 'time-management', 'workflow', 'ai-tools', 'productivity'],
      language: 'en',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 12,
      wordCount: 2800,
      seo: {
        title: 'Respond to Reviews in 2 Minutes a Day: The Efficient Method 2026',
        description: 'Learn how to manage all your customer reviews in just 2 minutes a day. Optimized workflow, templates, AI tools. Practical guide.',
        keywords: ['respond reviews quickly', 'efficient review management', 'review workflow', 'save time google reviews', 'automate review responses'],
      },
    },
  },
  // French articles
  'fr:repondre-avis-google-negatifs': {
    component: RespondNegativeReviewsFR,
    meta: {
      title: 'Comment Répondre aux Avis Google Négatifs : Guide Complet',
      slug: 'repondre-avis-google-negatifs',
      description: 'Apprenez à répondre aux avis négatifs de manière professionnelle. 5 principes, exemples concrets et modèles pour transformer les critiques en opportunités.',
      date: '2026-01-10',
      author: {
        name: 'Équipe ReplyStack',
        role: 'Experts en gestion d\'avis',
      },
      category: 'guides',
      tags: ['avis-negatifs', 'reponse-avis', 'e-reputation', 'service-client'],
      language: 'fr',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 12,
      wordCount: 2800,
      seo: {
        title: 'Comment Répondre aux Avis Google Négatifs : Guide Complet 2026',
        description: 'Apprenez à répondre aux avis négatifs de manière professionnelle. 5 principes, exemples concrets et modèles pour transformer les critiques en opportunités.',
        keywords: ['avis négatifs', 'répondre avis google', 'e-réputation', 'gestion avis clients'],
      },
    },
  },
  'fr:templates-reponses-avis': {
    component: ReviewResponseTemplatesFR,
    meta: {
      title: '20 Templates de Réponses aux Avis Clients',
      slug: 'templates-reponses-avis',
      description: '20 modèles prêts à l\'emploi pour répondre aux avis clients. Avis positifs, négatifs et cas particuliers. Copiez, personnalisez et publiez.',
      date: '2026-01-10',
      author: {
        name: 'Équipe ReplyStack',
        role: 'Experts en gestion d\'avis',
      },
      category: 'guides',
      tags: ['templates', 'reponse-avis', 'avis-positifs', 'avis-negatifs', 'service-client'],
      language: 'fr',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 15,
      wordCount: 3200,
      seo: {
        title: '20 Templates de Réponses aux Avis Clients (Copier-Coller) 2026',
        description: '20 modèles prêts à l\'emploi pour répondre aux avis clients. Avis positifs, négatifs et cas particuliers. Copiez, personnalisez et publiez.',
        keywords: ['templates avis', 'modèles réponse', 'avis clients', 'gestion avis'],
      },
    },
  },
  'fr:obtenir-plus-avis-google': {
    component: GetMoreGoogleReviewsFR,
    meta: {
      title: 'Comment Obtenir Plus d\'Avis Google : Le Guide Complet 2026',
      slug: 'obtenir-plus-avis-google',
      description: '15 stratégies éprouvées pour obtenir plus d\'avis Google. QR codes, emails, SMS, timing optimal. Guide pratique avec templates gratuits.',
      date: '2026-01-11',
      author: {
        name: 'Équipe ReplyStack',
        role: 'Experts en gestion d\'avis',
      },
      category: 'guides',
      tags: ['avis-google', 'collecter-avis', 'seo-local', 'feedback-client', 'strategie-avis'],
      language: 'fr',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 18,
      wordCount: 4200,
      seo: {
        title: 'Comment Obtenir Plus d\'Avis Google : Le Guide Complet 2026',
        description: '15 stratégies éprouvées pour obtenir plus d\'avis Google. QR codes, emails, SMS, timing optimal. Guide pratique avec templates gratuits.',
        keywords: ['obtenir plus avis google', 'demander avis clients', 'augmenter avis google', 'collecter avis google', 'stratégie avis google'],
      },
    },
  },
  'fr:repondre-avis-2-minutes-jour': {
    component: RespondReviews2MinutesFR,
    meta: {
      title: 'Répondre aux Avis en 2 Minutes par Jour : La Méthode Efficace',
      slug: 'repondre-avis-2-minutes-jour',
      description: 'Apprenez à gérer tous vos avis clients en seulement 2 minutes par jour. Workflow optimisé, templates, outils IA. Guide pratique.',
      date: '2026-01-15',
      author: {
        name: 'Équipe ReplyStack',
        role: 'Experts en gestion d\'avis',
      },
      category: 'guides',
      tags: ['reponse-avis', 'gestion-temps', 'workflow', 'outils-ia', 'productivite'],
      language: 'fr',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 12,
      wordCount: 2800,
      seo: {
        title: 'Répondre aux Avis en 2 Minutes par Jour : La Méthode Efficace 2026',
        description: 'Apprenez à gérer tous vos avis clients en seulement 2 minutes par jour. Workflow optimisé, templates, outils IA. Guide pratique.',
        keywords: ['répondre avis rapidement', 'gestion avis efficace', 'workflow avis clients', 'gagner temps avis google', 'automatiser réponses avis'],
      },
    },
  },
  // Spanish articles
  'es:responder-resenas-negativas': {
    component: RespondNegativeReviewsES,
    meta: {
      title: 'Cómo Responder a Reseñas Negativas en Google: Guía Completa',
      slug: 'responder-resenas-negativas',
      description: 'Aprenda a responder a reseñas negativas de forma profesional. Ejemplos concretos, errores a evitar y estrategias para proteger su reputación.',
      date: '2026-01-10',
      author: {
        name: 'Equipo ReplyStack',
        role: 'Expertos en gestión de reseñas',
      },
      category: 'guides',
      tags: ['resenas-negativas', 'respuesta-resenas', 'reputacion-online', 'atencion-cliente'],
      language: 'es',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 12,
      wordCount: 2800,
      seo: {
        title: 'Cómo Responder a Reseñas Negativas en Google: Guía Completa 2026',
        description: 'Aprenda a responder a reseñas negativas de forma profesional. Ejemplos concretos, errores a evitar y estrategias para proteger su reputación.',
        keywords: ['reseñas negativas', 'responder reseña google', 'reputación online', 'gestión reseñas'],
      },
    },
  },
  'es:plantillas-respuestas-resenas': {
    component: ReviewResponseTemplatesES,
    meta: {
      title: '20 Plantillas de Respuestas a Reseñas de Clientes',
      slug: 'plantillas-respuestas-resenas',
      description: '20 plantillas profesionales para responder a reseñas en Google, TripAdvisor, Facebook. Reseñas positivas y negativas. Copie, personalice, publique.',
      date: '2026-01-10',
      author: {
        name: 'Equipo ReplyStack',
        role: 'Expertos en gestión de reseñas',
      },
      category: 'guides',
      tags: ['plantillas', 'respuesta-resenas', 'resenas-positivas', 'resenas-negativas', 'atencion-cliente'],
      language: 'es',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 15,
      wordCount: 3200,
      seo: {
        title: '20 Plantillas de Respuestas a Reseñas de Clientes (Copiar y Pegar) 2026',
        description: '20 plantillas profesionales para responder a reseñas en Google, TripAdvisor, Facebook. Reseñas positivas y negativas. Copie, personalice, publique.',
        keywords: ['plantillas reseñas', 'modelos respuesta', 'reseñas clientes', 'gestión reseñas'],
      },
    },
  },
  'es:conseguir-mas-resenas-google': {
    component: GetMoreGoogleReviewsES,
    meta: {
      title: 'Cómo Conseguir Más Reseñas en Google: La Guía Completa 2026',
      slug: 'conseguir-mas-resenas-google',
      description: '15 estrategias probadas para conseguir más reseñas en Google. Códigos QR, emails, SMS, timing óptimo. Guía práctica con plantillas gratis.',
      date: '2026-01-11',
      author: {
        name: 'Equipo ReplyStack',
        role: 'Expertos en gestión de reseñas',
      },
      category: 'guides',
      tags: ['resenas-google', 'recopilar-resenas', 'seo-local', 'feedback-cliente', 'estrategia-resenas'],
      language: 'es',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 18,
      wordCount: 4200,
      seo: {
        title: 'Cómo Conseguir Más Reseñas en Google: La Guía Completa 2026',
        description: '15 estrategias probadas para conseguir más reseñas en Google. Códigos QR, emails, SMS, timing óptimo. Guía práctica con plantillas gratis.',
        keywords: ['conseguir más reseñas google', 'pedir reseñas clientes', 'aumentar reseñas google', 'recopilar opiniones google', 'estrategia reseñas google'],
      },
    },
  },
  'es:responder-resenas-2-minutos-dia': {
    component: RespondReviews2MinutesES,
    meta: {
      title: 'Responder a Reseñas en 2 Minutos al Día: El Método Eficiente',
      slug: 'responder-resenas-2-minutos-dia',
      description: 'Aprende a gestionar todas tus reseñas de clientes en solo 2 minutos al día. Workflow optimizado, plantillas, herramientas IA. Guía práctica.',
      date: '2026-01-15',
      author: {
        name: 'Equipo ReplyStack',
        role: 'Expertos en gestión de reseñas',
      },
      category: 'guides',
      tags: ['respuesta-resenas', 'gestion-tiempo', 'workflow', 'herramientas-ia', 'productividad'],
      language: 'es',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 12,
      wordCount: 2800,
      seo: {
        title: 'Responder a Reseñas en 2 Minutos al Día: El Método Eficiente 2026',
        description: 'Aprende a gestionar todas tus reseñas de clientes en solo 2 minutos al día. Workflow optimizado, plantillas, herramientas IA. Guía práctica.',
        keywords: ['responder reseñas rápido', 'gestión reseñas eficiente', 'workflow reseñas clientes', 'ahorrar tiempo reseñas google', 'automatizar respuestas reseñas'],
      },
    },
  },
  // Portuguese articles
  'pt:responder-avaliacoes-negativas': {
    component: RespondNegativeReviewsPT,
    meta: {
      title: 'Como Responder a Avaliações Negativas no Google: Guia Completo',
      slug: 'responder-avaliacoes-negativas',
      description: 'Aprenda a responder a avaliações negativas de forma profissional. Exemplos concretos, erros a evitar e estratégias para proteger a sua reputação.',
      date: '2026-01-10',
      author: {
        name: 'Equipa ReplyStack',
        role: 'Especialistas em gestão de avaliações',
      },
      category: 'guides',
      tags: ['avaliacoes-negativas', 'resposta-avaliacoes', 'reputacao-online', 'atendimento-cliente'],
      language: 'pt',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 12,
      wordCount: 2800,
      seo: {
        title: 'Como Responder a Avaliações Negativas no Google: Guia Completo 2026',
        description: 'Aprenda a responder a avaliações negativas de forma profissional. Exemplos concretos, erros a evitar e estratégias para proteger a sua reputação.',
        keywords: ['avaliações negativas', 'responder avaliação google', 'reputação online', 'gestão avaliações'],
      },
    },
  },
  'pt:templates-respostas-avaliacoes': {
    component: ReviewResponseTemplatesPT,
    meta: {
      title: '20 Templates de Respostas a Avaliações de Clientes',
      slug: 'templates-respostas-avaliacoes',
      description: '20 modelos profissionais para responder a avaliações no Google, TripAdvisor, Facebook. Avaliações positivas e negativas. Copie, personalize, publique.',
      date: '2026-01-10',
      author: {
        name: 'Equipa ReplyStack',
        role: 'Especialistas em gestão de avaliações',
      },
      category: 'guides',
      tags: ['templates', 'resposta-avaliacoes', 'avaliacoes-positivas', 'avaliacoes-negativas', 'atendimento-cliente'],
      language: 'pt',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 15,
      wordCount: 3200,
      seo: {
        title: '20 Templates de Respostas a Avaliações de Clientes (Copiar e Colar) 2026',
        description: '20 modelos profissionais para responder a avaliações no Google, TripAdvisor, Facebook. Avaliações positivas e negativas. Copie, personalize, publique.',
        keywords: ['templates avaliações', 'modelos resposta', 'avaliações clientes', 'gestão avaliações'],
      },
    },
  },
  'pt:conseguir-mais-avaliacoes-google': {
    component: GetMoreGoogleReviewsPT,
    meta: {
      title: 'Como Conseguir Mais Avaliações no Google: O Guia Completo 2026',
      slug: 'conseguir-mais-avaliacoes-google',
      description: '15 estratégias comprovadas para conseguir mais avaliações no Google. QR codes, emails, SMS, timing ideal. Guia prático com modelos grátis.',
      date: '2026-01-11',
      author: {
        name: 'Equipa ReplyStack',
        role: 'Especialistas em gestão de avaliações',
      },
      category: 'guides',
      tags: ['avaliacoes-google', 'coletar-avaliacoes', 'seo-local', 'feedback-cliente', 'estrategia-avaliacoes'],
      language: 'pt',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 18,
      wordCount: 4200,
      seo: {
        title: 'Como Conseguir Mais Avaliações no Google: O Guia Completo 2026',
        description: '15 estratégias comprovadas para conseguir mais avaliações no Google. QR codes, emails, SMS, timing ideal. Guia prático com modelos grátis.',
        keywords: ['conseguir mais avaliações google', 'pedir avaliações clientes', 'aumentar avaliações google', 'coletar avaliações google', 'estratégia avaliações google'],
      },
    },
  },
  'pt:responder-avaliacoes-2-minutos-dia': {
    component: RespondReviews2MinutesPT,
    meta: {
      title: 'Responder a Avaliações em 2 Minutos por Dia: O Método Eficiente',
      slug: 'responder-avaliacoes-2-minutos-dia',
      description: 'Aprenda a gerenciar todas as suas avaliações de clientes em apenas 2 minutos por dia. Workflow otimizado, modelos, ferramentas IA. Guia prático.',
      date: '2026-01-15',
      author: {
        name: 'Equipa ReplyStack',
        role: 'Especialistas em gestão de avaliações',
      },
      category: 'guides',
      tags: ['resposta-avaliacoes', 'gestao-tempo', 'workflow', 'ferramentas-ia', 'produtividade'],
      language: 'pt',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 12,
      wordCount: 2800,
      seo: {
        title: 'Responder a Avaliações em 2 Minutos por Dia: O Método Eficiente 2026',
        description: 'Aprenda a gerenciar todas as suas avaliações de clientes em apenas 2 minutos por dia. Workflow otimizado, modelos, ferramentas IA. Guia prático.',
        keywords: ['responder avaliações rápido', 'gestão avaliações eficiente', 'workflow avaliações clientes', 'economizar tempo avaliações google', 'automatizar respostas avaliações'],
      },
    },
  },
  // Online Reputation Strategy - EN
  'en:complete-online-reputation-strategy': {
    component: OnlineReputationStrategyEN,
    meta: {
      title: 'Complete Online Reputation Strategy 2026: The Ultimate Guide',
      slug: 'complete-online-reputation-strategy',
      description: 'Build an effective online reputation strategy in 2026. Audit, monitoring, responses, KPIs. Complete guide with action plan and tools.',
      date: '2026-01-11',
      author: {
        name: 'ReplyStack Team',
        role: 'Review Management Experts',
      },
      category: 'guides',
      tags: ['online-reputation', 'reputation-management', 'review-strategy', 'brand-monitoring', 'crisis-management'],
      language: 'en',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 25,
      wordCount: 5500,
      seo: {
        title: 'Complete Online Reputation Strategy 2026: The Ultimate Guide',
        description: 'Build an effective online reputation strategy in 2026. Audit, monitoring, responses, KPIs. Complete guide with action plan and tools.',
        keywords: ['online reputation strategy', 'reputation management', 'business reputation online', 'reputation plan', 'improve online reputation'],
      },
    },
  },
  // Online Reputation Strategy - FR
  'fr:strategie-e-reputation-complete': {
    component: OnlineReputationStrategyFR,
    meta: {
      title: 'Stratégie E-réputation Complète 2026 : Le Guide Ultime',
      slug: 'strategie-e-reputation-complete',
      description: 'Construisez une stratégie e-réputation efficace en 2026. Audit, monitoring, réponses, KPIs. Guide complet avec plan d\'action et outils.',
      date: '2026-01-11',
      author: {
        name: 'Équipe ReplyStack',
        role: 'Experts en gestion d\'avis',
      },
      category: 'guides',
      tags: ['e-reputation', 'gestion-reputation', 'strategie-avis', 'veille-marque', 'gestion-crise'],
      language: 'fr',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 25,
      wordCount: 5500,
      seo: {
        title: 'Stratégie E-réputation Complète 2026 : Le Guide Ultime',
        description: 'Construisez une stratégie e-réputation efficace en 2026. Audit, monitoring, réponses, KPIs. Guide complet avec plan d\'action et outils.',
        keywords: ['stratégie e-réputation', 'gestion réputation en ligne', 'e-réputation entreprise', 'plan e-réputation', 'améliorer réputation internet'],
      },
    },
  },
  // Online Reputation Strategy - ES
  'es:estrategia-reputacion-online-completa': {
    component: OnlineReputationStrategyES,
    meta: {
      title: 'Estrategia de Reputación Online Completa 2026: La Guía Definitiva',
      slug: 'estrategia-reputacion-online-completa',
      description: 'Construye una estrategia de reputación online efectiva en 2026. Auditoría, monitoreo, respuestas, KPIs. Guía completa con plan de acción y herramientas.',
      date: '2026-01-11',
      author: {
        name: 'Equipo ReplyStack',
        role: 'Expertos en gestión de reseñas',
      },
      category: 'guides',
      tags: ['reputacion-online', 'gestion-reputacion', 'estrategia-resenas', 'vigilancia-marca', 'gestion-crisis'],
      language: 'es',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 25,
      wordCount: 5500,
      seo: {
        title: 'Estrategia de Reputación Online Completa 2026: La Guía Definitiva',
        description: 'Construye una estrategia de reputación online efectiva en 2026. Auditoría, monitoreo, respuestas, KPIs. Guía completa con plan de acción y herramientas.',
        keywords: ['estrategia reputación online', 'gestión reputación internet', 'reputación digital empresa', 'plan reputación online', 'mejorar reputación internet'],
      },
    },
  },
  // Online Reputation Strategy - PT
  'pt:estrategia-reputacao-online-completa': {
    component: OnlineReputationStrategyPT,
    meta: {
      title: 'Estratégia de Reputação Online Completa 2026: O Guia Definitivo',
      slug: 'estrategia-reputacao-online-completa',
      description: 'Construa uma estratégia de reputação online eficaz em 2026. Auditoria, monitoramento, respostas, KPIs. Guia completo com plano de ação e ferramentas.',
      date: '2026-01-11',
      author: {
        name: 'Equipa ReplyStack',
        role: 'Especialistas em gestão de avaliações',
      },
      category: 'guides',
      tags: ['reputacao-online', 'gestao-reputacao', 'estrategia-avaliacoes', 'vigilancia-marca', 'gestao-crise'],
      language: 'pt',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 25,
      wordCount: 5500,
      seo: {
        title: 'Estratégia de Reputação Online Completa 2026: O Guia Definitivo',
        description: 'Construa uma estratégia de reputação online eficaz em 2026. Auditoria, monitoramento, respostas, KPIs. Guia completo com plano de ação e ferramentas.',
        keywords: ['estratégia reputação online', 'gestão reputação internet', 'reputação digital empresa', 'plano reputação online', 'melhorar reputação internet'],
      },
    },
  },
  // Respond to Google Reviews - EN
  'en:respond-google-reviews': {
    component: RespondGoogleReviewsEN,
    meta: {
      title: 'How to Respond to Google Reviews: Complete Guide for Businesses',
      slug: 'respond-google-reviews',
      description: 'Learn how to effectively respond to Google reviews to improve your online reputation, build customer loyalty, and boost your local SEO.',
      date: '2026-01-15',
      author: {
        name: 'ReplyStack Team',
        role: 'Online Reputation Expert',
      },
      category: 'guides',
      tags: ['google-reviews', 'review-response', 'online-reputation', 'local-seo', 'review-management'],
      language: 'en',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 15,
      wordCount: 3500,
      seo: {
        title: 'How to Respond to Google Reviews: Complete Guide 2026 | ReplyStack',
        description: 'Complete guide to responding to Google reviews: templates, best practices, mistakes to avoid. Improve your online reputation and local SEO.',
        keywords: ['respond google reviews', 'google review response', 'reply to reviews', 'review management', 'local SEO'],
      },
    },
  },
  // Respond to Google Reviews - FR
  'fr:respond-google-reviews': {
    component: RespondGoogleReviewsFR,
    meta: {
      title: 'Répondre aux Avis Google : Guide Complet pour les Entreprises',
      slug: 'respond-google-reviews',
      description: 'Apprenez à répondre efficacement aux avis Google pour améliorer votre e-réputation, fidéliser vos clients et booster votre SEO local.',
      date: '2026-01-15',
      author: {
        name: 'ReplyStack Team',
        role: 'Expert en e-réputation',
      },
      category: 'guides',
      tags: ['avis-google', 'reponse-avis', 'e-reputation', 'seo-local', 'gestion-avis'],
      language: 'fr',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 15,
      wordCount: 3500,
      seo: {
        title: 'Répondre aux Avis Google : Guide Complet 2026 | ReplyStack',
        description: 'Guide complet pour répondre aux avis Google : templates, bonnes pratiques, erreurs à éviter. Améliorez votre e-réputation et votre SEO local.',
        keywords: ['répondre avis google', 'réponse avis google', 'gestion avis', 'e-réputation', 'SEO local'],
      },
    },
  },
  // Respond to Google Reviews - ES
  'es:respond-google-reviews': {
    component: RespondGoogleReviewsES,
    meta: {
      title: 'Cómo Responder a las Reseñas de Google: Guía Completa para Empresas',
      slug: 'respond-google-reviews',
      description: 'Aprende a responder eficazmente a las reseñas de Google para mejorar tu reputación online, fidelizar clientes y potenciar tu SEO local.',
      date: '2026-01-15',
      author: {
        name: 'ReplyStack Team',
        role: 'Experto en reputación online',
      },
      category: 'guides',
      tags: ['resenas-google', 'respuesta-resenas', 'reputacion-online', 'seo-local', 'gestion-resenas'],
      language: 'es',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 15,
      wordCount: 3500,
      seo: {
        title: 'Cómo Responder a las Reseñas de Google: Guía Completa 2026 | ReplyStack',
        description: 'Guía completa para responder a las reseñas de Google: plantillas, buenas prácticas, errores a evitar. Mejora tu reputación online y tu SEO local.',
        keywords: ['responder reseñas google', 'respuesta reseñas google', 'gestión reseñas', 'reputación online', 'SEO local'],
      },
    },
  },
  // Respond to Google Reviews - PT
  'pt:respond-google-reviews': {
    component: RespondGoogleReviewsPT,
    meta: {
      title: 'Como Responder às Avaliações do Google: Guia Completo para Empresas',
      slug: 'respond-google-reviews',
      description: 'Aprenda a responder eficazmente às avaliações do Google para melhorar sua reputação online, fidelizar clientes e impulsionar seu SEO local.',
      date: '2026-01-15',
      author: {
        name: 'ReplyStack Team',
        role: 'Especialista em reputação online',
      },
      category: 'guides',
      tags: ['avaliacoes-google', 'resposta-avaliacoes', 'reputacao-online', 'seo-local', 'gestao-avaliacoes'],
      language: 'pt',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 15,
      wordCount: 3500,
      seo: {
        title: 'Como Responder às Avaliações do Google: Guia Completo 2026 | ReplyStack',
        description: 'Guia completo para responder às avaliações do Google: templates, boas práticas, erros a evitar. Melhore sua reputação online e seu SEO local.',
        keywords: ['responder avaliações google', 'resposta avaliações google', 'gestão avaliações', 'reputação online', 'SEO local'],
      },
    },
  },
  // Reviews Boost Local SEO - EN
  'en:reviews-boost-local-seo': {
    component: ReviewsBoostLocalSeoEN,
    meta: {
      title: 'How Google Reviews Boost Your Local SEO: Complete Guide',
      slug: 'reviews-boost-local-seo',
      description: 'Discover how Google reviews improve your local SEO ranking, increase visibility, and attract more customers to your business.',
      date: '2026-01-15',
      author: {
        name: 'ReplyStack Team',
        role: 'Local SEO Expert',
      },
      category: 'guides',
      tags: ['local-seo', 'google-reviews', 'local-ranking', 'google-visibility', 'google-business'],
      language: 'en',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 14,
      wordCount: 3200,
      seo: {
        title: 'How Google Reviews Boost Your Local SEO | ReplyStack',
        description: 'Complete guide on Google reviews impact on local SEO: ranking factors, best practices, and strategies to improve your visibility.',
        keywords: ['reviews local seo', 'google reviews seo', 'local pack ranking', 'local search optimization', 'reviews impact seo'],
      },
    },
  },
  // Reviews Boost Local SEO - FR
  'fr:reviews-boost-local-seo': {
    component: ReviewsBoostLocalSeoFR,
    meta: {
      title: 'Comment les Avis Google Boostent votre SEO Local : Guide Complet',
      slug: 'reviews-boost-local-seo',
      description: 'Découvrez comment les avis Google améliorent votre référencement local, augmentent votre visibilité et attirent plus de clients dans votre établissement.',
      date: '2026-01-15',
      author: {
        name: 'ReplyStack Team',
        role: 'Expert en SEO local',
      },
      category: 'guides',
      tags: ['seo-local', 'avis-google', 'referencement-local', 'visibilite-google', 'google-business'],
      language: 'fr',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 14,
      wordCount: 3200,
      seo: {
        title: 'Comment les Avis Google Boostent votre SEO Local | ReplyStack',
        description: 'Guide complet sur l\'impact des avis Google sur votre SEO local : facteurs de classement, bonnes pratiques et stratégies pour améliorer votre visibilité.',
        keywords: ['avis google seo', 'seo local avis', 'local pack google', 'référencement local', 'impact avis seo'],
      },
    },
  },
  // Reviews Boost Local SEO - ES
  'es:reviews-boost-local-seo': {
    component: ReviewsBoostLocalSeoES,
    meta: {
      title: 'Cómo las Reseñas de Google Impulsan tu SEO Local: Guía Completa',
      slug: 'reviews-boost-local-seo',
      description: 'Descubre cómo las reseñas de Google mejoran tu posicionamiento local, aumentan tu visibilidad y atraen más clientes a tu negocio.',
      date: '2026-01-15',
      author: {
        name: 'ReplyStack Team',
        role: 'Experto en SEO local',
      },
      category: 'guides',
      tags: ['seo-local', 'resenas-google', 'posicionamiento-local', 'visibilidad-google', 'google-business'],
      language: 'es',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 14,
      wordCount: 3200,
      seo: {
        title: 'Cómo las Reseñas de Google Impulsan tu SEO Local | ReplyStack',
        description: 'Guía completa sobre el impacto de las reseñas de Google en tu SEO local: factores de clasificación, buenas prácticas y estrategias para mejorar tu visibilidad.',
        keywords: ['reseñas google seo', 'seo local reseñas', 'local pack google', 'posicionamiento local', 'impacto reseñas seo'],
      },
    },
  },
  // Reviews Boost Local SEO - PT
  'pt:reviews-boost-local-seo': {
    component: ReviewsBoostLocalSeoPT,
    meta: {
      title: 'Como as Avaliações do Google Impulsionam seu SEO Local: Guia Completo',
      slug: 'reviews-boost-local-seo',
      description: 'Descubra como as avaliações do Google melhoram seu posicionamento local, aumentam sua visibilidade e atraem mais clientes para seu negócio.',
      date: '2026-01-15',
      author: {
        name: 'ReplyStack Team',
        role: 'Especialista em SEO local',
      },
      category: 'guides',
      tags: ['seo-local', 'avaliacoes-google', 'posicionamento-local', 'visibilidade-google', 'google-business'],
      language: 'pt',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 14,
      wordCount: 3200,
      seo: {
        title: 'Como as Avaliações do Google Impulsionam seu SEO Local | ReplyStack',
        description: 'Guia completo sobre o impacto das avaliações do Google no seu SEO local: fatores de classificação, boas práticas e estratégias para melhorar sua visibilidade.',
        keywords: ['avaliações google seo', 'seo local avaliações', 'local pack google', 'posicionamento local', 'impacto avaliações seo'],
      },
    },
  },
  // Get More 5-Star Reviews - EN
  'en:get-more-5-star-reviews': {
    component: GetMore5StarReviewsEN,
    meta: {
      title: 'How to Get More 5-Star Google Reviews: Proven Strategies',
      slug: 'get-more-5-star-reviews',
      description: 'Discover the best strategies to get more 5-star Google reviews. Ethical techniques, optimal timing, and effective request scripts.',
      date: '2026-01-15',
      author: {
        name: 'ReplyStack Team',
        role: 'Online Reputation Expert',
      },
      category: 'guides',
      tags: ['5-star-reviews', 'google-reviews', 'online-reputation', 'customer-satisfaction', 'google-business'],
      language: 'en',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 16,
      wordCount: 3800,
      seo: {
        title: 'How to Get More 5-Star Google Reviews | ReplyStack',
        description: 'Complete guide to getting more 5-star reviews: optimal timing, request techniques, and strategies to turn satisfied customers into ambassadors.',
        keywords: ['get 5 star reviews', 'more positive reviews', 'increase review rating', 'customer reviews strategy', 'ask for reviews'],
      },
    },
  },
  // Get More 5-Star Reviews - FR
  'fr:get-more-5-star-reviews': {
    component: GetMore5StarReviewsFR,
    meta: {
      title: 'Comment Obtenir Plus d\'Avis 5 Étoiles sur Google : Stratégies Éprouvées',
      slug: 'get-more-5-star-reviews',
      description: 'Découvrez les meilleures stratégies pour obtenir plus d\'avis 5 étoiles sur Google. Techniques éthiques, timing optimal et scripts de demande efficaces.',
      date: '2026-01-15',
      author: {
        name: 'ReplyStack Team',
        role: 'Expert en e-réputation',
      },
      category: 'guides',
      tags: ['avis-5-etoiles', 'avis-google', 'reputation-en-ligne', 'satisfaction-client', 'google-business'],
      language: 'fr',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 16,
      wordCount: 3800,
      seo: {
        title: 'Comment Obtenir Plus d\'Avis 5 Étoiles sur Google | ReplyStack',
        description: 'Guide complet pour obtenir plus d\'avis 5 étoiles : timing optimal, techniques de demande, et stratégies pour transformer vos clients satisfaits en ambassadeurs.',
        keywords: ['obtenir avis 5 étoiles', 'plus avis positifs', 'augmenter note google', 'stratégie avis clients', 'demander avis'],
      },
    },
  },
  // Get More 5-Star Reviews - ES
  'es:get-more-5-star-reviews': {
    component: GetMore5StarReviewsES,
    meta: {
      title: 'Cómo Conseguir Más Reseñas de 5 Estrellas en Google: Estrategias Probadas',
      slug: 'get-more-5-star-reviews',
      description: 'Descubre las mejores estrategias para conseguir más reseñas de 5 estrellas en Google. Técnicas éticas, timing óptimo y scripts de solicitud efectivos.',
      date: '2026-01-15',
      author: {
        name: 'ReplyStack Team',
        role: 'Experto en reputación online',
      },
      category: 'guides',
      tags: ['resenas-5-estrellas', 'resenas-google', 'reputacion-online', 'satisfaccion-cliente', 'google-business'],
      language: 'es',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 16,
      wordCount: 3800,
      seo: {
        title: 'Cómo Conseguir Más Reseñas de 5 Estrellas en Google | ReplyStack',
        description: 'Guía completa para conseguir más reseñas de 5 estrellas: timing óptimo, técnicas de solicitud y estrategias para convertir clientes satisfechos en embajadores.',
        keywords: ['conseguir reseñas 5 estrellas', 'más reseñas positivas', 'aumentar valoración google', 'estrategia reseñas clientes', 'pedir reseñas'],
      },
    },
  },
  // Get More 5-Star Reviews - PT
  'pt:get-more-5-star-reviews': {
    component: GetMore5StarReviewsPT,
    meta: {
      title: 'Como Conseguir Mais Avaliações de 5 Estrelas no Google: Estratégias Comprovadas',
      slug: 'get-more-5-star-reviews',
      description: 'Descubra as melhores estratégias para conseguir mais avaliações de 5 estrelas no Google. Técnicas éticas, timing ideal e scripts de solicitação eficazes.',
      date: '2026-01-15',
      author: {
        name: 'ReplyStack Team',
        role: 'Especialista em reputação online',
      },
      category: 'guides',
      tags: ['avaliacoes-5-estrelas', 'avaliacoes-google', 'reputacao-online', 'satisfacao-cliente', 'google-business'],
      language: 'pt',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 16,
      wordCount: 3800,
      seo: {
        title: 'Como Conseguir Mais Avaliações de 5 Estrelas no Google | ReplyStack',
        description: 'Guia completo para conseguir mais avaliações de 5 estrelas: timing ideal, técnicas de solicitação e estratégias para transformar clientes satisfeitos em embaixadores.',
        keywords: ['conseguir avaliações 5 estrelas', 'mais avaliações positivas', 'aumentar nota google', 'estratégia avaliações clientes', 'pedir avaliações'],
      },
    },
  },
  // Reputation Artisans - EN
  'en:reputation-artisans': {
    component: ReputationArtisansEN,
    meta: {
      title: 'Online Reputation for Contractors: The Complete 2026 Guide',
      slug: 'reputation-artisans',
      description: 'Online reputation guide for contractors, plumbers, electricians, carpenters. How to get Google reviews, respond to customers, and grow your business.',
      date: '2026-01-15',
      author: {
        name: 'ReplyStack Team',
        role: 'Online Reputation Expert',
      },
      category: 'guides',
      tags: ['contractor-reviews', 'plumber-reputation', 'google-reviews-contractor', 'online-reputation', 'electrician-reviews'],
      language: 'en',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 18,
      wordCount: 4200,
      seo: {
        title: 'Online Reputation for Contractors: The Complete 2026 Guide | ReplyStack',
        description: 'Online reputation guide for contractors, plumbers, electricians, carpenters. How to get Google reviews, respond to customers, and grow your business.',
        keywords: ['contractor reviews', 'plumber reputation', 'google reviews contractor', 'online reputation contractor', 'electrician reviews'],
      },
    },
  },
  // Reputation Artisans - FR
  'fr:reputation-artisans': {
    component: ReputationArtisansFR,
    meta: {
      title: 'Réputation en Ligne pour Artisans : Le Guide Complet 2026',
      slug: 'reputation-artisans',
      description: 'Guide e-réputation pour artisans, plombiers, électriciens, menuisiers. Comment obtenir des avis Google, répondre aux clients, développer votre activité.',
      date: '2026-01-15',
      author: {
        name: 'ReplyStack Team',
        role: 'Expert en e-réputation',
      },
      category: 'guides',
      tags: ['avis-artisan', 'reputation-plombier', 'avis-google-artisan', 'e-reputation-artisan', 'avis-electricien'],
      language: 'fr',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 18,
      wordCount: 4200,
      seo: {
        title: 'Réputation en Ligne pour Artisans : Le Guide Complet 2026 | ReplyStack',
        description: 'Guide e-réputation pour artisans, plombiers, électriciens, menuisiers. Comment obtenir des avis Google, répondre aux clients, développer votre activité.',
        keywords: ['avis artisan', 'reputation plombier', 'avis google artisan', 'e-réputation artisan', 'avis electricien'],
      },
    },
  },
  // Reputation Artisans - ES
  'es:reputation-artisans': {
    component: ReputationArtisansES,
    meta: {
      title: 'Reputación Online para Profesionales: La Guía Completa 2026',
      slug: 'reputation-artisans',
      description: 'Guía de e-reputación para profesionales, fontaneros, electricistas, carpinteros. Cómo conseguir reseñas en Google, responder a clientes y hacer crecer tu negocio.',
      date: '2026-01-15',
      author: {
        name: 'ReplyStack Team',
        role: 'Experto en reputación online',
      },
      category: 'guides',
      tags: ['resenas-profesionales', 'reputacion-fontanero', 'resenas-google-profesional', 'e-reputacion-profesional', 'resenas-electricista'],
      language: 'es',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 18,
      wordCount: 4200,
      seo: {
        title: 'Reputación Online para Profesionales: La Guía Completa 2026 | ReplyStack',
        description: 'Guía de e-reputación para profesionales, fontaneros, electricistas, carpinteros. Cómo conseguir reseñas en Google, responder a clientes y hacer crecer tu negocio.',
        keywords: ['reseñas profesionales', 'reputación fontanero', 'reseñas google profesional', 'e-reputación profesional', 'reseñas electricista'],
      },
    },
  },
  // Reputation Artisans - PT
  'pt:reputation-artisans': {
    component: ReputationArtisansPT,
    meta: {
      title: 'Reputação Online para Profissionais de Serviços: O Guia Completo 2026',
      slug: 'reputation-artisans',
      description: 'Guia de e-reputação para profissionais de serviços, encanadores, eletricistas, carpinteiros. Como conseguir avaliações no Google, responder clientes e crescer seu negócio.',
      date: '2026-01-15',
      author: {
        name: 'ReplyStack Team',
        role: 'Especialista em reputação online',
      },
      category: 'guides',
      tags: ['avaliacoes-profissionais', 'reputacao-encanador', 'avaliacoes-google-profissional', 'e-reputacao-profissional', 'avaliacoes-eletricista'],
      language: 'pt',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 18,
      wordCount: 4200,
      seo: {
        title: 'Reputação Online para Profissionais de Serviços: O Guia Completo 2026 | ReplyStack',
        description: 'Guia de e-reputação para profissionais de serviços, encanadores, eletricistas, carpinteiros. Como conseguir avaliações no Google, responder clientes e crescer seu negócio.',
        keywords: ['avaliações profissionais', 'reputação encanador', 'avaliações google profissional', 'e-reputação profissional', 'avaliações eletricista'],
      },
    },
  },
  // E-commerce Negative Reviews - EN
  'en:ecommerce-negative-reviews': {
    component: EcommerceNegativeReviewsEN,
    meta: {
      title: 'E-commerce: Turn Negative Reviews Into Sales Opportunities',
      slug: 'ecommerce-negative-reviews',
      description: 'Complete guide for e-commerce: how to respond to negative reviews to increase conversions. Amazon, Google, product reviews. Strategies + templates.',
      date: '2026-01-15',
      author: {
        name: 'ReplyStack Team',
        role: 'Online Reputation Expert',
      },
      category: 'guides',
      tags: ['ecommerce-reviews', 'negative-reviews', 'amazon-reviews', 'product-reviews', 'ecommerce-reputation'],
      language: 'en',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 20,
      wordCount: 4500,
      seo: {
        title: 'E-commerce: Turn Negative Reviews Into Sales Opportunities | ReplyStack',
        description: 'Complete guide for e-commerce: how to respond to negative reviews to increase conversions. Amazon, Google, product reviews.',
        keywords: ['ecommerce negative reviews', 'respond amazon reviews', 'negative product reviews', 'ecommerce review management', 'ecommerce reputation'],
      },
    },
  },
  // E-commerce Negative Reviews - FR
  'fr:ecommerce-negative-reviews': {
    component: EcommerceNegativeReviewsFR,
    meta: {
      title: 'E-commerce : Transformez les Avis Négatifs en Opportunités de Vente',
      slug: 'ecommerce-negative-reviews',
      description: 'Guide complet pour e-commerce : comment répondre aux avis négatifs pour augmenter vos conversions. Amazon, Google, avis produits. Stratégies + templates.',
      date: '2026-01-15',
      author: {
        name: 'ReplyStack Team',
        role: 'Expert en e-réputation',
      },
      category: 'guides',
      tags: ['avis-ecommerce', 'avis-negatifs', 'avis-amazon', 'avis-produits', 'reputation-ecommerce'],
      language: 'fr',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 20,
      wordCount: 4500,
      seo: {
        title: 'E-commerce : Transformez les Avis Négatifs en Opportunités de Vente | ReplyStack',
        description: 'Guide complet pour e-commerce : comment répondre aux avis négatifs pour augmenter vos conversions. Amazon, Google, avis produits.',
        keywords: ['avis négatifs ecommerce', 'répondre avis amazon', 'avis produits négatifs', 'gestion avis ecommerce', 'réputation ecommerce'],
      },
    },
  },
  // E-commerce Negative Reviews - ES
  'es:ecommerce-negative-reviews': {
    component: EcommerceNegativeReviewsES,
    meta: {
      title: 'E-commerce: Transforma Reseñas Negativas en Oportunidades de Venta',
      slug: 'ecommerce-negative-reviews',
      description: 'Guía completa para e-commerce: cómo responder a reseñas negativas para aumentar conversiones. Amazon, Google, reseñas de productos. Estrategias + plantillas.',
      date: '2026-01-15',
      author: {
        name: 'ReplyStack Team',
        role: 'Experto en reputación online',
      },
      category: 'guides',
      tags: ['resenas-ecommerce', 'resenas-negativas', 'resenas-amazon', 'resenas-productos', 'reputacion-ecommerce'],
      language: 'es',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 20,
      wordCount: 4500,
      seo: {
        title: 'E-commerce: Transforma Reseñas Negativas en Oportunidades de Venta | ReplyStack',
        description: 'Guía completa para e-commerce: cómo responder a reseñas negativas para aumentar conversiones. Amazon, Google, reseñas de productos.',
        keywords: ['reseñas negativas ecommerce', 'responder reseñas amazon', 'reseñas productos negativas', 'gestión reseñas ecommerce', 'reputación ecommerce'],
      },
    },
  },
  // E-commerce Negative Reviews - PT
  'pt:ecommerce-negative-reviews': {
    component: EcommerceNegativeReviewsPT,
    meta: {
      title: 'E-commerce: Transforme Avaliações Negativas em Oportunidades de Venda',
      slug: 'ecommerce-negative-reviews',
      description: 'Guia completo para e-commerce: como responder a avaliações negativas para aumentar conversões. Amazon, Google, avaliações de produtos. Estratégias + templates.',
      date: '2026-01-15',
      author: {
        name: 'ReplyStack Team',
        role: 'Especialista em reputação online',
      },
      category: 'guides',
      tags: ['avaliacoes-ecommerce', 'avaliacoes-negativas', 'avaliacoes-amazon', 'avaliacoes-produtos', 'reputacao-ecommerce'],
      language: 'pt',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 20,
      wordCount: 4500,
      seo: {
        title: 'E-commerce: Transforme Avaliações Negativas em Oportunidades de Venda | ReplyStack',
        description: 'Guia completo para e-commerce: como responder a avaliações negativas para aumentar conversões. Amazon, Google, avaliações de produtos.',
        keywords: ['avaliações negativas ecommerce', 'responder avaliações amazon', 'avaliações produtos negativas', 'gestão avaliações ecommerce', 'reputação ecommerce'],
      },
    },
  },
  // Auto Repair Reputation - EN
  'en:auto-repair-reputation': {
    component: AutoRepairReputationEN,
    meta: {
      title: 'Auto Repair Shop Reputation: The Complete Guide to Getting More Reviews',
      slug: 'auto-repair-reputation',
      description: 'Reputation guide for auto repair shops, mechanics, body shops. How to get Google reviews, respond to customers, grow your customer base.',
      date: '2026-01-15',
      author: {
        name: 'ReplyStack Team',
        role: 'Online Reputation Expert',
      },
      category: 'guides',
      tags: ['auto-repair-reviews', 'mechanic-reputation', 'google-reviews-garage', 'auto-shop-reputation', 'car-repair-reviews'],
      language: 'en',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 18,
      wordCount: 4200,
      seo: {
        title: 'Auto Repair Shop Reputation: The Complete Guide to Getting More Reviews | ReplyStack',
        description: 'Reputation guide for auto repair shops, mechanics, body shops. How to get Google reviews, respond to customers, grow your customer base.',
        keywords: ['auto repair reviews', 'mechanic reputation', 'google reviews garage', 'auto shop e-reputation', 'car repair reviews'],
      },
    },
  },
  // Auto Repair Reputation - FR
  'fr:auto-repair-reputation': {
    component: AutoRepairReputationFR,
    meta: {
      title: 'E-Réputation Garage Auto : Le Guide Complet pour Obtenir Plus d\'Avis',
      slug: 'auto-repair-reputation',
      description: 'Guide e-réputation pour garages automobiles, mécaniciens, carrossiers. Comment obtenir des avis Google, répondre aux clients, développer votre clientèle.',
      date: '2026-01-15',
      author: {
        name: 'ReplyStack Team',
        role: 'Expert en e-réputation',
      },
      category: 'guides',
      tags: ['avis-garage', 'reputation-garagiste', 'avis-google-garage', 'e-reputation-garage-automobile', 'avis-mecanicien'],
      language: 'fr',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 18,
      wordCount: 4200,
      seo: {
        title: 'E-Réputation Garage Auto : Le Guide Complet pour Obtenir Plus d\'Avis | ReplyStack',
        description: 'Guide e-réputation pour garages automobiles, mécaniciens, carrossiers. Comment obtenir des avis Google, répondre aux clients, développer votre clientèle.',
        keywords: ['avis garage', 'reputation garagiste', 'avis google garage', 'e-réputation garage automobile', 'avis mécanicien'],
      },
    },
  },
  // Auto Repair Reputation - ES
  'es:auto-repair-reputation': {
    component: AutoRepairReputationES,
    meta: {
      title: 'Reputación Online para Talleres Mecánicos: Guía Completa para Obtener Más Reseñas',
      slug: 'auto-repair-reputation',
      description: 'Guía de reputación para talleres mecánicos, mecánicos, carrocerías. Cómo conseguir reseñas Google, responder a clientes, hacer crecer tu negocio.',
      date: '2026-01-15',
      author: {
        name: 'ReplyStack Team',
        role: 'Experto en reputación online',
      },
      category: 'guides',
      tags: ['resenas-taller', 'reputacion-mecanico', 'resenas-google-taller', 'e-reputacion-taller-mecanico', 'opiniones-mecanico'],
      language: 'es',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 18,
      wordCount: 4200,
      seo: {
        title: 'Reputación Online para Talleres Mecánicos: Guía Completa para Obtener Más Reseñas | ReplyStack',
        description: 'Guía de reputación para talleres mecánicos, mecánicos, carrocerías. Cómo conseguir reseñas Google, responder a clientes, hacer crecer tu negocio.',
        keywords: ['reseñas taller', 'reputación mecánico', 'reseñas google taller', 'e-reputación taller mecánico', 'opiniones mecánico'],
      },
    },
  },
  // Auto Repair Reputation - PT
  'pt:auto-repair-reputation': {
    component: AutoRepairReputationPT,
    meta: {
      title: 'Reputação Online para Oficinas Mecânicas: Guia Completo para Obter Mais Avaliações',
      slug: 'auto-repair-reputation',
      description: 'Guia de reputação para oficinas mecânicas, mecânicos, funilarias. Como conseguir avaliações Google, responder a clientes, fazer crescer seu negócio.',
      date: '2026-01-15',
      author: {
        name: 'ReplyStack Team',
        role: 'Especialista em reputação online',
      },
      category: 'guides',
      tags: ['avaliacoes-oficina', 'reputacao-mecanico', 'avaliacoes-google-oficina', 'e-reputacao-oficina-mecanica', 'opinioes-mecanico'],
      language: 'pt',
      availableLanguages: ['en', 'fr', 'es', 'pt'],
      readingTime: 18,
      wordCount: 4200,
      seo: {
        title: 'Reputação Online para Oficinas Mecânicas: Guia Completo para Obter Mais Avaliações | ReplyStack',
        description: 'Guia de reputação para oficinas mecânicas, mecânicos, funilarias. Como conseguir avaliações Google, responder a clientes, fazer crescer seu negócio.',
        keywords: ['avaliações oficina', 'reputação mecânico', 'avaliações google oficina', 'e-reputação oficina mecânica', 'opiniões mecânico'],
      },
    },
  },
};

// Extract posts data from registry
const postsData: BlogPostMeta[] = Object.values(blogPosts).map((post) => post.meta);

// Store posts by language
const postsByLanguage: Record<SupportedBlogLanguage, BlogPostMeta[]> = {
  en: [],
  fr: [],
  es: [],
  pt: [],
};

// Initialize posts by language
postsData.forEach((post) => {
  if (postsByLanguage[post.language]) {
    postsByLanguage[post.language].push(post);
  }
});

/**
 * Get all posts for a language
 */
export function getAllPosts(language: SupportedBlogLanguage): BlogPostMeta[] {
  return sortPostsByDate(postsByLanguage[language] || []);
}

/**
 * Get a single post by slug
 */
export function getPostBySlug(
  slug: string,
  language: SupportedBlogLanguage
): BlogPostMeta | undefined {
  return postsByLanguage[language]?.find((post) => post.slug === slug);
}

/**
 * Get posts with filters and pagination
 */
export function getPosts(options: {
  language: SupportedBlogLanguage;
  category?: BlogCategory;
  tag?: string;
  page?: number;
  perPage?: number;
}): {
  posts: BlogPostMeta[];
  totalPages: number;
  totalPosts: number;
} {
  const { language, category, tag, page = 1, perPage = 12 } = options;

  let posts = getAllPosts(language);

  // Apply filters
  posts = filterByCategory(posts, category);
  posts = filterByTag(posts, tag);

  const totalPosts = posts.length;

  // Paginate
  const { posts: paginatedPosts, totalPages } = paginatePosts(posts, page, perPage);

  return {
    posts: paginatedPosts,
    totalPages,
    totalPosts,
  };
}

/**
 * Get all unique tags
 */
export function getAllTags(language: SupportedBlogLanguage): string[] {
  const posts = getAllPosts(language);
  const tags = new Set<string>();
  posts.forEach((post) => post.tags.forEach((tag) => tags.add(tag)));
  return Array.from(tags).sort();
}

/**
 * Get all categories with post counts
 */
export function getCategoriesWithCounts(
  language: SupportedBlogLanguage
): Record<BlogCategory, number> {
  const posts = getAllPosts(language);
  const counts: Record<BlogCategory, number> = {
    guides: 0,
    tips: 0,
    'case-studies': 0,
    news: 0,
    'product-updates': 0,
  };

  posts.forEach((post) => {
    if (counts[post.category] !== undefined) {
      counts[post.category]++;
    }
  });

  return counts;
}

/**
 * Register a new post (called during build/import)
 */
export function registerPost(post: BlogPostMeta): void {
  if (!postsByLanguage[post.language]) {
    postsByLanguage[post.language] = [];
  }
  // Avoid duplicates
  const existing = postsByLanguage[post.language].findIndex(
    (p) => p.slug === post.slug
  );
  if (existing === -1) {
    postsByLanguage[post.language].push(post);
  } else {
    postsByLanguage[post.language][existing] = post;
  }
}

/**
 * Check if any posts exist
 */
export function hasPosts(language: SupportedBlogLanguage): boolean {
  return (postsByLanguage[language]?.length || 0) > 0;
}

/**
 * Get post content component
 */
export function getPostContent(
  slug: string,
  language: SupportedBlogLanguage
): ComponentType | undefined {
  const key = `${language}:${slug}`;
  return blogPosts[key]?.component;
}

/**
 * Get full post with content component
 * Handles cross-language slug lookup (e.g., finding French article when URL has English slug)
 */
export function getFullPost(
  slug: string,
  language: SupportedBlogLanguage
): { meta: BlogPostMeta; component: ComponentType } | undefined {
  // First, try exact match with language:slug
  const key = `${language}:${slug}`;
  const post = blogPosts[key];
  if (post) return { meta: post.meta, component: post.component };

  // If not found, search for any post with this slug in any language
  // then find the equivalent post in the requested language
  const matchingEntry = Object.entries(blogPosts).find(
    ([, entry]) => entry.meta.slug === slug
  );

  if (matchingEntry) {
    const [, foundPost] = matchingEntry;
    // If the found post is in the same language family (has same availableLanguages)
    // try to find the equivalent in the requested language
    if (foundPost.meta.availableLanguages.includes(language)) {
      // Search for a post in the requested language that shares the same availableLanguages
      // (indicating they are translations of each other)
      const translatedPost = Object.values(blogPosts).find(
        (entry) =>
          entry.meta.language === language &&
          entry.meta.availableLanguages.join(',') ===
            foundPost.meta.availableLanguages.join(',') &&
          entry.meta.category === foundPost.meta.category &&
          entry.meta.date === foundPost.meta.date
      );
      if (translatedPost) {
        return { meta: translatedPost.meta, component: translatedPost.component };
      }
    }
  }

  return undefined;
}

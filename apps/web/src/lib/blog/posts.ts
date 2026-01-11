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

// Import blog articles - Guides FR
import RespondNegativeReviewsFR from '@/content/blog/guides/respond-negative-reviews/index.fr.mdx';
import ReviewResponseTemplatesFR from '@/content/blog/guides/review-response-templates/index.fr.mdx';
import GetMoreGoogleReviewsFR from '@/content/blog/guides/get-more-google-reviews/index.fr.mdx';
import OnlineReputationStrategyFR from '@/content/blog/guides/online-reputation-strategy/index.fr.mdx';

// Import blog articles - Guides ES
import RespondNegativeReviewsES from '@/content/blog/guides/respond-negative-reviews/index.es.mdx';
import ReviewResponseTemplatesES from '@/content/blog/guides/review-response-templates/index.es.mdx';
import GetMoreGoogleReviewsES from '@/content/blog/guides/get-more-google-reviews/index.es.mdx';
import OnlineReputationStrategyES from '@/content/blog/guides/online-reputation-strategy/index.es.mdx';

// Import blog articles - Guides PT
import RespondNegativeReviewsPT from '@/content/blog/guides/respond-negative-reviews/index.pt.mdx';
import ReviewResponseTemplatesPT from '@/content/blog/guides/review-response-templates/index.pt.mdx';
import GetMoreGoogleReviewsPT from '@/content/blog/guides/get-more-google-reviews/index.pt.mdx';
import OnlineReputationStrategyPT from '@/content/blog/guides/online-reputation-strategy/index.pt.mdx';

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

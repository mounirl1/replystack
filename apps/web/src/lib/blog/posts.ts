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

// Import blog articles - Guides FR
import RespondNegativeReviewsFR from '@/content/blog/guides/respond-negative-reviews/index.fr.mdx';
import ReviewResponseTemplatesFR from '@/content/blog/guides/review-response-templates/index.fr.mdx';

// Import blog articles - Guides ES
import RespondNegativeReviewsES from '@/content/blog/guides/respond-negative-reviews/index.es.mdx';
import ReviewResponseTemplatesES from '@/content/blog/guides/review-response-templates/index.es.mdx';

// Import blog articles - Guides PT
import RespondNegativeReviewsPT from '@/content/blog/guides/respond-negative-reviews/index.pt.mdx';
import ReviewResponseTemplatesPT from '@/content/blog/guides/review-response-templates/index.pt.mdx';

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
 */
export function getFullPost(
  slug: string,
  language: SupportedBlogLanguage
): { meta: BlogPostMeta; component: ComponentType } | undefined {
  const key = `${language}:${slug}`;
  const post = blogPosts[key];
  if (!post) return undefined;
  return { meta: post.meta, component: post.component };
}

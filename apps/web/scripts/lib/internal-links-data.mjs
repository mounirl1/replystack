/**
 * Internal linking data for SEO silo structure.
 *
 * Silos group related articles. Each silo has an optional pillar (cornerstone)
 * article and cluster articles that link to/from the pillar.
 */

export const silos = {
  'review-response': {
    pillar: 'respond-negative-reviews',
    cluster: [
      'review-response-templates',
      'respond-google-reviews',
      'respond-reviews-2-minutes-day',
    ],
  },
  'review-collection': {
    pillar: 'get-more-google-reviews',
    cluster: [
      'get-more-5-star-reviews',
    ],
  },
  'reputation-strategy': {
    pillar: 'online-reputation-strategy',
    cluster: [],
  },
  'seo-reviews': {
    pillar: 'reviews-boost-local-seo',
    cluster: [],
  },
  'industry-guides': {
    pillar: null,
    cluster: [
      'reputation-artisans',
      'ecommerce-negative-reviews',
      'auto-repair-reputation',
      'healthcare-reviews',
      'beauty-salon-reputation',
    ],
  },
};

/**
 * Related silos: which silos should cross-link.
 */
export const relatedSilos = {
  'review-response': ['review-collection', 'reputation-strategy'],
  'review-collection': ['review-response', 'seo-reviews'],
  'reputation-strategy': ['review-response', 'seo-reviews', 'industry-guides'],
  'seo-reviews': ['review-collection', 'reputation-strategy'],
  'industry-guides': ['review-response', 'reputation-strategy'],
};

/**
 * Anchor texts by slug, per language, per type.
 * Types: exact, partial, generic, branded
 */
export const anchorTexts = {
  'respond-negative-reviews': {
    en: {
      exact: ['respond to negative reviews', 'responding to negative reviews'],
      partial: ['handle negative reviews', 'dealing with bad reviews', 'negative review response'],
      generic: ['our complete guide', 'this guide'],
      branded: ['ReplyStack guide to negative reviews'],
    },
    fr: {
      exact: ['répondre aux avis négatifs', 'réponse aux avis négatifs'],
      partial: ['gérer les avis négatifs', 'faire face aux mauvais avis'],
      generic: ['notre guide complet', 'ce guide'],
      branded: ['le guide ReplyStack'],
    },
    es: {
      exact: ['responder a reseñas negativas', 'respuesta a reseñas negativas'],
      partial: ['gestionar reseñas negativas', 'lidiar con malas reseñas'],
      generic: ['nuestra guía completa', 'esta guía'],
      branded: ['la guía ReplyStack'],
    },
    pt: {
      exact: ['responder a avaliações negativas', 'resposta a avaliações negativas'],
      partial: ['lidar com avaliações negativas', 'gerenciar avaliações ruins'],
      generic: ['nosso guia completo', 'este guia'],
      branded: ['o guia ReplyStack'],
    },
  },
  'review-response-templates': {
    en: {
      exact: ['review response templates', 'response templates'],
      partial: ['ready-to-use templates', 'review reply templates'],
      generic: ['our templates', 'these templates'],
      branded: ['ReplyStack templates'],
    },
    fr: {
      exact: ['modèles de réponse aux avis', 'templates de réponse'],
      partial: ['modèles prêts à l\'emploi', 'exemples de réponse'],
      generic: ['nos modèles', 'ces templates'],
      branded: ['les templates ReplyStack'],
    },
    es: {
      exact: ['plantillas de respuesta a reseñas', 'plantillas de respuesta'],
      partial: ['plantillas listas para usar', 'ejemplos de respuesta'],
      generic: ['nuestras plantillas', 'estas plantillas'],
      branded: ['las plantillas ReplyStack'],
    },
    pt: {
      exact: ['modelos de resposta a avaliações', 'modelos de resposta'],
      partial: ['modelos prontos para usar', 'exemplos de resposta'],
      generic: ['nossos modelos', 'estes modelos'],
      branded: ['os modelos ReplyStack'],
    },
  },
  'respond-google-reviews': {
    en: {
      exact: ['respond to Google reviews', 'responding to Google reviews'],
      partial: ['Google review response', 'reply to Google reviews'],
      generic: ['our Google reviews guide', 'this article'],
      branded: ['ReplyStack Google reviews guide'],
    },
    fr: {
      exact: ['répondre aux avis Google', 'réponse aux avis Google'],
      partial: ['avis Google', 'gérer les avis Google'],
      generic: ['notre guide Google', 'cet article'],
      branded: ['le guide Google ReplyStack'],
    },
    es: {
      exact: ['responder a reseñas de Google', 'respuesta a reseñas Google'],
      partial: ['reseñas de Google', 'gestionar reseñas Google'],
      generic: ['nuestra guía de Google', 'este artículo'],
      branded: ['la guía Google de ReplyStack'],
    },
    pt: {
      exact: ['responder a avaliações do Google', 'resposta a avaliações Google'],
      partial: ['avaliações do Google', 'gerenciar avaliações Google'],
      generic: ['nosso guia do Google', 'este artigo'],
      branded: ['o guia Google do ReplyStack'],
    },
  },
  'respond-reviews-2-minutes-day': {
    en: {
      exact: ['respond to reviews in 2 minutes', 'reply to reviews quickly'],
      partial: ['save time on reviews', 'efficient review responses'],
      generic: ['our productivity guide', 'this method'],
      branded: ['the ReplyStack method'],
    },
    fr: {
      exact: ['répondre aux avis en 2 minutes', 'répondre rapidement aux avis'],
      partial: ['gagner du temps sur les avis', 'réponses efficaces'],
      generic: ['notre guide productivité', 'cette méthode'],
      branded: ['la méthode ReplyStack'],
    },
    es: {
      exact: ['responder reseñas en 2 minutos', 'responder rápido a reseñas'],
      partial: ['ahorrar tiempo en reseñas', 'respuestas eficientes'],
      generic: ['nuestra guía de productividad', 'este método'],
      branded: ['el método ReplyStack'],
    },
    pt: {
      exact: ['responder avaliações em 2 minutos', 'responder rápido a avaliações'],
      partial: ['economizar tempo em avaliações', 'respostas eficientes'],
      generic: ['nosso guia de produtividade', 'este método'],
      branded: ['o método ReplyStack'],
    },
  },
  'get-more-google-reviews': {
    en: {
      exact: ['get more Google reviews', 'how to get Google reviews'],
      partial: ['increase Google reviews', 'boost your reviews'],
      generic: ['our review collection guide', 'this strategy'],
      branded: ['ReplyStack review collection guide'],
    },
    fr: {
      exact: ['obtenir plus d\'avis Google', 'comment obtenir des avis Google'],
      partial: ['augmenter ses avis Google', 'booster ses avis'],
      generic: ['notre guide de collecte d\'avis', 'cette stratégie'],
      branded: ['le guide ReplyStack'],
    },
    es: {
      exact: ['conseguir más reseñas Google', 'cómo obtener reseñas Google'],
      partial: ['aumentar reseñas Google', 'impulsar tus reseñas'],
      generic: ['nuestra guía de recopilación', 'esta estrategia'],
      branded: ['la guía ReplyStack'],
    },
    pt: {
      exact: ['conseguir mais avaliações Google', 'como obter avaliações Google'],
      partial: ['aumentar avaliações Google', 'impulsionar avaliações'],
      generic: ['nosso guia de coleta', 'esta estratégia'],
      branded: ['o guia ReplyStack'],
    },
  },
  'get-more-5-star-reviews': {
    en: {
      exact: ['get more 5-star reviews', 'how to get 5-star reviews'],
      partial: ['increase positive reviews', 'earn five-star ratings'],
      generic: ['our 5-star guide', 'this article'],
      branded: ['ReplyStack 5-star guide'],
    },
    fr: {
      exact: ['obtenir plus d\'avis 5 étoiles', 'comment obtenir des avis 5 étoiles'],
      partial: ['augmenter les avis positifs', 'obtenir des notes 5 étoiles'],
      generic: ['notre guide 5 étoiles', 'cet article'],
      branded: ['le guide ReplyStack'],
    },
    es: {
      exact: ['conseguir más reseñas de 5 estrellas', 'cómo obtener reseñas 5 estrellas'],
      partial: ['aumentar reseñas positivas', 'obtener calificaciones 5 estrellas'],
      generic: ['nuestra guía 5 estrellas', 'este artículo'],
      branded: ['la guía ReplyStack'],
    },
    pt: {
      exact: ['conseguir mais avaliações 5 estrelas', 'como obter avaliações 5 estrelas'],
      partial: ['aumentar avaliações positivas', 'obter notas 5 estrelas'],
      generic: ['nosso guia 5 estrelas', 'este artigo'],
      branded: ['o guia ReplyStack'],
    },
  },
  'online-reputation-strategy': {
    en: {
      exact: ['online reputation strategy', 'reputation management strategy'],
      partial: ['build your online reputation', 'reputation strategy'],
      generic: ['our strategy guide', 'this comprehensive guide'],
      branded: ['ReplyStack reputation guide'],
    },
    fr: {
      exact: ['stratégie de réputation en ligne', 'stratégie e-réputation'],
      partial: ['construire sa réputation en ligne', 'stratégie de réputation'],
      generic: ['notre guide stratégique', 'ce guide complet'],
      branded: ['le guide ReplyStack'],
    },
    es: {
      exact: ['estrategia de reputación online', 'estrategia de gestión de reputación'],
      partial: ['construir tu reputación online', 'estrategia de reputación'],
      generic: ['nuestra guía estratégica', 'esta guía completa'],
      branded: ['la guía ReplyStack'],
    },
    pt: {
      exact: ['estratégia de reputação online', 'estratégia de gestão de reputação'],
      partial: ['construir sua reputação online', 'estratégia de reputação'],
      generic: ['nosso guia estratégico', 'este guia completo'],
      branded: ['o guia ReplyStack'],
    },
  },
  'reviews-boost-local-seo': {
    en: {
      exact: ['reviews boost local SEO', 'reviews and local SEO'],
      partial: ['improve local SEO with reviews', 'SEO impact of reviews'],
      generic: ['our SEO guide', 'this article'],
      branded: ['ReplyStack SEO guide'],
    },
    fr: {
      exact: ['avis boostent le SEO local', 'avis et SEO local'],
      partial: ['améliorer son SEO local avec les avis', 'impact SEO des avis'],
      generic: ['notre guide SEO', 'cet article'],
      branded: ['le guide SEO ReplyStack'],
    },
    es: {
      exact: ['reseñas impulsan el SEO local', 'reseñas y SEO local'],
      partial: ['mejorar SEO local con reseñas', 'impacto SEO de las reseñas'],
      generic: ['nuestra guía SEO', 'este artículo'],
      branded: ['la guía SEO de ReplyStack'],
    },
    pt: {
      exact: ['avaliações impulsionam o SEO local', 'avaliações e SEO local'],
      partial: ['melhorar SEO local com avaliações', 'impacto SEO das avaliações'],
      generic: ['nosso guia SEO', 'este artigo'],
      branded: ['o guia SEO do ReplyStack'],
    },
  },
  'reputation-artisans': {
    en: {
      exact: ['reputation for artisans', 'artisan reputation guide'],
      partial: ['online reputation for craftsmen', 'tradespeople reviews'],
      generic: ['our artisan guide', 'this guide'],
      branded: ['ReplyStack artisan guide'],
    },
    fr: {
      exact: ['réputation des artisans', 'guide réputation artisans'],
      partial: ['e-réputation artisans', 'avis artisans'],
      generic: ['notre guide artisan', 'ce guide'],
      branded: ['le guide artisan ReplyStack'],
    },
    es: {
      exact: ['reputación para artesanos', 'guía reputación artesanos'],
      partial: ['reputación online artesanos', 'reseñas artesanos'],
      generic: ['nuestra guía para artesanos', 'esta guía'],
      branded: ['la guía ReplyStack para artesanos'],
    },
    pt: {
      exact: ['reputação para artesãos', 'guia reputação artesãos'],
      partial: ['reputação online artesãos', 'avaliações artesãos'],
      generic: ['nosso guia para artesãos', 'este guia'],
      branded: ['o guia ReplyStack para artesãos'],
    },
  },
  'ecommerce-negative-reviews': {
    en: {
      exact: ['ecommerce negative reviews', 'handle ecommerce bad reviews'],
      partial: ['negative reviews in ecommerce', 'online store reviews'],
      generic: ['our ecommerce guide', 'this guide'],
      branded: ['ReplyStack ecommerce guide'],
    },
    fr: {
      exact: ['avis négatifs e-commerce', 'gérer avis négatifs e-commerce'],
      partial: ['avis négatifs boutique en ligne', 'mauvais avis e-commerce'],
      generic: ['notre guide e-commerce', 'ce guide'],
      branded: ['le guide e-commerce ReplyStack'],
    },
    es: {
      exact: ['reseñas negativas ecommerce', 'gestionar reseñas negativas ecommerce'],
      partial: ['reseñas negativas tienda online', 'malas reseñas ecommerce'],
      generic: ['nuestra guía ecommerce', 'esta guía'],
      branded: ['la guía ecommerce ReplyStack'],
    },
    pt: {
      exact: ['avaliações negativas ecommerce', 'gerenciar avaliações negativas ecommerce'],
      partial: ['avaliações negativas loja online', 'más avaliações ecommerce'],
      generic: ['nosso guia ecommerce', 'este guia'],
      branded: ['o guia ecommerce ReplyStack'],
    },
  },
  'auto-repair-reputation': {
    en: {
      exact: ['auto repair reputation', 'mechanic reputation guide'],
      partial: ['online reputation for auto shops', 'auto repair reviews'],
      generic: ['our auto repair guide', 'this guide'],
      branded: ['ReplyStack auto repair guide'],
    },
    fr: {
      exact: ['réputation garage automobile', 'guide réputation mécanicien'],
      partial: ['e-réputation garagiste', 'avis garage auto'],
      generic: ['notre guide automobile', 'ce guide'],
      branded: ['le guide auto ReplyStack'],
    },
    es: {
      exact: ['reputación taller mecánico', 'guía reputación mecánico'],
      partial: ['reputación online taller', 'reseñas taller mecánico'],
      generic: ['nuestra guía para talleres', 'esta guía'],
      branded: ['la guía ReplyStack para talleres'],
    },
    pt: {
      exact: ['reputação oficina mecânica', 'guia reputação mecânico'],
      partial: ['reputação online oficina', 'avaliações oficina mecânica'],
      generic: ['nosso guia para oficinas', 'este guia'],
      branded: ['o guia ReplyStack para oficinas'],
    },
  },
  'healthcare-reviews': {
    en: {
      exact: ['healthcare reviews', 'medical practice reviews'],
      partial: ['doctor reviews management', 'patient reviews'],
      generic: ['our healthcare guide', 'this guide'],
      branded: ['ReplyStack healthcare guide'],
    },
    fr: {
      exact: ['avis santé', 'avis cabinet médical'],
      partial: ['gestion avis médecin', 'avis patients'],
      generic: ['notre guide santé', 'ce guide'],
      branded: ['le guide santé ReplyStack'],
    },
    es: {
      exact: ['reseñas salud', 'reseñas consulta médica'],
      partial: ['gestión reseñas médico', 'reseñas pacientes'],
      generic: ['nuestra guía de salud', 'esta guía'],
      branded: ['la guía salud ReplyStack'],
    },
    pt: {
      exact: ['avaliações saúde', 'avaliações consultório médico'],
      partial: ['gestão avaliações médico', 'avaliações pacientes'],
      generic: ['nosso guia de saúde', 'este guia'],
      branded: ['o guia saúde ReplyStack'],
    },
  },
  'beauty-salon-reputation': {
    en: {
      exact: ['beauty salon reputation', 'salon reputation guide'],
      partial: ['online reputation for salons', 'beauty salon reviews'],
      generic: ['our salon guide', 'this guide'],
      branded: ['ReplyStack salon guide'],
    },
    fr: {
      exact: ['réputation salon de beauté', 'guide réputation coiffeur'],
      partial: ['e-réputation salon', 'avis salon de coiffure'],
      generic: ['notre guide salon', 'ce guide'],
      branded: ['le guide salon ReplyStack'],
    },
    es: {
      exact: ['reputación salón de belleza', 'guía reputación peluquería'],
      partial: ['reputación online salón', 'reseñas peluquería'],
      generic: ['nuestra guía para salones', 'esta guía'],
      branded: ['la guía ReplyStack para salones'],
    },
    pt: {
      exact: ['reputação salão de beleza', 'guia reputação cabeleireiro'],
      partial: ['reputação online salão', 'avaliações cabeleireiro'],
      generic: ['nosso guia para salões', 'este guia'],
      branded: ['o guia ReplyStack para salões'],
    },
  },
};

/**
 * Find which silo a slug belongs to.
 * Returns the silo key or null.
 */
export function findSilo(slug) {
  for (const [siloKey, silo] of Object.entries(silos)) {
    if (silo.pillar === slug || silo.cluster.includes(slug)) {
      return siloKey;
    }
  }
  return null;
}

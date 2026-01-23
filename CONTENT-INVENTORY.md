# ReplyStack - Inventaire Complet du Contenu

> Dernière mise à jour : 15 janvier 2026
> Ce document liste tous les contenus du site reply-stack.app avec leurs langues disponibles.

---

## Langues Supportées

| Code | Langue |
|------|--------|
| EN | Anglais (par défaut) |
| FR | Français |
| ES | Espagnol |
| PT | Portugais |

---

## 1. Pages Statiques

| Page | Route EN | Route FR | Route ES | Route PT | Langues |
|------|----------|----------|----------|----------|---------|
| Accueil | `/` | `/fr/` | `/es/` | `/pt/` | EN, FR, ES, PT |
| Tarifs | `/pricing` | `/fr/pricing` | `/es/pricing` | `/pt/pricing` | EN, FR, ES, PT |
| Contact | `/contact` | `/fr/contact` | `/es/contact` | `/pt/contact` | EN, FR, ES, PT |
| Confidentialité | `/privacy` | `/fr/privacy` | `/es/privacy` | `/pt/privacy` | EN, FR, ES, PT |
| Connexion | `/login` | - | - | - | EN |
| Inscription | `/register` | - | - | - | EN |

---

## 2. Blog / Guides (8 articles)

Tous les guides sont disponibles en **4 langues** (EN, FR, ES, PT).

| # | Slug | Titre (EN) | Date |
|---|------|------------|------|
| 1 | `respond-negative-reviews` | How to Respond to Negative Reviews: Complete Guide | 2026-01-10 |
| 2 | `review-response-templates` | 20 Review Response Templates That Work | 2026-01-10 |
| 3 | `get-more-google-reviews` | How to Get More Google Reviews | 2026-01-11 |
| 4 | `online-reputation-strategy` | Complete Online Reputation Strategy 2026 | 2026-01-11 |
| 5 | `respond-reviews-2-minutes-day` | Respond to Reviews in 2 Minutes a Day | 2026-01-15 |
| 6 | `respond-google-reviews` | How to Respond to Google Reviews | 2026-01-15 |
| 7 | `reviews-boost-local-seo` | How Google Reviews Boost Your Local SEO | 2026-01-15 |
| 8 | `get-more-5-star-reviews` | How to Get More 5-Star Google Reviews | 2026-01-15 |

### Routes Blog

- EN: `/blog/{slug}`
- FR: `/fr/blog/{slug}`
- ES: `/es/blog/{slug}`
- PT: `/pt/blog/{slug}`

---

## 3. Pages Compare (8 comparaisons)

| # | Slug | Concurrent | EN | FR | ES | PT |
|---|------|------------|----|----|----|----|
| 1 | `replystack-vs-birdeye` | Birdeye | ✅ | ✅ | ✅ | ✅ |
| 2 | `replystack-vs-podium` | Podium | ✅ | ❌ | ✅ | ✅ |
| 3 | `replystack-vs-talkbackai` | TalkbackAI | ✅ | ❌ | ❌ | ❌ |
| 4 | `replystack-vs-nicejob` | NiceJob | ✅ | ❌ | ❌ | ❌ |
| 5 | `replystack-vs-guest-suite` | Guest Suite | ❌ | ✅ | ❌ | ❌ |
| 6 | `replystack-vs-solike` | SoLike | ❌ | ✅ | ❌ | ❌ |
| 7 | `replystack-vs-custplace` | Custplace | ❌ | ✅ | ❌ | ❌ |
| 8 | `replystack-vs-revi` | Revi | ❌ | ❌ | ✅ | ❌ |

### Routes Compare

- EN: `/compare/{slug}`
- FR: `/fr/compare/{slug}`
- ES: `/es/compare/{slug}`
- PT: `/pt/compare/{slug}`

### Résumé Compare

| Langue | Nombre d'articles |
|--------|-------------------|
| EN | 4 |
| FR | 4 |
| ES | 3 |
| PT | 2 |

---

## 4. Pages Alternatives (1 article)

Un seul article "Meilleurs logiciels de gestion d'avis" avec **slugs différents par langue** :

| Langue | Slug | Route |
|--------|------|-------|
| EN | `best-review-management-software` | `/alternatives/best-review-management-software` |
| FR | `meilleur-logiciel-gestion-avis` | `/fr/alternatives/meilleur-logiciel-gestion-avis` |
| ES | `mejor-software-gestion-resenas` | `/es/alternatives/mejor-software-gestion-resenas` |
| PT | `melhor-software-gestao-avaliacoes` | `/pt/alternatives/melhor-software-gestao-avaliacoes` |

---

## 5. Pages Secteurs (8 secteurs)

Tous les secteurs sont disponibles en **4 langues** (EN, FR, ES, PT).

| # | Slug (interne) | EN | FR | ES | PT |
|---|----------------|----|----|----|----|
| 1 | `restaurants` | Restaurants | Restaurants | Restaurantes | Restaurantes |
| 2 | `hotels` | Hotels | Hôtels | Hoteles | Hotéis |
| 3 | `e-commerce` | E-commerce | E-commerce | E-commerce | E-commerce |
| 4 | `garages` | Auto Repair | Garages | Talleres | Garagens |
| 5 | `beaute` | Beauty Salons | Salons de beauté | Salones de belleza | Salões de beleza |
| 6 | `sante` | Healthcare | Professionnels de santé | Profesionales de salud | Profissionais de saúde |
| 7 | `artisans` | Contractors | Artisans | Artesanos | Profissionais de serviços |
| 8 | `auto-ecoles` | Driving Schools | Auto-écoles | Autoescuelas | Escolas de condução |

### Routes Secteurs

- EN: `/sectors/{slug}`
- FR: `/fr/secteurs/{slug}`
- ES: `/es/sectores/{slug}`
- PT: `/pt/setores/{slug}`

---

## 6. Résumé Global

| Type de contenu | Total articles | EN | FR | ES | PT |
|-----------------|----------------|----|----|----|----|
| Pages statiques | 6 | 6 | 4 | 4 | 4 |
| Blog/Guides | 8 | 8 | 8 | 8 | 8 |
| Compare | 8 | 4 | 4 | 3 | 2 |
| Alternatives | 1 | 1 | 1 | 1 | 1 |
| Secteurs | 8 | 8 | 8 | 8 | 8 |
| **TOTAL** | **31** | **27** | **25** | **24** | **23** |

---

## 7. Fichiers Clés

| Fichier | Description |
|---------|-------------|
| `apps/web/src/lib/blog/posts.ts` | Registre des articles de blog |
| `apps/web/src/config/sectors.ts` | Configuration des secteurs |
| `apps/web/src/content/compare/` | Fichiers MDX des comparaisons |
| `apps/web/src/content/alternatives/` | Fichiers MDX des alternatives |
| `apps/web/src/content/blog/guides/` | Fichiers MDX des guides |
| `apps/web/public/sitemap.xml` | Sitemap du site |

---

## 8. URLs de Production

- **Site** : https://www.reply-stack.app
- **Sitemap** : https://www.reply-stack.app/sitemap.xml

---

## 9. Stack Technique

| Composant | Technologie |
|-----------|-------------|
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Blog | MDX (compilé au build) |
| Hosting | Railway |
| Domaine | reply-stack.app (www.) |

---

## 10. Prochaines Idées de Contenu

### Guides potentiels
- [ ] Comment gérer une crise de réputation
- [ ] Guide Google Business Profile complet
- [ ] Avis et conformité RGPD

### Compare potentiels
- [ ] ReplyStack vs Trustpilot (EN, FR)
- [ ] ReplyStack vs ReviewTrackers (EN)
- [ ] ReplyStack vs Reputation.com (EN)

### Secteurs potentiels
- [ ] Agences immobilières
- [ ] Cabinets d'avocats
- [ ] Dentistes / Cliniques dentaires

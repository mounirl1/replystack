# ReplyStack - Contexte Complet pour Rédaction

> Document de contexte pour rédiger du contenu (articles de blog, landing pages, etc.)
> Dernière mise à jour : Janvier 2026

## URLs Officielles

- **Site Web** : https://www.reply-stack.app
- **API** : https://api.reply-stack.app
- **Support** : contact@reply-stack.app

---

## 1. Qu'est-ce que ReplyStack ?

### Vision Produit

ReplyStack est une solution SaaS qui permet aux entreprises de **répondre aux avis clients grâce à l'IA**, directement sur les plateformes d'avis (Google, TripAdvisor, Booking, etc.).

### Proposition de valeur unique

1. **Extension navigateur Chrome/Firefox** : Génère des réponses IA directement sur les plateformes d'avis, sans quitter le site
2. **Dashboard SaaS** : Centralise les avis, historique des réponses, analytics
3. **Prix accessible** : À partir de 0€/mois (vs 300-500$/mois chez les concurrents comme Birdeye, Podium)
4. **Multi-plateforme sans API** : Fonctionne sur n'importe quelle plateforme grâce à l'extension

### Comment ça marche ?

1. L'utilisateur installe l'extension Chrome ou Firefox (gratuit)
2. Il navigue vers une plateforme d'avis (Google Business, TripAdvisor, etc.)
3. Un bouton "Réponse IA" apparaît à côté de chaque avis
4. En 1 clic, l'IA génère une réponse personnalisée
5. L'utilisateur peut ajuster le ton et la langue, puis copier/coller la réponse

---

## 2. Public Cible

### Segments principaux

| Segment | Besoins | Taille typique |
|---------|---------|----------------|
| **Restaurants** | Répondre aux avis Google/TripAdvisor/Yelp | 1-10 établissements |
| **Hôtels** | Gérer Booking, TripAdvisor, Google | 1-50 établissements |
| **Commerces locaux** | Maintenir réputation Google | 1-5 établissements |
| **Professionnels de santé** | Répondre avec tact aux avis sensibles | 1-3 cabinets |
| **Garagistes/Artisans** | Gagner du temps sur les réponses | 1-3 établissements |
| **Agences immobilières** | Gérer plusieurs agents/agences | 5-20 établissements |

### Persona principal

**Marie, 42 ans, gérante de restaurant**
- Reçoit 10-20 avis/semaine sur Google et TripAdvisor
- Passe 2-3h/semaine à rédiger des réponses
- Veut répondre professionnellement mais manque de temps
- Budget limité, ne peut pas payer 300$/mois pour un outil

### Marchés cibles

- **Priorité 1** : France, Belgique, Suisse, Canada francophone
- **Priorité 2** : UK, USA, Irlande (anglophone)
- **Priorité 3** : Espagne, Portugal, Amérique latine

---

## 3. Fonctionnalités du Produit

### Extension Navigateur (Cœur du produit)

| Fonctionnalité | Statut | Description |
|----------------|--------|-------------|
| Injection bouton IA | ✅ Fait | Bouton "Réponse IA" sur chaque avis |
| Génération réponse | ✅ Fait | Claude AI génère une réponse contextualisée |
| Choix du ton | ✅ Fait | Professionnel, Amical, Formel, Décontracté |
| Détection langue | ✅ Fait | Répond dans la langue de l'avis |
| Copier réponse | ✅ Fait | 1 clic pour copier |
| Quota affiché | ✅ Fait | Voir réponses restantes |
| Login/Register | ✅ Fait | Authentification via extension |

### Plateformes supportées

| Plateforme | Statut | Notes |
|------------|--------|-------|
| Google Business | ✅ Fait | Via Google Maps/Search |
| TripAdvisor | ✅ Fait | |
| Booking.com | ✅ Fait | |
| Yelp | ✅ Fait | |
| Facebook | ✅ Fait | Avis pages entreprise |
| Trustpilot | ✅ Fait | |
| G2 | ✅ Fait | Pour SaaS B2B |
| Capterra | ✅ Fait | Pour SaaS B2B |

### Dashboard SaaS (apps/web)

| Fonctionnalité | Statut | Description |
|----------------|--------|-------------|
| Landing page | ✅ Fait | Page d'accueil optimisée conversion |
| Page Pricing | ✅ Fait | 5 plans avec toggle mensuel/annuel |
| Pages Industries | ✅ Fait | 8 pages par secteur (restaurants, hôtels, etc.) |
| Auth (Login/Register) | ✅ Fait | Email/password + magic link |
| Dashboard | ✅ Fait | Vue d'ensemble quota + stats |
| Historique réponses | ✅ Fait | Toutes les réponses générées |
| Paramètres | ✅ Fait | Ton, langue, profil |
| Onboarding | ✅ Fait | Wizard première connexion |
| i18n | ✅ Fait | 5 langues (EN, FR, ES, IT, PT) |
| SEO | ✅ Fait | Meta tags, structured data, hreflang |
| Analytics | ✅ Fait | Google Analytics 4 avec consent |
| Cookie consent | ✅ Fait | Bannière GDPR |
| Blog | ✅ Fait | Structure MDX multilingue (4 langues) |

### API Backend (apps/api - Laravel)

| Endpoint | Statut | Description |
|----------|--------|-------------|
| POST /api/replies/generate | ✅ Fait | Génère réponse IA |
| GET /api/auth/user | ✅ Fait | Info utilisateur + quota |
| POST /api/auth/login | ✅ Fait | Connexion |
| POST /api/auth/register | ✅ Fait | Inscription |
| POST /api/auth/magic-link | ✅ Fait | Envoi magic link |
| GET /api/user/quota | ✅ Fait | Quota restant |
| Stripe webhooks | ✅ Fait | Gestion abonnements |

---

## 4. Pricing

### Plans disponibles

| Plan | Prix/mois | Prix/an | Réponses | Features |
|------|-----------|---------|----------|----------|
| **Free** | 0€ | 0€ | 15/mois | Extension, 2 tons, watermark |
| **Starter** | 9,90€ | 99€ | 50/mois | + Dashboard, tous les tons |
| **Pro** | 29€ | 290€ | 200/mois | + Analytics, priorité support |
| **Business** | 79€ | 790€ | 500/mois | + 10 établissements, 5 users |
| **Enterprise** | Sur devis | - | Illimité | + API, SSO, white-label |

### Positionnement prix

- **Concurrents** : Birdeye (299$/mois), Podium (399$/mois), ReviewTrackers (199$/mois)
- **ReplyStack** : 10-20x moins cher, focalisé sur la réponse IA

---

## 5. Stack Technique

### Frontend (apps/web)

- **Framework** : React 19 + TypeScript + Vite 7
- **Styling** : Tailwind CSS 4
- **Routing** : React Router v7
- **State** : React Query v5 + Context
- **i18n** : i18next (4 langues blog: EN, FR, ES, PT)
- **SEO** : react-helmet-async + structured data JSON-LD
- **Blog** : MDX avec @mdx-js/rollup

### Extension (apps/extension)

- **Framework** : Plasmo (React)
- **Build** : Chrome + Firefox simultané
- **Auth** : Token Sanctum stocké localement

### Backend (apps/api)

- **Framework** : Laravel 12
- **Auth** : Sanctum (tokens API)
- **Database** : MySQL 8
- **Cache/Queue** : Redis + Horizon
- **AI** : Gemini 2.0 Flash (défaut) + Mistral (payant)
- **Paiement** : Lemon Squeezy

### Hébergement

- **API + Frontend** : Railway
- **Domaine** : www.reply-stack.app

---

## 6. Structure du Blog

### Architecture

```
/blog                     → Listing (EN par défaut)
/fr/blog                  → Listing FR
/es/blog                  → Listing ES
/pt/blog                  → Listing PT
/blog/:slug               → Article EN
/fr/blog/:slug            → Article FR
/es/blog/:slug            → Article ES
/pt/blog/:slug            → Article PT
```

### Catégories de contenu

| Catégorie | Clé i18n | Description |
|-----------|----------|-------------|
| Guides | `guides` | Tutoriels complets, how-to |
| Tips & Tricks | `tips` | Conseils rapides, astuces |
| Case Studies | `case-studies` | Études de cas clients |
| News | `news` | Actualités du secteur |
| Product Updates | `product-updates` | Nouvelles fonctionnalités |

### Format des articles MDX

```yaml
---
title: "Titre de l'article"
slug: "slug-url"
description: "Description pour SEO"
date: "2025-01-15"
author:
  name: "Nom Auteur"
  avatar: "/images/authors/avatar.jpg"
  role: "Rôle"
category: "guides"
tags: ["tag1", "tag2"]
featuredImage:
  src: "./images/hero.webp"
  alt: "Description image"
---

Contenu en Markdown avec composants React...
```

### Emplacement des fichiers

```
apps/web/src/content/blog/
├── 2025-01-15-titre-article/
│   ├── index.mdx         # Version EN
│   ├── index.fr.mdx      # Version FR
│   ├── index.es.mdx      # Version ES
│   ├── index.pt.mdx      # Version PT
│   └── images/
│       └── hero.webp
```

### Composants MDX disponibles

- `<Callout type="info|warning|success|tip">` - Encadrés colorés
- `<ImageGallery images={[...]} />` - Galerie d'images
- Tous les éléments Markdown standard (headings, code, tables, etc.)

---

## 7. Langues Supportées

| Code | Langue | Priorité | Blog | Compare | Alternatives |
|------|--------|----------|------|---------|--------------|
| `en` | English | 1 (défaut) | ✅ 5 articles | ✅ 4 articles | ✅ |
| `fr` | Français | 1 | ✅ 5 articles | ✅ 4 articles | ✅ |
| `es` | Español | 2 | ✅ 5 articles | ✅ 3 articles | ✅ |
| `pt` | Português | 2 | ✅ 5 articles | ✅ 2 articles | ✅ |

**Note** : L'italien (it) est supporté dans l'interface mais pas dans le contenu blog/compare.

---

## 8. Pages Secteurs (Industries)

### 8 Secteurs Configurés

| Secteur | Slug EN | Slug FR | Icône |
|---------|---------|---------|-------|
| Restaurants | `/sectors/restaurants` | `/fr/secteurs/restaurants` | 🍽️ |
| Hôtels | `/sectors/hotels` | `/fr/secteurs/hotels` | 🏨 |
| E-commerce | `/sectors/e-commerce` | `/fr/secteurs/e-commerce` | 🛍️ |
| Santé | `/sectors/healthcare` | `/fr/secteurs/sante` | ⚕️ |
| Garages Auto | `/sectors/garages` | `/fr/secteurs/garages` | 🚗 |
| Beauté/Salons | `/sectors/beauty` | `/fr/secteurs/beaute` | 💇 |
| Artisans | `/sectors/contractors` | `/fr/secteurs/artisans` | 🔧 |
| Auto-écoles | `/sectors/driving-schools` | `/fr/secteurs/auto-ecoles` | 🚗 |

Chaque page contient :
- Hero avec problématique spécifique au métier
- Exemples d'avis typiques du secteur
- Bénéfices adaptés
- Stats et chiffres du secteur
- CTA installation extension

---

## 8b. Pages Compare (Comparatifs)

### Structure des URLs

```
/compare                        → Index des comparatifs (EN)
/fr/compare                     → Index des comparatifs (FR)
/compare/:slug                  → Comparatif individuel (EN)
/fr/compare/:slug               → Comparatif individuel (FR)
```

### Comparatifs par langue

**Anglais (4)** :
- ReplyStack vs Birdeye
- ReplyStack vs Podium
- ReplyStack vs TalkbackAI
- ReplyStack vs NiceJob

**Français (4)** :
- ReplyStack vs Birdeye
- ReplyStack vs Guest Suite
- ReplyStack vs SoLike
- ReplyStack vs Custplace

**Espagnol (3)** :
- ReplyStack vs Birdeye
- ReplyStack vs Podium
- ReplyStack vs Revi

**Portugais (2)** :
- ReplyStack vs Birdeye
- ReplyStack vs Podium

---

## 8c. Pages Alternatives (Hub SEO)

### Structure des URLs

```
/alternatives/:slug             → Hub EN
/fr/alternatives/:slug          → Hub FR
/es/alternatives/:slug          → Hub ES
/pt/alternatives/:slug          → Hub PT
```

### Articles Hub existants

| Langue | Slug | Titre |
|--------|------|-------|
| EN | `best-review-management-software` | Best Review Management Software in 2026 |
| FR | `meilleur-logiciel-gestion-avis` | Meilleurs Logiciels de Gestion d'Avis Clients en 2026 |
| ES | `mejor-software-gestion-resenas` | Mejores Herramientas de Gestión de Reseñas en 2026 |
| PT | `melhor-software-gestao-avaliacoes` | Melhores Ferramentas de Gestão de Avaliações em 2026 |

---

## 9. SEO Implementé

### Éléments en place

- ✅ `robots.txt` avec règles crawling
- ✅ `sitemap.xml` statique avec hreflang
- ✅ Balises `<title>` et `<meta description>` sur toutes les pages
- ✅ Open Graph tags (og:title, og:description, og:image)
- ✅ Structured data JSON-LD (Organization, Product, BlogPosting)
- ✅ Balises hreflang pour multilingue
- ✅ `lang` HTML synchronisé avec langue sélectionnée
- ✅ `noindex` sur pages auth (login, register)

### URLs canoniques

- Landing : `https://www.reply-stack.app`
- Pricing : `https://www.reply-stack.app/pricing`
- Blog : `https://www.reply-stack.app/blog`
- Industries : `https://www.reply-stack.app/sectors/{slug}`

---

## 10. Ce qui reste à faire

### Haute priorité

- [x] **Contenu blog** : 5 guides publiés en 4 langues ✅
- [x] **SEO** : Sitemap, hreflang, structured data ✅
- [x] **Pages Compare** : 11 comparatifs publiés ✅
- [x] **Pages Alternatives** : 4 hubs SEO publiés ✅
- [ ] **Témoignages réels** : Remplacer témoignages fictifs par vrais clients
- [ ] **Vidéo démo** : Créer une vidéo de démonstration de l'extension
- [ ] **Publication extension** : Soumettre sur Chrome Web Store et Firefox Add-ons

### Moyenne priorité

- [ ] **Email marketing** : Séquences onboarding et newsletter
- [ ] **A/B testing** : Tester différents CTAs et messages
- [ ] **OG Image** : Créer og-image.png (1200x630px)

### Basse priorité

- [ ] **Analytics avancés** : Dashboard analytics dans le SaaS
- [ ] **Alertes email** : Notification nouveaux avis (nécessite scraping)
- [ ] **Templates réponses** : Modèles personnalisables

---

## 11. Ton et Voix de Marque

### Personnalité

- **Accessible** : Pas de jargon technique, langage simple
- **Efficace** : Focus sur le gain de temps, ROI clair
- **Moderne** : IA comme outil, pas comme remplacement humain
- **Rassurant** : GDPR, données sécurisées, contrôle utilisateur

### Messages clés

1. "Répondez à tous vos avis en quelques secondes, pas en heures"
2. "L'IA rédige, vous gardez le contrôle"
3. "Gratuit pour commencer, pas de carte bancaire requise"
4. "Fonctionne sur Google, TripAdvisor, Booking et 50+ plateformes"

### Ce qu'on évite

- Promesses exagérées ("meilleur du marché", "révolutionnaire")
- Jargon IA ("machine learning", "NLP", "modèle de langage")
- Ton corporate froid
- Critiques des concurrents

---

## 12. Ressources Visuelles

### Logo et couleurs

- **Logo** : `/public/icon.png` (icône), nom "ReplyStack"
- **Couleur primaire** : Emerald/Teal (`#10B981` → `#14B8A6`)
- **Couleur secondaire** : Gray (`#1F2937`)
- **Gradient CTA** : `from-emerald-500 to-teal-500`

### Icônes

- Utilisation de Lucide Icons (ex: Chrome, Star, MessageSquare, Zap)

---

## 13. Liens Utiles

### Stores Extension

- **Chrome** : `https://chromewebstore.google.com/detail/replystack/[EXTENSION_ID]`
- **Firefox** : `https://addons.mozilla.org/firefox/addon/replystack/`

### Réseaux sociaux (à créer)

- Twitter/X : @replystack
- LinkedIn : /company/replystack
- YouTube : @replystack

### Support

- Email : contact@reply-stack.app
- Documentation : (à créer)

---

## 14. Articles de Blog Existants

### 5 Guides Publiés (4 langues chacun)

| Slug | Titre (EN) | Catégorie |
|------|-----------|-----------|
| `respond-negative-reviews` | How to Respond to Negative Reviews: Complete Guide | guides |
| `review-response-templates` | 20 Review Response Templates That Work | guides |
| `get-more-google-reviews` | How to Get More Google Reviews: Complete Guide 2026 | guides |
| `online-reputation-strategy` | Online Reputation Strategy: Complete 2026 Guide | guides |
| `respond-reviews-2-minutes-day` | Respond to Reviews in 2 Minutes a Day | guides |

### Idées pour prochains articles

**Par industrie** :
- "Répondre aux avis TripAdvisor : Guide pour hôteliers"
- "Avis Google pour restaurants : Transformer les critiques en opportunités"
- "Gestion des avis pour professionnels de santé : Ce qu'il faut savoir"

**SEO long-tail** :
- "Réponse avis négatif restaurant exemple"
- "Comment supprimer un faux avis Google"
- "Répondre aux avis Booking automatiquement"

---

## 15. Concurrents à mentionner (pour comparaisons)

| Concurrent | Type | Prix | Différenciateur ReplyStack |
|------------|------|------|----------------------------|
| Birdeye | Suite complète | 299$/mois | 30x moins cher |
| Podium | SMS + Reviews | 399$/mois | Pas besoin de SMS |
| ReviewTrackers | Analytics | 199$/mois | Extension directe |
| Yext | SEO local | 499$/mois | Focus réponses IA |
| Trustpilot Business | Plateforme | 199$/mois | Multi-plateforme |

---

*Ce document peut être mis à jour au fur et à mesure de l'évolution du produit.*

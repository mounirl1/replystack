# Product Requirements Document (PRD): ReplyStack

**Document Version:** 1.0
**Date:** 2026-01-23
**Product Brief Reference:** docs/product-brief-replystack-2026-01-22.md
**Project Level:** 2 (Medium - 5-15 stories)
**Status:** Draft

---

## 1. Introduction

### 1.1 Purpose

Ce document définit les exigences fonctionnelles et non-fonctionnelles de ReplyStack, une plateforme de réponse aux avis clients alimentée par l'IA. Il sert de référence pour le développement, les tests et la validation du produit.

### 1.2 Product Vision

ReplyStack permet aux entreprises (PME, indépendants) de répondre efficacement à tous leurs avis clients grâce à :
- Une **extension navigateur** qui génère des réponses IA directement sur les plateformes d'avis
- Un **dashboard SaaS** centralisant l'historique, les analytics et les paramètres

### 1.3 Success Metrics

| Métrique | Cible | Méthode de mesure |
|----------|-------|-------------------|
| Conversion Free → Paid | > 5% | Analytics LemonSqueezy |
| Churn mensuel | < 5% | Analytics LemonSqueezy |
| Temps de réponse utilisateur | 5x plus rapide | Timestamps responses |
| NPS | > 40 | Sondages in-app |

### 1.4 Scope

**In Scope (Phase actuelle):**
- Extension Chrome/Firefox avec génération IA
- Dashboard web (historique, analytics, paramètres)
- Support Google Business, TripAdvisor, Booking, Airbnb
- Personnalisation ton et secteur
- Traduction automatique multi-langue
- Analytics avec détection de sentiment
- Intégration Google Business API (OAuth + sync)
- Intégration TriggerFlow (SSO optionnel)

**Out of Scope:**
- Application mobile native
- Multi-locations (1 établissement par utilisateur pour cette phase)
- Version white-label / Enterprise
- Intégrations CRM (Salesforce, HubSpot)
- Support Safari

---

## 2. Functional Requirements

### 2.1 Extension Navigateur

#### FR-EXT-001: Génération de réponses IA
**Priority:** MUST
**Description:** L'extension doit permettre de générer une réponse IA personnalisée pour tout avis visible sur une plateforme supportée.

**Acceptance Criteria:**
- [ ] Un bouton "Générer une réponse" est injecté à côté de chaque avis sans réponse
- [ ] Le clic déclenche un appel API avec le contenu de l'avis, la note et la plateforme
- [ ] La réponse générée s'affiche dans un popup éditable
- [ ] L'utilisateur peut modifier la réponse avant de la copier/publier
- [ ] Le bouton affiche un état de chargement pendant la génération

#### FR-EXT-002: Support multi-plateformes
**Priority:** MUST
**Description:** L'extension doit fonctionner sur les plateformes d'avis majeures.

**Acceptance Criteria:**
- [ ] Google Business Profile : injection fonctionnelle
- [ ] TripAdvisor : injection fonctionnelle
- [ ] Booking.com : injection fonctionnelle
- [ ] Airbnb : injection fonctionnelle
- [ ] Les sélecteurs DOM sont résilients aux changements mineurs d'interface

#### FR-EXT-003: Choix du ton de réponse
**Priority:** MUST
**Description:** L'utilisateur peut choisir le ton de la réponse générée.

**Acceptance Criteria:**
- [ ] 4 tons disponibles : Professionnel, Chaleureux, Formel, Décontracté
- [ ] Le ton par défaut est configurable dans les paramètres
- [ ] Le ton sélectionné est transmis à l'API pour la génération

#### FR-EXT-004: Détection automatique de la langue
**Priority:** MUST
**Description:** La réponse est générée dans la même langue que l'avis.

**Acceptance Criteria:**
- [ ] La langue de l'avis est détectée automatiquement
- [ ] La réponse est générée dans la langue détectée
- [ ] Option pour forcer une langue spécifique si besoin
- [ ] Support minimum : FR, EN, ES, DE, IT, PT, NL

#### FR-EXT-005: Authentification extension
**Priority:** MUST
**Description:** L'extension doit permettre à l'utilisateur de se connecter.

**Acceptance Criteria:**
- [ ] Popup de connexion email/mot de passe
- [ ] Stockage sécurisé du token Sanctum
- [ ] Affichage du quota restant dans le popup
- [ ] Déconnexion possible depuis le popup

#### FR-EXT-006: Gestion des quotas
**Priority:** MUST
**Description:** L'extension doit respecter les quotas de l'utilisateur.

**Acceptance Criteria:**
- [ ] Affichage du quota restant avant génération
- [ ] Blocage de la génération si quota épuisé
- [ ] Message d'upgrade vers plan supérieur si quota atteint
- [ ] Mise à jour du quota après chaque génération

---

### 2.2 Dashboard Web

#### FR-DASH-001: Authentification utilisateur
**Priority:** MUST
**Description:** Les utilisateurs doivent pouvoir créer un compte et se connecter.

**Acceptance Criteria:**
- [ ] Inscription avec email/mot de passe
- [ ] Connexion avec email/mot de passe
- [ ] Réinitialisation de mot de passe par email
- [ ] Validation email (optionnel pour MVP)

#### FR-DASH-002: Historique des réponses
**Priority:** MUST
**Description:** Affichage de toutes les réponses générées par l'utilisateur.

**Acceptance Criteria:**
- [ ] Liste paginée des réponses (cursor pagination)
- [ ] Filtres : par plateforme, par date, par ton
- [ ] Détail : avis original, réponse générée, date, plateforme
- [ ] Recherche dans le contenu des réponses

#### FR-DASH-003: Gestion de l'établissement (Location)
**Priority:** MUST
**Description:** L'utilisateur peut configurer son établissement.

**Acceptance Criteria:**
- [ ] Création d'un établissement (nom, adresse, secteur)
- [ ] Configuration du ton par défaut
- [ ] Configuration du secteur d'activité (restaurant, hôtel, commerce, etc.)
- [ ] Instructions personnalisées pour l'IA (ex: "Toujours mentionner notre terrasse")

#### FR-DASH-004: Analytics de base
**Priority:** SHOULD
**Description:** Statistiques sur l'utilisation et les avis.

**Acceptance Criteria:**
- [ ] Nombre de réponses générées (jour, semaine, mois)
- [ ] Répartition par plateforme
- [ ] Répartition par note (1-5 étoiles)
- [ ] Temps moyen de réponse

#### FR-DASH-005: Analytics avec sentiment
**Priority:** SHOULD
**Description:** Analyse de sentiment avancée des avis.

**Acceptance Criteria:**
- [ ] Score de sentiment global (positif, neutre, négatif)
- [ ] Évolution du sentiment dans le temps
- [ ] Détection des thèmes récurrents (service, propreté, prix, etc.)
- [ ] Alertes sur tendances négatives

#### FR-DASH-006: Paramètres utilisateur
**Priority:** MUST
**Description:** Configuration des préférences utilisateur.

**Acceptance Criteria:**
- [ ] Modification du profil (nom, email)
- [ ] Changement de mot de passe
- [ ] Ton par défaut pour les réponses
- [ ] Langue d'interface (FR, EN)

---

### 2.3 Abonnements et Paiements

#### FR-PAY-001: Gestion des plans
**Priority:** MUST
**Description:** L'utilisateur peut choisir et changer de plan.

**Acceptance Criteria:**
- [ ] Affichage des 4 plans avec leurs quotas
- [ ] Souscription via Lemon Squeezy Checkout
- [ ] Upgrade/downgrade depuis le dashboard
- [ ] Annulation d'abonnement

#### FR-PAY-002: Quotas par plan
**Priority:** MUST
**Description:** Chaque plan a un quota de réponses spécifique.

| Plan | Quota mensuel | Prix |
|------|---------------|------|
| Free | 15 réponses | 0€ |
| Starter | 50 réponses | 9,90€/mois |
| Pro | 200 réponses | 29€/mois |
| Business | 500 réponses | 79€/mois |

**Acceptance Criteria:**
- [ ] Reset automatique du quota chaque mois
- [ ] Blocage soft à l'atteinte du quota (message upgrade)
- [ ] Compteur visible dans extension et dashboard

---

### 2.4 Intégration Google Business

#### FR-GOOG-001: Connexion OAuth
**Priority:** SHOULD
**Description:** L'utilisateur peut connecter son compte Google Business.

**Acceptance Criteria:**
- [ ] Bouton "Connecter Google Business" dans le dashboard
- [ ] Flow OAuth 2.0 standard
- [ ] Sélection du compte/établissement si plusieurs
- [ ] Stockage sécurisé des tokens (chiffrés)

#### FR-GOOG-002: Synchronisation des avis
**Priority:** SHOULD
**Description:** Les avis Google sont synchronisés automatiquement.

**Acceptance Criteria:**
- [ ] Sync automatique toutes les heures (job)
- [ ] Sync manuel déclenché depuis le dashboard
- [ ] Détection des nouveaux avis uniquement (upsert)
- [ ] Gestion des erreurs et retry

#### FR-GOOG-003: Publication des réponses
**Priority:** COULD
**Description:** Les réponses peuvent être publiées directement via l'API.

**Acceptance Criteria:**
- [ ] Bouton "Publier" pour les avis Google connectés
- [ ] Confirmation avant publication
- [ ] Mise à jour du statut de l'avis après publication
- [ ] Gestion des erreurs API

---

### 2.5 Traduction Multi-langue

#### FR-LANG-001: Détection de langue
**Priority:** MUST
**Description:** Détection automatique de la langue de l'avis.

**Acceptance Criteria:**
- [ ] Détection fiable pour FR, EN, ES, DE, IT, PT, NL
- [ ] Fallback sur l'anglais si langue non détectée
- [ ] Affichage de la langue détectée à l'utilisateur

#### FR-LANG-002: Génération multilingue
**Priority:** MUST
**Description:** Réponses générées dans la langue appropriée.

**Acceptance Criteria:**
- [ ] Réponse dans la même langue que l'avis par défaut
- [ ] Qualité grammaticale native
- [ ] Option pour forcer une autre langue

---

### 2.6 Intégration TriggerFlow (Optionnelle)

#### FR-TF-001: SSO TriggerFlow
**Priority:** COULD
**Description:** Les utilisateurs TriggerFlow peuvent se connecter via leur token.

**Acceptance Criteria:**
- [ ] Middleware de validation de token TriggerFlow
- [ ] Création automatique du compte ReplyStack si inexistant
- [ ] Synchronisation des données utilisateur (plan, quotas)

#### FR-TF-002: API pour TriggerFlow
**Priority:** COULD
**Description:** API REST pour que TriggerFlow consomme ReplyStack.

**Acceptance Criteria:**
- [ ] Endpoint sync location (Facility → Location)
- [ ] Endpoint get reviews avec filtres
- [ ] Endpoint generate reply
- [ ] Endpoint stats/analytics

---

## 3. Non-Functional Requirements

### 3.1 Performance

#### NFR-PERF-001: Temps de génération
**Requirement:** La génération d'une réponse doit prendre moins de 5 secondes dans 95% des cas.

**Acceptance Criteria:**
- [ ] P95 latence < 5s
- [ ] P50 latence < 2s
- [ ] Timeout à 15s avec message d'erreur approprié

#### NFR-PERF-002: Temps de chargement dashboard
**Requirement:** Les pages du dashboard doivent se charger en moins de 3 secondes.

**Acceptance Criteria:**
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Pagination cursor pour les listes

### 3.2 Sécurité

#### NFR-SEC-001: Protection des données
**Requirement:** Les données sensibles doivent être protégées.

**Acceptance Criteria:**
- [ ] Tokens OAuth chiffrés en base (AES-256)
- [ ] Mots de passe hashés (bcrypt, 12 rounds)
- [ ] HTTPS obligatoire
- [ ] Rate limiting sur les endpoints sensibles

#### NFR-SEC-002: Authentification
**Requirement:** L'authentification doit être sécurisée.

**Acceptance Criteria:**
- [ ] Tokens Sanctum avec expiration
- [ ] Protection CSRF sur les formulaires web
- [ ] Validation des inputs côté serveur

### 3.3 Disponibilité

#### NFR-AVAIL-001: Uptime
**Requirement:** Le service doit être disponible 99.5% du temps.

**Acceptance Criteria:**
- [ ] Monitoring avec alertes (Railway metrics)
- [ ] Logs centralisés pour debugging
- [ ] Procédure de rollback documentée

### 3.4 Scalabilité

#### NFR-SCALE-001: Charge utilisateur
**Requirement:** Le système doit supporter 1000 utilisateurs concurrents.

**Acceptance Criteria:**
- [ ] Architecture stateless (API)
- [ ] Redis pour sessions et cache
- [ ] Queues pour les jobs longs (sync)

### 3.5 Maintenabilité

#### NFR-MAINT-001: Qualité du code
**Requirement:** Le code doit être maintenable et testé.

**Acceptance Criteria:**
- [ ] Coverage tests > 70% sur les services critiques
- [ ] Code style enforced (ESLint, Pint)
- [ ] Documentation des API (OpenAPI/Swagger)

---

## 4. Epics et User Stories

### Epic 1: Extension Navigateur Core
**Description:** Fonctionnalités de base de l'extension pour générer des réponses IA.

| Story ID | User Story | Priority | Estimate |
|----------|------------|----------|----------|
| US-EXT-01 | En tant qu'utilisateur, je veux voir un bouton "Générer" à côté de chaque avis pour pouvoir créer une réponse rapidement | MUST | M |
| US-EXT-02 | En tant qu'utilisateur, je veux choisir le ton de ma réponse pour adapter le message à ma marque | MUST | S |
| US-EXT-03 | En tant qu'utilisateur, je veux éditer la réponse générée avant de la copier | MUST | S |
| US-EXT-04 | En tant qu'utilisateur, je veux voir mon quota restant pour savoir combien de réponses je peux encore générer | MUST | S |
| US-EXT-05 | En tant qu'utilisateur, je veux me connecter via le popup pour utiliser mes quotas | MUST | M |

### Epic 2: Dashboard - Authentification et Profil
**Description:** Gestion des comptes utilisateurs et de leurs préférences.

| Story ID | User Story | Priority | Estimate |
|----------|------------|----------|----------|
| US-AUTH-01 | En tant que visiteur, je veux créer un compte pour utiliser ReplyStack | MUST | M |
| US-AUTH-02 | En tant qu'utilisateur, je veux me connecter pour accéder à mon dashboard | MUST | S |
| US-AUTH-03 | En tant qu'utilisateur, je veux configurer mon ton par défaut pour ne pas le choisir à chaque fois | SHOULD | S |
| US-AUTH-04 | En tant qu'utilisateur, je veux configurer mon établissement pour personnaliser les réponses | MUST | M |

### Epic 3: Dashboard - Historique et Analytics
**Description:** Visualisation de l'activité et des statistiques.

| Story ID | User Story | Priority | Estimate |
|----------|------------|----------|----------|
| US-HIST-01 | En tant qu'utilisateur, je veux voir l'historique de mes réponses pour les retrouver facilement | MUST | M |
| US-HIST-02 | En tant qu'utilisateur, je veux filtrer mes réponses par plateforme et date | SHOULD | S |
| US-ANAL-01 | En tant qu'utilisateur, je veux voir des statistiques de base sur mon utilisation | SHOULD | M |
| US-ANAL-02 | En tant qu'utilisateur, je veux voir l'analyse de sentiment de mes avis pour comprendre les tendances | SHOULD | L |

### Epic 4: Paiements et Abonnements
**Description:** Gestion des plans et de la facturation.

| Story ID | User Story | Priority | Estimate |
|----------|------------|----------|----------|
| US-PAY-01 | En tant qu'utilisateur free, je veux voir les plans disponibles pour choisir un upgrade | MUST | S |
| US-PAY-02 | En tant qu'utilisateur, je veux souscrire à un plan payant via Lemon Squeezy | MUST | M |
| US-PAY-03 | En tant qu'utilisateur payant, je veux gérer mon abonnement (upgrade, annuler) | MUST | M |

### Epic 5: Intégration Google Business
**Description:** Connexion OAuth et synchronisation des avis Google.

| Story ID | User Story | Priority | Estimate |
|----------|------------|----------|----------|
| US-GOOG-01 | En tant qu'utilisateur, je veux connecter mon compte Google Business | SHOULD | L |
| US-GOOG-02 | En tant qu'utilisateur connecté à Google, je veux voir mes avis synchronisés dans le dashboard | SHOULD | M |
| US-GOOG-03 | En tant qu'utilisateur connecté à Google, je veux publier mes réponses directement via l'API | COULD | M |

### Epic 6: Traduction Multi-langue
**Description:** Support multilingue pour les réponses.

| Story ID | User Story | Priority | Estimate |
|----------|------------|----------|----------|
| US-LANG-01 | En tant qu'utilisateur, je veux que les réponses soient générées dans la langue de l'avis | MUST | M |
| US-LANG-02 | En tant qu'utilisateur, je veux pouvoir forcer une langue spécifique si besoin | SHOULD | S |

---

## 5. Prioritization Summary

### MUST Have (MVP)
- Extension : génération, multi-plateforme, tons, quotas, auth
- Dashboard : auth, historique, établissement, paramètres
- Paiements : plans, checkout Lemon Squeezy
- Traduction : détection et génération multilingue

### SHOULD Have (V1.1)
- Dashboard : analytics de base, analytics sentiment
- Google Business : OAuth, sync avis
- Dashboard : filtres avancés

### COULD Have (V1.2)
- Google Business : publication directe
- TriggerFlow : SSO et API
- Templates personnalisés

### WON'T Have (Cette phase)
- Application mobile
- Multi-locations
- White-label
- Intégrations CRM

---

## 6. Dependencies

| Dependency | Type | Impact |
|------------|------|--------|
| Gemini API | External | Core - génération IA |
| Lemon Squeezy | External | Paiements |
| Chrome Web Store | External | Distribution extension |
| Google Business API | External | Sync avis Google |
| Railway | Infrastructure | Hébergement |

---

## 7. Glossary

| Term | Definition |
|------|------------|
| **Location** | Un établissement (restaurant, hôtel, commerce) configuré dans ReplyStack |
| **Review** | Un avis client sur une plateforme externe |
| **Response** | Une réponse générée par l'IA pour un avis |
| **Tone** | Le style de la réponse (professionnel, chaleureux, formel, décontracté) |
| **Content Script** | Code de l'extension injecté dans les pages des plateformes d'avis |
| **Quota** | Nombre de réponses générables par période selon le plan |

---

**Document généré par BMAD Method v6**
**Workflow:** PRD
**Phase:** 2 - Planning

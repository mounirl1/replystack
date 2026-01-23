# Sprint Plan: ReplyStack

**Date:** 2026-01-23
**Scrum Master:** Claude (BMAD Method v6)
**Project Level:** 2 (Medium - 5-15 stories)
**PRD Reference:** docs/prd-replystack-2026-01-23.md
**Architecture Reference:** docs/architecture-replystack-2026-01-23.md

---

## Executive Summary

Ce sprint plan couvre les **fonctionnalités restantes à implémenter** pour ReplyStack. La majorité du produit est déjà développée et fonctionnelle. Ce plan se concentre sur :

1. **Analytics avec détection de sentiment** (FR-DASH-005) - La seule feature majeure non implémentée
2. **Améliorations de qualité** - Tests, polish, optimisations
3. **Préparation au lancement** - Documentation, monitoring

**Statut actuel :** 19/20 FRs implémentés (95%)

---

## Key Metrics

| Métrique | Valeur |
|----------|--------|
| **Total Stories** | 16 |
| **Total Points** | 65 points |
| **Sprints Planifiés** | 2 sprints |
| **Team Size** | 2 développeurs |
| **Sprint Length** | 2 semaines |
| **Capacité par Sprint** | ~40 points (2 devs × 10 jours × 6h × 0.33 points/h) |
| **Target Completion** | Février 2026 |

---

## Team Capacity

**Calcul de capacité :**
```
Développeurs : 2
Sprint : 2 semaines = 10 jours ouvrés
Heures productives/jour : 6h
Total heures : 2 × 10 × 6 = 120 heures

Vélocité estimée : 1 point = 3 heures (équipe mid-level)
Capacité : 120 ÷ 3 = 40 points/sprint

Buffer (20%) : 40 × 0.8 = 32 points engagés max
```

---

## Story Inventory

### Epic: Analytics Sentiment (FR-DASH-005)

#### STORY-001: Backend - Service d'analyse de sentiment

**Epic:** Analytics Sentiment
**Priority:** SHOULD (mais priorité business haute pour différenciation)
**Points:** 8

**User Story:**
En tant que développeur, je veux un service d'analyse de sentiment pour pouvoir classifier les avis automatiquement.

**Acceptance Criteria:**
- [ ] Service `SentimentAnalysisService` créé
- [ ] Utilisation de l'API Gemini pour analyse de sentiment
- [ ] Classification : positif (0.6-1.0), neutre (0.4-0.6), négatif (0.0-0.4)
- [ ] Détection des thèmes : service, propreté, prix, qualité, accueil, localisation
- [ ] Stockage du score et des thèmes en base
- [ ] Job `AnalyzeReviewSentimentJob` pour traitement async

**Technical Notes:**
- Ajouter colonnes `sentiment_score`, `sentiment_label`, `themes` (JSON) à la table `reviews`
- Créer migration
- Batch processing pour avis existants
- Rate limiting pour ne pas surcharger Gemini

**Dependencies:**
- Gemini API (déjà configuré)

---

#### STORY-002: Backend - API endpoints analytics sentiment

**Epic:** Analytics Sentiment
**Priority:** SHOULD
**Points:** 5

**User Story:**
En tant que développeur frontend, je veux des endpoints API pour récupérer les données de sentiment.

**Acceptance Criteria:**
- [ ] `GET /api/reviews/sentiment/summary` - Score global et distribution
- [ ] `GET /api/reviews/sentiment/trends` - Évolution dans le temps (jour/semaine/mois)
- [ ] `GET /api/reviews/sentiment/themes` - Thèmes récurrents avec counts
- [ ] Filtres : date range, plateforme, location_id
- [ ] Réponses JSON normalisées avec cache

**Technical Notes:**
- Utiliser query scopes Eloquent
- Cache Redis 15 minutes pour les stats
- Agrégations SQL optimisées

**Dependencies:**
- STORY-001 (Service sentiment)

---

#### STORY-003: Frontend - Dashboard Analytics Sentiment

**Epic:** Analytics Sentiment
**Priority:** SHOULD
**Points:** 8

**User Story:**
En tant qu'utilisateur, je veux voir l'analyse de sentiment de mes avis pour comprendre les tendances.

**Acceptance Criteria:**
- [ ] Widget "Score de sentiment global" avec gauge visuelle
- [ ] Graphique d'évolution du sentiment (line chart)
- [ ] Répartition positif/neutre/négatif (pie chart)
- [ ] Liste des thèmes récurrents avec badges colorés
- [ ] Filtres par période et plateforme
- [ ] Responsive design (mobile-friendly)

**Technical Notes:**
- Utiliser Recharts ou Chart.js pour les graphiques
- Intégrer dans la page Dashboard existante
- React Query pour les appels API
- Lazy loading des composants charts

**Dependencies:**
- STORY-002 (API endpoints)

---

#### STORY-004: Alertes tendances négatives

**Epic:** Analytics Sentiment
**Priority:** COULD
**Points:** 5

**User Story:**
En tant qu'utilisateur, je veux être alerté quand mes avis deviennent majoritairement négatifs.

**Acceptance Criteria:**
- [ ] Détection automatique si 3+ avis négatifs consécutifs
- [ ] Détection si moyenne sentiment < 0.4 sur 7 jours
- [ ] Notification in-app (badge/toast)
- [ ] Email optionnel (préférence utilisateur)
- [ ] Historique des alertes consultable

**Technical Notes:**
- Job schedulé quotidien `CheckSentimentAlertsJob`
- Table `sentiment_alerts` pour historique
- Intégration avec système de notifications existant

**Dependencies:**
- STORY-001 (Service sentiment)

---

### Epic: Qualité et Polish

#### STORY-005: Tests unitaires services critiques

**Epic:** Qualité
**Priority:** SHOULD
**Points:** 3

**User Story:**
En tant que développeur, je veux des tests sur les services critiques pour assurer la stabilité.

**Acceptance Criteria:**
- [ ] Tests `ReplyGeneratorServiceTest` (génération IA)
- [ ] Tests `QuotaServiceTest` (gestion quotas)
- [ ] Tests `SentimentAnalysisServiceTest`
- [ ] Coverage > 70% sur ces services
- [ ] CI/CD intégré (tests automatiques)

**Technical Notes:**
- PHPUnit avec factories
- Mocking des appels API externes
- Tests de edge cases (quota épuisé, timeout API, etc.)

**Dependencies:**
- STORY-001 (pour tester sentiment)

---

#### STORY-006: Amélioration détection langue

**Epic:** Traduction
**Priority:** SHOULD
**Points:** 2

**User Story:**
En tant qu'utilisateur, je veux une détection de langue plus fiable pour des réponses dans la bonne langue.

**Acceptance Criteria:**
- [ ] Utiliser Gemini pour détection de langue (plus fiable que patterns)
- [ ] Support élargi : + Russe, Chinois, Japonais, Arabe
- [ ] Fallback sur détection pattern si API échoue
- [ ] Affichage de la langue détectée dans l'UI

**Technical Notes:**
- Modifier `detectLanguage()` dans `ReplyGeneratorService`
- Prompt Gemini : "Detect the language of this text. Return only the ISO 639-1 code."
- Cache du résultat si même texte

**Dependencies:** Aucune

---

### Epic: Préparation Lancement

#### STORY-007: Monitoring et alertes production

**Epic:** Ops
**Priority:** SHOULD
**Points:** 2

**User Story:**
En tant qu'ops, je veux du monitoring pour détecter les problèmes rapidement.

**Acceptance Criteria:**
- [ ] Health check endpoint `/up` fonctionnel
- [ ] Métriques Railway configurées (CPU, memory, requests)
- [ ] Alertes Slack/email si erreur rate > 1%
- [ ] Logs structurés pour debugging
- [ ] Dashboard Horizon accessible

**Technical Notes:**
- Railway metrics built-in
- Config Horizon pour monitoring queues
- Laravel logging JSON format

**Dependencies:** Aucune

---

#### STORY-008: Documentation API (OpenAPI)

**Epic:** Docs
**Priority:** COULD
**Points:** 1

**User Story:**
En tant que développeur, je veux une documentation API pour faciliter l'intégration.

**Acceptance Criteria:**
- [ ] Fichier OpenAPI/Swagger généré
- [ ] Tous les endpoints documentés
- [ ] Exemples de requêtes/réponses
- [ ] Accessible via `/api/docs`

**Technical Notes:**
- Utiliser `l5-swagger` ou `scribe` pour Laravel
- Générer automatiquement depuis les Form Requests
- Publier sur documentation site

**Dependencies:** Aucune

---

## Sprint Allocation

### Sprint 1 (Semaines 1-2) - 34/40 points (85% utilisation)

**Goal:** Livrer l'analytics sentiment complet et améliorer la qualité

**Stories:**

| Story ID | Titre | Points | Priority | Dev |
|----------|-------|--------|----------|-----|
| STORY-001 | Backend - Service sentiment | 8 | SHOULD | Dev 1 |
| STORY-002 | Backend - API endpoints | 5 | SHOULD | Dev 1 |
| STORY-003 | Frontend - Dashboard sentiment | 8 | SHOULD | Dev 2 |
| STORY-004 | Alertes tendances négatives | 5 | COULD | Dev 2 |
| STORY-005 | Tests services critiques | 3 | SHOULD | Dev 1 |
| STORY-006 | Amélioration détection langue | 2 | SHOULD | Dev 2 |
| STORY-007 | Monitoring production | 2 | SHOULD | Dev 1 |
| STORY-008 | Documentation API | 1 | COULD | Dev 2 |

**Total:** 34 points / 40 capacité

**Déroulement suggéré:**

**Semaine 1:**
- Dev 1 : STORY-001 (sentiment service) → STORY-002 (API)
- Dev 2 : STORY-003 (frontend) → STORY-006 (langue)

**Semaine 2:**
- Dev 1 : STORY-005 (tests) → STORY-007 (monitoring)
- Dev 2 : STORY-003 (finir) → STORY-004 (alertes) → STORY-008 (docs)

**Risques:**
- Gemini rate limits pour analyse batch → Mitigation: throttling, queue
- Complexité graphiques frontend → Mitigation: utiliser librairie existante
- Tests peuvent prendre plus de temps → Buffer de 6 points disponible

**Definition of Done Sprint 1:**
- [ ] Tous les acceptance criteria validés
- [ ] Code review effectué
- [ ] Tests passants
- [ ] Déployé en production
- [ ] Pas de régression sur features existantes

---

### Sprint 2 (Semaines 3-4) - 31/40 points (78% utilisation)

**Goal:** Migration TriggerFlow → ReplyStack (centralisation gestion des avis)

**Stories:**

| Story ID | Titre | Points | Priority | Dev |
|----------|-------|--------|----------|-----|
| STORY-TF-001 | Migrations et modèles de données | 5 | MUST | Dev 1 |
| STORY-TF-002 | Authentification TriggerFlow SSO | 3 | MUST | Dev 1 |
| STORY-TF-003 | Intégration Google Business API | 5 | MUST | Dev 2 |
| STORY-TF-004 | Intégration Apify (Scraping Premium) | 5 | SHOULD | Dev 2 |
| STORY-TF-005 | API REST TriggerFlow | 5 | MUST | Dev 1 |
| STORY-TF-006 | Jobs de synchronisation | 3 | MUST | Dev 1 |
| STORY-TF-007 | Interface Super Admin Apify | 2 | SHOULD | Dev 2 |
| STORY-TF-008 | Tests et validation | 3 | MUST | Dev 1 + Dev 2 |

**Total:** 31 points / 40 capacité

**Déroulement suggéré:**

**Semaine 3:**
- Dev 1 : STORY-TF-001 (migrations) → STORY-TF-002 (auth SSO)
- Dev 2 : STORY-TF-003 (Google API) → STORY-TF-004 (Apify)

**Semaine 4:**
- Dev 1 : STORY-TF-005 (API REST) → STORY-TF-006 (jobs sync)
- Dev 2 : STORY-TF-007 (super admin) → STORY-TF-008 (tests, avec Dev 1)

**Risques:**
- Complexité OAuth Google → Mitigation: Réutiliser code TriggerFlow existant
- Apify API limites → Mitigation: Mode dégradé, logs détaillés
- Sync lock race conditions → Mitigation: Tests d'intégration approfondis

**Definition of Done Sprint 2:**
- [ ] Tous les acceptance criteria validés
- [ ] Auth TriggerFlow → ReplyStack fonctionnel
- [ ] Sync Google reviews opérationnel
- [ ] Apify intégré (si activé par super admin)
- [ ] Tests passants (coverage > 80% nouveaux fichiers)
- [ ] Déployé en production
- [ ] Test manuel end-to-end validé

---

## Epic Traceability

| Epic | Stories | Total Points | Sprint |
|------|---------|--------------|--------|
| Analytics Sentiment | STORY-001, 002, 003, 004 | 26 points | Sprint 1 |
| Qualité | STORY-005 | 3 points | Sprint 1 |
| Traduction | STORY-006 | 2 points | Sprint 1 |
| Ops | STORY-007 | 2 points | Sprint 1 |
| Docs | STORY-008 | 1 point | Sprint 1 |
| **Migration TriggerFlow** | **STORY-TF-001 à TF-008** | **31 points** | **Sprint 2** |

---

## FR Coverage

| FR ID | FR Name | Story | Status |
|-------|---------|-------|--------|
| FR-EXT-001 | Génération réponses IA | - | ✅ Déjà implémenté |
| FR-EXT-002 | Support multi-plateformes | - | ✅ Déjà implémenté |
| FR-EXT-003 | Choix du ton | - | ✅ Déjà implémenté |
| FR-EXT-004 | Détection langue | STORY-006 | ✅ + Amélioration |
| FR-EXT-005 | Auth extension | - | ✅ Déjà implémenté |
| FR-EXT-006 | Gestion quotas | - | ✅ Déjà implémenté |
| FR-DASH-001 | Auth utilisateur | - | ✅ Déjà implémenté |
| FR-DASH-002 | Historique réponses | - | ✅ Déjà implémenté |
| FR-DASH-003 | Gestion établissement | - | ✅ Déjà implémenté |
| FR-DASH-004 | Analytics base | - | ✅ Déjà implémenté |
| **FR-DASH-005** | **Analytics sentiment** | **STORY-001, 002, 003, 004** | **⏳ Sprint 1** |
| FR-DASH-006 | Paramètres | - | ✅ Déjà implémenté |
| FR-PAY-001 | Gestion plans | - | ✅ Déjà implémenté |
| FR-PAY-002 | Quotas par plan | - | ✅ Déjà implémenté |
| FR-GOOG-001 | Connexion OAuth | - | ✅ Déjà implémenté |
| FR-GOOG-002 | Sync avis | - | ✅ Déjà implémenté |
| FR-GOOG-003 | Publication réponses | - | ✅ Déjà implémenté |
| FR-LANG-001 | Détection langue | STORY-006 | ✅ + Amélioration |
| FR-LANG-002 | Génération multilingue | - | ✅ Déjà implémenté |
| FR-TF-001 | SSO TriggerFlow | - | ✅ Déjà implémenté |
| FR-TF-002 | API TriggerFlow | - | ✅ Déjà implémenté |

**Couverture finale après Sprint 1 :** 20/20 FRs (100%)

---

## Risks and Mitigation

### High Risk

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Gemini rate limits pour analyse batch | Medium | High | Throttling queue, traitement progressif |

### Medium Risk

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Complexité visualisation données | Medium | Medium | Utiliser Chart.js/Recharts, prototyper tôt |
| Précision analyse sentiment | Medium | Medium | Tuning prompts, validation manuelle |

### Low Risk

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Régression features existantes | Low | High | Tests automatisés, smoke tests |

---

## Dependencies

| Dependency | Type | Stories Impacted | Status |
|------------|------|------------------|--------|
| Gemini API | External | STORY-001, 006 | ✅ Déjà configuré |
| Chart.js/Recharts | Library | STORY-003 | À installer |
| l5-swagger | Library | STORY-008 | À installer |

---

## Definition of Done (Global)

Pour qu'une story soit considérée comme terminée :

- [ ] Code implémenté et commité
- [ ] Tests unitaires écrits et passants
- [ ] Code review approuvé
- [ ] Pas de linting errors (Pint, ESLint)
- [ ] Documentation mise à jour si nécessaire
- [ ] Déployé sur production
- [ ] Acceptance criteria validés
- [ ] Pas de bugs bloquants

---

## Next Steps

**Immédiat :** Commencer Sprint 1

1. **Setup initial** :
   - Créer la branche `feature/sentiment-analytics`
   - Installer dépendances (Chart.js ou Recharts)

2. **Démarrer STORY-001** :
   - Run `/bmad:dev-story STORY-001` pour créer le document de story détaillé
   - Ou commencer directement l'implémentation

**Sprint Cadence :**
- **Sprint Planning** : Lundi Semaine 1
- **Daily Standup** : Async via commits/PR descriptions
- **Sprint Review** : Vendredi Semaine 2
- **Sprint Retrospective** : Vendredi Semaine 2

---

## Summary

| Aspect | Valeur |
|--------|--------|
| **Stories à implémenter** | 16 |
| **Points totaux** | 65 |
| **Sprints** | 2 |
| **FRs déjà implémentés** | 19/20 (95%) |
| **FRs après Sprint 1** | 20/20 (100%) |
| **Sprint 1 - Objectif** | Analytics Sentiment |
| **Sprint 2 - Objectif** | Migration TriggerFlow → ReplyStack |

---

**Ce plan a été créé avec BMAD Method v6 - Phase 4 (Implementation Planning)**

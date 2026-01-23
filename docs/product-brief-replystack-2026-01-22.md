# Product Brief: ReplyStack

**Document Version:** 1.0
**Date:** 2026-01-22
**Project Type:** Monorepo (API + Web + Extension)
**Project Level:** 2 (Medium - 5-15 stories)
**Status:** Draft

---

## 1. Executive Summary

ReplyStack est une plateforme de réponse aux avis clients alimentée par l'IA. Elle permet aux entreprises de répondre efficacement à tous leurs avis (Google, TripAdvisor, Booking, etc.) grâce à une extension navigateur innovante et un dashboard SaaS centralisé.

ReplyStack se positionne comme une alternative accessible aux solutions existantes (Birdeye, Reputation.com), offrant un prix 5-10x inférieur (9-79€/mois vs 300-500$) tout en ciblant spécifiquement les PME et indépendants.

---

## 2. Problem Statement

### Le Problème

Les entreprises font face à trois problèmes majeurs concernant la gestion de leurs avis clients :

1. **Réponses chronophages** - Répondre aux avis prend trop de temps. Les entreprises ignorent les avis ou utilisent des réponses génériques qui nuisent à leur image.

2. **Outils trop chers** - Les solutions existantes (Birdeye, Reputation.com) coûtent 300-500$/mois, ce qui les rend inaccessibles aux PME et indépendants.

3. **Fragmentation des plateformes** - Les avis sont dispersés sur Google, TripAdvisor, Booking, Facebook, Yelp, etc. Il n'existe pas de vue centralisée simple.

### Pourquoi Maintenant ?

- **IA générative mature** - Les modèles comme GPT, Claude et Gemini rendent les réponses IA de qualité accessibles à faible coût.
- **Importance croissante des avis** - 93% des consommateurs lisent les avis avant d'acheter. La réputation en ligne n'a jamais été aussi critique.
- **Gap de marché** - Il n'existe pas de solution abordable entre "gratuit mais entièrement manuel" et "entreprise à 500$/mois".

### Impact si Non Résolu

Les PME continuent à :
- Ignorer les avis négatifs (ce qui aggrave leur réputation)
- Passer des heures à rédiger manuellement des réponses
- Perdre des clients potentiels face à des concurrents qui gèrent mieux leur e-réputation

---

## 3. Target Audience

### Utilisateurs Principaux

**Propriétaires de PME (1 établissement)**
- Restaurants, hôtels, commerces locaux
- Gèrent eux-mêmes leur réputation en ligne
- Un seul établissement à gérer (cible initiale)
- Temps limité, besoin d'efficacité
- Budget marketing modeste (10-80€/mois acceptable)

### Niveau Technique

Mix variable selon le segment :
- PME : Moins à l'aise avec les outils numériques complexes, besoin de simplicité
- Responsables marketing : Utilisent des outils SaaS courants sans difficulté

### Besoins Clés

1. **Gagner du temps** - Réduire le temps passé à répondre aux avis de 80%
2. **Améliorer la qualité** - Des réponses personnalisées et professionnelles
3. **Centraliser la gestion** - Une seule interface pour toutes les plateformes

---

## 4. Solution Overview

### Proposition de Valeur

ReplyStack offre la combinaison unique de :
- **Prix accessible** - 5-10x moins cher que les concurrents
- **Extension navigateur** - Fonctionne sur n'importe quelle plateforme sans intégration API complexe
- **Simplicité d'utilisation** - Pas de formation nécessaire, install et utilise en 2 minutes

### Fonctionnalités Clés

- **Extension navigateur Chrome/Firefox**
  - Génère des réponses IA directement sur les plateformes d'avis
  - Bouton "Générer une réponse" injecté dans l'interface des plateformes
  - Choix du ton (professionnel, chaleureux, formel, décontracté)

- **Personnalisation du ton et du secteur**
  - Adaptation au secteur d'activité (restaurant, hôtel, commerce, etc.)
  - Personnalisation de la longueur et du style des réponses
  - Templates personnalisables

### Différenciation

| Aspect | ReplyStack | Concurrents |
|--------|-----------|-------------|
| Prix | 9-79€/mois | 300-500$/mois |
| Installation | 2 minutes (extension) | Jours/semaines |
| Intégration | Fonctionne partout | APIs limitées |
| Cible | PME, indépendants | Grandes entreprises |

---

## 5. Business Objectives

### Objectifs à 12 Mois

| Objectif | Métrique | Cible |
|----------|----------|-------|
| Revenus récurrents | MRR | À définir |
| Acquisition | Utilisateurs actifs | À définir |
| Conversion | Free → Paid | >5% |
| Rétention | Churn mensuel | <5% |

### Modèle de Revenus

**Freemium + SaaS**

Tous les plans incluent : Extension + Dashboard + Tous les tons + Personnalisation IA complète

| Plan | Prix | Quotas | Différenciation |
|------|------|--------|-----------------|
| Free | 0€ | 15 réponses/mois | Accès complet, quota limité |
| Starter | 9.90€/mois | 50 réponses/mois | Quota augmenté |
| Pro | 29€/mois | 200 réponses/mois | Analytics avancés |
| Business | 79€/mois | 500 réponses/mois | Support prioritaire |

**Note :** Cible initiale = 1 établissement par utilisateur. Multi-locations prévu pour une phase ultérieure.

---

## 6. Scope

### In Scope (Phase Actuelle)

- **Extension Chrome/Firefox**
  - Génération de réponses IA
  - Support Google Business, TripAdvisor, Booking, Airbnb
  - Personnalisation du ton

- **Intégration TriggerFlow**
  - SSO avec authentification TriggerFlow
  - Centralisation des avis pour les clients TriggerFlow existants

- **Dashboard Web**
  - Historique des réponses
  - Analytics basiques
  - Gestion des paramètres

- **Google Business API**
  - OAuth pour connexion Google Business Profile
  - Sync automatique des avis
  - Publication des réponses via API

- **Traduction automatique multi-langue**
  - Détection automatique de la langue de l'avis
  - Génération de réponses dans la langue appropriée
  - Support des principales langues européennes

- **Analytics avec détection de sentiment**
  - Analyse de sentiment avancée des avis
  - Dashboard analytics avec insights
  - Tendances et évolution de la réputation

### Out of Scope (Pas pour cette phase)

- Application mobile native (iOS/Android)
- Version White-label / Enterprise
- Intégrations CRM (Salesforce, HubSpot)
- Multi-locations (1 établissement par utilisateur pour l'instant)

### Considérations Futures

- Support Safari
- API publique pour intégrations tierces
- Réponses automatiques (sans validation humaine)
- Multi-locations et gestion d'équipe

---

## 7. Stakeholders

| Nom/Rôle | Influence | Intérêt |
|----------|-----------|---------|
| **Fondateur / CEO** | Haute | Vision produit, décisions stratégiques, allocation budget |
| **Développeur(s)** | Moyenne | Implémentation technique, faisabilité, qualité code |
| **Clients TriggerFlow** | Moyenne | Utilisateurs existants qui migreront, feedback critique |

---

## 8. Constraints and Assumptions

### Contraintes

- **Budget limité** - Ressources financières restreintes pour développement et marketing
- **Équipe réduite** - 1-2 développeurs, pas d'équipe dédiée marketing/support
- **Contraintes techniques** - Limitations des APIs des plateformes d'avis (rate limits, changements fréquents)

### Hypothèses

- **Gemini reste abordable** - Les coûts IA restent bas pour maintenir les marges (actuellement quasi-gratuit)
- **Utilisateurs ont Chrome** - La majorité des utilisateurs cibles utilisent Chrome (>65% du marché)
- **PME prêtes à payer** - Les PME valorisent assez leur réputation pour investir 10-80€/mois

---

## 9. Success Criteria

Le projet sera considéré comme un succès si :

- [ ] **Conversion Free→Paid** - Au moins 5% des utilisateurs gratuits passent à un plan payant dans les 30 jours
- [ ] **Rétention** - Les utilisateurs payants restent abonnés plus de 6 mois en moyenne
- [ ] **NPS positif** - Score NPS supérieur à 40 (utilisateurs recommandent le produit)
- [ ] **Temps de réponse** - Les utilisateurs répondent aux avis 5x plus vite qu'avant

---

## 10. Timeline

### Date de Lancement Cible

**Q1 2026 (Janvier - Mars 2026)**

### Milestones Clés

| Milestone | Date Cible | Statut |
|-----------|------------|--------|
| Extension Chrome soumise | Janvier 2026 | ✓ FAIT |
| Extension Chrome publiée | Janvier 2026 | En attente validation |
| Dashboard v1 complet | Février 2026 | En cours |
| Traduction multi-langue | Février 2026 | Planifié |
| Analytics sentiment | Février 2026 | Planifié |
| 10 premiers clients payants | Février 2026 | Objectif |

---

## 11. Risks and Mitigation

### Risque 1: Rejet Chrome Web Store

| Aspect | Détail |
|--------|--------|
| **Description** | L'extension pourrait être refusée par Google pour non-conformité aux policies |
| **Likelihood** | Basse |
| **Impact** | Élevé - Retarderait le lancement |
| **Statut** | Extension soumise - en attente de validation |
| **Mitigation** | - Policies Chrome respectées lors du développement<br>- Firefox prêt comme alternative<br>- Prêt à itérer si feedback de Google |

### Risque 2: Changements APIs Plateformes

| Aspect | Détail |
|--------|--------|
| **Description** | Google, TripAdvisor peuvent modifier leurs interfaces/APIs, cassant l'extension |
| **Likelihood** | Moyenne |
| **Impact** | Moyen - Nécessite maintenance régulière |
| **Mitigation** | - Utiliser des sélecteurs CSS résilients<br>- Monitoring des changements DOM<br>- Alertes automatiques si l'extension échoue |

---

## 12. Appendix

### Stack Technique

| Composant | Technologie |
|-----------|-------------|
| Backend API | Laravel 12 |
| Frontend Dashboard | React 19 + TypeScript + Vite |
| Extension | Plasmo (React) |
| Database | MySQL 8 |
| Cache | Redis |
| IA | Gemini 2.0 Flash (défaut), Mistral (fallback) |
| Paiements | Lemon Squeezy |

### Intégrations

- TriggerFlow (SSO)
- Google Business Profile API
- Apify (scraping premium)
- Lemon Squeezy (paiements)

---

**Document généré par BMAD Method v6**
**Workflow:** Product Brief
**Phase:** 1 - Analysis

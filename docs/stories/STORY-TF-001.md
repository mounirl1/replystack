# STORY-TF-001: Migrations et modèles de données

**Epic:** Migration TriggerFlow → ReplyStack
**Priority:** MUST
**Story Points:** 5
**Status:** Done
**Assigned To:** Dev 1
**Created:** 2026-01-23
**Sprint:** 2

---

## User Story

En tant que **développeur backend**,
Je veux **créer les migrations et modèles pour supporter l'intégration TriggerFlow**,
Afin que **ReplyStack puisse stocker les connexions plateformes et les références externes**.

---

## Description

### Background

Pour permettre à TriggerFlow d'utiliser ReplyStack comme service de gestion des avis, nous devons étendre le modèle de données pour supporter :
- Le mapping entre Facility (TriggerFlow) et Location (ReplyStack)
- Les connexions aux plateformes d'avis (Google, Booking, TripAdvisor, Airbnb)
- Le tracking des requêtes Apify pour le scraping premium
- Les droits super admin pour activer Apify

### Business Value

- **Fondation technique** : Permet toutes les autres stories de la migration
- **Flexibilité** : Support multi-plateforme avec configuration par connexion
- **Traçabilité** : Historique complet des synchronisations

---

## Scope

### In Scope

- Migration `add_external_ids_to_locations` (external_facility_id, external_source)
- Migration `create_review_connections_table`
- Migration `create_apify_requests_table`
- Migration `add_is_super_admin_to_users`
- Migration `add_review_connection_id_to_reviews`
- Modèle `ReviewConnection` avec relations et scopes
- Modèle `ApifyRequest` avec relations et scopes
- Mise à jour modèle `Location` (relation reviewConnections)
- Mise à jour modèle `Review` (relation reviewConnection)

### Out of Scope

- Services métier (autres stories)
- Controllers et routes (autres stories)
- Tests (STORY-TF-008)

---

## Acceptance Criteria

### Migrations

- [ ] **AC-001**: La table `locations` a les colonnes `external_facility_id` et `external_source`
- [ ] **AC-002**: La table `review_connections` existe avec toutes les colonnes définies dans le plan
- [ ] **AC-003**: La table `apify_requests` existe avec toutes les colonnes définies
- [ ] **AC-004**: La table `users` a la colonne `is_super_admin`
- [ ] **AC-005**: La table `reviews` a la colonne `review_connection_id` (FK nullable)

### Modèles

- [ ] **AC-006**: `ReviewConnection` a les relations : `location`, `reviews`, `apifyRequests`
- [ ] **AC-007**: `ReviewConnection` a les scopes : `active()`, `forPlatform()`, `google()`, `needsSync()`, `apifyEnabled()`
- [ ] **AC-008**: `ReviewConnection` chiffre `access_token` et `refresh_token`
- [ ] **AC-009**: `ReviewConnection` a les méthodes de sync lock
- [ ] **AC-010**: `ApifyRequest` a les relations et méthodes de status
- [ ] **AC-011**: `Location` a la relation `reviewConnections`
- [ ] **AC-012**: `Review` a la relation `reviewConnection`

---

## Technical Notes

### Fichiers existants à vérifier

Les migrations suivantes existent déjà (créées lors d'une session précédente) :
- `2026_01_22_100000_add_external_ids_to_locations.php`
- `2026_01_22_100001_create_review_connections_table.php`
- `2026_01_22_100002_create_apify_requests_table.php`
- `2026_01_22_100003_add_is_super_admin_to_users.php`
- `2026_01_22_100004_add_review_connection_id_to_reviews.php`

### Modèles existants à vérifier

- `ReviewConnection.php`
- `ApifyRequest.php`

### Actions requises

1. Vérifier que les migrations sont complètes et correctes
2. Vérifier que les modèles ont toutes les relations/scopes nécessaires
3. Exécuter les migrations
4. Tester les relations en tinker

---

## Definition of Done

- [ ] Toutes les migrations créées et fonctionnelles
- [ ] Modèles créés avec relations, scopes et méthodes
- [ ] Migrations exécutées sans erreur
- [ ] Relations testées en tinker
- [ ] Code review passée

---

**Cette story a été créée avec BMAD Method v6 - Phase 4 (Implementation)**

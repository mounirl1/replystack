# STORY-TF-003: Intégration Google Business API

**Epic:** Migration TriggerFlow → ReplyStack
**Priority:** MUST
**Story Points:** 5
**Status:** Not Started
**Assigned To:** Dev 2
**Created:** 2026-01-23
**Sprint:** 2
**Depends On:** STORY-TF-001

---

## User Story

En tant que **propriétaire d'établissement**,
Je veux **connecter mon compte Google Business à ReplyStack**,
Afin de **synchroniser automatiquement mes avis Google et y répondre**.

---

## Description

### Background

Google Business Profile API permet de :
- Lister les avis d'un établissement
- Répondre aux avis
- Obtenir les informations de l'établissement

L'intégration nécessite OAuth 2.0 pour obtenir l'autorisation de l'utilisateur.

### Flow OAuth

1. Utilisateur clique "Connecter Google"
2. Redirection vers Google OAuth
3. Autorisation par l'utilisateur
4. Callback avec code d'autorisation
5. Échange code contre tokens
6. Stockage tokens chiffrés dans `review_connections`

---

## Scope

### In Scope

- Service `GoogleBusinessAuthService` (OAuth flow)
- Service `GoogleBusinessReviewService` (fetch/reply reviews)
- Service `GoogleBusinessAccountService` (list accounts/locations)
- Controller `GoogleBusinessController`
- Job `SyncGoogleReviewsJob`
- Routes OAuth (auth-url, callback)

### Out of Scope

- Interface utilisateur (frontend)
- Autres plateformes (Booking, TripAdvisor, etc.)

---

## Acceptance Criteria

### OAuth

- [ ] **AC-001**: Endpoint pour obtenir l'URL d'autorisation Google
- [ ] **AC-002**: Endpoint callback pour échanger le code contre des tokens
- [ ] **AC-003**: Les tokens sont stockés chiffrés dans `review_connections`
- [ ] **AC-004**: Le refresh token est utilisé quand l'access token expire
- [ ] **AC-005**: Endpoint pour révoquer l'accès

### Fetch Reviews

- [ ] **AC-006**: Service pour récupérer les avis d'une connexion
- [ ] **AC-007**: Les avis sont créés/mis à jour dans la table `reviews`
- [ ] **AC-008**: Le statut `has_response` est correctement détecté

### Reply to Reviews

- [ ] **AC-009**: Service pour répondre à un avis via l'API Google
- [ ] **AC-010**: La réponse est enregistrée et le statut mis à jour

### Sync Job

- [ ] **AC-011**: Job asynchrone pour synchroniser les avis
- [ ] **AC-012**: Gestion du sync lock (éviter doublons)
- [ ] **AC-013**: Logs détaillés des synchronisations

---

## Technical Notes

### Services à adapter depuis TriggerFlow

Les services existent dans TriggerFlow et doivent être adaptés :
- `GoogleBusinessAuthService.php`
- `GoogleBusinessReviewService.php`
- `GoogleBusinessAccountService.php`

### Adaptations nécessaires

- Namespace : `App\Services\Plugs\Google` → `App\Services\Google`
- `Facility` → `Location`
- `facility_id` → `location_id`
- Utiliser `ReviewConnection` au lieu de `FacilityPlug`

### Configuration

```php
// config/services.php
'google' => [
    'client_id' => env('GOOGLE_CLIENT_ID'),
    'client_secret' => env('GOOGLE_CLIENT_SECRET'),
    'redirect_uri' => env('GOOGLE_REDIRECT_URI'),
],
```

### Routes

```php
// Dans le groupe triggerflow.auth
Route::get('/google/auth-url', [GoogleBusinessController::class, 'authUrl']);
Route::post('/google/callback', [GoogleBusinessController::class, 'callback']);
Route::get('/google/accounts', [GoogleBusinessController::class, 'accounts']);
Route::post('/google/revoke', [GoogleBusinessController::class, 'revoke']);
```

---

## Definition of Done

- [ ] Services créés et fonctionnels
- [ ] Controller avec tous les endpoints
- [ ] Job de synchronisation fonctionnel
- [ ] Tests unitaires pour les services
- [ ] Test manuel OAuth flow complet
- [ ] Test manuel sync reviews

---

**Cette story a été créée avec BMAD Method v6 - Phase 4 (Implementation)**

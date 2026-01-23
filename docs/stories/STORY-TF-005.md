# STORY-TF-005: API REST TriggerFlow

**Epic:** Migration TriggerFlow → ReplyStack
**Priority:** MUST
**Story Points:** 5
**Status:** Not Started
**Assigned To:** Dev 1
**Created:** 2026-01-23
**Sprint:** 2
**Depends On:** STORY-TF-001, STORY-TF-002

---

## User Story

En tant que **application TriggerFlow**,
Je veux **accéder aux fonctionnalités ReplyStack via une API REST**,
Afin de **gérer les avis de mes utilisateurs sans dupliquer le code**.

---

## Description

### Background

TriggerFlow doit pouvoir appeler ReplyStack pour :
- Synchroniser les locations (Facility → Location)
- Récupérer les avis d'une location
- Obtenir les statistiques
- Générer des réponses IA
- Gérer les connexions plateformes

Toutes les routes sont protégées par le middleware `ValidateTriggerFlowToken`.

---

## Scope

### In Scope

- Controller `TriggerFlowController`
- Routes préfixées `/api/triggerflow/`
- Mapping Facility ID → Location
- Endpoints : sync, reviews, stats, generate, connections

### Out of Scope

- Authentification (STORY-TF-002)
- Google OAuth détails (STORY-TF-003)

---

## Acceptance Criteria

### Locations

- [ ] **AC-001**: `POST /triggerflow/locations/sync` crée/met à jour une location
- [ ] **AC-002**: `DELETE /triggerflow/locations/{externalId}` supprime une location
- [ ] **AC-003**: Le mapping `external_facility_id` → `location` fonctionne

### Reviews

- [ ] **AC-004**: `GET /triggerflow/locations/{externalId}/reviews` retourne les avis paginés
- [ ] **AC-005**: `GET /triggerflow/locations/{externalId}/stats` retourne les statistiques
- [ ] **AC-006**: Filtres supportés : platform, status, rating, date_from, date_to

### Connections

- [ ] **AC-007**: `GET /triggerflow/locations/{externalId}/connections` liste les connexions
- [ ] **AC-008**: `POST /triggerflow/locations/{externalId}/connections` crée une connexion

### Reply Generation

- [ ] **AC-009**: `POST /triggerflow/replies/generate` génère une réponse IA
- [ ] **AC-010**: Support du `location_id` externe pour le contexte

---

## Technical Notes

### Routes

```php
// routes/api.php
Route::middleware(['triggerflow.auth'])->prefix('triggerflow')->group(function () {
    // Locations
    Route::post('/locations/sync', [TriggerFlowController::class, 'syncLocation']);
    Route::delete('/locations/{externalId}', [TriggerFlowController::class, 'deleteLocation']);

    // Reviews
    Route::get('/locations/{externalId}/reviews', [TriggerFlowController::class, 'getReviews']);
    Route::get('/locations/{externalId}/stats', [TriggerFlowController::class, 'getStats']);

    // Connections
    Route::get('/locations/{externalId}/connections', [TriggerFlowController::class, 'getConnections']);
    Route::post('/locations/{externalId}/connections', [TriggerFlowController::class, 'createConnection']);

    // Reply generation
    Route::post('/replies/generate', [TriggerFlowController::class, 'generateReply']);

    // Google OAuth
    Route::get('/google/auth-url', [TriggerFlowController::class, 'getGoogleAuthUrl']);
    Route::post('/google/callback', [TriggerFlowController::class, 'handleGoogleCallback']);
});
```

### Controller

```php
class TriggerFlowController extends Controller
{
    public function syncLocation(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'external_id' => 'required|string',
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            // ... autres champs
        ]);

        $location = Location::updateOrCreate(
            [
                'external_facility_id' => $validated['external_id'],
                'external_source' => 'triggerflow',
            ],
            [
                'user_id' => $request->user()->id,
                'name' => $validated['name'],
                // ...
            ]
        );

        return response()->json(['location' => $location]);
    }

    protected function findLocationByExternalId(string $externalId): Location
    {
        return Location::where('external_facility_id', $externalId)
            ->where('external_source', 'triggerflow')
            ->firstOrFail();
    }
}
```

---

## Definition of Done

- [ ] Controller créé avec tous les endpoints
- [ ] Routes configurées avec middleware
- [ ] Validation des inputs
- [ ] Responses JSON standardisées
- [ ] Tests feature pour chaque endpoint
- [ ] Documentation des endpoints

---

**Cette story a été créée avec BMAD Method v6 - Phase 4 (Implementation)**

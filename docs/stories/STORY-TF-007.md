# STORY-TF-007: Interface Super Admin Apify

**Epic:** Migration TriggerFlow → ReplyStack
**Priority:** SHOULD
**Story Points:** 2
**Status:** Not Started
**Assigned To:** Dev 2
**Created:** 2026-01-23
**Sprint:** 2
**Depends On:** STORY-TF-001

---

## User Story

En tant que **super admin ReplyStack**,
Je veux **activer/désactiver Apify sur les connexions**,
Afin de **contrôler les coûts de scraping**.

---

## Description

### Background

Apify est un service payant. Pour éviter les abus, seuls les super admins peuvent activer le scraping Apify sur une connexion.

L'interface permet de :
- Lister toutes les connexions avec leur statut Apify
- Activer/désactiver Apify sur une connexion
- Voir l'historique des requêtes Apify

---

## Scope

### In Scope

- Middleware `SuperAdmin`
- Controller `SuperAdmin/ReviewConnectionController`
- Routes préfixées `/api/super-admin/`
- Endpoints : list, toggle, history

### Out of Scope

- Interface frontend (API seulement)
- Gestion des coûts/facturations

---

## Acceptance Criteria

### Middleware

- [ ] **AC-001**: Le middleware `SuperAdmin` vérifie `is_super_admin`
- [ ] **AC-002**: Retourne 403 si non super admin

### Endpoints

- [ ] **AC-003**: `GET /super-admin/connections` liste toutes les connexions
- [ ] **AC-004**: `PATCH /super-admin/connections/{id}/apify` toggle Apify
- [ ] **AC-005**: `GET /super-admin/apify-requests` liste les requêtes Apify
- [ ] **AC-006**: Filtres supportés : platform, status, location_id

---

## Technical Notes

### Middleware

```php
// app/Http/Middleware/SuperAdmin.php
class SuperAdmin
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->user()?->isSuperAdmin()) {
            return response()->json([
                'error' => 'Forbidden',
                'message' => 'Super admin access required.',
            ], 403);
        }

        return $next($request);
    }
}
```

### Routes

```php
Route::middleware(['auth:sanctum', 'super-admin'])->prefix('super-admin')->group(function () {
    Route::get('/connections', [SuperAdmin\ReviewConnectionController::class, 'index']);
    Route::patch('/connections/{connection}/apify', [SuperAdmin\ReviewConnectionController::class, 'toggleApify']);
    Route::get('/apify-requests', [SuperAdmin\ReviewConnectionController::class, 'apifyRequests']);
});
```

### Controller

```php
class ReviewConnectionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $connections = ReviewConnection::with('location')
            ->when($request->platform, fn($q, $p) => $q->where('platform', $p))
            ->when($request->apify_enabled, fn($q) => $q->apifyEnabled())
            ->paginate(50);

        return response()->json($connections);
    }

    public function toggleApify(ReviewConnection $connection): JsonResponse
    {
        $connection->update([
            'apify_enabled' => !$connection->apify_enabled,
        ]);

        return response()->json([
            'message' => 'Apify ' . ($connection->apify_enabled ? 'enabled' : 'disabled'),
            'connection' => $connection,
        ]);
    }

    public function apifyRequests(Request $request): JsonResponse
    {
        $requests = ApifyRequest::with('reviewConnection.location')
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->latest()
            ->paginate(50);

        return response()->json($requests);
    }
}
```

---

## Definition of Done

- [ ] Middleware créé et enregistré
- [ ] Controller créé avec tous les endpoints
- [ ] Routes configurées
- [ ] Tests feature pour les endpoints
- [ ] Test manuel avec compte super admin

---

**Cette story a été créée avec BMAD Method v6 - Phase 4 (Implementation)**

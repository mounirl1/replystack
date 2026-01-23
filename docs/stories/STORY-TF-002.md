# STORY-TF-002: Authentification TriggerFlow SSO

**Epic:** Migration TriggerFlow → ReplyStack
**Priority:** MUST
**Story Points:** 3
**Status:** Not Started
**Assigned To:** Dev 1
**Created:** 2026-01-23
**Sprint:** 2
**Depends On:** STORY-TF-001

---

## User Story

En tant que **utilisateur TriggerFlow**,
Je veux **être automatiquement authentifié sur ReplyStack via mon token TriggerFlow**,
Afin de **ne pas avoir à créer un compte séparé**.

---

## Description

### Background

TriggerFlow agit comme fournisseur d'authentification (IdP). Quand un utilisateur TriggerFlow fait une requête vers ReplyStack, son token Sanctum TriggerFlow est validé via un appel API, puis un utilisateur local ReplyStack est créé/récupéré.

### Flow

1. Requête avec `Authorization: Bearer <triggerflow_token>`
2. Middleware extrait le token
3. Appel API vers TriggerFlow : `GET /api/auth/user`
4. Si valide → créer/récupérer User local
5. Attacher User à la requête Laravel
6. Si invalide → 401 Unauthorized

---

## Scope

### In Scope

- Middleware `ValidateTriggerFlowToken`
- Service `TriggerFlowAuthService`
- Configuration dans `services.php`
- Cache du résultat de validation (5 min)
- Création automatique d'utilisateur local

### Out of Scope

- Interface utilisateur
- Gestion des plans/quotas (utilise les valeurs TriggerFlow)

---

## Acceptance Criteria

- [ ] **AC-001**: Le middleware `ValidateTriggerFlowToken` valide les tokens via API TriggerFlow
- [ ] **AC-002**: Un utilisateur local est créé si inexistant (basé sur email)
- [ ] **AC-003**: L'utilisateur local est mis à jour avec les infos TriggerFlow à chaque requête
- [ ] **AC-004**: Le résultat de validation est caché 5 minutes
- [ ] **AC-005**: Une requête avec token invalide retourne 401
- [ ] **AC-006**: Une requête sans token retourne 401
- [ ] **AC-007**: La configuration TriggerFlow est dans `config/services.php`

---

## Technical Notes

### Middleware

```php
// app/Http/Middleware/ValidateTriggerFlowToken.php
public function handle(Request $request, Closure $next)
{
    $token = $request->bearerToken();

    if (!$token) {
        return response()->json(['error' => 'Unauthorized'], 401);
    }

    $authService = app(TriggerFlowAuthService::class);
    $userData = $authService->validateToken($token);

    if (!$userData) {
        return response()->json(['error' => 'Invalid token'], 401);
    }

    $user = $authService->findOrCreateUser($userData);
    $request->setUserResolver(fn() => $user);

    return $next($request);
}
```

### Service

```php
// app/Services/Auth/TriggerFlowAuthService.php
public function validateToken(string $token): ?array
{
    return Cache::remember("tf_token:{$token}", 300, function () use ($token) {
        $response = Http::withToken($token)
            ->get(config('services.triggerflow.api_url') . '/api/auth/user');

        return $response->successful() ? $response->json() : null;
    });
}

public function findOrCreateUser(array $tfUser): User
{
    return User::updateOrCreate(
        ['email' => $tfUser['email']],
        [
            'name' => $tfUser['name'],
            'external_user_id' => $tfUser['id'],
            'external_source' => 'triggerflow',
            'plan' => $tfUser['plan'] ?? 'free',
            'monthly_quota' => $tfUser['monthly_quota'] ?? 15,
        ]
    );
}
```

### Configuration

```php
// config/services.php
'triggerflow' => [
    'api_url' => env('TRIGGERFLOW_API_URL'),
    'api_key' => env('TRIGGERFLOW_API_KEY'),
],
```

---

## Definition of Done

- [ ] Middleware créé et enregistré
- [ ] Service créé et fonctionnel
- [ ] Configuration ajoutée
- [ ] Tests unitaires pour le service
- [ ] Test manuel avec vrai token TriggerFlow

---

**Cette story a été créée avec BMAD Method v6 - Phase 4 (Implementation)**

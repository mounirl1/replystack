# STORY-TF-008: Tests et validation

**Epic:** Migration TriggerFlow → ReplyStack
**Priority:** MUST
**Story Points:** 3
**Status:** Not Started
**Assigned To:** Dev 1 + Dev 2
**Created:** 2026-01-23
**Sprint:** 2
**Depends On:** STORY-TF-001 à STORY-TF-007

---

## User Story

En tant que **équipe de développement**,
Je veux **valider l'intégration complète TriggerFlow-ReplyStack**,
Afin de **garantir la fiabilité du système avant mise en production**.

---

## Description

### Background

Cette story regroupe tous les tests nécessaires pour valider :
- Les endpoints API TriggerFlow
- L'authentification SSO
- Les intégrations Google et Apify
- Les jobs de synchronisation
- L'interface super admin

### Types de tests

1. **Tests unitaires** : Services isolés
2. **Tests feature** : Endpoints API
3. **Tests d'intégration** : Flows complets
4. **Tests manuels** : Scénarios end-to-end

---

## Scope

### In Scope

- Tests unitaires pour tous les services
- Tests feature pour tous les endpoints
- Tests d'intégration pour les flows critiques
- Documentation des scénarios de test manuel

### Out of Scope

- Tests de performance/charge
- Tests E2E automatisés frontend

---

## Acceptance Criteria

### Tests Unitaires

- [ ] **AC-001**: Tests `TriggerFlowAuthService` (validation token, création user)
- [ ] **AC-002**: Tests `GoogleBusinessAuthService` (OAuth flow, refresh token)
- [ ] **AC-003**: Tests `GoogleBusinessReviewService` (fetch, reply)
- [ ] **AC-004**: Tests `ApifyService` (launch run, get results)

### Tests Feature

- [ ] **AC-005**: Tests `TriggerFlowController` (tous les endpoints)
- [ ] **AC-006**: Tests `ApifyWebhookController` (événements webhook)
- [ ] **AC-007**: Tests `SuperAdmin/ReviewConnectionController`
- [ ] **AC-008**: Tests middleware `ValidateTriggerFlowToken`
- [ ] **AC-009**: Tests middleware `SuperAdmin`

### Tests d'Intégration

- [ ] **AC-010**: Flow complet : Auth TF → Sync location → Get reviews
- [ ] **AC-011**: Flow complet : Connect Google → Sync reviews → Reply
- [ ] **AC-012**: Flow complet : Enable Apify → Launch run → Process results

### Couverture

- [ ] **AC-013**: Couverture de code > 80% sur les nouveaux fichiers

---

## Technical Notes

### Structure des tests

```
tests/
├── Unit/
│   ├── Services/
│   │   ├── Auth/
│   │   │   └── TriggerFlowAuthServiceTest.php
│   │   ├── Google/
│   │   │   ├── GoogleBusinessAuthServiceTest.php
│   │   │   └── GoogleBusinessReviewServiceTest.php
│   │   └── Apify/
│   │       └── ApifyServiceTest.php
│   └── Models/
│       ├── ReviewConnectionTest.php
│       └── ApifyRequestTest.php
├── Feature/
│   ├── TriggerFlow/
│   │   ├── AuthenticationTest.php
│   │   ├── LocationSyncTest.php
│   │   ├── ReviewsTest.php
│   │   └── ConnectionsTest.php
│   ├── Google/
│   │   └── OAuthFlowTest.php
│   ├── Apify/
│   │   └── WebhookTest.php
│   └── SuperAdmin/
│       └── ReviewConnectionTest.php
└── Integration/
    ├── TriggerFlowFullFlowTest.php
    └── ReviewSyncFlowTest.php
```

### Exemple test unitaire

```php
class TriggerFlowAuthServiceTest extends TestCase
{
    public function test_validates_valid_token(): void
    {
        Http::fake([
            'triggerflow.test/api/auth/user' => Http::response([
                'id' => 1,
                'email' => 'test@example.com',
                'name' => 'Test User',
            ], 200),
        ]);

        $service = new TriggerFlowAuthService();
        $result = $service->validateToken('valid-token');

        $this->assertNotNull($result);
        $this->assertEquals('test@example.com', $result['email']);
    }

    public function test_returns_null_for_invalid_token(): void
    {
        Http::fake([
            'triggerflow.test/api/auth/user' => Http::response([], 401),
        ]);

        $service = new TriggerFlowAuthService();
        $result = $service->validateToken('invalid-token');

        $this->assertNull($result);
    }
}
```

### Exemple test feature

```php
class TriggerFlowAuthenticationTest extends TestCase
{
    public function test_middleware_allows_valid_triggerflow_token(): void
    {
        Http::fake([
            config('services.triggerflow.api_url') . '/api/auth/user' => Http::response([
                'id' => 1,
                'email' => 'test@triggerflow.com',
                'name' => 'TF User',
            ], 200),
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer valid-tf-token',
        ])->getJson('/api/triggerflow/locations/ext-123/reviews');

        $response->assertStatus(200);
    }

    public function test_middleware_rejects_invalid_token(): void
    {
        Http::fake([
            config('services.triggerflow.api_url') . '/api/auth/user' => Http::response([], 401),
        ]);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer invalid-token',
        ])->getJson('/api/triggerflow/locations/ext-123/reviews');

        $response->assertStatus(401);
    }
}
```

### Scénarios de test manuel

1. **Auth Flow**
   - [ ] Se connecter depuis TriggerFlow avec token valide
   - [ ] Vérifier la création automatique du user ReplyStack
   - [ ] Vérifier le rejet avec token invalide

2. **Google OAuth Flow**
   - [ ] Obtenir l'URL d'autorisation
   - [ ] Compléter le flow OAuth Google
   - [ ] Vérifier le stockage des tokens
   - [ ] Tester le refresh automatique

3. **Sync Google Reviews**
   - [ ] Lancer une sync manuelle
   - [ ] Vérifier la création des reviews
   - [ ] Vérifier le sync lock

4. **Apify Flow** (si activé)
   - [ ] Activer Apify sur une connexion (super admin)
   - [ ] Lancer un run Apify
   - [ ] Recevoir le webhook
   - [ ] Vérifier les reviews créées

---

## Definition of Done

- [ ] Tous les tests unitaires passent
- [ ] Tous les tests feature passent
- [ ] Tests d'intégration validés
- [ ] Couverture > 80%
- [ ] Scénarios manuels documentés et validés
- [ ] Pas de régression sur les tests existants

---

**Cette story a été créée avec BMAD Method v6 - Phase 4 (Implementation)**

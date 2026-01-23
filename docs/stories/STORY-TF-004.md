# STORY-TF-004: Intégration Apify (Scraping Premium)

**Epic:** Migration TriggerFlow → ReplyStack
**Priority:** SHOULD
**Story Points:** 5
**Status:** Not Started
**Assigned To:** Dev 2
**Created:** 2026-01-23
**Sprint:** 2
**Depends On:** STORY-TF-001

---

## User Story

En tant que **super admin**,
Je veux **activer le scraping Apify pour certaines connexions**,
Afin de **récupérer les avis des plateformes sans API (Booking, TripAdvisor, Airbnb)**.

---

## Description

### Background

Apify est un service de scraping cloud qui permet de récupérer les avis des plateformes qui n'offrent pas d'API :
- TripAdvisor
- Booking.com
- Airbnb

Le scraping est activable uniquement par un super admin pour contrôler les coûts.

### Flow

1. Super admin active Apify sur une connexion
2. Job `SyncExternalReviewsJob` détecte les connexions Apify enabled
3. Appel API Apify pour lancer un "run"
4. Webhook Apify notifie quand le run est terminé
5. Job `ProcessApifyResultsJob` récupère et traite les résultats

---

## Scope

### In Scope

- Service `ApifyService`
- Controller `ApifyWebhookController`
- Job `SyncExternalReviewsJob`
- Job `ProcessApifyResultsJob`
- Routes webhook

### Out of Scope

- Interface super admin (STORY-TF-007)
- Plateformes autres que TripAdvisor, Booking, Airbnb

---

## Acceptance Criteria

### Service Apify

- [ ] **AC-001**: Méthode pour lancer un run TripAdvisor
- [ ] **AC-002**: Méthode pour lancer un run Booking
- [ ] **AC-003**: Méthode pour lancer un run Airbnb
- [ ] **AC-004**: Méthode pour récupérer le statut d'un run
- [ ] **AC-005**: Méthode pour récupérer les résultats d'un run

### Webhook

- [ ] **AC-006**: Endpoint `POST /webhooks/apify` reçoit les événements
- [ ] **AC-007**: Événement `ACTOR.RUN.SUCCEEDED` dispatch le job de traitement
- [ ] **AC-008**: Événement `ACTOR.RUN.FAILED` met à jour le statut ApifyRequest
- [ ] **AC-009**: Signature du webhook validée

### Jobs

- [ ] **AC-010**: `SyncExternalReviewsJob` ne traite que les connexions `apify_enabled`
- [ ] **AC-011**: `ProcessApifyResultsJob` crée/met à jour les reviews
- [ ] **AC-012**: Les `ApifyRequest` sont correctement trackés

---

## Technical Notes

### Configuration

```php
// config/services.php
'apify' => [
    'api_token' => env('APIFY_API_TOKEN'),
    'webhook_url' => env('APIFY_WEBHOOK_URL'),
    'actors' => [
        'tripadvisor' => env('APIFY_ACTOR_TRIPADVISOR', 'maxcopell/tripadvisor-reviews'),
        'booking' => env('APIFY_ACTOR_BOOKING', 'voyager/booking-reviews-scraper'),
        'airbnb' => env('APIFY_ACTOR_AIRBNB', 'voyager/airbnb-scraper'),
    ],
],
```

### Routes

```php
// routes/api.php (sans auth)
Route::post('/webhooks/apify', [ApifyWebhookController::class, 'handle']);
```

### Service

```php
class ApifyService
{
    public function requestReviews(ReviewConnection $connection, ?int $limit = null): ApifyRequest
    {
        $actor = match($connection->platform) {
            'tripadvisor' => config('services.apify.actors.tripadvisor'),
            'booking' => config('services.apify.actors.booking'),
            'airbnb' => config('services.apify.actors.airbnb'),
        };

        $response = Http::withToken(config('services.apify.api_token'))
            ->post("https://api.apify.com/v2/acts/{$actor}/runs", [
                'startUrls' => [['url' => $connection->platform_url]],
                'maxReviews' => $limit ?? 100,
            ]);

        return ApifyRequest::create([
            'run_id' => $response->json('data.id'),
            'actor_id' => $actor,
            'review_connection_id' => $connection->id,
            'platform' => $connection->platform,
            'status' => 'pending',
        ]);
    }
}
```

---

## Definition of Done

- [ ] Service Apify créé et fonctionnel
- [ ] Webhook controller créé
- [ ] Jobs créés et fonctionnels
- [ ] Routes configurées
- [ ] Test manuel avec compte Apify
- [ ] Logs détaillés des opérations

---

**Cette story a été créée avec BMAD Method v6 - Phase 4 (Implementation)**

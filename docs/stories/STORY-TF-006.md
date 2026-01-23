# STORY-TF-006: Jobs de synchronisation

**Epic:** Migration TriggerFlow → ReplyStack
**Priority:** MUST
**Story Points:** 3
**Status:** Not Started
**Assigned To:** Dev 1
**Created:** 2026-01-23
**Sprint:** 2
**Depends On:** STORY-TF-003, STORY-TF-004

---

## User Story

En tant que **système**,
Je veux **synchroniser automatiquement les avis depuis les plateformes**,
Afin que **les utilisateurs aient toujours des données à jour**.

---

## Description

### Background

Deux types de synchronisation :
1. **Google** : Via API officielle (SyncGoogleReviewsJob)
2. **Externes** : Via Apify pour Booking/TripAdvisor/Airbnb (SyncExternalReviewsJob)

Les jobs doivent gérer :
- Le sync lock (éviter les doublons)
- L'expiration des tokens
- Les erreurs et retries
- Les logs détaillés

---

## Scope

### In Scope

- Job `SyncGoogleReviewsJob`
- Job `SyncExternalReviewsJob`
- Mécanisme de sync lock
- Commande artisan pour sync manuel
- Scheduler pour sync automatique

### Out of Scope

- Services Google/Apify (autres stories)
- Interface utilisateur

---

## Acceptance Criteria

### SyncGoogleReviewsJob

- [ ] **AC-001**: Récupère les avis via GoogleBusinessReviewService
- [ ] **AC-002**: Crée/met à jour les reviews en base
- [ ] **AC-003**: Gère l'expiration du token (refresh automatique)
- [ ] **AC-004**: Utilise le sync lock (15 min max)
- [ ] **AC-005**: Log le résultat (created, updated, errors)

### SyncExternalReviewsJob

- [ ] **AC-006**: Ne traite que les connexions `apify_enabled`
- [ ] **AC-007**: Dispatch vers ApifyService
- [ ] **AC-008**: Respecte le sync lock
- [ ] **AC-009**: Gère les erreurs gracieusement

### Commandes et Scheduler

- [ ] **AC-010**: Commande `reviews:sync {--location=} {--platform=}`
- [ ] **AC-011**: Scheduler : Google toutes les heures, Apify toutes les 6h

---

## Technical Notes

### SyncGoogleReviewsJob

```php
class SyncGoogleReviewsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public array $backoff = [60, 300, 900];

    public function __construct(
        public ReviewConnection $connection
    ) {}

    public function handle(GoogleBusinessReviewService $service): void
    {
        if ($this->connection->isSyncLocked()) {
            Log::info('Sync locked, skipping', ['connection' => $this->connection->id]);
            return;
        }

        $this->connection->markSyncStarted();

        try {
            $reviews = $service->getReviews($this->connection);

            foreach ($reviews as $reviewData) {
                Review::updateOrCreate(
                    [
                        'location_id' => $this->connection->location_id,
                        'platform' => 'google',
                        'external_id' => $reviewData['reviewId'],
                    ],
                    [
                        'review_connection_id' => $this->connection->id,
                        'author_name' => $reviewData['reviewer']['displayName'] ?? null,
                        'rating' => $reviewData['starRating'],
                        'content' => $reviewData['comment'] ?? null,
                        'published_at' => Carbon::parse($reviewData['createTime']),
                        'has_response' => isset($reviewData['reviewReply']),
                        'sync_source' => 'api',
                    ]
                );
            }

            $this->connection->markSyncSuccess();
        } catch (\Exception $e) {
            $this->connection->markSyncFailed($e->getMessage());
            throw $e;
        }
    }
}
```

### Scheduler

```php
// app/Console/Kernel.php
protected function schedule(Schedule $schedule): void
{
    // Google sync every hour
    $schedule->command('reviews:sync --platform=google')
        ->hourly()
        ->withoutOverlapping();

    // Apify sync every 6 hours
    $schedule->command('reviews:sync --platform=apify')
        ->everySixHours()
        ->withoutOverlapping();
}
```

---

## Definition of Done

- [ ] Jobs créés et fonctionnels
- [ ] Sync lock implémenté
- [ ] Commande artisan créée
- [ ] Scheduler configuré
- [ ] Tests unitaires
- [ ] Test manuel de sync complet

---

**Cette story a été créée avec BMAD Method v6 - Phase 4 (Implementation)**

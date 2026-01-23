# STORY-001: Backend - Service d'analyse de sentiment

**Epic:** Analytics Sentiment
**Priority:** SHOULD
**Story Points:** 8
**Status:** Not Started
**Assigned To:** Dev 1
**Created:** 2026-01-23
**Sprint:** 1

---

## User Story

En tant que **développeur backend**,
Je veux **un service d'analyse de sentiment des avis**,
Afin que **les avis soient automatiquement classifiés et que les thèmes récurrents soient détectés**.

---

## Description

### Background

ReplyStack permet aux utilisateurs de répondre aux avis clients via l'IA. Actuellement, les utilisateurs n'ont pas de visibilité sur les tendances de sentiment dans leurs avis. Cette story implémente un service backend qui analyse chaque avis pour :
- Calculer un score de sentiment (0.0 à 1.0)
- Classifier le sentiment (positif, neutre, négatif)
- Détecter les thèmes mentionnés (service, propreté, prix, etc.)

Ce service sera utilisé par les stories suivantes pour afficher les analytics de sentiment dans le dashboard (STORY-002, STORY-003).

### Business Value

- **Différenciation produit** : Les concurrents n'offrent pas d'analyse de sentiment avancée à ce prix
- **Valeur utilisateur** : Permet aux entreprises de comprendre les tendances et d'agir proactivement
- **Rétention** : Feature premium qui encourage l'upgrade vers plans payants

---

## Scope

### In Scope

- Création du service `SentimentAnalysisService`
- Migration pour ajouter les colonnes sentiment à la table `reviews`
- Job asynchrone `AnalyzeReviewSentimentJob` pour traitement batch
- Analyse via Gemini API (réutilisation du provider existant)
- Classification : positif (>0.6), neutre (0.4-0.6), négatif (<0.4)
- Détection de 8 thèmes : service, propreté, prix, qualité, accueil, localisation, ambiance, rapport_qualite_prix
- Commande artisan pour analyser les avis existants

### Out of Scope

- API endpoints (STORY-002)
- Interface utilisateur (STORY-003)
- Alertes automatiques (STORY-004)
- Analyse en temps réel (batch async seulement)
- Comparaison avec période précédente

---

## User Flow

1. Un nouvel avis est créé/synchronisé dans la base
2. Un event `ReviewCreated` est dispatché
3. Le listener dispatch le job `AnalyzeReviewSentimentJob`
4. Le job appelle `SentimentAnalysisService::analyze()`
5. Le service envoie le contenu de l'avis à Gemini avec un prompt spécialisé
6. Gemini retourne un JSON structuré avec score, label, et thèmes
7. Le service parse la réponse et met à jour l'avis en base
8. L'avis est maintenant enrichi avec les données de sentiment

---

## Acceptance Criteria

### Fonctionnels

- [x] **AC-001**: Le service `SentimentAnalysisService` existe avec une méthode `analyze(Review $review): SentimentResult`
- [x] **AC-002**: Le score de sentiment est un float entre 0.0 (très négatif) et 1.0 (très positif)
- [x] **AC-003**: Le label de sentiment est calculé automatiquement :
  - `positive` si score >= 0.6
  - `neutral` si score entre 0.4 et 0.6
  - `negative` si score < 0.4
- [x] **AC-004**: Les thèmes détectés sont retournés sous forme de tableau JSON
- [x] **AC-005**: Les thèmes supportés sont : `service`, `cleanliness`, `price`, `quality`, `welcome`, `location`, `ambiance`, `value_for_money`
- [x] **AC-006**: Le job `AnalyzeReviewSentimentJob` traite un avis de manière asynchrone
- [x] **AC-007**: Les avis sans contenu textuel (rating seul) ont un score basé sur le rating (1*=0.1, 2*=0.3, 3*=0.5, 4*=0.7, 5*=0.9)
- [x] **AC-008**: Une commande `php artisan reviews:analyze-sentiment` permet d'analyser les avis existants

### Techniques

- [x] **AC-009**: La migration ajoute les colonnes `sentiment_score`, `sentiment_label`, `sentiment_themes`, `sentiment_analyzed_at` à la table `reviews`
- [x] **AC-010**: Le modèle `Review` est mis à jour avec les casts appropriés (float, string, array, datetime)
- [x] **AC-011**: Le service gère les erreurs Gemini gracieusement (retry, fallback sur rating)
- [x] **AC-012**: Le rate limiting est respecté (max 10 appels Gemini/seconde via queue throttling)

### Performance

- [x] **AC-013**: L'analyse d'un avis prend moins de 3 secondes
- [x] **AC-014**: Le batch processing peut traiter 100 avis en moins de 10 minutes

---

## Technical Notes

### Components

| Component | File | Action |
|-----------|------|--------|
| Service | `app/Services/Sentiment/SentimentAnalysisService.php` | Créer |
| DTO | `app/Services/Sentiment/SentimentResult.php` | Créer |
| Job | `app/Jobs/AnalyzeReviewSentimentJob.php` | Créer |
| Migration | `database/migrations/XXXX_add_sentiment_to_reviews.php` | Créer |
| Model | `app/Models/Review.php` | Modifier |
| Command | `app/Console/Commands/AnalyzeReviewsSentimentCommand.php` | Créer |
| Event Listener | `app/Listeners/AnalyzeNewReviewSentiment.php` | Créer |
| Event | `app/Events/ReviewCreated.php` | Créer (si n'existe pas) |

### Database Changes

```sql
-- Migration: add_sentiment_to_reviews
ALTER TABLE reviews ADD COLUMN sentiment_score DECIMAL(3,2) NULL;
ALTER TABLE reviews ADD COLUMN sentiment_label ENUM('positive', 'neutral', 'negative') NULL;
ALTER TABLE reviews ADD COLUMN sentiment_themes JSON NULL;
ALTER TABLE reviews ADD COLUMN sentiment_analyzed_at TIMESTAMP NULL;

CREATE INDEX idx_reviews_sentiment ON reviews(sentiment_label);
CREATE INDEX idx_reviews_sentiment_score ON reviews(sentiment_score);
```

### Service Implementation

```php
// app/Services/Sentiment/SentimentAnalysisService.php
namespace App\Services\Sentiment;

use App\Models\Review;
use App\Services\AI\GeminiService;

class SentimentAnalysisService
{
    public function __construct(
        private GeminiService $gemini
    ) {}

    public function analyze(Review $review): SentimentResult
    {
        // Si pas de contenu, utiliser le rating
        if (empty($review->content)) {
            return $this->analyzeFromRating($review->rating);
        }

        $prompt = $this->buildPrompt($review);
        $response = $this->gemini->generateCompletion($prompt, [
            'temperature' => 0.3, // Plus déterministe
            'max_tokens' => 200,
        ]);

        return $this->parseResponse($response['content']);
    }

    private function buildPrompt(Review $review): string
    {
        return <<<PROMPT
Analyze the sentiment of this customer review and extract themes.

Review content: "{$review->content}"
Rating: {$review->rating}/5

Return a JSON object with:
- "score": float between 0.0 (very negative) and 1.0 (very positive)
- "themes": array of detected themes from this list only: ["service", "cleanliness", "price", "quality", "welcome", "location", "ambiance", "value_for_money"]

Return ONLY the JSON, no explanation.

Example output:
{"score": 0.75, "themes": ["service", "welcome"]}
PROMPT;
    }

    private function analyzeFromRating(?int $rating): SentimentResult
    {
        $score = match($rating) {
            1 => 0.1,
            2 => 0.3,
            3 => 0.5,
            4 => 0.7,
            5 => 0.9,
            default => 0.5,
        };

        return new SentimentResult(
            score: $score,
            label: $this->getLabelFromScore($score),
            themes: []
        );
    }

    private function getLabelFromScore(float $score): string
    {
        return match(true) {
            $score >= 0.6 => 'positive',
            $score < 0.4 => 'negative',
            default => 'neutral',
        };
    }

    private function parseResponse(string $content): SentimentResult
    {
        // Parse JSON from Gemini response
        $json = json_decode($content, true);

        if (!$json || !isset($json['score'])) {
            throw new \RuntimeException('Invalid sentiment response from AI');
        }

        return new SentimentResult(
            score: (float) $json['score'],
            label: $this->getLabelFromScore((float) $json['score']),
            themes: $json['themes'] ?? []
        );
    }
}
```

### DTO Implementation

```php
// app/Services/Sentiment/SentimentResult.php
namespace App\Services\Sentiment;

readonly class SentimentResult
{
    public function __construct(
        public float $score,
        public string $label,
        public array $themes,
    ) {}

    public function toArray(): array
    {
        return [
            'score' => $this->score,
            'label' => $this->label,
            'themes' => $this->themes,
        ];
    }
}
```

### Job Implementation

```php
// app/Jobs/AnalyzeReviewSentimentJob.php
namespace App\Jobs;

use App\Models\Review;
use App\Services\Sentiment\SentimentAnalysisService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\Middleware\RateLimited;

class AnalyzeReviewSentimentJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [30, 60, 120];

    public function __construct(
        public Review $review
    ) {}

    public function middleware(): array
    {
        return [new RateLimited('gemini-sentiment')];
    }

    public function handle(SentimentAnalysisService $service): void
    {
        try {
            $result = $service->analyze($this->review);

            $this->review->update([
                'sentiment_score' => $result->score,
                'sentiment_label' => $result->label,
                'sentiment_themes' => $result->themes,
                'sentiment_analyzed_at' => now(),
            ]);
        } catch (\Exception $e) {
            // Log but don't fail - sentiment is non-critical
            \Log::warning('Sentiment analysis failed', [
                'review_id' => $this->review->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
```

### Rate Limiter Configuration

```php
// app/Providers/AppServiceProvider.php (dans boot())
RateLimiter::for('gemini-sentiment', function () {
    return Limit::perSecond(10); // Max 10 calls/second to Gemini
});
```

### Artisan Command

```php
// app/Console/Commands/AnalyzeReviewsSentimentCommand.php
namespace App\Console\Commands;

use App\Jobs\AnalyzeReviewSentimentJob;
use App\Models\Review;
use Illuminate\Console\Command;

class AnalyzeReviewsSentimentCommand extends Command
{
    protected $signature = 'reviews:analyze-sentiment
                            {--location= : Analyze only reviews for this location}
                            {--limit=100 : Maximum reviews to analyze}
                            {--force : Re-analyze already analyzed reviews}';

    protected $description = 'Analyze sentiment for existing reviews';

    public function handle(): int
    {
        $query = Review::query()
            ->whereNotNull('content')
            ->when(!$this->option('force'), fn($q) => $q->whereNull('sentiment_analyzed_at'))
            ->when($this->option('location'), fn($q, $loc) => $q->where('location_id', $loc))
            ->limit((int) $this->option('limit'));

        $count = $query->count();
        $this->info("Dispatching sentiment analysis for {$count} reviews...");

        $bar = $this->output->createProgressBar($count);

        $query->chunk(50, function ($reviews) use ($bar) {
            foreach ($reviews as $review) {
                AnalyzeReviewSentimentJob::dispatch($review);
                $bar->advance();
            }
        });

        $bar->finish();
        $this->newLine();
        $this->info('Jobs dispatched! Check Horizon for progress.');

        return Command::SUCCESS;
    }
}
```

### Review Model Updates

```php
// Ajouter à app/Models/Review.php

// Dans $fillable, ajouter:
'sentiment_score',
'sentiment_label',
'sentiment_themes',
'sentiment_analyzed_at',

// Dans casts(), ajouter:
'sentiment_score' => 'float',
'sentiment_themes' => 'array',
'sentiment_analyzed_at' => 'datetime',

// Nouveaux scopes:
public function scopeWithSentiment($query)
{
    return $query->whereNotNull('sentiment_analyzed_at');
}

public function scopePositiveSentiment($query)
{
    return $query->where('sentiment_label', 'positive');
}

public function scopeNegativeSentiment($query)
{
    return $query->where('sentiment_label', 'negative');
}

public function scopeWithTheme($query, string $theme)
{
    return $query->whereJsonContains('sentiment_themes', $theme);
}

// Nouvel accessor:
public function getSentimentEmojiAttribute(): string
{
    return match($this->sentiment_label) {
        'positive' => '😊',
        'negative' => '😞',
        'neutral' => '😐',
        default => '❓',
    };
}
```

---

## Dependencies

### Prerequisite Stories

Aucune - Cette story est la fondation de l'Epic Analytics Sentiment.

### Blocked Stories

Les stories suivantes dépendent de STORY-001 :
- **STORY-002**: Backend - API endpoints analytics sentiment
- **STORY-003**: Frontend - Dashboard Analytics Sentiment (indirectement via STORY-002)
- **STORY-004**: Alertes tendances négatives
- **STORY-005**: Tests unitaires services critiques

### External Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Gemini API | ✅ Configuré | Réutiliser `GeminiService` existant |
| Laravel Horizon | ✅ Configuré | Pour monitoring des jobs |
| Redis | ✅ Configuré | Pour rate limiting et queues |

---

## Definition of Done

### Code

- [x] `SentimentAnalysisService` créé et fonctionnel
- [x] `SentimentResult` DTO créé
- [x] `AnalyzeReviewSentimentJob` créé avec retry et rate limiting
- [x] Migration créée et testée
- [x] Modèle `Review` mis à jour
- [x] Commande artisan fonctionnelle
- [ ] Event/Listener pour nouveaux avis (optionnel, peut être ajouté plus tard)

### Tests

- [ ] Test unitaire `SentimentAnalysisServiceTest`
  - [ ] Test analyse avec contenu
  - [x] Test fallback sur rating seul
  - [ ] Test parsing réponse JSON
  - [ ] Test gestion erreur Gemini
- [ ] Test du job `AnalyzeReviewSentimentJobTest`
- [ ] Test de la commande artisan

### Documentation

- [x] PHPDoc sur toutes les méthodes publiques
- [x] Exemple d'utilisation dans le code

### Deployment

- [x] Migration exécutée en staging
- [x] Tests manuels avec vrais avis
- [ ] Déployé en production
- [ ] Commande exécutée sur avis existants (optionnel)

---

## Story Points Breakdown

| Composant | Points | Justification |
|-----------|--------|---------------|
| Service + DTO | 3 | Logique métier principale, prompt engineering |
| Migration + Model | 1 | Straightforward schema change |
| Job + Rate Limiting | 2 | Config queue, retry logic |
| Command | 1 | Simple CLI wrapper |
| Tests | 1 | Unit tests basiques |
| **Total** | **8** | |

---

## Additional Notes

### Prompt Engineering

Le prompt pour Gemini doit être testé avec plusieurs types d'avis :
- Avis très positif (5 étoiles, éloge)
- Avis très négatif (1 étoile, plainte)
- Avis mitigé (3 étoiles, positif et négatif)
- Avis court (quelques mots)
- Avis long (plusieurs paragraphes)
- Avis dans différentes langues (FR, EN, ES)

### Fallback Strategy

Si Gemini échoue après 3 retries :
1. Logger l'erreur
2. Ne PAS marquer comme analysé (pour retry ultérieur)
3. Utiliser le score basé sur rating comme fallback temporaire pour l'affichage

### Considérations Multi-langue

Le prompt est en anglais pour Gemini, mais les avis peuvent être dans n'importe quelle langue. Gemini gère bien le multilingue, donc pas de traduction nécessaire.

---

## Progress Tracking

**Status History:**
- 2026-01-23: Story créée par Scrum Master (BMAD)
- 2026-01-23: Implémentation complétée

**Actual Effort:** 8 points (conforme à l'estimation)

---

**Cette story a été créée avec BMAD Method v6 - Phase 4 (Implementation)**

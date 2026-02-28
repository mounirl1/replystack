# ReplyStack - AI Review Reply Platform

> Fichier de contexte pour Claude Code. Ce fichier est lu automatiquement au lancement.
> Dernière mise à jour : Janvier 2026

## 🌐 URLs Importantes

- **Site Web** : https://www.reply-stack.app
- **API** : https://api.reply-stack.app
- **Dashboard** : https://www.reply-stack.app/dashboard

## 🎯 Vision Produit

ReplyStack permet aux entreprises de centraliser, monitorer et répondre efficacement à tous leurs avis clients grâce à l'IA. L'innovation majeure : une **extension navigateur** qui permet de répondre directement sur n'importe quelle plateforme, même sans API.

### Proposition de valeur
- **Extension Chrome/Firefox** : Génère des réponses IA directement sur les plateformes d'avis
- **Dashboard SaaS** : Centralise les avis, analytics, historique des réponses
- **Prix accessible** : 0-79€/mois (vs 300-500$ chez les concurrents)

---

## 🏗️ Architecture Technique

### Stack principale

| Composant | Technologie | Justification |
|-----------|-------------|---------------|
| Backend API | Laravel 12 | Expertise existante, écosystème mature |
| Auth API | Laravel Sanctum | Tokens API pour extension + dashboard |
| Base de données | MySQL 8 | Expertise existante |
| Cache | Redis | Sessions, cache, queues |
| Queues/Jobs | Laravel Horizon + Redis | Dashboard monitoring, workers dédiés |
| IA | Gemini 2.0 Flash (défaut) + Mistral (fallback) | Rapide, économique |
| Frontend Dashboard | React 19 + TypeScript + Vite | Réutilisation pour extension |
| Extension | Plasmo (React) | Build multi-navigateur, DX moderne |
| Paiement | Lemon Squeezy | Simplicité, gestion TVA automatique |
| Hébergement | Railway (API + Frontend) | Simplicité, coût maîtrisé |

### Structure Monorepo

```
replystack/
├── apps/
│   ├── api/                    # Laravel 12 Backend
│   │   ├── app/
│   │   │   ├── Http/
│   │   │   │   ├── Controllers/
│   │   │   │   │   └── Api/
│   │   │   │   │       ├── AuthController.php
│   │   │   │   │       ├── ReplyController.php
│   │   │   │   │       ├── ReviewController.php
│   │   │   │   │       ├── LocationController.php
│   │   │   │   │       └── StripeController.php
│   │   │   │   ├── Middleware/
│   │   │   │   │   └── CheckQuota.php
│   │   │   │   └── Resources/
│   │   │   ├── Models/
│   │   │   │   ├── User.php
│   │   │   │   ├── Organization.php
│   │   │   │   ├── Location.php
│   │   │   │   ├── Review.php
│   │   │   │   └── Response.php
│   │   │   ├── Services/
│   │   │   │   ├── AI/
│   │   │   │   │   ├── ClaudeService.php
│   │   │   │   │   └── ReplyGeneratorService.php
│   │   │   │   ├── Quota/
│   │   │   │   │   └── QuotaService.php
│   │   │   │   └── Scraping/
│   │   │   │       └── ReviewAggregatorService.php
│   │   │   └── Jobs/
│   │   │       ├── SyncReviewsJob.php
│   │   │       └── SendAlertJob.php
│   │   ├── database/
│   │   │   └── migrations/
│   │   ├── routes/
│   │   │   └── api.php
│   │   └── config/
│   │       ├── horizon.php
│   │       └── services.php
│   │
│   ├── web/                    # React Dashboard
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   │   ├── Landing.tsx
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Register.tsx
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Reviews.tsx
│   │   │   │   ├── Settings.tsx
│   │   │   │   └── Pricing.tsx
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   │   └── api.ts
│   │   │   └── store/
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── extension/              # Plasmo Extension
│       ├── src/
│       │   ├── background/
│       │   │   └── index.ts
│       │   ├── contents/
│       │   │   ├── google-business.tsx
│       │   │   ├── tripadvisor.tsx
│       │   │   ├── booking.tsx
│       │   │   ├── yelp.tsx
│       │   │   └── facebook.tsx
│       │   ├── popup/
│       │   │   └── index.tsx
│       │   ├── components/
│       │   │   ├── ReplyPopup.tsx
│       │   │   ├── ToneSelector.tsx
│       │   │   └── QuotaDisplay.tsx
│       │   └── services/
│       │       └── api.ts
│       ├── package.json
│       └── plasmo.config.ts
│
├── packages/
│   └── shared/                 # Types partagés
│       ├── types/
│       │   ├── user.ts
│       │   ├── review.ts
│       │   └── response.ts
│       └── constants/
│           └── platforms.ts
│
├── CLAUDE.md                   # Ce fichier
├── pnpm-workspace.yaml
└── README.md
```

---

## 📊 Modèle de Données

### Tables principales

```sql
-- Users (authentification + quotas)
CREATE TABLE users (
                       id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
                       email VARCHAR(255) UNIQUE NOT NULL,
                       password VARCHAR(255) NOT NULL,
                       name VARCHAR(255),
                       plan ENUM('free', 'starter', 'pro', 'business', 'enterprise') DEFAULT 'free',
                       daily_quota INT DEFAULT 3,           -- Free: 3/jour
                       monthly_quota INT DEFAULT 0,         -- Starter: 50/mois, Pro+: illimité (0)
                       quota_used_today INT DEFAULT 0,
                       quota_used_month INT DEFAULT 0,
                       quota_reset_at TIMESTAMP,
                       stripe_customer_id VARCHAR(255),
                       stripe_subscription_id VARCHAR(255),
                       organization_id BIGINT UNSIGNED NULL,
                       created_at TIMESTAMP,
                       updated_at TIMESTAMP,

                       INDEX idx_email (email),
                       INDEX idx_organization (organization_id)
);

-- Organizations (Business+)
CREATE TABLE organizations (
                               id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
                               name VARCHAR(255) NOT NULL,
                               owner_id BIGINT UNSIGNED NOT NULL,
                               max_locations INT DEFAULT 10,
                               max_users INT DEFAULT 5,
                               created_at TIMESTAMP,
                               updated_at TIMESTAMP,

                               FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- Locations (établissements)
CREATE TABLE locations (
                           id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
                           organization_id BIGINT UNSIGNED NULL,
                           user_id BIGINT UNSIGNED NOT NULL,    -- Si pas d'organization
                           name VARCHAR(255) NOT NULL,
                           address TEXT,
                           google_place_id VARCHAR(255),
                           tripadvisor_id VARCHAR(255),
                           booking_id VARCHAR(255),
                           yelp_id VARCHAR(255),
                           facebook_page_id VARCHAR(255),
                           default_tone ENUM('professional', 'friendly', 'formal', 'casual') DEFAULT 'professional',
                           default_language VARCHAR(5) DEFAULT 'auto',
                           created_at TIMESTAMP,
                           updated_at TIMESTAMP,

                           INDEX idx_user (user_id),
                           INDEX idx_organization (organization_id),
                           INDEX idx_google (google_place_id)
);

-- Reviews (avis agrégés)
CREATE TABLE reviews (
                         id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
                         location_id BIGINT UNSIGNED NOT NULL,
                         platform ENUM('google', 'tripadvisor', 'booking', 'yelp', 'facebook', 'g2', 'capterra', 'trustpilot') NOT NULL,
                         external_id VARCHAR(255) NOT NULL,   -- ID sur la plateforme d'origine
                         author_name VARCHAR(255),
                         author_avatar VARCHAR(500),
                         rating TINYINT UNSIGNED,             -- 1-5
                         content TEXT,
                         language VARCHAR(5),
                         published_at TIMESTAMP,
                         status ENUM('pending', 'replied', 'ignored') DEFAULT 'pending',
                         created_at TIMESTAMP,
                         updated_at TIMESTAMP,

                         UNIQUE KEY uk_platform_external (platform, external_id),
                         INDEX idx_location_status (location_id, status),
                         INDEX idx_location_date (location_id, published_at DESC, id DESC),
                         INDEX idx_platform_date (platform, published_at DESC)
);

-- Responses (réponses générées)
CREATE TABLE responses (
                           id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
                           review_id BIGINT UNSIGNED NOT NULL,
                           user_id BIGINT UNSIGNED NOT NULL,
                           content TEXT NOT NULL,
                           tone ENUM('professional', 'friendly', 'formal', 'casual') NOT NULL,
                           language VARCHAR(5) NOT NULL,
                           is_published BOOLEAN DEFAULT FALSE,
                           published_at TIMESTAMP NULL,
                           generation_time_ms INT,              -- Temps de génération
                           tokens_used INT,                     -- Tokens Claude utilisés
                           created_at TIMESTAMP,
                           updated_at TIMESTAMP,

                           INDEX idx_review (review_id),
                           INDEX idx_user_date (user_id, created_at DESC)
);

-- Templates (modèles de réponse personnalisés)
CREATE TABLE templates (
                           id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
                           user_id BIGINT UNSIGNED NOT NULL,
                           location_id BIGINT UNSIGNED NULL,    -- NULL = template global
                           name VARCHAR(255) NOT NULL,
                           category ENUM('positive', 'negative', 'neutral', 'complaint', 'praise') NOT NULL,
                           content TEXT NOT NULL,
                           variables JSON,                      -- ["customer_name", "issue_mentioned"]
                           created_at TIMESTAMP,
                           updated_at TIMESTAMP,

                           INDEX idx_user_category (user_id, category)
);
```

### Relations Eloquent

```php
// User.php
class User extends Authenticatable
{
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }
    
    public function locations(): HasMany
    {
        return $this->hasMany(Location::class);
    }
    
    public function responses(): HasMany
    {
        return $this->hasMany(Response::class);
    }
    
    public function templates(): HasMany
    {
        return $this->hasMany(Template::class);
    }
    
    // Helpers quota
    public function hasQuotaRemaining(): bool
    {
        if ($this->plan === 'pro' || $this->plan === 'business' || $this->plan === 'enterprise') {
            return true; // Illimité
        }
        
        if ($this->plan === 'free') {
            return $this->quota_used_today < $this->daily_quota;
        }
        
        // Starter
        return $this->quota_used_month < $this->monthly_quota;
    }
    
    public function decrementQuota(): void
    {
        if ($this->plan === 'free') {
            $this->increment('quota_used_today');
        } elseif ($this->plan === 'starter') {
            $this->increment('quota_used_month');
        }
    }
}

// Location.php
class Location extends Model
{
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }
    
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }
}

// Review.php
class Review extends Model
{
    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }
    
    public function responses(): HasMany
    {
        return $this->hasMany(Response::class);
    }
    
    public function latestResponse(): HasOne
    {
        return $this->hasOne(Response::class)->latestOfMany();
    }
}
```

---

## 🔌 API Endpoints

### Authentication

```
POST   /api/auth/register          # Inscription
POST   /api/auth/login             # Connexion (retourne token Sanctum)
POST   /api/auth/logout            # Déconnexion
GET    /api/auth/user              # User connecté + quotas
```

### Replies (cœur du produit)

```
POST   /api/replies/generate       # Génère une réponse IA
       Body: {
           review_content: string,
           review_rating: int,
           review_author: string,
           platform: string,
           tone?: 'professional'|'friendly'|'formal'|'casual',
           language?: string,      # 'auto' pour détection
           location_id?: int       # Pour contexte établissement
       }
       Response: {
           reply: string,
           tone: string,
           language: string,
           tokens_used: int,
           quota_remaining: int|'unlimited'
       }

GET    /api/replies                # Historique des réponses
GET    /api/replies/{id}           # Détail d'une réponse
```

### Reviews (dashboard)

```
GET    /api/reviews                # Liste des avis (cursor pagination)
       Query: ?location_id=&platform=&status=&cursor=
GET    /api/reviews/{id}           # Détail d'un avis
PATCH  /api/reviews/{id}/status    # Marquer replied/ignored
```

### Locations

```
GET    /api/locations              # Liste des établissements
POST   /api/locations              # Créer un établissement
GET    /api/locations/{id}         # Détail
PATCH  /api/locations/{id}         # Modifier
DELETE /api/locations/{id}         # Supprimer
POST   /api/locations/{id}/sync    # Forcer sync des avis
```

### Lemon Squeezy (Paiements)

```
POST   /api/lemonsqueezy/checkout  # Créer session Checkout
       Body: { plan: 'starter'|'pro'|'business', billing: 'monthly'|'yearly' }
POST   /api/lemonsqueezy/portal    # Accès portail client
POST   /api/lemonsqueezy/webhook   # Webhook Lemon Squeezy (events)
```

### User

```
GET    /api/user/quota             # Quota actuel
PATCH  /api/user/settings          # Préférences (ton, langue par défaut)
```

---

## 🤖 Service IA (Gemini - Défaut)

### Architecture Multi-Provider

Le système utilise un pattern Factory pour supporter plusieurs fournisseurs IA :
- **Gemini 2.0 Flash** : Provider par défaut (gratuit, rapide)
- **Mistral** : Provider payant (qualité supérieure)
- **Claude** : Supporté mais pas actif

### AIProviderFactory.php

```php
namespace App\Services\AI;

class AIProviderFactory
{
    public static function create(?string $provider = null): AIProviderInterface
    {
        $provider = $provider ?? config('services.ai.default_provider', 'gemini');

        return match($provider) {
            'gemini' => app(GeminiService::class),
            'mistral' => app(MistralService::class),
            'claude' => app(ClaudeService::class),
            default => throw new \InvalidArgumentException("Unknown AI provider: {$provider}"),
        };
    }
}
```

### GeminiService.php (Provider par défaut)

```php
namespace App\Services\AI;

use Illuminate\Support\Facades\Http;

class GeminiService implements AIProviderInterface
{
    private string $apiKey;
    private string $model;

    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key');
        $this->model = config('services.gemini.model', 'gemini-2.0-flash');
    }

    public function generateCompletion(string $prompt, array $options = []): array
    {
        $response = Http::post(
            "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent?key={$this->apiKey}",
            [
                'contents' => [['parts' => [['text' => $prompt]]]],
                'generationConfig' => [
                    'temperature' => $options['temperature'] ?? 0.7,
                    'maxOutputTokens' => $options['max_tokens'] ?? 500,
                ],
            ]
        );

        return [
            'content' => $response->json('candidates.0.content.parts.0.text'),
            'tokens_used' => $response->json('usageMetadata.totalTokenCount', 0),
        ];
    }
}
```

### ReplyGeneratorService.php

```php
namespace App\Services\AI;

use App\Models\Location;

class ReplyGeneratorService
{
    public function __construct(
        private ClaudeService $claude
    ) {}
    
    public function generate(array $review, array $options = []): array
    {
        $tone = $options['tone'] ?? 'professional';
        $language = $options['language'] ?? 'auto';
        $location = $options['location'] ?? null;
        
        $prompt = $this->buildPrompt($review, $tone, $language, $location);
        
        $result = $this->claude->generateCompletion($prompt, [
            'model' => 'claude-3-haiku-20240307', // Rapide et économique
            'max_tokens' => 400,
        ]);
        
        // Détecter la langue si auto
        $detectedLanguage = $language === 'auto' 
            ? $this->detectLanguage($review['content']) 
            : $language;
        
        return [
            'reply' => trim($result['content']),
            'tone' => $tone,
            'language' => $detectedLanguage,
            'tokens_used' => $result['tokens_used'],
            'generation_time_ms' => $result['generation_time_ms'],
        ];
    }
    
    private function buildPrompt(array $review, string $tone, string $language, ?Location $location): string
    {
        $toneInstructions = match($tone) {
            'professional' => 'Adopte un ton professionnel et courtois.',
            'friendly' => 'Adopte un ton chaleureux et amical, comme un ami.',
            'formal' => 'Adopte un ton très formel et respectueux.',
            'casual' => 'Adopte un ton décontracté mais respectueux.',
        };
        
        $languageInstruction = $language === 'auto'
            ? 'Réponds dans la même langue que l\'avis.'
            : "Réponds en {$language}.";
        
        $locationContext = $location 
            ? "Établissement : {$location->name}\n" 
            : '';
        
        $ratingContext = match(true) {
            $review['rating'] <= 2 => 'Cet avis est négatif. Montre de l\'empathie, présente des excuses sincères, et propose une solution ou un suivi.',
            $review['rating'] == 3 => 'Cet avis est mitigé. Remercie pour le feedback constructif et mentionne les points d\'amélioration.',
            default => 'Cet avis est positif. Remercie chaleureusement et invite à revenir.',
        };
        
        return <<<PROMPT
Tu es un assistant spécialisé dans la rédaction de réponses aux avis clients.

{$locationContext}
Plateforme : {$review['platform']}
Note : {$review['rating']}/5
Auteur : {$review['author']}
Avis : {$review['content']}

Instructions :
- {$toneInstructions}
- {$languageInstruction}
- {$ratingContext}
- La réponse doit faire entre 50 et 150 mots.
- Ne fais pas de promesses impossibles à tenir.
- N'utilise pas de formules génériques type "Cher client".
- Personnalise la réponse en mentionnant des éléments spécifiques de l'avis.
- Termine par une invitation à revenir ou à contacter l'établissement si besoin.

Génère uniquement la réponse, sans introduction ni explication.
PROMPT;
    }
    
    private function detectLanguage(string $text): string
    {
        // Détection simple basée sur des patterns
        // En production, utiliser un service dédié ou Claude
        $patterns = [
            'fr' => '/\b(le|la|les|de|du|des|et|est|sont|nous|vous|merci|bonjour)\b/i',
            'en' => '/\b(the|is|are|was|were|have|has|thank|hello|great)\b/i',
            'es' => '/\b(el|la|los|las|de|del|y|es|son|gracias|hola)\b/i',
            'de' => '/\b(der|die|das|und|ist|sind|haben|danke|guten)\b/i',
            'it' => '/\b(il|la|i|le|di|del|e|è|sono|grazie|buon)\b/i',
        ];
        
        $scores = [];
        foreach ($patterns as $lang => $pattern) {
            preg_match_all($pattern, $text, $matches);
            $scores[$lang] = count($matches[0]);
        }
        
        arsort($scores);
        return array_key_first($scores) ?: 'en';
    }
}
```

---

## 🔧 Configuration Horizon (Jobs)

```php
// config/horizon.php
'environments' => [
    'production' => [
        // Jobs de sync des avis (lents, peu prioritaires)
        'sync-reviews' => [
            'connection' => 'redis',
            'queue' => ['sync-reviews'],
            'balance' => 'simple',
            'processes' => 2,
            'tries' => 3,
            'timeout' => 300,
        ],
        
        // Jobs d'alertes (rapides, prioritaires)
        'alerts' => [
            'connection' => 'redis',
            'queue' => ['alerts', 'default'],
            'balance' => 'auto',
            'processes' => 5,
            'tries' => 3,
            'timeout' => 60,
        ],
    ],
    
    'local' => [
        'default' => [
            'connection' => 'redis',
            'queue' => ['default', 'sync-reviews', 'alerts'],
            'balance' => 'simple',
            'processes' => 2,
            'tries' => 1,
            'timeout' => 60,
        ],
    ],
],
```

---

## 🧩 Extension - Content Scripts

### Pattern Factory pour les plateformes

```typescript
// apps/extension/src/contents/base.ts
export interface ReviewData {
    externalId: string;
    author: string;
    rating: number;
    content: string;
    date: string;
    platform: Platform;
}

export interface PlatformAdapter {
    platform: Platform;
    urlPattern: RegExp;

    isReviewPage(): boolean;
    extractReviews(): ReviewData[];
    injectReplyButton(review: HTMLElement, onClick: () => void): void;
    insertReply(review: HTMLElement, reply: string): void;
}

// apps/extension/src/contents/google-business.tsx
export const GoogleBusinessAdapter: PlatformAdapter = {
    platform: 'google',
    urlPattern: /business\.google\.com\/.*\/reviews/,

    isReviewPage() {
        return this.urlPattern.test(window.location.href);
    },

    extractReviews() {
        const reviewElements = document.querySelectorAll('[data-review-id]');
        return Array.from(reviewElements).map(el => ({
            externalId: el.getAttribute('data-review-id') || '',
            author: el.querySelector('.review-author')?.textContent || '',
            rating: this.extractRating(el),
            content: el.querySelector('.review-text')?.textContent || '',
            date: el.querySelector('.review-date')?.textContent || '',
            platform: 'google' as Platform,
        }));
    },

    injectReplyButton(review: HTMLElement, onClick: () => void) {
        const existingBtn = review.querySelector('.replystack-btn');
        if (existingBtn) return;

        const btn = document.createElement('button');
        btn.className = 'replystack-btn';
        btn.innerHTML = '✨ Generate AI Reply';
        btn.onclick = onClick;

        const replySection = review.querySelector('.reply-section');
        replySection?.prepend(btn);
    },

    insertReply(review: HTMLElement, reply: string) {
        const textarea = review.querySelector('textarea.reply-input') as HTMLTextAreaElement;
        if (textarea) {
            textarea.value = reply;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
        }
    },

    extractRating(el: Element): number {
        const stars = el.querySelectorAll('.star-rating .filled');
        return stars.length || 0;
    },
};
```

---

## 💰 Plans & Pricing

| Plan | Prix       | Quotas   | Features |
|------|------------|----------|----------|
| **Free** | 0€         | 15/mois  | Extension, dashboard, tous tons |
| **Starter** | 9,90€/mois | 50/mois  | + Tout Free |
| **Pro** | 29€/mois   | 200/mois | + Analytics, alertes |
| **Business** | 79€/mois   | 500/mois | + 10 locations, 5 users, Slack |
| **Enterprise** | Sur devis  | sur devis | + API, white-label, SSO |

### Lemon Squeezy Products

Les produits sont configurés dans Lemon Squeezy avec des variant IDs :
- Starter : Monthly + Yearly variants
- Pro : Monthly + Yearly variants
- Business : Monthly + Yearly variants

Configuration via variables d'environnement `LEMONSQUEEZY_*`.

---

## 📁 Fichiers de configuration importants

### .env (exemple)

```env
APP_NAME=ReplyStack
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=replystack
DB_USERNAME=root
DB_PASSWORD=

# Redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# AI Providers
AI_DEFAULT_PROVIDER=gemini
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.0-flash
MISTRAL_API_KEY=...
ANTHROPIC_API_KEY=sk-ant-...  # optionnel

# Lemon Squeezy
LEMONSQUEEZY_API_KEY=...
LEMONSQUEEZY_STORE_ID=...
LEMONSQUEEZY_WEBHOOK_SECRET=...
LEMONSQUEEZY_STARTER_MONTHLY_VARIANT_ID=...
LEMONSQUEEZY_STARTER_YEARLY_VARIANT_ID=...
LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID=...
LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID=...
LEMONSQUEEZY_BUSINESS_MONTHLY_VARIANT_ID=...
LEMONSQUEEZY_BUSINESS_YEARLY_VARIANT_ID=...

# Horizon
HORIZON_PREFIX=replystack_horizon:
```

---

## 🚀 Commandes utiles

```bash
# Installation
pnpm install                    # Install all workspaces
cd apps/api && composer install # Install Laravel deps

# Développement
pnpm --filter api dev          # Laravel (php artisan serve)
pnpm --filter web dev          # React dashboard (vite)
pnpm --filter extension dev    # Plasmo extension

# Build
pnpm --filter extension build  # Build extension pour Chrome
pnpm --filter web build        # Build dashboard

# Base de données
cd apps/api
php artisan migrate
php artisan db:seed

# Horizon (jobs)
php artisan horizon

# Tests
cd apps/api && php artisan test
pnpm --filter web test
```

---

## 🎯 MVP - Ordre de développement

### Phase 1 : Core (Semaine 1-2)
1. [ ] Init monorepo (pnpm workspaces)
2. [ ] Backend : Auth (register, login, user)
3. [ ] Backend : Quota system
4. [ ] Backend : POST /api/replies/generate
5. [ ] Extension : Plasmo setup + auth flow

### Phase 2 : Extension MVP (Semaine 3-4)
1. [ ] Content script Google Business
2. [ ] Content script TripAdvisor
3. [ ] Popup UI (login, quota, settings)
4. [ ] Injection bouton + génération

### Phase 3 : Dashboard (Semaine 5-6)
1. [ ] Landing page
2. [ ] Auth pages
3. [ ] Dashboard (historique, stats basiques)
4. [ ] Stripe checkout

### Phase 4 : Polish & Launch (Semaine 7-8)
1. [ ] Tests E2E
2. [ ] Chrome Web Store submission
3. [ ] Firefox Add-ons submission
4. [ ] Soft launch

---

## ⚠️ Points d'attention

### Performance (leçons TriggerFlow)
- Utiliser `cursorPaginate()` au lieu de `paginate()` pour les listings
- Index composites sur `(location_id, published_at, id)` pour les reviews
- Eager loading systématique : `Review::with('location', 'responses')`
- Cache Redis pour les stats dashboard

### Sécurité
- Rate limiting sur `/api/replies/generate` (prévenir abus)
- Validation stricte des inputs (platform, tone, language)
- Sanctum tokens avec expiration
- CORS configuré pour l'extension uniquement

### Extension
- Sélecteurs DOM résilients (classes multiples, attributs data-)
- Monitoring des changements de DOM (MutationObserver)
- Fallback gracieux si plateforme change son HTML
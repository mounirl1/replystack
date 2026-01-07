<?php

namespace App\Models;

use App\Enums\BusinessSector;
use App\Enums\NegativeStrategy;
use App\Enums\ResponseLength;
use App\Enums\ResponseTone;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * LocationResponseProfile Model
 *
 * Represents the response style configuration for a location.
 *
 * @property string $id
 * @property int $location_id
 * @property string|null $business_sector
 * @property string $business_name
 * @property string|null $signature
 * @property string $tone
 * @property string $default_length
 * @property string $negative_strategy
 * @property array|null $include_elements
 * @property string|null $highlights
 * @property string|null $avoid_topics
 * @property string|null $additional_context
 * @property bool $onboarding_completed
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 *
 * @property-read Location $location
 */
class LocationResponseProfile extends Model
{
    use HasFactory, HasUuids;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'location_id',
        'business_sector',
        'business_name',
        'city',
        'seo_keywords',
        'main_services',
        'signature',
        'tone',
        'default_length',
        'negative_strategy',
        'include_elements',
        'highlights',
        'avoid_topics',
        'additional_context',
        'onboarding_completed',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'include_elements' => 'array',
        'onboarding_completed' => 'boolean',
    ];

    /**
     * Get the location that owns this profile.
     *
     * @return BelongsTo<Location, LocationResponseProfile>
     */
    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    /**
     * Get the business sector enum.
     */
    public function getBusinessSectorEnumAttribute(): ?BusinessSector
    {
        return $this->business_sector ? BusinessSector::from($this->business_sector) : null;
    }

    /**
     * Get the tone enum.
     */
    public function getToneEnumAttribute(): ResponseTone
    {
        return ResponseTone::from($this->tone);
    }

    /**
     * Get the length enum.
     */
    public function getLengthEnumAttribute(): ResponseLength
    {
        return ResponseLength::from($this->default_length);
    }

    /**
     * Get the negative strategy enum.
     */
    public function getNegativeStrategyEnumAttribute(): NegativeStrategy
    {
        return NegativeStrategy::from($this->negative_strategy);
    }

    /**
     * Get the default include elements configuration.
     *
     * @return array<string, array<string, bool>>
     */
    public static function defaultIncludeElements(): array
    {
        return [
            'negative' => [
                'customer_name' => true,
                'business_name' => true,
                'emojis' => false,
                'invitation' => false,
                'signature' => true,
            ],
            'neutral' => [
                'customer_name' => true,
                'business_name' => true,
                'emojis' => false,
                'invitation' => true,
                'signature' => true,
            ],
            'positive' => [
                'customer_name' => true,
                'business_name' => true,
                'emojis' => true,
                'invitation' => true,
                'signature' => true,
            ],
        ];
    }

    /**
     * Get the sentiment type from a rating.
     *
     * @param int $rating The review rating (1-5)
     * @return string 'negative', 'neutral', or 'positive'
     */
    public static function getSentimentFromRating(int $rating): string
    {
        if ($rating <= 2) {
            return 'negative';
        }
        if ($rating === 3) {
            return 'neutral';
        }

        return 'positive';
    }

    /**
     * Get the include elements configuration for a specific rating.
     *
     * @param int $rating The review rating (1-5)
     * @return array<string, bool>
     */
    public function getIncludeElementsForRating(int $rating): array
    {
        $sentiment = self::getSentimentFromRating($rating);
        $elements = $this->include_elements ?? self::defaultIncludeElements();

        return $elements[$sentiment] ?? $elements['neutral'] ?? self::defaultIncludeElements()['neutral'];
    }

    /**
     * Build the AI system prompt from the profile settings.
     *
     * @param int $rating The review rating (1-5)
     * @param string|null $specificContext Optional specific context for this reply
     * @param string|null $toneOverride Optional tone override
     * @param string|null $lengthOverride Optional length override
     * @return string
     */
    public function buildSystemPrompt(
        int $rating,
        ?string $specificContext = null,
        ?string $toneOverride = null,
        ?string $lengthOverride = null
    ): string {
        $tone = $toneOverride ? ResponseTone::from($toneOverride) : $this->tone_enum;
        $length = $lengthOverride ? ResponseLength::from($lengthOverride) : $this->length_enum;
        $wordRange = $length->wordRange();

        $prompt = "Tu es un assistant spécialisé dans la rédaction de réponses aux avis clients.\n\n";

        // Business context
        $prompt .= "## Contexte de l'établissement\n";
        $prompt .= "Nom : {$this->business_name}\n";

        if ($this->business_sector) {
            $sectorLabel = BusinessSector::from($this->business_sector)->label();
            $prompt .= "Secteur : {$sectorLabel}\n";
        }

        if ($this->city) {
            $prompt .= "Localisation : {$this->city}\n";
        }

        if ($this->additional_context) {
            $prompt .= "Contexte : {$this->additional_context}\n";
        }

        // Strict length constraint
        $prompt .= "\n## CONTRAINTE DE LONGUEUR (OBLIGATOIRE)\n";
        $prompt .= "Ta réponse DOIT contenir EXACTEMENT entre {$wordRange['min']} et {$wordRange['max']} mots.\n";
        $prompt .= "Compte les mots avant de répondre. Cette limite est STRICTE.\n";
        $prompt .= "Une réponse trop longue ou trop courte sera rejetée.\n";

        // Formatting instructions
        $prompt .= "\n## Structure de la réponse\n";
        $prompt .= $length->formatInstructions() . "\n";

        // Tone
        $prompt .= "\n## Ton\n";
        $prompt .= $tone->promptInstructions() . "\n";

        // SEO instructions
        if ($this->city || $this->seo_keywords || $this->main_services) {
            $prompt .= "\n## Optimisation SEO (intégrer naturellement)\n";

            if ($this->city) {
                $prompt .= "- Mentionne la localisation ({$this->city}) de manière naturelle si pertinent.\n";
            }

            if ($this->seo_keywords) {
                $prompt .= "- Intègre si pertinent ces mots-clés : {$this->seo_keywords}\n";
            }

            if ($this->main_services) {
                $prompt .= "- Mentionne les services/produits si en lien avec l'avis : {$this->main_services}\n";
            }

            $prompt .= "- Utilise le nom complet de l'établissement.\n";
            $prompt .= "- L'intégration doit être naturelle, jamais forcée.\n";
        }

        // Include options (based on sentiment)
        $elements = $this->getIncludeElementsForRating($rating);

        $prompt .= "\n## Éléments à inclure\n";
        if ($elements['customer_name'] ?? false) {
            $prompt .= "- Utilise le prénom du client si disponible.\n";
        }
        if ($elements['business_name'] ?? false) {
            $prompt .= "- Mentionne le nom de l'établissement.\n";
        }
        if ($elements['emojis'] ?? false) {
            $prompt .= "- Utilise des emojis pertinents avec modération.\n";
        } else {
            $prompt .= "- N'utilise PAS d'emojis.\n";
        }
        if ($elements['invitation'] ?? false) {
            $prompt .= "- Termine par une invitation à revenir.\n";
        }
        if (($elements['signature'] ?? false) && $this->signature) {
            $prompt .= "- Signe la réponse avec : {$this->signature}\n";
        }

        // Highlights
        if ($this->highlights) {
            $prompt .= "\n## Points forts à mentionner si pertinent\n";
            $prompt .= "{$this->highlights}\n";
        }

        // Avoid topics
        if ($this->avoid_topics) {
            $prompt .= "\n## Sujets à éviter\n";
            $prompt .= "NE MENTIONNE JAMAIS : {$this->avoid_topics}\n";
        }

        // Handle negative reviews
        if ($rating <= 2) {
            $prompt .= "\n## Stratégie pour cet avis négatif\n";
            $prompt .= $this->negative_strategy_enum->promptInstructions() . "\n";
        } elseif ($rating == 3) {
            $prompt .= "\n## Instructions pour cet avis mitigé\n";
            $prompt .= "Remercie pour le feedback constructif. Reconnais les points positifs mentionnés et montre que tu prends en compte les suggestions.\n";
        } else {
            $prompt .= "\n## Instructions pour cet avis positif\n";
            $prompt .= "Remercie chaleureusement pour ce retour positif. Montre ta gratitude sincère.\n";
        }

        // Specific context for this reply
        if ($specificContext) {
            $prompt .= "\n## Contexte spécifique pour cet avis\n";
            $prompt .= "{$specificContext}\n";
        }

        $prompt .= "\n## Règles importantes\n";
        $prompt .= "- Ne fais pas de promesses impossibles à tenir.\n";
        $prompt .= "- N'utilise pas de formules génériques type \"Cher client\" ou \"Cher(e) client(e)\".\n";
        $prompt .= "- Personnalise la réponse en mentionnant des éléments spécifiques de l'avis.\n";
        $prompt .= "- Génère uniquement la réponse, sans introduction ni explication.\n";

        // Final reminder for strict length
        $prompt .= "\n## Rappel final\n";
        $prompt .= "IMPORTANT : Respecte STRICTEMENT la limite de {$wordRange['min']}-{$wordRange['max']} mots.\n";
        $prompt .= "La réponse doit être bien aérée selon la structure demandée.\n";

        return $prompt;
    }

    /**
     * Get the default profile values.
     */
    public static function getDefaults(Location $location): array
    {
        return [
            'business_sector' => null,
            'business_name' => $location->name,
            'signature' => null,
            'tone' => ResponseTone::PROFESSIONAL->value,
            'default_length' => ResponseLength::MEDIUM->value,
            'negative_strategy' => NegativeStrategy::EMPATHETIC->value,
            'include_elements' => self::defaultIncludeElements(),
            'highlights' => null,
            'avoid_topics' => null,
            'additional_context' => null,
            'onboarding_completed' => false,
        ];
    }
}

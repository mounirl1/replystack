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
 * @property bool $include_customer_name
 * @property bool $include_business_name
 * @property bool $include_emojis
 * @property bool $include_invitation
 * @property bool $include_signature
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
        'signature',
        'tone',
        'default_length',
        'negative_strategy',
        'include_customer_name',
        'include_business_name',
        'include_emojis',
        'include_invitation',
        'include_signature',
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
        'include_customer_name' => 'boolean',
        'include_business_name' => 'boolean',
        'include_emojis' => 'boolean',
        'include_invitation' => 'boolean',
        'include_signature' => 'boolean',
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
        $prompt .= "Nom de l'établissement : {$this->business_name}\n";

        if ($this->business_sector) {
            $sectorLabel = BusinessSector::from($this->business_sector)->label();
            $prompt .= "Secteur d'activité : {$sectorLabel}\n";
        }

        if ($this->additional_context) {
            $prompt .= "Contexte additionnel : {$this->additional_context}\n";
        }

        $prompt .= "\n## Style de réponse\n";
        $prompt .= "Ton : {$tone->promptInstructions()}\n";
        $prompt .= "Longueur : Entre {$wordRange['min']} et {$wordRange['max']} mots.\n";

        // Include options
        $prompt .= "\n## Éléments à inclure\n";
        if ($this->include_customer_name) {
            $prompt .= "- Utilise le prénom du client si disponible.\n";
        }
        if ($this->include_business_name) {
            $prompt .= "- Mentionne le nom de l'établissement.\n";
        }
        if ($this->include_emojis) {
            $prompt .= "- Utilise des emojis pertinents avec modération.\n";
        } else {
            $prompt .= "- N'utilise PAS d'emojis.\n";
        }
        if ($this->include_invitation) {
            $prompt .= "- Termine par une invitation à revenir.\n";
        }
        if ($this->include_signature && $this->signature) {
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
            'include_customer_name' => true,
            'include_business_name' => true,
            'include_emojis' => false,
            'include_invitation' => true,
            'include_signature' => true,
            'highlights' => null,
            'avoid_topics' => null,
            'additional_context' => null,
            'onboarding_completed' => false,
        ];
    }
}

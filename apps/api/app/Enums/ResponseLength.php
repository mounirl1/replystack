<?php

namespace App\Enums;

enum ResponseLength: string
{
    case SHORT = 'short';
    case MEDIUM = 'medium';
    case DETAILED = 'detailed';

    /**
     * Get the label for the length.
     */
    public function label(): string
    {
        return match ($this) {
            self::SHORT => 'Courte',
            self::MEDIUM => 'Moyenne',
            self::DETAILED => 'Détaillée',
        };
    }

    /**
     * Get the description for the length.
     */
    public function description(): string
    {
        return match ($this) {
            self::SHORT => '2-3 phrases, va droit au but.',
            self::MEDIUM => '4-5 phrases, équilibre entre concision et personnalisation.',
            self::DETAILED => '6-8 phrases, réponse complète et personnalisée.',
        };
    }

    /**
     * Get the word range for the length.
     */
    public function wordRange(): array
    {
        return match ($this) {
            self::SHORT => ['min' => 30, 'max' => 60],
            self::MEDIUM => ['min' => 60, 'max' => 120],
            self::DETAILED => ['min' => 120, 'max' => 200],
        };
    }

    /**
     * Get the max tokens for the length.
     */
    public function maxTokens(): int
    {
        return match ($this) {
            self::SHORT => 250,
            self::MEDIUM => 500,
            self::DETAILED => 800,
        };
    }

    /**
     * Get the formatting instructions for the prompt.
     */
    public function formatInstructions(): string
    {
        return match ($this) {
            self::SHORT => "Réponse concise de 1 à 3 phrases.\n" .
                "Adapte la longueur à l'avis (plus l'avis est court, plus la réponse l'est).\n" .
                "Aère la réponse avec des retours à la ligne entre les idées pour faciliter la lecture.",
            self::MEDIUM => "Structure en 2 paragraphes distincts séparés par une ligne vide :\n" .
                "- Paragraphe 1 : Remerciement et reconnaissance\n" .
                "- Paragraphe 2 : Réponse au contenu et/ou conclusion\n" .
                "Assure une bonne aération pour faciliter la lecture.",
            self::DETAILED => "Structure en 3 paragraphes distincts séparés par des lignes vides :\n" .
                "- Paragraphe 1 : Remerciement chaleureux\n" .
                "- Paragraphe 2 : Réponse détaillée au contenu de l'avis\n" .
                "- Paragraphe 3 : Conclusion et/ou invitation à revenir\n" .
                "Assure une bonne aération pour faciliter la lecture.",
        };
    }

    /**
     * Get all lengths as array for API responses.
     */
    public static function toArray(): array
    {
        return array_map(fn ($case) => [
            'value' => $case->value,
            'label' => $case->label(),
            'description' => $case->description(),
            'wordRange' => $case->wordRange(),
        ], self::cases());
    }

    /**
     * Get all values.
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}

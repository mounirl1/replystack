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
            self::SHORT => 150,
            self::MEDIUM => 300,
            self::DETAILED => 500,
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

<?php

namespace App\Enums;

enum NegativeStrategy: string
{
    case EMPATHETIC = 'empathetic';
    case SOLUTION = 'solution';
    case CONTACT = 'contact';
    case FACTUAL = 'factual';
    case RECONQUEST = 'reconquest';

    /**
     * Get the label for the strategy.
     */
    public function label(): string
    {
        return match ($this) {
            self::EMPATHETIC => 'Empathique',
            self::SOLUTION => 'Orienté solution',
            self::CONTACT => 'Invitation au contact',
            self::FACTUAL => 'Factuel',
            self::RECONQUEST => 'Reconquête',
        };
    }

    /**
     * Get the description for the strategy.
     */
    public function description(): string
    {
        return match ($this) {
            self::EMPATHETIC => 'Montrer de l\'empathie, s\'excuser sincèrement et reconnaître le problème.',
            self::SOLUTION => 'Proposer une solution concrète ou expliquer les mesures prises.',
            self::CONTACT => 'Inviter le client à nous contacter directement pour résoudre le problème.',
            self::FACTUAL => 'Répondre factuellement, clarifier si nécessaire, rester neutre.',
            self::RECONQUEST => 'Offrir une compensation ou invitation à revenir pour une meilleure expérience.',
        };
    }

    /**
     * Get all strategies as array for API responses.
     */
    public static function toArray(): array
    {
        return array_map(fn ($case) => [
            'value' => $case->value,
            'label' => $case->label(),
            'description' => $case->description(),
        ], self::cases());
    }

    /**
     * Get all values.
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * Get prompt instructions for the strategy.
     */
    public function promptInstructions(): string
    {
        return match ($this) {
            self::EMPATHETIC => 'Montre beaucoup d\'empathie, présente des excuses sincères et reconnais le problème rencontré par le client.',
            self::SOLUTION => 'Propose une solution concrète ou explique les mesures correctives mises en place. Sois orienté résolution.',
            self::CONTACT => 'Invite le client à contacter directement l\'établissement pour discuter du problème et trouver une solution personnalisée.',
            self::FACTUAL => 'Réponds de manière factuelle et professionnelle. Clarifie les malentendus si nécessaire, sans être défensif.',
            self::RECONQUEST => 'Propose une compensation ou une invitation à revenir pour vivre une meilleure expérience. Montre ta volonté de reconquérir le client.',
        };
    }
}

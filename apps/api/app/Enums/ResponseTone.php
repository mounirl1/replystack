<?php

namespace App\Enums;

enum ResponseTone: string
{
    case PROFESSIONAL = 'professional';
    case WARM = 'warm';
    case CASUAL = 'casual';
    case LUXURY = 'luxury';
    case DYNAMIC = 'dynamic';

    /**
     * Get the label for the tone.
     */
    public function label(): string
    {
        return match ($this) {
            self::PROFESSIONAL => 'Professionnel',
            self::WARM => 'Chaleureux',
            self::CASUAL => 'Décontracté',
            self::LUXURY => 'Luxe / Premium',
            self::DYNAMIC => 'Dynamique',
        };
    }

    /**
     * Get the description for the tone.
     */
    public function description(): string
    {
        return match ($this) {
            self::PROFESSIONAL => 'Ton courtois et formel, idéal pour les services B2B ou médicaux.',
            self::WARM => 'Ton chaleureux et personnel, parfait pour les restaurants et hôtels.',
            self::CASUAL => 'Ton décontracté et amical, adapté aux commerces de proximité.',
            self::LUXURY => 'Ton raffiné et élégant, pour les établissements haut de gamme.',
            self::DYNAMIC => 'Ton énergique et enthousiaste, idéal pour le sport et les loisirs.',
        };
    }

    /**
     * Get the example for the tone.
     */
    public function example(): string
    {
        return match ($this) {
            self::PROFESSIONAL => 'Nous vous remercions pour votre retour et restons à votre disposition.',
            self::WARM => 'Merci beaucoup pour ces mots qui nous touchent ! Votre visite nous a fait plaisir.',
            self::CASUAL => 'Super content que ça vous ait plu ! À très vite chez nous !',
            self::LUXURY => 'Nous sommes honorés de votre témoignage et espérons avoir le privilège de vous accueillir à nouveau.',
            self::DYNAMIC => 'Génial ! Votre énergie positive nous motive ! Hâte de vous revoir pour de nouvelles aventures !',
        };
    }

    /**
     * Get all tones as array for API responses.
     */
    public static function toArray(): array
    {
        return array_map(fn ($case) => [
            'value' => $case->value,
            'label' => $case->label(),
            'description' => $case->description(),
            'example' => $case->example(),
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
     * Get prompt instructions for the tone.
     */
    public function promptInstructions(): string
    {
        return match ($this) {
            self::PROFESSIONAL => 'Adopte un ton professionnel, courtois et formel. Utilise des formules de politesse classiques.',
            self::WARM => 'Adopte un ton chaleureux et personnel. Montre de la gratitude sincère et de l\'empathie.',
            self::CASUAL => 'Adopte un ton décontracté et amical. Sois naturel, comme si tu parlais à un ami.',
            self::LUXURY => 'Adopte un ton raffiné et élégant. Utilise un vocabulaire soigné et des formulations distinguées.',
            self::DYNAMIC => 'Adopte un ton énergique et enthousiaste. Montre de l\'excitation et de la positivité.',
        };
    }
}

<?php

namespace App\Enums;

enum BusinessSector: string
{
    case HOTEL = 'hotel';
    case RESTAURANT = 'restaurant';
    case RETAIL = 'retail';
    case SPA = 'spa';
    case FITNESS = 'fitness';
    case REAL_ESTATE = 'real_estate';
    case MEDICAL = 'medical';
    case AUTOMOTIVE = 'automotive';
    case ARTISAN = 'artisan';
    case EVENTS = 'events';
    case TOURISM = 'tourism';
    case EDUCATION = 'education';
    case ECOMMERCE = 'ecommerce';
    case B2B = 'b2b';
    case VETERINARY = 'veterinary';
    case CREATIVE = 'creative';
    case TRAVEL = 'travel';
    case OTHER = 'other';

    /**
     * Get the label for the business sector.
     */
    public function label(): string
    {
        return match ($this) {
            self::HOTEL => 'Hôtel / Hébergement',
            self::RESTAURANT => 'Restaurant / Café / Bar',
            self::RETAIL => 'Commerce de détail',
            self::SPA => 'Spa / Bien-être / Salon de beauté',
            self::FITNESS => 'Salle de sport / Fitness',
            self::REAL_ESTATE => 'Agence immobilière',
            self::MEDICAL => 'Cabinet médical / Dentiste / Clinique',
            self::AUTOMOTIVE => 'Garage / Concession auto',
            self::ARTISAN => 'Artisan / Services à domicile',
            self::EVENTS => 'Événementiel / Traiteur',
            self::TOURISM => 'Tourisme / Activités de loisirs',
            self::EDUCATION => 'Éducation / Formation',
            self::ECOMMERCE => 'E-commerce',
            self::B2B => 'Services B2B',
            self::VETERINARY => 'Vétérinaire / Animalerie',
            self::CREATIVE => 'Photographe / Créatif',
            self::TRAVEL => 'Agence de voyage',
            self::OTHER => 'Autre',
        };
    }

    /**
     * Get the Lucide icon name for the business sector.
     */
    public function icon(): string
    {
        return match ($this) {
            self::HOTEL => 'Building2',
            self::RESTAURANT => 'UtensilsCrossed',
            self::RETAIL => 'ShoppingBag',
            self::SPA => 'Sparkles',
            self::FITNESS => 'Dumbbell',
            self::REAL_ESTATE => 'Home',
            self::MEDICAL => 'Stethoscope',
            self::AUTOMOTIVE => 'Car',
            self::ARTISAN => 'Wrench',
            self::EVENTS => 'PartyPopper',
            self::TOURISM => 'Compass',
            self::EDUCATION => 'GraduationCap',
            self::ECOMMERCE => 'ShoppingCart',
            self::B2B => 'Briefcase',
            self::VETERINARY => 'PawPrint',
            self::CREATIVE => 'Camera',
            self::TRAVEL => 'Plane',
            self::OTHER => 'MoreHorizontal',
        };
    }

    /**
     * Get all sectors as array for API responses.
     */
    public static function toArray(): array
    {
        return array_map(fn ($case) => [
            'value' => $case->value,
            'label' => $case->label(),
            'icon' => $case->icon(),
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

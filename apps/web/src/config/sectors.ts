/**
 * Centralized sector configuration
 * Single source of truth for all sector-related data across the application
 */

import type { LucideIcon } from 'lucide-react';
import {
  UtensilsCrossed,
  Hotel,
  ShoppingCart,
  Car,
  Scissors,
  Stethoscope,
  Wrench,
  GraduationCap,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export type SectorSlug =
  | 'restaurants'
  | 'hotels'
  | 'e-commerce'
  | 'garages'
  | 'beaute'
  | 'sante'
  | 'artisans'
  | 'auto-ecoles';

export type SupportedLanguage = 'en' | 'fr' | 'es' | 'pt';

export interface Sector {
  slug: SectorSlug;
  icon: LucideIcon;
  emoji: string;
  color: string;
}

export interface SectorWithName extends Sector {
  name: string;
}

// ============================================================================
// Sector Definitions
// ============================================================================

export const SECTORS: readonly Sector[] = [
  { slug: 'restaurants', icon: UtensilsCrossed, emoji: '🍽️', color: 'text-amber-500' },
  { slug: 'hotels', icon: Hotel, emoji: '🏨', color: 'text-violet-500' },
  { slug: 'e-commerce', icon: ShoppingCart, emoji: '🛍️', color: 'text-fuchsia-500' },
  { slug: 'garages', icon: Car, emoji: '🚗', color: 'text-slate-500' },
  { slug: 'beaute', icon: Scissors, emoji: '💇', color: 'text-pink-500' },
  { slug: 'sante', icon: Stethoscope, emoji: '⚕️', color: 'text-emerald-500' },
  { slug: 'artisans', icon: Wrench, emoji: '🔧', color: 'text-amber-500' },
  { slug: 'auto-ecoles', icon: GraduationCap, emoji: '🚗', color: 'text-indigo-500' },
] as const;

export const HEADER_SECTORS: readonly SectorSlug[] = [
  'restaurants', 'hotels', 'e-commerce', 'garages', 'beaute', 'sante', 'artisans', 'auto-ecoles',
] as const;

export const FOOTER_SECTORS: readonly SectorSlug[] = [
  'restaurants', 'hotels', 'e-commerce', 'garages',
] as const;

export const LANDING_SECTORS: readonly SectorSlug[] = [
  'restaurants', 'hotels', 'e-commerce', 'garages', 'beaute', 'sante',
] as const;

// ============================================================================
// Localized Path Configuration
// ============================================================================

export const SECTOR_PATHS: Record<SupportedLanguage, string> = {
  en: '/sectors',
  fr: '/fr/secteurs',
  es: '/es/sectores',
  pt: '/pt/setores',
} as const;

// ============================================================================
// Localized Sector Names
// ============================================================================

export const SECTOR_NAMES: Record<SupportedLanguage, Record<SectorSlug, string>> = {
  en: {
    restaurants: 'Restaurants',
    hotels: 'Hotels',
    'e-commerce': 'E-commerce',
    garages: 'Auto Repair',
    beaute: 'Beauty Salons',
    sante: 'Healthcare',
    artisans: 'Contractors',
    'auto-ecoles': 'Driving Schools',
  },
  fr: {
    restaurants: 'Restaurants',
    hotels: 'Hôtels',
    'e-commerce': 'E-commerce',
    garages: 'Garages',
    beaute: 'Salons de beauté',
    sante: 'Professionnels de santé',
    artisans: 'Artisans',
    'auto-ecoles': 'Auto-écoles',
  },
  es: {
    restaurants: 'Restaurantes',
    hotels: 'Hoteles',
    'e-commerce': 'E-commerce',
    garages: 'Talleres',
    beaute: 'Salones de belleza',
    sante: 'Profesionales de salud',
    artisans: 'Artesanos',
    'auto-ecoles': 'Autoescuelas',
  },
  pt: {
    restaurants: 'Restaurantes',
    hotels: 'Hotéis',
    'e-commerce': 'E-commerce',
    garages: 'Garagens',
    beaute: 'Salões de beleza',
    sante: 'Profissionais de saúde',
    artisans: 'Profissionais de serviços',
    'auto-ecoles': 'Escolas de condução',
  },
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

export function getSectorBySlug(slug: SectorSlug): Sector | undefined {
  return SECTORS.find((sector) => sector.slug === slug);
}

export function getSectorName(slug: SectorSlug, language: SupportedLanguage): string {
  return SECTOR_NAMES[language]?.[slug] ?? SECTOR_NAMES.en[slug] ?? slug;
}

export function getSectorBasePath(language: SupportedLanguage): string {
  return SECTOR_PATHS[language] ?? SECTOR_PATHS.en;
}

export function getSectorPath(slug: SectorSlug, language: SupportedLanguage): string {
  return `${getSectorBasePath(language)}/${slug}`;
}

export function getSectorsForLocation(
  location: 'header' | 'footer' | 'landing',
  language: SupportedLanguage
): SectorWithName[] {
  const slugs =
    location === 'header' ? HEADER_SECTORS :
    location === 'footer' ? FOOTER_SECTORS : LANDING_SECTORS;

  return slugs
    .map((slug) => {
      const sector = getSectorBySlug(slug);
      if (!sector) return null;
      return { ...sector, name: getSectorName(slug, language) };
    })
    .filter((s): s is SectorWithName => s !== null);
}

export function isValidSector(slug: string): slug is SectorSlug {
  return SECTORS.some((sector) => sector.slug === slug);
}

export function extractLanguageCode(i18nLanguage: string | undefined): SupportedLanguage {
  const code = i18nLanguage?.substring(0, 2) || 'en';
  return (SECTOR_PATHS[code as SupportedLanguage] ? code : 'en') as SupportedLanguage;
}

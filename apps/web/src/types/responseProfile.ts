// Response Profile Types

export type BusinessSector =
  | 'hotel'
  | 'restaurant'
  | 'retail'
  | 'spa'
  | 'fitness'
  | 'real_estate'
  | 'medical'
  | 'automotive'
  | 'artisan'
  | 'events'
  | 'tourism'
  | 'education'
  | 'ecommerce'
  | 'b2b'
  | 'veterinary'
  | 'creative'
  | 'travel'
  | 'other';

export type ResponseTone =
  | 'professional'
  | 'warm'
  | 'casual'
  | 'luxury'
  | 'dynamic';

export type ResponseLength = 'short' | 'medium' | 'detailed';

export type NegativeStrategy =
  | 'empathetic'
  | 'solution'
  | 'contact'
  | 'factual'
  | 'reconquest';

export interface SectorOption {
  value: BusinessSector;
  label: string;
  icon: string;
}

export interface ToneOption {
  value: ResponseTone;
  label: string;
  description: string;
  example: string;
}

export interface LengthOption {
  value: ResponseLength;
  label: string;
  description: string;
  wordRange: {
    min: number;
    max: number;
  };
}

export interface NegativeStrategyOption {
  value: NegativeStrategy;
  label: string;
  description: string;
}

export interface ResponseProfileOptions {
  sectors: SectorOption[];
  tones: ToneOption[];
  lengths: LengthOption[];
  negativeStrategies: NegativeStrategyOption[];
}

export interface ResponseProfile {
  id?: string;
  location_id: number;
  business_sector: BusinessSector | null;
  business_name: string;
  signature: string | null;
  tone: ResponseTone;
  default_length: ResponseLength;
  negative_strategy: NegativeStrategy;
  include_customer_name: boolean;
  include_business_name: boolean;
  include_emojis: boolean;
  include_invitation: boolean;
  include_signature: boolean;
  highlights: string | null;
  avoid_topics: string | null;
  additional_context: string | null;
  onboarding_completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ResponseProfileFormData {
  business_sector: BusinessSector | null;
  business_name: string;
  signature: string;
  tone: ResponseTone;
  default_length: ResponseLength;
  negative_strategy: NegativeStrategy;
  include_customer_name: boolean;
  include_business_name: boolean;
  include_emojis: boolean;
  include_invitation: boolean;
  include_signature: boolean;
  highlights: string;
  avoid_topics: string;
  additional_context: string;
  onboarding_completed: boolean;
}

export const DEFAULT_PROFILE: ResponseProfileFormData = {
  business_sector: null,
  business_name: '',
  signature: '',
  tone: 'professional',
  default_length: 'medium',
  negative_strategy: 'empathetic',
  include_customer_name: true,
  include_business_name: true,
  include_emojis: false,
  include_invitation: true,
  include_signature: true,
  highlights: '',
  avoid_topics: '',
  additional_context: '',
  onboarding_completed: false,
};

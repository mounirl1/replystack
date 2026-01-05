export const PLATFORMS = [
  'google',
  'tripadvisor',
  'booking',
  'yelp',
  'facebook',
  'g2',
  'capterra',
  'trustpilot',
] as const;

export type Platform = (typeof PLATFORMS)[number];

export const TONES = ['professional', 'friendly', 'formal', 'casual'] as const;

export type Tone = (typeof TONES)[number];

export const PLATFORM_CONFIG: Record<
  Platform,
  {
    name: string;
    icon: string;
    urlPattern: RegExp;
    color: string;
  }
> = {
  google: {
    name: 'Google Business',
    icon: 'google',
    urlPattern: /business\.google\.com/,
    color: '#4285f4',
  },
  tripadvisor: {
    name: 'TripAdvisor',
    icon: 'tripadvisor',
    urlPattern: /tripadvisor\.(com|fr|de|es|it)/,
    color: '#00af87',
  },
  booking: {
    name: 'Booking.com',
    icon: 'booking',
    urlPattern: /admin\.booking\.com/,
    color: '#003580',
  },
  yelp: {
    name: 'Yelp',
    icon: 'yelp',
    urlPattern: /yelp\.com/,
    color: '#d32323',
  },
  facebook: {
    name: 'Facebook',
    icon: 'facebook',
    urlPattern: /business\.facebook\.com/,
    color: '#1877f2',
  },
  g2: {
    name: 'G2',
    icon: 'g2',
    urlPattern: /g2\.com/,
    color: '#ff492c',
  },
  capterra: {
    name: 'Capterra',
    icon: 'capterra',
    urlPattern: /capterra\.com/,
    color: '#ff9d28',
  },
  trustpilot: {
    name: 'Trustpilot',
    icon: 'trustpilot',
    urlPattern: /trustpilot\.com/,
    color: '#00b67a',
  },
};

export const TONE_CONFIG: Record<
  Tone,
  {
    label: string;
    description: string;
  }
> = {
  professional: {
    label: 'Professional',
    description: 'Courteous and business-like tone',
  },
  friendly: {
    label: 'Friendly',
    description: 'Warm and approachable, like talking to a friend',
  },
  formal: {
    label: 'Formal',
    description: 'Very respectful and traditional',
  },
  casual: {
    label: 'Casual',
    description: 'Relaxed and conversational',
  },
};

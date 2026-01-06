import api from './api';

export interface PlatformConnection {
  connected: boolean;
  token_valid?: boolean;
  last_fetch_at?: string;
  expires_at?: string;
  management_url?: string;
  last_extension_fetch_at?: string;
}

export interface LocationConnections {
  google: PlatformConnection;
  facebook: PlatformConnection;
  tripadvisor: PlatformConnection;
  booking: PlatformConnection;
  yelp: PlatformConnection;
}

export interface ManagementUrlsUpdate {
  tripadvisor?: string | null;
  booking?: string | null;
  yelp?: string | null;
}

export async function getLocationConnections(locationId: number): Promise<LocationConnections> {
  const response = await api.get<LocationConnections>(`/locations/${locationId}/connections`);
  return response.data;
}

export async function updateManagementUrls(
  locationId: number,
  urls: ManagementUrlsUpdate
): Promise<{ message: string; tripadvisor_management_url?: string; booking_management_url?: string; yelp_management_url?: string }> {
  const response = await api.put(`/locations/${locationId}/management-urls`, urls);
  return response.data;
}

export async function toggleAutoFetch(
  locationId: number,
  enabled: boolean
): Promise<{ message: string; auto_fetch_enabled: boolean }> {
  const response = await api.put(`/locations/${locationId}/auto-fetch`, { enabled });
  return response.data;
}

export async function disconnectPlatform(locationId: number, platform: 'google' | 'facebook'): Promise<void> {
  await api.delete(`/oauth/${platform}/${locationId}`);
}

export function getOAuthUrl(platform: 'google' | 'facebook', locationId: number): string {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  return `${apiUrl}/api/oauth/${platform}/${locationId}`;
}

// URL validation helpers
export const PLATFORM_URL_PATTERNS: Record<string, RegExp> = {
  tripadvisor: /^https:\/\/(www\.)?tripadvisor\.(com|fr|de|es|it|co\.uk)/i,
  booking: /^https:\/\/(admin\.)?booking\.com/i,
  yelp: /^https:\/\/(biz\.)?yelp\.(com|fr|de|es|it|co\.uk)/i,
};

export const PLATFORM_URL_EXAMPLES: Record<string, string> = {
  tripadvisor: 'https://www.tripadvisor.com/reviews?locationId=...',
  booking: 'https://admin.booking.com/hotel/hoteladmin/...',
  yelp: 'https://biz.yelp.com/biz/...',
};

export function isValidManagementUrl(platform: string, url: string): boolean {
  const pattern = PLATFORM_URL_PATTERNS[platform];
  if (!pattern) return false;
  return pattern.test(url);
}

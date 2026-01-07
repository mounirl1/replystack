import type { CachedLocation, Platform } from '../types/review';

/**
 * Get cached locations from local storage
 */
async function getCachedLocations(): Promise<CachedLocation[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['locations'], (result) => {
      const locations = result.locations;
      // Ensure we always return an array
      if (Array.isArray(locations)) {
        resolve(locations);
      } else if (locations && typeof locations === 'object' && Array.isArray(locations.data)) {
        // Handle case where API returned { data: [...] } format
        resolve(locations.data);
      } else {
        resolve([]);
      }
    });
  });
}

/**
 * Extract platform-specific identifiers from URL
 */
function extractUrlIdentifiers(url: string): Record<string, string> {
  const identifiers: Record<string, string> = {};

  // Google Place ID
  const googlePlaceMatch = url.match(/place_id[=\/]([^&\/]+)/i);
  if (googlePlaceMatch) {
    identifiers.google_place_id = googlePlaceMatch[1];
  }

  // TripAdvisor location ID
  const tripAdvisorMatch = url.match(/[gd](\d+)/i);
  if (tripAdvisorMatch) {
    identifiers.tripadvisor_id = tripAdvisorMatch[1];
  }

  // Booking property ID
  const bookingMatch = url.match(/property[\/=](\d+)/i);
  if (bookingMatch) {
    identifiers.booking_id = bookingMatch[1];
  }

  // Yelp business ID
  const yelpMatch = url.match(/biz\.yelp\.com\/biz\/([^/?]+)/i);
  if (yelpMatch) {
    identifiers.yelp_id = yelpMatch[1];
  }

  return identifiers;
}

/**
 * Match a URL against a location's management URLs
 */
function matchByManagementUrl(location: CachedLocation, url: string): boolean {
  const urlLower = url.toLowerCase();

  const managementUrls = [
    location.tripadvisor_management_url,
    location.booking_management_url,
    location.yelp_management_url,
  ].filter(Boolean) as string[];

  return managementUrls.some((mgmtUrl) => {
    // Check if the URL contains the management URL (partial match)
    return urlLower.includes(mgmtUrl.toLowerCase());
  });
}

/**
 * Match a URL against a location's platform identifiers
 */
function matchByIdentifiers(
  location: CachedLocation,
  urlIdentifiers: Record<string, string>
): boolean {
  // Google Place ID match
  return Boolean(
    urlIdentifiers.google_place_id &&
      location.google_place_id &&
      urlIdentifiers.google_place_id === location.google_place_id
  );
}

/**
 * Get the location ID for the current page
 * Returns null if no matching location is found
 */
export async function getLocationIdForCurrentPage(): Promise<number | null> {
  const locations = await getCachedLocations();

  if (!locations || locations.length === 0) {
    console.log('[LocationMatcher] No cached locations');
    return null;
  }

  const url = window.location.href;
  const urlIdentifiers = extractUrlIdentifiers(url);

  // Try to find a matching location
  for (const location of locations) {
    // Check management URLs first
    if (matchByManagementUrl(location, url)) {
      console.log(`[LocationMatcher] Matched by management URL: ${location.name}`);
      return location.id;
    }

    // Check identifiers
    if (matchByIdentifiers(location, urlIdentifiers)) {
      console.log(`[LocationMatcher] Matched by identifier: ${location.name}`);
      return location.id;
    }
  }

  // Fallback: if user has only one location, use it
  if (locations.length === 1) {
    console.log(`[LocationMatcher] Using single location fallback: ${locations[0].name}`);
    return locations[0].id;
  }

  console.log('[LocationMatcher] No matching location found');
  return null;
}

/**
 * Get all locations for a specific platform
 */
export async function getLocationsForPlatform(platform: Platform): Promise<CachedLocation[]> {
  const locations = await getCachedLocations();

  return locations.filter((loc) => {
    switch (platform) {
      case 'google':
        return !!loc.google_place_id;
      case 'facebook':
        return !!loc.facebook_page_id;
      case 'tripadvisor':
        return !!loc.tripadvisor_management_url;
      case 'booking':
        return !!loc.booking_management_url;
      case 'yelp':
        return !!loc.yelp_management_url;
      default:
        return false;
    }
  });
}

/**
 * Prompt user to select a location if multiple match or none match
 */
export async function promptLocationSelection(): Promise<number | null> {
  // This would be called from the content script to show a selection UI
  // For now, we'll implement a simple approach
  const locations = await getCachedLocations();

  if (locations.length === 0) {
    return null;
  }

  if (locations.length === 1) {
    return locations[0].id;
  }

  // For multiple locations, we could:
  // 1. Show a popup/modal in the page
  // 2. Send a message to the popup to handle selection
  // For now, return the first one
  console.log('[LocationMatcher] Multiple locations, using first:', locations[0].name);
  return locations[0].id;
}

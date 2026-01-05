import type { ExtractedReview, Platform, SyncResult, ExtractionTask } from '../types/review';

const API_URL = process.env.PLASMO_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Get auth token from storage
 */
async function getAuthToken(): Promise<string | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['token'], (result) => {
      resolve(result.token || null);
    });
  });
}

/**
 * Sync extracted reviews with the backend
 */
export async function syncReviews(
  locationId: number,
  platform: Platform,
  reviews: ExtractedReview[]
): Promise<SyncResult> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  if (reviews.length === 0) {
    return { created: 0, updated: 0, unchanged: 0 };
  }

  console.log(`[ReviewSync] Syncing ${reviews.length} ${platform} reviews for location ${locationId}`);

  const response = await fetch(`${API_URL}/api/reviews/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body: JSON.stringify({
      location_id: locationId,
      platform,
      reviews: reviews.map((r) => ({
        external_id: r.externalId,
        author_name: r.authorName,
        author_avatar: r.authorAvatar,
        rating: r.rating,
        content: r.content,
        language: r.language,
        published_at: r.publishedAt,
        has_response: r.hasResponse,
      })),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[ReviewSync] Sync failed: ${response.status}`, errorText);
    throw new Error(`Sync failed: ${response.status}`);
  }

  const result: SyncResult = await response.json();
  console.log(`[ReviewSync] Sync complete:`, result);
  return result;
}

/**
 * Get extraction tasks from the backend
 * Returns locations that need review extraction via the extension
 */
export async function getExtractionTasks(): Promise<ExtractionTask[]> {
  const token = await getAuthToken();
  if (!token) {
    console.log('[ReviewSync] No auth token, skipping extraction tasks');
    return [];
  }

  try {
    const response = await fetch(`${API_URL}/api/locations/extraction-tasks`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`[ReviewSync] Failed to get extraction tasks: ${response.status}`);
      return [];
    }

    const data = await response.json();

    // Flatten: each location can have multiple platforms
    const tasks: ExtractionTask[] = [];
    for (const loc of data) {
      for (const p of loc.platforms) {
        if (p.management_url) {
          tasks.push({
            locationId: loc.location_id,
            locationName: loc.location_name,
            platform: p.platform as Platform,
            managementUrl: p.management_url,
            lastFetchedAt: p.last_fetched_at,
          });
        }
      }
    }

    console.log(`[ReviewSync] Found ${tasks.length} extraction tasks`);
    return tasks;
  } catch (error) {
    console.error('[ReviewSync] Error getting extraction tasks:', error);
    return [];
  }
}

/**
 * Update last fetched timestamp for a location/platform
 */
export async function updateLastFetched(
  locationId: number,
  platform: Platform
): Promise<void> {
  const token = await getAuthToken();
  if (!token) return;

  try {
    await fetch(`${API_URL}/api/locations/${locationId}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      body: JSON.stringify({
        platform,
        source: 'extension',
      }),
    });
  } catch (error) {
    console.error('[ReviewSync] Error updating last fetched:', error);
  }
}

/**
 * Cache user's locations in local storage for quick access
 */
export async function cacheLocations(): Promise<void> {
  const token = await getAuthToken();
  if (!token) return;

  try {
    const response = await fetch(`${API_URL}/api/locations`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      const locations = data.data || data;

      chrome.storage.local.set({ locations }, () => {
        console.log(`[ReviewSync] Cached ${locations.length} locations`);
      });
    }
  } catch (error) {
    console.error('[ReviewSync] Error caching locations:', error);
  }
}

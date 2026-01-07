import { getAuthState, setAuthState, updateUserQuota, type AuthUser } from '../services/auth';
import { runAutoExtraction, scheduleAutoExtraction, handleAlarm as handleAutoExtractionAlarm } from '../services/auto-extraction';
import { cacheLocations } from '../services/review-sync';

export {};

const API_URL = process.env.PLASMO_PUBLIC_API_URL || 'http://localhost:8000';

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  switch (request.type) {
    case 'GENERATE_REPLY':
      handleGenerateReply(request.payload)
        .then(sendResponse)
        .catch((error) => sendResponse({ error: error.message }));
      return true; // Keep the message channel open for async response

    case 'GET_AUTH_STATUS':
      getAuthState().then(({ token, user }) => {
        sendResponse({
          isLoggedIn: !!token,
          user: user || null,
        });
      });
      return true;

    case 'CHECK_AUTH':
      getAuthState().then(({ token }) => {
        sendResponse({ isAuthenticated: !!token });
      });
      return true;

    case 'REFRESH_QUOTA':
      handleRefreshQuota()
        .then(sendResponse)
        .catch((error) => sendResponse({ error: error.message }));
      return true;

    case 'LOGIN':
      handleLogin(request.payload)
        .then(sendResponse)
        .catch((error) => sendResponse({ error: error.message }));
      return true;

    case 'REGISTER':
      handleRegister(request.payload)
        .then(sendResponse)
        .catch((error) => sendResponse({ error: error.message }));
      return true;

    case 'SYNC_REVIEWS':
      handleSyncReviews(request.payload)
        .then(sendResponse)
        .catch((error) => sendResponse({ error: error.message }));
      return true;

    case 'CACHE_LOCATIONS':
      handleCacheLocations()
        .then(() => sendResponse({ success: true }))
        .catch((error) => sendResponse({ error: error.message }));
      return true;

    default:
      return false;
  }
});

/**
 * Generate an AI reply for a review.
 */
async function handleGenerateReply(payload: {
  review_content: string;
  review_rating: number;
  review_author: string;
  platform: string;
  location_id?: number;
  length?: 'short' | 'medium' | 'detailed';
  specific_context?: string;
  language?: string;
}) {
  const { token } = await getAuthState();

  if (!token) {
    throw new Error('SIGN_IN_REQUIRED');
  }

  console.log('[Background] Generating reply for:', payload.platform, 'location:', payload.location_id);

  const response = await fetch(`${API_URL}/api/replies/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let error: { error?: string; message?: string } = {};
    try {
      error = await response.json();
    } catch {
      error = { message: `HTTP ${response.status}` };
    }
    console.error('[Background] Generate failed:', response.status, error);

    if (response.status === 401) {
      throw new Error('Session expired. Please sign in again.');
    }

    if (response.status === 429) {
      // Distinguish between quota exceeded (from CheckQuota middleware) and rate limited (from throttle middleware)
      if (error.error === 'QuotaExceeded') {
        throw new Error('QUOTA_EXCEEDED');
      } else {
        throw new Error('RATE_LIMITED');
      }
    }

    throw new Error(error.message || 'Failed to generate reply');
  }

  const data = await response.json();
  console.log('[Background] Generate success, reply length:', data.reply?.length || 0);

  // Update user quota in storage
  if (data.quota_remaining !== undefined) {
    await updateUserQuota(data.quota_remaining);
  }

  return data;
}

/**
 * Refresh the user's quota from the server.
 */
async function handleRefreshQuota() {
  const { token } = await getAuthState();

  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/api/user/quota`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to refresh quota');
  }

  const data = await response.json();

  if (data.quota?.remaining !== undefined) {
    await updateUserQuota(data.quota.remaining);
  }

  return data.quota;
}

/**
 * Handle login from content scripts.
 */
async function handleLogin(payload: { email: string; password: string }) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  const data = await response.json();

  // Fetch user quota and response style status in parallel
  const [quotaRes, styleRes] = await Promise.all([
    fetch(`${API_URL}/api/user/quota`, {
      headers: {
        Authorization: `Bearer ${data.token}`,
        Accept: 'application/json',
      },
    }),
    fetch(`${API_URL}/api/user/response-style-status`, {
      headers: {
        Authorization: `Bearer ${data.token}`,
        Accept: 'application/json',
      },
    }),
  ]);

  const quotaData = quotaRes.ok ? await quotaRes.json() : { quota: { remaining: 0 } };
  const styleData = styleRes.ok ? await styleRes.json() : { onboardingCompleted: false, locationId: null };

  const user: AuthUser = {
    id: data.user.id,
    email: data.user.email,
    name: data.user.name || data.user.email.split('@')[0],
    plan: data.user.plan,
    quota_remaining: quotaData.quota.remaining,
    responseStyleConfigured: styleData.onboardingCompleted,
    firstLocationId: styleData.locationId,
  };

  // Save to storage
  await setAuthState(data.token, user);

  // Cache locations after login
  cacheLocations();

  return { token: data.token, user };
}

/**
 * Handle registration from content scripts.
 */
async function handleRegister(payload: { name?: string; email: string; password: string; password_confirmation: string }) {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    // Handle validation errors
    if (error.errors) {
      const firstError = Object.values(error.errors)[0];
      throw new Error(Array.isArray(firstError) ? firstError[0] : String(firstError));
    }
    throw new Error(error.message || 'Registration failed');
  }

  const data = await response.json();

  // Fetch user quota and response style status in parallel
  const [quotaRes, styleRes] = await Promise.all([
    fetch(`${API_URL}/api/user/quota`, {
      headers: {
        Authorization: `Bearer ${data.token}`,
        Accept: 'application/json',
      },
    }),
    fetch(`${API_URL}/api/user/response-style-status`, {
      headers: {
        Authorization: `Bearer ${data.token}`,
        Accept: 'application/json',
      },
    }),
  ]);

  const quotaData = quotaRes.ok ? await quotaRes.json() : { quota: { remaining: 10 } };
  const styleData = styleRes.ok ? await styleRes.json() : { onboardingCompleted: false, locationId: null };

  const user: AuthUser = {
    id: data.user.id,
    email: data.user.email,
    name: data.user.name || data.user.email.split('@')[0],
    plan: data.user.plan,
    quota_remaining: quotaData.quota.remaining,
    responseStyleConfigured: styleData.onboardingCompleted,
    firstLocationId: styleData.locationId,
  };

  // Save to storage
  await setAuthState(data.token, user);

  // Cache locations after registration
  cacheLocations();

  return { token: data.token, user };
}

/**
 * Handle sync reviews from content scripts.
 */
async function handleSyncReviews(payload: {
  locationId: number;
  platform: string;
  reviews: Array<{
    external_id: string;
    author_name: string;
    author_avatar?: string;
    rating: number;
    content: string;
    language?: string;
    published_at?: string;
    has_response?: boolean;
  }>;
}) {
  const { token } = await getAuthState();
  if (!token) {
    throw new Error('Not authenticated');
  }

  if (payload.reviews.length === 0) {
    return { created: 0, updated: 0, unchanged: 0 };
  }

  console.log(`[Background] Syncing ${payload.reviews.length} ${payload.platform} reviews for location ${payload.locationId}`);

  const response = await fetch(`${API_URL}/api/reviews/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body: JSON.stringify({
      location_id: payload.locationId,
      platform: payload.platform,
      reviews: payload.reviews,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Background] Sync failed: ${response.status}`, errorText);
    throw new Error(`Sync failed: ${response.status}`);
  }

  const result = await response.json();
  console.log(`[Background] Sync complete:`, result);
  return result;
}

/**
 * Handle cache locations from content scripts.
 */
async function handleCacheLocations() {
  const { token } = await getAuthState();
  if (!token) {
    console.log('[Background] No auth token, skipping cache locations');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/locations`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      // Handle different API response formats
      let locations: unknown[];
      if (Array.isArray(data)) {
        locations = data;
      } else if (Array.isArray(data.data)) {
        locations = data.data;
      } else if (Array.isArray(data.locations)) {
        locations = data.locations;
      } else {
        console.warn('[Background] Unexpected API response format:', data);
        locations = [];
      }

      await chrome.storage.local.set({ locations });
      console.log(`[Background] Cached ${locations.length} locations`);
    }
  } catch (error) {
    console.error('[Background] Error caching locations:', error);
  }
}

// Listen for installation/update
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('ReplyStack extension installed');
  } else if (details.reason === 'update') {
    console.log('ReplyStack extension updated');
  }

  // Schedule auto-extraction for paid plans
  scheduleAutoExtraction();

  // Cache locations
  cacheLocations();
});

// Listen for browser startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Browser started, checking auto-extraction...');

  // Cache locations
  cacheLocations();

  // Run auto-extraction (will only run for paid plans)
  runAutoExtraction();
});

// Optional: Refresh quota periodically when extension is active
chrome.alarms.create('refreshQuota', { periodInMinutes: 5 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'refreshQuota') {
    handleRefreshQuota().catch(() => {
      // Silently fail
    });
  }

  // Handle auto-extraction alarm
  handleAutoExtractionAlarm(alarm);
});

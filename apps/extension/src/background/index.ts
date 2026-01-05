import { getAuthState, updateUserQuota } from '../services/auth';
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
  length?: 'short' | 'medium' | 'detailed';
  specific_context?: string;
  language?: string;
}) {
  const { token } = await getAuthState();

  if (!token) {
    throw new Error('Please sign in to generate replies');
  }

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
    const error = await response.json();

    if (response.status === 401) {
      throw new Error('Session expired. Please sign in again.');
    }

    if (response.status === 429) {
      throw new Error(error.message || 'Quota exceeded. Please upgrade your plan.');
    }

    throw new Error(error.message || 'Failed to generate reply');
  }

  const data = await response.json();

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

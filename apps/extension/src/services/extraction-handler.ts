/**
 * Shared extraction handler for content scripts
 * Handles extraction, sync, and message communication
 */

import type { SyncResult, ExtractionRequestMessage } from '../types/review';
import type { BaseExtractor } from './extractors/base-extractor';
import { syncReviews, cacheLocations } from './review-sync';
import { getLocationIdForCurrentPage } from '../utils/location-matcher';
import { debounce } from '../utils/debounce';

/**
 * Show a toast notification for sync results
 */
export function showSyncNotification(result: SyncResult): void {
  if (result.created === 0 && result.updated === 0) return;

  const existingToast = document.getElementById('replystack-sync-toast');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.id = 'replystack-sync-toast';
  toast.innerHTML = `
    <span style="margin-right: 8px;">✓</span>
    ReplyStack: ${result.created + result.updated} reviews synced
  `;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #10B981 0%, #059669 100%);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    z-index: 999999;
    font-size: 14px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    display: flex;
    align-items: center;
    animation: slideIn 0.3s ease-out;
  `;

  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-in forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Show an error notification
 */
export function showErrorNotification(message: string): void {
  const existingToast = document.getElementById('replystack-sync-toast');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.id = 'replystack-sync-toast';
  toast.innerHTML = `
    <span style="margin-right: 8px;">⚠</span>
    ReplyStack: ${message}
  `;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    z-index: 999999;
    font-size: 14px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    display: flex;
    align-items: center;
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 5000);
}

/**
 * Check if user is authenticated
 */
async function isAuthenticated(): Promise<boolean> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['token', 'user'], (result) => {
      resolve(!!result.token && !!result.user);
    });
  });
}

/**
 * Extract reviews and sync with the backend
 */
export async function extractAndSync(
  extractor: BaseExtractor,
  showNotification = true
): Promise<SyncResult | null> {
  // Check authentication
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    console.log('[ExtractionHandler] Not authenticated, skipping sync');
    return null;
  }

  // Get location ID
  const locationId = await getLocationIdForCurrentPage();
  if (!locationId) {
    console.log('[ExtractionHandler] No matching location found, skipping sync');
    return null;
  }

  // Extract reviews
  const reviews = extractor.extractAll();
  console.log(`[ExtractionHandler] Extracted ${reviews.length} reviews for platform ${extractor.platform}`);

  if (reviews.length === 0) {
    return { created: 0, updated: 0, unchanged: 0 };
  }

  try {
    const result = await syncReviews(locationId, extractor.platform, reviews);

    if (showNotification) {
      showSyncNotification(result);
    }

    return result;
  } catch (error) {
    console.error('[ExtractionHandler] Sync failed:', error);
    if (showNotification) {
      showErrorNotification('Failed to sync reviews');
    }
    return null;
  }
}

/**
 * Create a debounced extraction function
 */
export function createDebouncedExtractor(
  extractor: BaseExtractor,
  wait = 2000
): () => void {
  return debounce(async () => {
    await extractAndSync(extractor, true);
  }, wait);
}

/**
 * Setup MutationObserver for dynamic content
 */
export function setupExtractionObserver(
  extractor: BaseExtractor,
  containerSelector: string
): MutationObserver | null {
  const debouncedExtract = createDebouncedExtractor(extractor);

  const container = document.querySelector(containerSelector);
  if (!container) {
    console.log('[ExtractionHandler] Container not found:', containerSelector);
    return null;
  }

  const observer = new MutationObserver((mutations) => {
    // Check if any mutations added review elements
    const hasNewContent = mutations.some((mutation) =>
      mutation.addedNodes.length > 0
    );

    if (hasNewContent) {
      debouncedExtract();
    }
  });

  observer.observe(container, {
    childList: true,
    subtree: true,
  });

  return observer;
}

/**
 * Handle extraction request messages from background script
 */
export function handleExtractionMessages(extractor: BaseExtractor): void {
  chrome.runtime.onMessage.addListener(
    (
      message: ExtractionRequestMessage,
      _sender: chrome.runtime.MessageSender,
      sendResponse: (response: any) => void
    ) => {
      if (message.type === 'REQUEST_EXTRACTION') {
        console.log('[ExtractionHandler] Received extraction request:', message);

        (async () => {
          try {
            const reviews = extractor.extractAll();

            if (reviews.length > 0) {
              const result = await syncReviews(
                message.locationId,
                message.platform,
                reviews
              );

              // Notify background that extraction is complete
              chrome.runtime.sendMessage({
                type: 'EXTRACTION_COMPLETE',
                result,
                autoExtraction: message.autoExtraction,
              });

              sendResponse({ success: true, result });
            } else {
              sendResponse({ success: true, result: { created: 0, updated: 0, unchanged: 0 } });
            }
          } catch (error) {
            console.error('[ExtractionHandler] Extraction failed:', error);
            sendResponse({
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        })();

        return true; // Keep channel open for async response
      }
    }
  );
}

/**
 * Initialize extraction for a content script
 * Call this at the end of each content script
 */
export async function initializeExtraction(
  extractor: BaseExtractor,
  containerSelectors: string[] = ['body']
): Promise<void> {
  console.log(`[ExtractionHandler] Initializing extraction for ${extractor.platform}`);

  // Cache locations on first load
  await cacheLocations();

  // Initial extraction (silent, no notification on first load)
  setTimeout(async () => {
    await extractAndSync(extractor, false);
  }, 2000);

  // Setup observer for dynamic content
  for (const selector of containerSelectors) {
    setupExtractionObserver(extractor, selector);
  }

  // Handle extraction request messages
  handleExtractionMessages(extractor);
}

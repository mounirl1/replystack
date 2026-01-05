/**
 * Auto-extraction service for paid plans
 * Automatically extracts reviews from platforms in background tabs
 */

import type { ExtractionTask } from '../types/review';
import { getExtractionTasks } from './review-sync';

/**
 * Plans eligible for auto-extraction
 */
const ELIGIBLE_PLANS = ['starter', 'pro', 'business', 'enterprise'];

/**
 * Minimum hours between extractions for the same task
 */
const MIN_HOURS_BETWEEN_EXTRACTIONS = 24;

/**
 * Timeout for extraction in milliseconds
 */
const EXTRACTION_TIMEOUT = 30000; // 30 seconds

/**
 * Delay between extractions in milliseconds
 */
const DELAY_BETWEEN_EXTRACTIONS = 5000; // 5 seconds

/**
 * Get current user data from storage
 */
async function getCurrentUser(): Promise<{ plan: string } | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['user'], (result) => {
      resolve(result.user || null);
    });
  });
}

/**
 * Check if user's plan is eligible for auto-extraction
 */
export function isEligibleForAutoExtraction(plan: string): boolean {
  return ELIGIBLE_PLANS.includes(plan);
}

/**
 * Check if a task should be extracted based on last fetch time
 */
export function shouldExtract(task: ExtractionTask): boolean {
  // Must have a management URL
  if (!task.managementUrl) {
    return false;
  }

  // If never fetched, should extract
  if (!task.lastFetchedAt) {
    return true;
  }

  // Check time since last fetch
  const lastFetch = new Date(task.lastFetchedAt);
  const hoursSince = (Date.now() - lastFetch.getTime()) / (1000 * 60 * 60);

  return hoursSince >= MIN_HOURS_BETWEEN_EXTRACTIONS;
}

/**
 * Helper to wait for a specified duration
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Extract reviews in a background tab
 */
async function extractInBackgroundTab(task: ExtractionTask): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`[AutoExtraction] Creating tab for ${task.platform}: ${task.managementUrl}`);

    // Create a background tab
    chrome.tabs.create({ url: task.managementUrl, active: false }, (tab) => {
      if (!tab?.id) {
        reject(new Error('Failed to create tab'));
        return;
      }

      const tabId = tab.id;

      // Set up timeout
      const timeout = setTimeout(() => {
        console.log(`[AutoExtraction] Timeout for ${task.platform}`);
        chrome.runtime.onMessage.removeListener(listener);
        chrome.tabs.remove(tabId).catch(() => {});
        reject(new Error('Extraction timeout'));
      }, EXTRACTION_TIMEOUT);

      // Listen for completion message
      const listener = (
        message: any,
        sender: chrome.runtime.MessageSender
      ) => {
        if (
          sender.tab?.id === tabId &&
          message.type === 'EXTRACTION_COMPLETE'
        ) {
          console.log(`[AutoExtraction] Extraction complete for ${task.platform}:`, message.result);
          clearTimeout(timeout);
          chrome.runtime.onMessage.removeListener(listener);
          chrome.tabs.remove(tabId).catch(() => {});
          resolve();
        }
      };

      chrome.runtime.onMessage.addListener(listener);

      // Wait for page to load, then request extraction
      setTimeout(() => {
        console.log(`[AutoExtraction] Sending extraction request to tab ${tabId}`);
        chrome.tabs.sendMessage(tabId, {
          type: 'REQUEST_EXTRACTION',
          platform: task.platform,
          locationId: task.locationId,
          autoExtraction: true,
        }).catch((error) => {
          console.error(`[AutoExtraction] Failed to send message to tab:`, error);
          clearTimeout(timeout);
          chrome.runtime.onMessage.removeListener(listener);
          chrome.tabs.remove(tabId).catch(() => {});
          reject(error);
        });
      }, 3000); // Wait 3 seconds for page to load
    });
  });
}

/**
 * Run auto-extraction for all eligible tasks
 */
export async function runAutoExtraction(): Promise<void> {
  console.log('[AutoExtraction] Starting auto-extraction check...');

  // Check if user is authenticated and eligible
  const user = await getCurrentUser();
  if (!user) {
    console.log('[AutoExtraction] No user logged in, skipping');
    return;
  }

  if (!isEligibleForAutoExtraction(user.plan)) {
    console.log(`[AutoExtraction] Plan "${user.plan}" not eligible for auto-extraction`);
    return;
  }

  // Get extraction tasks
  const tasks = await getExtractionTasks();
  if (tasks.length === 0) {
    console.log('[AutoExtraction] No extraction tasks found');
    return;
  }

  // Filter tasks that need extraction
  const pendingTasks = tasks.filter(shouldExtract);
  console.log(`[AutoExtraction] ${pendingTasks.length}/${tasks.length} tasks need extraction`);

  if (pendingTasks.length === 0) {
    return;
  }

  // Process tasks sequentially
  for (const task of pendingTasks) {
    try {
      console.log(`[AutoExtraction] Processing task: ${task.locationName} - ${task.platform}`);
      await extractInBackgroundTab(task);
      console.log(`[AutoExtraction] Successfully extracted ${task.platform}`);
    } catch (error) {
      console.error(`[AutoExtraction] Failed to extract ${task.platform}:`, error);
    }

    // Wait between extractions to avoid rate limiting
    if (pendingTasks.indexOf(task) < pendingTasks.length - 1) {
      await delay(DELAY_BETWEEN_EXTRACTIONS);
    }
  }

  console.log('[AutoExtraction] Auto-extraction complete');
}

/**
 * Schedule periodic auto-extraction using Chrome alarms
 */
export function scheduleAutoExtraction(): void {
  // Run every 6 hours
  chrome.alarms.create('auto-extraction', {
    delayInMinutes: 1, // First run after 1 minute
    periodInMinutes: 360, // Then every 6 hours
  });

  console.log('[AutoExtraction] Scheduled auto-extraction alarm (every 6 hours)');
}

/**
 * Handle alarm trigger
 */
export function handleAlarm(alarm: chrome.alarms.Alarm): void {
  if (alarm.name === 'auto-extraction') {
    console.log('[AutoExtraction] Alarm triggered, running auto-extraction...');
    runAutoExtraction();
  }
}

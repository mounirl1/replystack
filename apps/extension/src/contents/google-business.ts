import type { PlasmoCSConfig } from 'plasmo';
import { t } from '../i18n';
import { GoogleExtractor } from '../services/extractors/google-extractor';
import { initializeExtraction } from '../services/extraction-handler';

export const config: PlasmoCSConfig = {
  matches: ['https://business.google.com/*'],
  all_frames: true,
  run_at: 'document_idle',
};

// Types
type Length = 'short' | 'medium' | 'detailed';

interface ReviewData {
  externalId: string;
  author: string;
  rating: number;
  content: string;
}

// Inject styles
function injectStyles() {
  if (document.getElementById('replystack-styles')) return;

  const style = document.createElement('style');
  style.id = 'replystack-styles';
  style.textContent = `
    .replystack-popup-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .replystack-popup {
      background: white;
      border-radius: 12px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      width: 480px;
      max-height: 90vh;
      overflow: hidden;
    }
    .replystack-popup-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      border-bottom: 1px solid #e5e7eb;
    }
    .replystack-popup-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #111827;
      font-size: 16px;
    }
    .replystack-popup-close {
      color: #9ca3af;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 20px;
      line-height: 1;
      padding: 4px;
    }
    .replystack-popup-close:hover {
      color: #6b7280;
    }
    .replystack-popup-body {
      padding: 24px;
    }
    .replystack-review-preview {
      background: #f9fafb;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
    }
    .replystack-review-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    .replystack-review-author {
      font-weight: 500;
      color: #111827;
    }
    .replystack-review-stars {
      color: #fbbf24;
    }
    .replystack-review-stars-empty {
      color: #d1d5db;
    }
    .replystack-review-content {
      color: #4b5563;
      font-size: 14px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
    }
    .replystack-label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      margin-bottom: 8px;
    }
    .replystack-length-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-bottom: 16px;
    }
    .replystack-length-btn {
      padding: 10px 12px;
      font-size: 14px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      background: white;
      cursor: pointer;
      transition: all 0.2s;
    }
    .replystack-length-btn:hover {
      border-color: #d1d5db;
    }
    .replystack-length-btn.active {
      border-color: #0ea5e9;
      background: #f0f9ff;
      color: #0369a1;
    }
    .replystack-custom-prompt {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      resize: none;
      font-family: inherit;
      font-size: 14px;
      margin-bottom: 16px;
      box-sizing: border-box;
      min-height: 70px;
    }
    .replystack-custom-prompt:focus {
      outline: none;
      border-color: #0ea5e9;
      box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
    }
    .replystack-custom-prompt::placeholder {
      color: #9ca3af;
    }
    .replystack-btn-primary {
      width: 100%;
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
      color: white;
      padding: 12px;
      border-radius: 8px;
      font-weight: 500;
      font-size: 14px;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }
    .replystack-btn-primary:hover {
      opacity: 0.9;
    }
    .replystack-btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .replystack-error {
      background: #fef2f2;
      color: #b91c1c;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      margin-bottom: 16px;
    }
    .replystack-textarea {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      resize: none;
      font-family: inherit;
      font-size: 14px;
      margin-bottom: 16px;
      box-sizing: border-box;
    }
    .replystack-textarea:focus {
      outline: none;
      border-color: #0ea5e9;
      box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
    }
    .replystack-btn-group {
      display: flex;
      gap: 8px;
    }
    .replystack-btn-secondary {
      flex: 1;
      padding: 10px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      background: white;
      font-weight: 500;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .replystack-btn-secondary:hover {
      background: #f9fafb;
    }
    .replystack-btn-secondary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .replystack-btn-copy {
      padding: 10px 16px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      background: white;
      font-weight: 500;
      font-size: 14px;
      cursor: pointer;
    }
    .replystack-btn-insert {
      flex: 1;
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
      color: white;
      padding: 10px;
      border-radius: 8px;
      font-weight: 500;
      font-size: 14px;
      border: none;
      cursor: pointer;
    }
    .replystack-login-prompt {
      text-align: center;
      padding: 24px;
    }
    .replystack-login-icon {
      width: 64px;
      height: 64px;
      background: #f0f9ff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      font-size: 32px;
    }
    .replystack-login-title {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 8px;
    }
    .replystack-login-text {
      color: #6b7280;
      font-size: 14px;
      margin-bottom: 16px;
    }
    .replystack-login-hint {
      font-size: 12px;
      color: #9ca3af;
    }
    .replystack-reply-section {
      margin-top: 16px;
    }
    .replystack-hidden {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
}

// Create popup HTML
function createPopupHTML(reviewData: ReviewData): string {
  const stars = '★'.repeat(reviewData.rating);
  const emptyStars = '★'.repeat(5 - reviewData.rating);

  return `
    <div class="replystack-popup-overlay" id="replystack-popup-overlay">
      <div class="replystack-popup">
        <div class="replystack-popup-header">
          <div class="replystack-popup-title">
            <span>✨</span>
            <span>${t('modal.title')}</span>
          </div>
          <button class="replystack-popup-close" id="replystack-close">✕</button>
        </div>
        <div class="replystack-popup-body">
          <div class="replystack-review-preview">
            <div class="replystack-review-header">
              <span class="replystack-review-author">${escapeHtml(reviewData.author)}</span>
              <span class="replystack-review-stars">${stars}</span>
              <span class="replystack-review-stars-empty">${emptyStars}</span>
            </div>
            <p class="replystack-review-content">${escapeHtml(reviewData.content)}</p>
          </div>

          <div>
            <label class="replystack-label">${t('modal.responseLength')}</label>
            <div class="replystack-length-grid">
              <button class="replystack-length-btn" data-length="short">${t('modal.short')}</button>
              <button class="replystack-length-btn active" data-length="medium">${t('modal.medium')}</button>
              <button class="replystack-length-btn" data-length="detailed">${t('modal.detailed')}</button>
            </div>
          </div>

          <div>
            <label class="replystack-label">${t('modal.customPrompt')}</label>
            <textarea
              id="replystack-custom-prompt"
              class="replystack-custom-prompt"
              placeholder="${t('modal.customPromptPlaceholder')}"
              rows="2"
            ></textarea>
          </div>

          <div id="replystack-generate-section">
            <button class="replystack-btn-primary" id="replystack-generate">${t('modal.generate')}</button>
          </div>

          <div id="replystack-error" class="replystack-error replystack-hidden"></div>

          <div id="replystack-reply-section" class="replystack-reply-section replystack-hidden">
            <label class="replystack-label">${t('modal.generatedReply')}</label>
            <textarea id="replystack-reply-text" class="replystack-textarea" rows="5"></textarea>
            <div class="replystack-btn-group">
              <button class="replystack-btn-secondary" id="replystack-regenerate">${t('modal.regenerate')}</button>
              <button class="replystack-btn-copy" id="replystack-copy">${t('modal.copy')}</button>
              <button class="replystack-btn-insert" id="replystack-insert">${t('modal.insert')}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Show popup
function showReplyPopup(reviewData: ReviewData, reviewEl: HTMLElement) {
  // Remove any existing popup
  const existingPopup = document.getElementById('replystack-popup-overlay');
  if (existingPopup) {
    existingPopup.remove();
  }

  // Create popup container
  const container = document.createElement('div');
  container.innerHTML = createPopupHTML(reviewData);
  document.body.appendChild(container.firstElementChild!);

  let currentLength: Length = 'medium';
  let generatedReply = '';

  // Get elements
  const overlay = document.getElementById('replystack-popup-overlay')!;
  const closeBtn = document.getElementById('replystack-close')!;
  const generateBtn = document.getElementById('replystack-generate')!;
  const regenerateBtn = document.getElementById('replystack-regenerate')!;
  const copyBtn = document.getElementById('replystack-copy')!;
  const insertBtn = document.getElementById('replystack-insert')!;
  const lengthButtons = document.querySelectorAll('.replystack-length-btn');
  const customPromptTextarea = document.getElementById('replystack-custom-prompt') as HTMLTextAreaElement;
  const generateSection = document.getElementById('replystack-generate-section')!;
  const replySection = document.getElementById('replystack-reply-section')!;
  const replyTextarea = document.getElementById('replystack-reply-text') as HTMLTextAreaElement;
  const errorDiv = document.getElementById('replystack-error')!;

  // Close popup
  const closePopup = () => {
    overlay.remove();
  };

  closeBtn.addEventListener('click', closePopup);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closePopup();
  });

  // Length selection
  lengthButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      lengthButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentLength = btn.getAttribute('data-length') as Length;
    });
  });

  // Generate reply
  const handleGenerate = async () => {
    generateBtn.textContent = t('modal.generating');
    generateBtn.setAttribute('disabled', 'true');
    regenerateBtn.textContent = t('modal.generating');
    regenerateBtn.setAttribute('disabled', 'true');
    errorDiv.classList.add('replystack-hidden');

    // Get custom prompt value
    const specificContext = customPromptTextarea.value.trim() || undefined;

    try {
      const response = await new Promise<{ reply?: string; error?: string }>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: 'GENERATE_REPLY',
            payload: {
              review_content: reviewData.content,
              review_rating: reviewData.rating,
              review_author: reviewData.author,
              platform: 'google',
              length: currentLength,
              specific_context: specificContext,
              language: 'auto',
            },
          },
          (response) => {
            resolve(response || { error: 'No response from extension' });
          }
        );
      });

      if (response.error) {
        throw new Error(response.error);
      }

      generatedReply = response.reply || '';
      replyTextarea.value = generatedReply;
      generateSection.classList.add('replystack-hidden');
      replySection.classList.remove('replystack-hidden');
    } catch (err) {
      errorDiv.textContent = err instanceof Error ? err.message : 'Failed to generate reply';
      errorDiv.classList.remove('replystack-hidden');
    } finally {
      generateBtn.textContent = t('modal.generate');
      generateBtn.removeAttribute('disabled');
      regenerateBtn.textContent = t('modal.regenerate');
      regenerateBtn.removeAttribute('disabled');
    }
  };

  generateBtn.addEventListener('click', handleGenerate);
  regenerateBtn.addEventListener('click', handleGenerate);

  // Copy
  copyBtn.addEventListener('click', async () => {
    const text = replyTextarea.value;
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = t('modal.copied');
      setTimeout(() => {
        copyBtn.textContent = t('modal.copy');
      }, 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      copyBtn.textContent = t('modal.copied');
      setTimeout(() => {
        copyBtn.textContent = t('modal.copy');
      }, 2000);
    }
  });

  // Insert
  insertBtn.addEventListener('click', () => {
    const text = replyTextarea.value;
    const textarea = reviewEl.querySelector('textarea.reply-input, textarea[placeholder*="Reply"]') as HTMLTextAreaElement;
    if (textarea) {
      textarea.value = text;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(new Event('change', { bubbles: true }));
    }
    closePopup();
  });

  // Update textarea value on manual edit
  replyTextarea.addEventListener('input', () => {
    generatedReply = replyTextarea.value;
  });
}

// Observer
function initReviewObserver() {
  injectStyles();

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLElement) {
          injectReplyButtons(node);
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Initial injection
  injectReplyButtons(document.body);
}

function injectReplyButtons(container: HTMLElement) {
  // Google Business Profile selectors - updated for current structure
  const reviewSelectors = [
    '.DsOcnf',           // Main review container
    '.GYpYWe',           // Review wrapper
    '[jscontroller="H8pyme"]', // Review controller element
  ];

  const reviewElements = container.querySelectorAll(reviewSelectors.join(', '));

  reviewElements.forEach((reviewEl) => {
    if (reviewEl.querySelector('.replystack-btn')) return;

    // Find the action area where the "Répondre" button is
    const actionArea = reviewEl.querySelector('.lGXsGc');
    if (!actionArea) return;

    const btn = document.createElement('button');
    btn.className = 'replystack-btn';
    btn.innerHTML = t('modal.aiReplyButton');
    btn.style.cssText = `
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      margin-left: 8px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'translateY(-1px)';
      btn.style.boxShadow = '0 4px 12px rgba(14, 165, 233, 0.3)';
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translateY(0)';
      btn.style.boxShadow = 'none';
    });

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const reviewData = extractReviewData(reviewEl as HTMLElement);
      showReplyPopup(reviewData, reviewEl as HTMLElement);
    });

    // Append button after the existing buttons
    actionArea.appendChild(btn);
  });
}

function extractReviewData(reviewEl: HTMLElement): ReviewData {
  // Author name - in .bFubHb link
  const authorEl = reviewEl.querySelector('.bFubHb');
  const author = authorEl?.textContent?.trim() || 'Anonymous';

  // Review content - in .oiQd1c or .arx7af (truncated)
  const contentEl = reviewEl.querySelector('.oiQd1c, .arx7af');
  let content = contentEl?.textContent?.trim() || '';
  // Clean up "Plus" link text if present
  content = content.replace(/\s*Plus$/, '');

  // Rating - count filled stars (.z3FsAc class)
  const rating = extractRating(reviewEl);

  // External ID from data-review-id attribute
  const reviewIdEl = reviewEl.closest('[data-review-id]') || reviewEl.querySelector('[data-review-id]');
  const externalId = reviewIdEl?.getAttribute('data-review-id') ||
                     reviewEl.getAttribute('key') ||
                     '';

  return { externalId, author, rating, content };
}

function extractRating(reviewEl: HTMLElement): number {
  // Google Business uses .DPvwYc.L12a3c.z3FsAc for filled stars
  const filledStars = reviewEl.querySelectorAll('.DPvwYc.z3FsAc');
  if (filledStars.length > 0) {
    return Math.min(filledStars.length, 5);
  }

  // Fallback: try to find any star rating indicators
  const allStars = reviewEl.querySelectorAll('.DPvwYc');
  if (allStars.length > 0) {
    let count = 0;
    allStars.forEach((star) => {
      if (star.classList.contains('z3FsAc')) count++;
    });
    return count || 5;
  }

  return 5;
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initReviewObserver);
} else {
  initReviewObserver();
}

// Initialize extraction and sync
const googleExtractor = new GoogleExtractor();
initializeExtraction(googleExtractor, [
  '[class*="reviews"]',
  '[class*="review-list"]',
  'body',
]);

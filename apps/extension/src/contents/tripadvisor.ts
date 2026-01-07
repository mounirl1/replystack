import type { PlasmoCSConfig } from 'plasmo';
import { t, translateError } from '@/i18n';
import { TripAdvisorExtractor } from '@/services/extractors/tripadvisor-extractor';
import { initializeExtraction } from '@/services/extraction-handler';
import { getLocationIdForCurrentPage } from '@/utils/location-matcher';
import { getAuthUser, hasQuotaRemaining } from '@/services/auth';

export const config: PlasmoCSConfig = {
  matches: [
    'https://www.tripadvisor.com/*',
    'https://www.tripadvisor.fr/*',
    'https://www.tripadvisor.de/*',
    'https://www.tripadvisor.es/*',
    'https://www.tripadvisor.it/*',
  ],
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
      resize: vertical;
      font-family: inherit;
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 16px;
      box-sizing: border-box;
      white-space: pre-wrap;
      min-height: 120px;
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
    .replystack-hidden {
      display: none !important;
    }
    .replystack-auth-section {
      margin-top: 0;
    }
    .replystack-auth-tabs {
      display: flex;
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 16px;
    }
    .replystack-auth-tab {
      flex: 1;
      padding: 12px;
      background: none;
      border: none;
      font-size: 14px;
      font-weight: 500;
      color: #6b7280;
      cursor: pointer;
      transition: all 0.2s;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
    }
    .replystack-auth-tab:hover {
      color: #111827;
    }
    .replystack-auth-tab.active {
      color: #0ea5e9;
      border-bottom-color: #0ea5e9;
    }
    .replystack-auth-form {
      display: none;
    }
    .replystack-auth-form.active {
      display: block;
    }
    .replystack-login-form-title {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 4px;
      text-align: center;
    }
    .replystack-login-form-subtitle {
      font-size: 13px;
      color: #6b7280;
      margin-bottom: 16px;
      text-align: center;
    }
    .replystack-input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-size: 14px;
      margin-bottom: 12px;
      box-sizing: border-box;
    }
    .replystack-input:focus {
      outline: none;
      border-color: #0ea5e9;
      box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
    }
    .replystack-login-error {
      background: #fef2f2;
      color: #dc2626;
      padding: 10px 12px;
      border-radius: 8px;
      font-size: 13px;
      margin-bottom: 12px;
    }
    .replystack-signup-link {
      text-align: center;
      margin-top: 12px;
      font-size: 13px;
      color: #6b7280;
    }
    .replystack-signup-link a {
      color: #0ea5e9;
      text-decoration: none;
    }
    .replystack-signup-link a:hover {
      text-decoration: underline;
    }
    .replystack-quota-exhausted {
      text-align: center;
      padding: 24px 16px;
    }
    .replystack-quota-exhausted-icon {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      font-size: 28px;
    }
    .replystack-quota-exhausted-title {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 8px;
    }
    .replystack-quota-exhausted-description {
      color: #6b7280;
      font-size: 14px;
      margin-bottom: 20px;
      line-height: 1.5;
    }
    .replystack-btn-upgrade {
      width: 100%;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      padding: 12px;
      border-radius: 8px;
      font-weight: 500;
      font-size: 14px;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }
    .replystack-btn-upgrade:hover {
      opacity: 0.9;
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
          <div id="replystack-initial-content">
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
          </div>

          <div id="replystack-login-section" class="replystack-auth-section replystack-hidden">
            <div class="replystack-auth-tabs">
              <button class="replystack-auth-tab active" data-tab="login">${t('popup.signIn')}</button>
              <button class="replystack-auth-tab" data-tab="register">${t('popup.signUpFree')}</button>
            </div>

            <div id="replystack-login-form" class="replystack-auth-form active">
              <div class="replystack-login-form-title">${t('modal.loginRequired')}</div>
              <div class="replystack-login-form-subtitle">${t('modal.loginDescription')}</div>
              <div id="replystack-login-error" class="replystack-login-error replystack-hidden"></div>
              <input type="email" id="replystack-login-email" class="replystack-input" placeholder="${t('popup.emailPlaceholder')}" />
              <input type="password" id="replystack-login-password" class="replystack-input" placeholder="${t('popup.passwordPlaceholder')}" />
              <button class="replystack-btn-primary" id="replystack-login-btn">${t('popup.signIn')}</button>
            </div>

            <div id="replystack-register-form" class="replystack-auth-form">
              <div class="replystack-login-form-title">${t('modal.registerTitle')}</div>
              <div class="replystack-login-form-subtitle">${t('modal.registerDescription')}</div>
              <div id="replystack-register-error" class="replystack-login-error replystack-hidden"></div>
              <input type="text" id="replystack-register-name" class="replystack-input" placeholder="${t('modal.namePlaceholder')}" />
              <input type="email" id="replystack-register-email" class="replystack-input" placeholder="${t('popup.emailPlaceholder')}" />
              <input type="password" id="replystack-register-password" class="replystack-input" placeholder="${t('popup.passwordPlaceholder')}" />
              <input type="password" id="replystack-register-password-confirm" class="replystack-input" placeholder="${t('modal.confirmPasswordPlaceholder')}" />
              <button class="replystack-btn-primary" id="replystack-register-btn">${t('modal.registerButton')}</button>
            </div>
          </div>

          <div id="replystack-quota-exhausted-section" class="replystack-quota-exhausted replystack-hidden">
            <div class="replystack-quota-exhausted-icon">⚡</div>
            <div class="replystack-quota-exhausted-title">${t('quotaExhausted.title')}</div>
            <div class="replystack-quota-exhausted-description">${t('quotaExhausted.description')}</div>
            <button class="replystack-btn-upgrade" id="replystack-upgrade-btn">${t('quotaExhausted.upgradeButton')}</button>
          </div>

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
async function showReplyPopup(reviewData: ReviewData, reviewEl: HTMLElement) {
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
  const loginSection = document.getElementById('replystack-login-section')!;
  const loginForm = document.getElementById('replystack-login-form')!;
  const loginEmailInput = document.getElementById('replystack-login-email') as HTMLInputElement;
  const loginPasswordInput = document.getElementById('replystack-login-password') as HTMLInputElement;
  const loginBtn = document.getElementById('replystack-login-btn')!;
  const loginErrorDiv = document.getElementById('replystack-login-error')!;
  const registerForm = document.getElementById('replystack-register-form')!;
  const registerNameInput = document.getElementById('replystack-register-name') as HTMLInputElement;
  const registerEmailInput = document.getElementById('replystack-register-email') as HTMLInputElement;
  const registerPasswordInput = document.getElementById('replystack-register-password') as HTMLInputElement;
  const registerPasswordConfirmInput = document.getElementById('replystack-register-password-confirm') as HTMLInputElement;
  const registerBtn = document.getElementById('replystack-register-btn')!;
  const registerErrorDiv = document.getElementById('replystack-register-error')!;
  const authTabs = document.querySelectorAll('.replystack-auth-tab');
  const quotaExhaustedSection = document.getElementById('replystack-quota-exhausted-section')!;
  const upgradeBtn = document.getElementById('replystack-upgrade-btn')!;
  const initialContent = document.getElementById('replystack-initial-content')!;

  // Check if user has quota remaining
  const userHasQuota = await hasQuotaRemaining();
  const user = await getAuthUser();

  if (user && !userHasQuota) {
    // User is logged in but has no quota - show quota exhausted section
    generateSection.classList.add('replystack-hidden');
    quotaExhaustedSection.classList.remove('replystack-hidden');
  }

  // Upgrade button handler
  upgradeBtn.addEventListener('click', () => {
    window.open('https://reply-stack.app/pricing', '_blank');
  });

  // Close popup
  const closePopup = () => {
    overlay.remove();
  };

  closeBtn.addEventListener('click', closePopup);
  overlay.addEventListener('click', (e) => {
    const popup = overlay.querySelector('.replystack-popup');
    if (popup && !popup.contains(e.target as Node)) {
      closePopup();
    }
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

    // Get location ID for this page
    const locationId = await getLocationIdForCurrentPage();

    try {
      const response = await new Promise<{ reply?: string; error?: string }>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Request timeout. Please reload the page and try again.'));
        }, 30000); // 30 second timeout

        chrome.runtime.sendMessage(
          {
            type: 'GENERATE_REPLY',
            payload: {
              review_content: reviewData.content,
              review_rating: reviewData.rating,
              review_author: reviewData.author,
              platform: 'tripadvisor',
              location_id: locationId ?? undefined,
              length: currentLength,
              specific_context: specificContext,
              language: 'auto',
            },
          },
          (response) => {
            clearTimeout(timeout);
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message || 'Extension error. Please reload the page.'));
              return;
            }
            resolve(response || { error: 'No response from extension' });
          }
        );
      });

      if (response.error) {
        throw new Error(response.error);
      }

      replyTextarea.value = response.reply || '';
      generateSection.classList.add('replystack-hidden');
      replySection.classList.remove('replystack-hidden');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate reply';
      console.error('[ReplyStack] Generate error:', errorMessage, err);

      // Handle sign-in required error - show login form
      if (errorMessage === 'SIGN_IN_REQUIRED') {
        initialContent.classList.add('replystack-hidden');
        loginSection.classList.remove('replystack-hidden');
        loginEmailInput.focus();
      } else {
        errorDiv.textContent = translateError(errorMessage);
        errorDiv.classList.remove('replystack-hidden');
      }
    } finally {
      generateBtn.textContent = t('modal.generate');
      generateBtn.removeAttribute('disabled');
      regenerateBtn.textContent = t('modal.regenerate');
      regenerateBtn.removeAttribute('disabled');
    }
  };

  generateBtn.addEventListener('click', handleGenerate);
  regenerateBtn.addEventListener('click', handleGenerate);

  // Login form submission
  const handleLogin = async () => {
    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value;

    if (!email || !password) {
      loginErrorDiv.textContent = t('errors.invalidCredentials');
      loginErrorDiv.classList.remove('replystack-hidden');
      return;
    }

    loginBtn.textContent = t('popup.signingIn');
    loginBtn.setAttribute('disabled', 'true');
    loginErrorDiv.classList.add('replystack-hidden');

    try {
      const response = await new Promise<{ token?: string; user?: unknown; error?: string }>((resolve, reject) => {
        chrome.runtime.sendMessage(
          { type: 'LOGIN', payload: { email, password } },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message || 'Login failed'));
              return;
            }
            resolve(response || { error: 'No response' });
          }
        );
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Login successful - hide login form, show initial content and trigger generation
      loginSection.classList.add('replystack-hidden');
      initialContent.classList.remove('replystack-hidden');
      // Auto-generate after login
      handleGenerate();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      loginErrorDiv.textContent = translateError(errorMessage);
      loginErrorDiv.classList.remove('replystack-hidden');
    } finally {
      loginBtn.textContent = t('popup.signIn');
      loginBtn.removeAttribute('disabled');
    }
  };

  loginBtn.addEventListener('click', handleLogin);
  loginPasswordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  });

  // Tab switching
  authTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const tabName = tab.getAttribute('data-tab');
      authTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      if (tabName === 'login') {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        loginErrorDiv.classList.add('replystack-hidden');
      } else {
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
        registerErrorDiv.classList.add('replystack-hidden');
      }
    });
  });

  // Registration form submission
  const handleRegister = async () => {
    const name = registerNameInput.value.trim();
    const email = registerEmailInput.value.trim();
    const password = registerPasswordInput.value;
    const passwordConfirm = registerPasswordConfirmInput.value;

    if (!email || !password) {
      registerErrorDiv.textContent = t('errors.invalidCredentials');
      registerErrorDiv.classList.remove('replystack-hidden');
      return;
    }

    if (password !== passwordConfirm) {
      registerErrorDiv.textContent = t('errors.passwordMismatch');
      registerErrorDiv.classList.remove('replystack-hidden');
      return;
    }

    if (password.length < 8) {
      registerErrorDiv.textContent = t('errors.passwordTooWeak');
      registerErrorDiv.classList.remove('replystack-hidden');
      return;
    }

    registerBtn.textContent = t('modal.registering');
    registerBtn.setAttribute('disabled', 'true');
    registerErrorDiv.classList.add('replystack-hidden');

    try {
      const response = await new Promise<{ token?: string; user?: unknown; error?: string }>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: 'REGISTER',
            payload: {
              name: name || undefined,
              email,
              password,
              password_confirmation: passwordConfirm,
            },
          },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message || 'Registration failed'));
              return;
            }
            resolve(response || { error: 'No response' });
          }
        );
      });

      if (response.error) {
        throw new Error(response.error);
      }

      loginSection.classList.add('replystack-hidden');
      initialContent.classList.remove('replystack-hidden');
      handleGenerate();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      registerErrorDiv.textContent = translateError(errorMessage);
      registerErrorDiv.classList.remove('replystack-hidden');
    } finally {
      registerBtn.textContent = t('modal.registerButton');
      registerBtn.removeAttribute('disabled');
    }
  };

  registerBtn.addEventListener('click', handleRegister);
  registerPasswordConfirmInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleRegister();
    }
  });

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
  insertBtn.addEventListener('click', async () => {
    const text = replyTextarea.value;

    const textareaSelectors = [
      // Overview page modal textarea
      'textarea.GYDIs',
      '.WMIKb[role="dialog"] textarea',
      // Reviews page textareas
      'textarea.VoyPg',
      'textarea[placeholder*="response"]',
      'textarea[placeholder*="Reply"]',
      'textarea[name="response"]',
      '.roAGK textarea',
      '.response-form textarea',
    ];

    // Helper function to insert text into textarea
    const insertIntoTextarea = (textarea: HTMLTextAreaElement) => {
      textarea.value = text;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(new Event('change', { bubbles: true }));
      textarea.focus();
    };

    // Helper function to find and insert into textarea
    const tryInsert = (): boolean => {
      // First check for overview page modal
      const responseModal = document.querySelector('.WMIKb[role="dialog"]') as HTMLElement;
      if (responseModal) {
        for (const selector of textareaSelectors) {
          const textarea = responseModal.querySelector(selector) as HTMLTextAreaElement;
          if (textarea) {
            insertIntoTextarea(textarea);
            return true;
          }
        }
      }

      // Then try to find expanded review on reviews page
      const reviewsContainer = document.querySelector('.kXCMl, #REVIEWS, [class*="reviews"]');
      if (reviewsContainer) {
        const expandedReview = reviewsContainer.querySelector('[data-review-gid]') as HTMLElement;
        if (expandedReview) {
          for (const selector of textareaSelectors) {
            const textarea = expandedReview.querySelector(selector) as HTMLTextAreaElement;
            if (textarea) {
              insertIntoTextarea(textarea);
              return true;
            }
          }
        }
      }

      // Try globally for any visible textarea
      for (const selector of textareaSelectors) {
        const textarea = document.querySelector(selector) as HTMLTextAreaElement;
        if (textarea && textarea.offsetParent !== null) {
          insertIntoTextarea(textarea);
          return true;
        }
      }

      return false;
    };

    // Check review type
    const isCollapsedReview = reviewEl.classList.contains('onXpl') && reviewEl.tagName === 'BUTTON';
    const isOverviewCard = reviewEl.matches('li.GDjZb');
    const isResponseModal = reviewEl.matches('.WMIKb[role="dialog"]');

    if (isOverviewCard) {
      // Overview page card - need to click Respond button to open modal
      const respondBtn = reviewEl.querySelector('button.QHaGY') as HTMLButtonElement;
      if (respondBtn) {
        respondBtn.click();

        // Wait for the modal to appear
        let attempts = 0;
        const maxAttempts = 30; // 3 seconds max

        const waitForModal = () => {
          attempts++;
          const modal = document.querySelector('.WMIKb[role="dialog"]') as HTMLElement;
          if (modal) {
            // Modal appeared, try to insert
            if (tryInsert()) {
              navigator.clipboard.writeText(text).catch(() => {});
              closePopup();
              return;
            }
          }

          if (attempts < maxAttempts) {
            setTimeout(waitForModal, 100);
          } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(text).catch(() => {});
            closePopup();
          }
        };

        setTimeout(waitForModal, 200);
      } else {
        // No respond button found, copy to clipboard
        navigator.clipboard.writeText(text).catch(() => {});
        closePopup();
      }
    } else if (isResponseModal) {
      // Already in modal, insert directly
      if (!tryInsert()) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
      closePopup();
    } else if (isCollapsedReview) {
      // Collapsed review on reviews page - click to expand
      reviewEl.click();

      // Wait for the expanded review and textarea to appear
      let attempts = 0;
      const maxAttempts = 20; // 2 seconds max

      const waitForTextarea = () => {
        attempts++;
        if (tryInsert()) {
          navigator.clipboard.writeText(text).catch(() => {});
          closePopup();
          return;
        }

        if (attempts < maxAttempts) {
          setTimeout(waitForTextarea, 100);
        } else {
          // Fallback: copy to clipboard
          navigator.clipboard.writeText(text).catch(() => {});
          closePopup();
        }
      };

      // Start waiting after a short delay for the click to process
      setTimeout(waitForTextarea, 150);
    } else {
      // Review is already expanded or using legacy interface
      if (!tryInsert()) {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(text).catch(() => {});
      }
      closePopup();
    }
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

  injectReplyButtons(document.body);
}

function injectReplyButtons(container: HTMLElement) {
  // Helper to get elements including the container itself if it matches
  const querySelectorAllIncludingSelf = (el: HTMLElement, selector: string): Element[] => {
    const descendants = Array.from(el.querySelectorAll(selector));
    if (el.matches(selector)) {
      return [el, ...descendants];
    }
    return descendants;
  };

  // Inject button next to Submit button in expanded reviews (.roAGK .aJvfh)
  const submitButtonContainers = container.querySelectorAll('.roAGK .aJvfh, .roAGK .SKoPa');
  submitButtonContainers.forEach((aJvfhEl) => {
    // Check if button already exists in this container
    if (aJvfhEl.querySelector('.replystack-btn')) return;

    const submitBtn = aJvfhEl.querySelector('button[type="submit"], button.sOtnj');
    if (!submitBtn) return;

    // Find the parent .Fizlk or [data-review-gid] for extracting review data
    const reviewEl = aJvfhEl.closest('.Fizlk, [data-review-gid]');
    if (!reviewEl) return;

    createAndInsertButton(aJvfhEl as HTMLElement, submitBtn as HTMLElement, reviewEl as HTMLElement, 'expanded');
  });

  // Inject button in collapsed reviews (button.onXpl)
  // Use helper to also check if container itself is an .onXpl
  const collapsedReviews = querySelectorAllIncludingSelf(container, 'button.onXpl, .onXpl');
  collapsedReviews.forEach((reviewEl) => {
    if (reviewEl.querySelector('.replystack-btn')) return;

    const actionArea = reviewEl.querySelector('.DyFaS') || reviewEl;
    createAndInsertButton(actionArea as HTMLElement, null, reviewEl as HTMLElement, 'collapsed');
  });

  // Inject button in overview page cards (li.GDjZb)
  const overviewCards = querySelectorAllIncludingSelf(container, 'li.GDjZb');
  overviewCards.forEach((reviewEl) => {
    if (reviewEl.querySelector('.replystack-btn')) return;

    const respondBtn = reviewEl.querySelector('button.QHaGY');
    if (!respondBtn || !respondBtn.parentElement) return;

    createAndInsertButton(respondBtn.parentElement as HTMLElement, respondBtn as HTMLElement, reviewEl as HTMLElement, 'overview');
  });

  // Inject button in response modal (.WMIKb[role="dialog"])
  const responseModals = querySelectorAllIncludingSelf(container, '.WMIKb[role="dialog"]');
  responseModals.forEach((reviewEl) => {
    if (reviewEl.querySelector('.replystack-btn')) return;

    const respondBtn = reviewEl.querySelector('.BVBSW button.sOtnj');
    if (!respondBtn || !respondBtn.parentElement) return;

    createAndInsertButton(respondBtn.parentElement as HTMLElement, respondBtn as HTMLElement, reviewEl as HTMLElement, 'modal');
  });

  // Legacy selectors
  const legacySelectors = [
    '[data-reviewid]',
    '.review-container',
    '.reviewSelector',
    '[data-test-target="HR_CC_CARD"]',
    '.location-review-card',
  ];
  const legacyReviews = container.querySelectorAll(legacySelectors.join(', '));
  legacyReviews.forEach((reviewEl) => {
    if (reviewEl.querySelector('.replystack-btn')) return;
    // Skip if this is actually a new interface element
    if (reviewEl.closest('.Fizlk, .onXpl, .GDjZb, .WMIKb')) return;

    const actionArea = reviewEl.querySelector(
      '.helpful, .social-actions, .review-actions, [data-test-target="review-rating"]'
    );
    if (!actionArea) return;

    createAndInsertButton(actionArea as HTMLElement, null, reviewEl as HTMLElement, 'legacy');
  });
}

function createAndInsertButton(
  actionArea: HTMLElement,
  targetBtn: HTMLElement | null,
  reviewEl: HTMLElement,
  type: 'expanded' | 'collapsed' | 'overview' | 'modal' | 'legacy'
) {
  const btn = document.createElement('button');
  btn.className = 'replystack-btn';
  btn.innerHTML = t('modal.aiReplyButton');

  // Use margin-right when inserted before a button, margin-left otherwise
  const insertBefore = type === 'expanded' || type === 'modal' || type === 'overview';
  const marginStyle = insertBefore ? 'margin-right: 8px;' : 'margin-left: 8px;';

  btn.style.cssText = `
    background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    ${marginStyle}
    display: inline-flex;
    align-items: center;
    gap: 4px;
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
    const reviewData = extractReviewData(reviewEl);
    showReplyPopup(reviewData, reviewEl);
  });

  // Insert the button
  if (targetBtn && insertBefore) {
    // Insert directly before the target button
    targetBtn.parentNode?.insertBefore(btn, targetBtn);
  } else {
    actionArea.appendChild(btn);
  }
}

function extractReviewData(reviewEl: HTMLElement): ReviewData {
  // Check if this is the new management interface
  const isCollapsedReview = reviewEl.classList.contains('onXpl');
  const isExpandedReview = reviewEl.hasAttribute('data-review-gid') || reviewEl.classList.contains('Fizlk');
  const isOverviewCard = reviewEl.matches('li.GDjZb');
  const isResponseModal = reviewEl.matches('.WMIKb[role="dialog"]');

  let author = 'Anonymous';
  let content = '';
  let rating = 5;
  let externalId = '';

  if (isResponseModal) {
    // Response modal on overview page
    // Author is in .biGQs._P.SewaP.OgHoE .o.W
    const authorEl = reviewEl.querySelector('.biGQs.SewaP.OgHoE .o.W, .aaiAK .biGQs.SewaP');
    if (authorEl?.textContent?.trim()) {
      author = authorEl.textContent.trim();
    }

    // Rating is in svg.evwcZ title
    const svgTitle = reviewEl.querySelector('svg.evwcZ title');
    if (svgTitle?.textContent) {
      const match = svgTitle.textContent.match(/(\d+\.?\d*)\s*of\s*5/);
      if (match) {
        rating = Math.round(parseFloat(match[1]));
      }
    }

    // Content: title in [data-test-target="review-title"], text in [data-automation="reviewText_*"]
    const titleEl = reviewEl.querySelector('[data-test-target="review-title"]');
    const contentEl = reviewEl.querySelector('[data-automation^="reviewText_"], .fIrGe .biGQs');

    const titleText = titleEl?.textContent?.trim() || '';
    const contentText = contentEl?.textContent?.trim() || '';

    content = titleText ? `${titleText}\n${contentText}` : contentText;
  } else if (isOverviewCard) {
    // Overview page card in carousel
    // Author is in .biGQs._P span._c or .biGQs.oCpZu span._c
    const authorEl = reviewEl.querySelector('.biGQs.oCpZu span._c, .joERX .biGQs span._c');
    if (authorEl?.textContent?.trim()) {
      author = authorEl.textContent.trim();
    }

    // Rating is in svg.evwcZ title
    const svgTitle = reviewEl.querySelector('svg.evwcZ title');
    if (svgTitle?.textContent) {
      const match = svgTitle.textContent.match(/(\d+\.?\d*)\s*of\s*5/);
      if (match) {
        rating = Math.round(parseFloat(match[1]));
      }
    }

    // Content is in .biGQs._P.alXOW.wSaDS or .biGQs._P.alXOW.NwcxK
    const contentEl = reviewEl.querySelector('.biGQs.alXOW.wSaDS, .biGQs.alXOW.NwcxK');
    content = contentEl?.textContent?.trim() || '';
  } else if (isExpandedReview) {
    // Expanded review in new management interface
    externalId = reviewEl.getAttribute('data-review-gid') || '';

    // Author is in .hcVjp .QIHsu .biGQs or similar
    const authorEl = reviewEl.querySelector('.QIHsu .biGQs, .hcVjp .biGQs');
    if (authorEl?.textContent?.trim()) {
      author = authorEl.textContent.trim();
    }

    // Rating is in the SVG title
    const svgTitle = reviewEl.querySelector('svg.UctUV title');
    if (svgTitle?.textContent) {
      const match = svgTitle.textContent.match(/(\d+\.?\d*)\s*of\s*5/);
      if (match) {
        rating = Math.round(parseFloat(match[1]));
      }
    }

    // Content: title in .OgHoE, full text in .S4.H4
    const titleEl = reviewEl.querySelector('.OgHoE');
    const contentEl = reviewEl.querySelector('.S4.H4, .oJZss');

    const titleText = titleEl?.textContent?.trim() || '';
    const contentText = contentEl?.textContent?.trim() || '';

    content = titleText ? `${titleText}\n${contentText}` : contentText;
  } else if (isCollapsedReview) {
    // Collapsed review in new management interface
    // Author is in .YLwnJ .biGQs (first one)
    const authorEl = reviewEl.querySelector('.YLwnJ .biGQs');
    if (authorEl?.textContent?.trim()) {
      author = authorEl.textContent.trim();
    }

    // Rating is in the SVG title like "5.0 of 5 bubbles"
    const svgTitle = reviewEl.querySelector('svg.UctUV title');
    if (svgTitle?.textContent) {
      const match = svgTitle.textContent.match(/(\d+\.?\d*)\s*of\s*5/);
      if (match) {
        rating = Math.round(parseFloat(match[1]));
      }
    }

    // Content is in .DyFaS .biGQs._P.VImYz.xARtZ.AWdfh .q.W.o (the review text)
    // There can be a title and content - let's get both
    const titleEl = reviewEl.querySelector('.DyFaS .biGQs.SewaP.OgHoE .q, .DyFaS .OgHoE .q');
    const contentEl = reviewEl.querySelector('.DyFaS .biGQs.VImYz.AWdfh .q, .DyFaS .AWdfh .q');

    const titleText = titleEl?.textContent?.trim() || '';
    const contentText = contentEl?.textContent?.trim() || '';

    content = titleText ? `${titleText}\n${contentText}` : contentText;
  } else {
    // Legacy selectors for older interface
    const authorSelectors = [
      '.member_info .username',
      '[class*="username"]',
      '[data-test-target="review-title"] + * a',
      '.info_text',
    ];
    for (const selector of authorSelectors) {
      const el = reviewEl.querySelector(selector);
      if (el?.textContent?.trim()) {
        author = el.textContent.trim();
        break;
      }
    }

    rating = extractRating(reviewEl);

    const contentSelectors = [
      '.entry .partial_entry',
      '[data-test-target="review-body"]',
      '.prw_reviews_text_summary_hsx',
      '.review-text',
      '[class*="reviewText"]',
    ];
    for (const selector of contentSelectors) {
      const el = reviewEl.querySelector(selector);
      if (el?.textContent?.trim()) {
        content = el.textContent.trim();
        break;
      }
    }
  }

  return {
    externalId: externalId || reviewEl.getAttribute('data-reviewid') || '',
    author,
    rating,
    content,
  };
}

function extractRating(reviewEl: HTMLElement): number {
  const bubbleSelectors = [
    '[class*="bubble_"] svg',
    '.ui_bubble_rating',
    '[class*="rating"]',
  ];

  for (const selector of bubbleSelectors) {
    const ratingEl = reviewEl.querySelector(selector);
    if (ratingEl) {
      const ariaLabel = ratingEl.getAttribute('aria-label');
      if (ariaLabel) {
        const match = ariaLabel.match(/(\d)/);
        if (match) return parseInt(match[1], 10);
      }

      const className = ratingEl.className;
      const bubbleMatch = className.match(/bubble_(\d)0/);
      if (bubbleMatch) return parseInt(bubbleMatch[1], 10);

      const filledBubbles = reviewEl.querySelectorAll('[class*="bubble_"] .fill');
      if (filledBubbles.length > 0) return Math.min(filledBubbles.length, 5);
    }
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
const tripAdvisorExtractor = new TripAdvisorExtractor();
initializeExtraction(tripAdvisorExtractor, [
  '[class*="reviews"]',
  '[class*="review-container"]',
  '#REVIEWS',
  'body',
]);

import type { PlasmoCSConfig } from 'plasmo';
import { t, translateError } from '../i18n';
import { BookingExtractor } from '../services/extractors/booking-extractor';
import { initializeExtraction } from '../services/extraction-handler';
import { getLocationIdForCurrentPage } from '../utils/location-matcher';
import { getAuthUser, hasQuotaRemaining } from '../services/auth';

export const config: PlasmoCSConfig = {
  matches: ['https://admin.booking.com/*'],
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

async function showReplyPopup(reviewData: ReviewData) {
  const existingPopup = document.getElementById('replystack-popup-overlay');
  if (existingPopup) {
    existingPopup.remove();
  }

  const container = document.createElement('div');
  container.innerHTML = createPopupHTML(reviewData);
  document.body.appendChild(container.firstElementChild!);

  let currentLength: Length = 'medium';

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

  lengthButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      lengthButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentLength = btn.getAttribute('data-length') as Length;
    });
  });

  const handleGenerate = async () => {
    generateBtn.textContent = t('modal.generating');
    generateBtn.setAttribute('disabled', 'true');
    regenerateBtn.textContent = t('modal.generating');
    regenerateBtn.setAttribute('disabled', 'true');
    errorDiv.classList.add('replystack-hidden');

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
              platform: 'booking',
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

    // Client-side validation
    if (!email || !password) {
      registerErrorDiv.textContent = t('errors.invalidCredentials');
      registerErrorDiv.classList.remove('replystack-hidden');
      return;
    }

    if (password.length < 8) {
      registerErrorDiv.textContent = t('errors.passwordTooWeak');
      registerErrorDiv.classList.remove('replystack-hidden');
      return;
    }

    if (password !== passwordConfirm) {
      registerErrorDiv.textContent = t('errors.passwordMismatch');
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

      // Registration successful - hide login section, show initial content and trigger generation
      loginSection.classList.add('replystack-hidden');
      initialContent.classList.remove('replystack-hidden');
      // Auto-generate after registration
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

  insertBtn.addEventListener('click', () => {
    const text = replyTextarea.value;
    const textareaSelectors = [
      'textarea[name="response"]',
      'textarea[placeholder*="response"]',
      'textarea[placeholder*="Reply"]',
      '.response-form textarea',
      'textarea',
    ];

    for (const selector of textareaSelectors) {
      const textarea = document.querySelector(selector) as HTMLTextAreaElement;
      if (textarea) {
        textarea.value = text;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new Event('change', { bubbles: true }));
        textarea.focus();
        break;
      }
    }

    navigator.clipboard.writeText(text).catch(() => {});
    closePopup();
  });
}

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
  const reviewSelectors = [
    '[data-review-id]',
    '.review-card',
    '[class*="guest-review"]',
    '[class*="review-item"]',
    '.bui-card',
  ];

  const reviewElements = container.querySelectorAll(reviewSelectors.join(', '));

  reviewElements.forEach((reviewEl) => {
    if (reviewEl.querySelector('.replystack-btn')) return;

    const actionArea = reviewEl.querySelector(
      '.review-actions, [class*="actions"], .bui-button-group, footer'
    );
    if (!actionArea) return;

    const btn = document.createElement('button');
    btn.className = 'replystack-btn';
    btn.innerHTML = t('modal.aiReplyButton');
    btn.style.cssText = `
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
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
      showReplyPopup(reviewData);
    });

    actionArea.appendChild(btn);
  });
}

function extractReviewData(reviewEl: HTMLElement): ReviewData {
  const authorSelectors = [
    '.guest-name',
    '[class*="guest-name"]',
    '[class*="reviewer-name"]',
    '.review-author',
  ];
  let author = 'Anonymous';
  for (const selector of authorSelectors) {
    const el = reviewEl.querySelector(selector);
    if (el?.textContent?.trim()) {
      author = el.textContent.trim();
      break;
    }
  }

  const rating = extractRating(reviewEl);

  const contentSelectors = [
    '.review-text',
    '[class*="review-text"]',
    '[class*="review-content"]',
    '.review-body',
  ];

  let content = '';
  for (const selector of contentSelectors) {
    const el = reviewEl.querySelector(selector);
    if (el?.textContent?.trim()) {
      content = el.textContent.trim();
      break;
    }
  }

  // Booking often has positive/negative sections
  if (!content) {
    const positive = reviewEl.querySelector('[class*="positive"]')?.textContent?.trim() || '';
    const negative = reviewEl.querySelector('[class*="negative"]')?.textContent?.trim() || '';
    if (positive || negative) {
      content = [positive && `+: ${positive}`, negative && `-: ${negative}`]
        .filter(Boolean)
        .join(' | ');
    }
  }

  return {
    externalId: reviewEl.getAttribute('data-review-id') || reviewEl.getAttribute('data-id') || '',
    author,
    rating,
    content,
  };
}

function extractRating(reviewEl: HTMLElement): number {
  const scoreSelectors = [
    '.review-score',
    '[class*="review-score"]',
    '[class*="rating-score"]',
    '.bui-review-score__badge',
  ];

  for (const selector of scoreSelectors) {
    const scoreEl = reviewEl.querySelector(selector);
    if (scoreEl?.textContent) {
      const match = scoreEl.textContent.match(/(\d+\.?\d*)/);
      if (match) {
        const score10 = parseFloat(match[1]);
        // Booking uses 1-10 scale, convert to 1-5
        return Math.round(score10 / 2);
      }
    }
  }

  return 4; // Default
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initReviewObserver);
} else {
  initReviewObserver();
}

// Initialize extraction and sync
const bookingExtractor = new BookingExtractor();
initializeExtraction(bookingExtractor, [
  '[class*="reviews"]',
  '[class*="review-list"]',
  'body',
]);

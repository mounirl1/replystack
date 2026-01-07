import React, { useState, useEffect } from 'react';

import '../style.css';
import i18n, { t, translateError } from '../i18n';
import {
  type AuthUser,
  getAuthState,
  login,
  register,
  logout,
  refreshUserProfile,
  openWithMagicAuth,
} from '../services/auth';

type TabType = 'dashboard' | 'reply';
type LengthType = 'short' | 'medium' | 'detailed';
type AuthTabType = 'login' | 'register';

function IndexPopup() {
  // Force re-render on language change (for future language selector)
  const [, _setLang] = useState(i18n.language);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auth tab state
  const [authTab, setAuthTab] = useState<AuthTabType>('login');

  // Form state (login)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Form state (register)
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState('');

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Reply form state
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [length, setLength] = useState<LengthType>('medium');
  const [customInstructions, setCustomInstructions] = useState('');
  const [generatedReply, setGeneratedReply] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    setIsLoading(true);
    try {
      const { token, user } = await getAuthState();
      if (token && user) {
        // Verify token is still valid by refreshing profile
        const refreshedUser = await refreshUserProfile();
        if (refreshedUser) {
          setIsLoggedIn(true);
          setUser(refreshedUser);
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
      }
    } catch (err) {
      console.error('Failed to load auth state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError(null);

    try {
      const { user } = await login(email, password);
      setIsLoggedIn(true);
      setUser(user);
      setEmail('');
      setPassword('');
    } catch (err) {
      const message = err instanceof Error ? err.message : t('errors.loginFailed');
      setError(translateError(message));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!registerEmail || !registerPassword) {
      setError(t('errors.invalidCredentials'));
      return;
    }

    if (registerPassword.length < 8) {
      setError(t('errors.passwordTooWeak'));
      return;
    }

    if (registerPassword !== registerPasswordConfirm) {
      setError(t('errors.passwordMismatch'));
      return;
    }

    setIsRegistering(true);

    try {
      const { user } = await register(
        registerEmail,
        registerPassword,
        registerPasswordConfirm,
        registerName || undefined
      );
      setIsLoggedIn(true);
      setUser(user);
      setRegisterName('');
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterPasswordConfirm('');
    } catch (err) {
      const message = err instanceof Error ? err.message : t('errors.registrationFailed');
      setError(translateError(message));
    } finally {
      setIsRegistering(false);
    }
  };

  const switchAuthTab = (tab: AuthTabType) => {
    setAuthTab(tab);
    setError(null);
  };

  const handleLogout = async () => {
    await logout();
    setIsLoggedIn(false);
    setUser(null);
    setActiveTab('dashboard');
  };

  const handleRefresh = async () => {
    const refreshedUser = await refreshUserProfile();
    if (refreshedUser) {
      setUser(refreshedUser);
    }
  };

  const handleGenerate = async () => {
    if (!reviewText.trim()) {
      setReplyError(t('popup.reply.errorEmpty'));
      return;
    }
    setIsGenerating(true);
    setReplyError(null);
    setGeneratedReply('');

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GENERATE_REPLY',
        payload: {
          review_content: reviewText,
          review_rating: rating,
          review_author: 'Customer',
          platform: 'other',
          length,
          specific_context: customInstructions,
          language: 'auto'
        }
      });

      if (response.error) {
        setReplyError(translateError(response.error));
      } else {
        setGeneratedReply(response.reply);
        // Refresh user to update quota
        const refreshedUser = await refreshUserProfile();
        if (refreshedUser) {
          setUser(refreshedUser);
        }
      }
    } catch (err) {
      setReplyError(t('errors.generateFailed'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedReply);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = generatedReply;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRegenerate = () => {
    setGeneratedReply('');
    handleGenerate();
  };

  // Star Rating Component
  const StarRating = () => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          className={`text-xl transition-colors ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300'
          } hover:text-yellow-400`}
        >
          ★
        </button>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="w-80 p-6 bg-white flex items-center justify-center">
        <div className="animate-pulse text-gray-400">{t('popup.loading')}</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="w-80 p-6 bg-white">
        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">✨</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">ReplyStack</h1>
          <p className="text-sm text-gray-500 mt-1">{t('popup.tagline')}</p>
        </div>

        {/* Auth Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            type="button"
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              authTab === 'login'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => switchAuthTab('login')}
          >
            {t('popup.signIn')}
          </button>
          <button
            type="button"
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              authTab === 'register'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => switchAuthTab('register')}
          >
            {t('popup.signUpFree')}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {/* Login Form */}
        {authTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('popup.email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('popup.emailPlaceholder')}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {t('popup.password')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('popup.passwordPlaceholder')}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-primary-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoggingIn ? t('popup.signingIn') : t('popup.signIn')}
            </button>
          </form>
        )}

        {/* Register Form */}
        {authTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label htmlFor="registerName" className="block text-sm font-medium text-gray-700 mb-1">
                {t('modal.namePlaceholder')}
              </label>
              <input
                id="registerName"
                type="text"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                placeholder={t('modal.namePlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>

            <div>
              <label htmlFor="registerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                {t('popup.email')}
              </label>
              <input
                id="registerEmail"
                type="email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                placeholder={t('popup.emailPlaceholder')}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>

            <div>
              <label htmlFor="registerPassword" className="block text-sm font-medium text-gray-700 mb-1">
                {t('popup.password')}
              </label>
              <input
                id="registerPassword"
                type="password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                placeholder={t('popup.passwordPlaceholder')}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>

            <div>
              <label htmlFor="registerPasswordConfirm" className="block text-sm font-medium text-gray-700 mb-1">
                {t('modal.confirmPasswordPlaceholder')}
              </label>
              <input
                id="registerPasswordConfirm"
                type="password"
                value={registerPasswordConfirm}
                onChange={(e) => setRegisterPasswordConfirm(e.target.value)}
                placeholder={t('modal.confirmPasswordPlaceholder')}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isRegistering}
              className="w-full bg-primary-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isRegistering ? t('modal.registering') : t('modal.registerButton')}
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="w-80 bg-white">
      {/* Header */}
      <div className="p-4 pb-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">✨</span>
            </div>
            <h1 className="text-lg font-bold text-gray-900">ReplyStack</h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            {t('popup.logout')}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('dashboard')}
          >
            {t('popup.tabs.dashboard')}
          </button>
          <button
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'reply'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('reply')}
          >
            {t('popup.tabs.reply')}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'dashboard' ? (
          /* Dashboard Tab */
          <>
            {/* Style prompt - if NOT configured */}
            {!user?.responseStyleConfigured && (
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎨</span>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{t('popup.style.title')}</h3>
                    <p className="text-sm text-gray-600 mt-0.5">{t('popup.style.description')}</p>
                    <button
                      type="button"
                      onClick={() => openWithMagicAuth('/settings/response-style')}
                      className="inline-block mt-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                    >
                      {t('popup.style.configure')} →
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div
              className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={handleRefresh}
              title="Click to refresh"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-primary-700 font-medium">{t('popup.repliesRemaining')}</p>
                  <p className="text-3xl font-bold text-primary-900 mt-1">
                    {user?.quota_remaining === 'unlimited' ? '∞' : user?.quota_remaining}
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/50 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💬</span>
                </div>
              </div>
              {user?.quota_remaining !== 'unlimited' && (
                <p className="text-xs text-primary-600 mt-2">
                  {t('popup.resetsMonthly')}
                </p>
              )}
            </div>

            {/* Platform Links */}
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2">{t('popup.goToReviews')}</p>
              <div className="grid grid-cols-5 gap-1.5">
                <a href="https://business.google.com" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center p-1.5 rounded-lg hover:bg-gray-50 transition-colors group" title="Google Business">
                  <div className="w-7 h-7 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center justify-center group-hover:shadow-md transition-shadow">
                    <svg viewBox="0 0 24 24" className="w-4 h-4">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                  <span className="text-[9px] text-gray-500 mt-1 group-hover:text-gray-700">Google</span>
                </a>
                <a href="https://www.tripadvisor.com/Owners" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center p-1.5 rounded-lg hover:bg-gray-50 transition-colors group" title="TripAdvisor">
                  <div className="w-7 h-7 rounded-lg bg-[#00AF87] shadow-sm border border-gray-100 flex items-center justify-center group-hover:shadow-md transition-shadow">
                    <span className="text-white font-bold text-[10px]">TA</span>
                  </div>
                  <span className="text-[9px] text-gray-500 mt-1 group-hover:text-gray-700">TripAdvisor</span>
                </a>
                <a href="https://admin.booking.com" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center p-1.5 rounded-lg hover:bg-gray-50 transition-colors group" title="Booking.com">
                  <div className="w-7 h-7 rounded-lg bg-[#003580] shadow-sm border border-gray-100 flex items-center justify-center group-hover:shadow-md transition-shadow">
                    <span className="text-white font-bold text-xs">B.</span>
                  </div>
                  <span className="text-[9px] text-gray-500 mt-1 group-hover:text-gray-700">Booking</span>
                </a>
                <a href="https://biz.yelp.com" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center p-1.5 rounded-lg hover:bg-gray-50 transition-colors group" title="Yelp">
                  <div className="w-7 h-7 rounded-lg bg-[#D32323] shadow-sm border border-gray-100 flex items-center justify-center group-hover:shadow-md transition-shadow">
                    <span className="text-white font-bold text-xs">Y</span>
                  </div>
                  <span className="text-[9px] text-gray-500 mt-1 group-hover:text-gray-700">Yelp</span>
                </a>
                <a href="https://business.facebook.com" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center p-1.5 rounded-lg hover:bg-gray-50 transition-colors group" title="Facebook">
                  <div className="w-7 h-7 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center justify-center group-hover:shadow-md transition-shadow">
                    <svg viewBox="0 0 24 24" className="w-4 h-4">
                      <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <span className="text-[9px] text-gray-500 mt-1 group-hover:text-gray-700">Facebook</span>
                </a>
                <a href="https://business.trustpilot.com" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center p-1.5 rounded-lg hover:bg-gray-50 transition-colors group" title="Trustpilot">
                  <div className="w-7 h-7 rounded-lg bg-[#00B67A] shadow-sm border border-gray-100 flex items-center justify-center group-hover:shadow-md transition-shadow">
                    <span className="text-white font-bold text-xs">★</span>
                  </div>
                  <span className="text-[9px] text-gray-500 mt-1 group-hover:text-gray-700">Trustpilot</span>
                </a>
                <a href="https://www.skeepers.io" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center p-1.5 rounded-lg hover:bg-gray-50 transition-colors group" title="Skeepers">
                  <div className="w-7 h-7 rounded-lg bg-[#FF6B35] shadow-sm border border-gray-100 flex items-center justify-center group-hover:shadow-md transition-shadow">
                    <span className="text-white font-bold text-[10px]">SK</span>
                  </div>
                  <span className="text-[9px] text-gray-500 mt-1 group-hover:text-gray-700">Skeepers</span>
                </a>
                <a href="https://www.trustyou.com" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center p-1.5 rounded-lg hover:bg-gray-50 transition-colors group" title="TrustYou">
                  <div className="w-7 h-7 rounded-lg bg-[#1A73E8] shadow-sm border border-gray-100 flex items-center justify-center group-hover:shadow-md transition-shadow">
                    <span className="text-white font-bold text-[10px]">TY</span>
                  </div>
                  <span className="text-[9px] text-gray-500 mt-1 group-hover:text-gray-700">TrustYou</span>
                </a>
                <a href="https://www.expedia.com/partner" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center p-1.5 rounded-lg hover:bg-gray-50 transition-colors group" title="Expedia">
                  <div className="w-7 h-7 rounded-lg bg-[#FFCC00] shadow-sm border border-gray-100 flex items-center justify-center group-hover:shadow-md transition-shadow">
                    <span className="text-gray-900 font-bold text-[10px]">EX</span>
                  </div>
                  <span className="text-[9px] text-gray-500 mt-1 group-hover:text-gray-700">Expedia</span>
                </a>
                <a href={`${process.env.PLASMO_PUBLIC_WEB_URL || 'http://localhost:5173'}/platforms`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center p-1.5 rounded-lg hover:bg-gray-50 transition-colors group" title={t('popup.andMore')}>
                  <div className="w-7 h-7 rounded-lg bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center group-hover:border-primary-400 group-hover:bg-primary-50 transition-colors">
                    <span className="text-gray-400 font-medium text-xs group-hover:text-primary-500">+</span>
                  </div>
                  <span className="text-[9px] text-gray-400 mt-1 group-hover:text-primary-500">{t('popup.more')}</span>
                </a>
              </div>
            </div>

            {/* Discrete modify link - if ALREADY configured */}
            {user?.responseStyleConfigured && (
              <button
                type="button"
                onClick={() => openWithMagicAuth('/settings/response-style')}
                className="block mt-4 text-xs text-gray-500 hover:text-primary-600 transition-colors text-left"
              >
                🎨 {t('popup.style.modify')}
              </button>
            )}

            {/* Footer: user info + upgrade CTA */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <div className="text-xs text-gray-500">
                {user?.name?.split(' ')[0]} · <span className="capitalize">{user?.plan}</span>
              </div>
              {(user?.plan === 'free' || user?.plan === 'starter') && (
                <button
                  type="button"
                  onClick={() => openWithMagicAuth('/pricing')}
                  className="text-xs font-medium text-primary-600 hover:text-primary-700"
                >
                  {t('popup.footer.upgrade')} →
                </button>
              )}
            </div>
          </>
        ) : (
          /* Reply Tab */
          <div className="space-y-4">
            {/* Error display */}
            {replyError && (
              <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm">
                {replyError}
              </div>
            )}

            {/* Review textarea */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('popup.reply.pasteReview')}
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder={t('popup.reply.pasteReviewPlaceholder')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
              />
            </div>

            {/* Star rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('popup.reply.rating')}
              </label>
              <StarRating />
            </div>

            {/* Length selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('popup.reply.length')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['short', 'medium', 'detailed'] as LengthType[]).map((len) => (
                  <button
                    key={len}
                    type="button"
                    onClick={() => setLength(len)}
                    className={`py-2 px-3 text-sm rounded-lg border transition-colors ${
                      length === len
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {t(`popup.reply.${len}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('popup.reply.customInstructions')}
              </label>
              <textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder={t('popup.reply.customInstructionsPlaceholder')}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
              />
            </div>

            {/* Generate button */}
            {!generatedReply && (
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !reviewText.trim()}
                className="w-full bg-primary-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? t('popup.reply.generating') : t('popup.reply.generate')}
              </button>
            )}

            {/* Generated reply */}
            {generatedReply && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  {t('popup.reply.generatedReply')}
                </label>
                <textarea
                  value={generatedReply}
                  readOnly
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleRegenerate}
                    disabled={isGenerating}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    {isGenerating ? t('popup.reply.generating') : t('popup.reply.regenerate')}
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex-1 py-2 px-4 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                  >
                    {copied ? t('popup.reply.copied') : t('popup.reply.copy')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default IndexPopup;

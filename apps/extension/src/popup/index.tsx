import React, { useState, useEffect } from 'react';

import '../style.css';
import i18n, { t } from '../i18n';
import {
  type AuthUser,
  getAuthState,
  login,
  logout,
  refreshUserProfile,
} from '../services/auth';

function IndexPopup() {
  // Force re-render on language change (for future language selector)
  const [, _setLang] = useState(i18n.language);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsLoggedIn(false);
    setUser(null);
  };

  const handleRefresh = async () => {
    const refreshedUser = await refreshUserProfile();
    if (refreshedUser) {
      setUser(refreshedUser);
    }
  };

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
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">✨</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">ReplyStack</h1>
          <p className="text-sm text-gray-500 mt-1">{t('popup.tagline')}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

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

        <p className="text-xs text-gray-500 text-center mt-4">
          {t('popup.noAccount')}{' '}
          <a
            href={`${process.env.PLASMO_PUBLIC_WEB_URL || 'http://localhost:5173'}/register`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:underline"
          >
            {t('popup.signUpFree')}
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="w-80 p-6 bg-white">
      <div className="flex items-center justify-between mb-4">
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

      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
          <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full capitalize">
            {user?.plan}
          </span>
        </div>
      </div>

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

      <div className="mt-4 p-3 bg-amber-50 rounded-lg">
        <p className="text-xs text-amber-800">
          <span className="font-medium">Tip:</span> {t('popup.tip')}
        </p>
      </div>

      {user?.plan === 'free' && (
        <a
          href={`${process.env.PLASMO_PUBLIC_WEB_URL || 'http://localhost:5173'}/pricing`}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-4 text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          {t('popup.upgradeUnlimited')}
        </a>
      )}
    </div>
  );
}

export default IndexPopup;

import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { translateApiError } from '@/utils/apiErrors';
import { AxiosError } from 'axios';
import { Loader2, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { PageSEO } from '@/components/seo/PageSEO';

export function ResetPassword() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (password.length < 8) {
      setError(t('register.errors.passwordLength'));
      return;
    }

    if (password !== passwordConfirmation) {
      setError(t('register.errors.passwordMismatch'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.resetPassword({
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      });

      setIsSuccess(true);

      // Auto-login with the new token
      if (response.token && response.user) {
        loginWithToken(response.token, response.user);
        // Redirect to dashboard after a brief delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(translateApiError(err.response?.data?.message, t, 'apiErrors.generic'));
      } else {
        setError(t('apiErrors.generic'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputClassName = "w-full px-4 py-3 rounded-xl text-sm bg-gray-50 dark:bg-dark-hover text-gray-900 dark:text-text-primary placeholder:text-gray-400 dark:placeholder:text-text-tertiary border border-gray-200 dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all";

  // Check if token and email are present
  if (!token || !email) {
    return (
      <>
        <PageSEO
          title="Invalid Link - ReplyStack"
          description="Invalid password reset link"
          noindex={true}
          includeHreflang={false}
        />
        <div className="w-full max-w-md bg-white dark:bg-dark-surface rounded-2xl shadow-xl border border-gray-100 dark:border-dark-border p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-text-primary mb-2">
              {t('resetPassword.invalidLink')}
            </h1>
            <p className="text-gray-600 dark:text-text-secondary mb-6">
              {t('resetPassword.invalidLinkDescription')}
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
            >
              {t('resetPassword.requestNewLink')}
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (isSuccess) {
    return (
      <>
        <PageSEO
          title="Password Reset - ReplyStack"
          description="Your password has been reset successfully"
          noindex={true}
          includeHreflang={false}
        />
        <div className="w-full max-w-md bg-white dark:bg-dark-surface rounded-2xl shadow-xl border border-gray-100 dark:border-dark-border p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-text-primary mb-2">
              {t('resetPassword.success')}
            </h1>
            <p className="text-gray-600 dark:text-text-secondary mb-6">
              {t('resetPassword.successDescription')}
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Loader2 size={16} className="animate-spin" />
              {t('resetPassword.redirecting')}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageSEO
        title="Reset Password - ReplyStack"
        description="Create a new password for your ReplyStack account"
        noindex={true}
        includeHreflang={false}
      />
      <div className="w-full max-w-md bg-white dark:bg-dark-surface rounded-2xl shadow-xl border border-gray-100 dark:border-dark-border p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/25">
            <span className="text-3xl">🔑</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-text-primary">{t('resetPassword.title')}</h1>
          <p className="text-gray-600 dark:text-text-secondary mt-2">{t('resetPassword.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm border border-red-100 dark:border-red-900/30">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1.5">
              {t('resetPassword.newPassword')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('resetPassword.newPasswordPlaceholder')}
                required
                autoComplete="new-password"
                className={inputClassName}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1.5">
              {t('resetPassword.confirmPassword')}
            </label>
            <div className="relative">
              <input
                type={showPasswordConfirmation ? 'text' : 'password'}
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder={t('resetPassword.confirmPasswordPlaceholder')}
                required
                autoComplete="new-password"
                className={inputClassName}
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswordConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-500 to-teal-500 hover:from-primary-600 hover:to-teal-600 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 size={18} className="animate-spin" />}
            {t('resetPassword.submit')}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
          >
            <ArrowLeft size={16} />
            {t('forgotPassword.backToLogin')}
          </Link>
        </div>
      </div>
    </>
  );
}

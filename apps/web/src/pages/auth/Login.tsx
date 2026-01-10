import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { translateApiError } from '@/utils/apiErrors';
import { AxiosError } from 'axios';
import { Loader2 } from 'lucide-react';
import { PageSEO } from '@/components/seo/PageSEO';

export function Login() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(translateApiError(err.response?.data?.message, t, 'apiErrors.invalidCredentials'));
      } else {
        setError(t('apiErrors.generic'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputClassName = "w-full px-4 py-3 rounded-xl text-sm bg-gray-50 dark:bg-dark-hover text-gray-900 dark:text-text-primary placeholder:text-gray-400 dark:placeholder:text-text-tertiary border border-gray-200 dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all";

  return (
    <>
      <PageSEO
        title="Login - ReplyStack"
        description="Sign in to your ReplyStack account"
        noindex={true}
        includeHreflang={false}
      />
    <div className="w-full max-w-md bg-white dark:bg-dark-surface rounded-2xl shadow-xl border border-gray-100 dark:border-dark-border p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/25">
          <span className="text-3xl">✨</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-text-primary">{t('login.title')}</h1>
        <p className="text-gray-600 dark:text-text-secondary mt-2">{t('login.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm border border-red-100 dark:border-red-900/30">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1.5">
            {t('login.email')}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('login.emailPlaceholder')}
            required
            autoComplete="email"
            className={inputClassName}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1.5">
            {t('login.password')}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('login.passwordPlaceholder')}
            required
            autoComplete="current-password"
            className={inputClassName}
          />
        </div>

        <div className="flex items-center justify-end">
          <a href="#" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
            {t('login.forgotPassword')}
          </a>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-500 to-teal-500 hover:from-primary-600 hover:to-teal-600 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 size={18} className="animate-spin" />}
          {t('login.submit')}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 dark:text-text-secondary mt-6">
        {t('login.noAccount')}{' '}
        <Link to="/register" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
          {t('login.signUp')}
        </Link>
      </p>
    </div>
    </>
  );
}

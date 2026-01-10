import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { translateApiError, translateValidationErrors } from '@/utils/apiErrors';
import { AxiosError } from 'axios';
import { Loader2 } from 'lucide-react';
import { PageSEO } from '@/components/seo/PageSEO';

export function Register() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Client-side validation
    if (password !== passwordConfirmation) {
      setErrors({ password_confirmation: t('register.errors.passwordMismatch') });
      return;
    }

    if (password.length < 8) {
      setErrors({ password: t('register.errors.passwordLength') });
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password, passwordConfirmation, name || undefined);
      navigate('/dashboard');
    } catch (err) {
      if (err instanceof AxiosError) {
        const responseErrors = err.response?.data?.errors;
        if (responseErrors) {
          setErrors(translateValidationErrors(responseErrors, t));
        } else {
          setErrors({ general: translateApiError(err.response?.data?.message, t, 'apiErrors.generic') });
        }
      } else {
        setErrors({ general: t('apiErrors.generic') });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputClassName = "w-full px-4 py-3 rounded-xl text-sm bg-gray-50 dark:bg-dark-hover text-gray-900 dark:text-text-primary placeholder:text-gray-400 dark:placeholder:text-text-tertiary border border-gray-200 dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all";
  const inputErrorClassName = "w-full px-4 py-3 rounded-xl text-sm bg-gray-50 dark:bg-dark-hover text-gray-900 dark:text-text-primary placeholder:text-gray-400 dark:placeholder:text-text-tertiary border border-red-300 dark:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all";

  return (
    <>
      <PageSEO
        title="Create Account - ReplyStack"
        description="Create your free ReplyStack account and start responding to reviews with AI"
        noindex={true}
        includeHreflang={false}
      />
    <div className="w-full max-w-md bg-white dark:bg-dark-surface rounded-2xl shadow-xl border border-gray-100 dark:border-dark-border p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/25">
          <span className="text-3xl">✨</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-text-primary">{t('register.title')}</h1>
        <p className="text-gray-600 dark:text-text-secondary mt-2">{t('register.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm border border-red-100 dark:border-red-900/30">
            {errors.general}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1.5">
            {t('register.name')}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('register.namePlaceholder')}
            autoComplete="name"
            className={errors.name ? inputErrorClassName : inputClassName}
          />
          {errors.name && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1.5">
            {t('register.email')}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('register.emailPlaceholder')}
            required
            autoComplete="email"
            className={errors.email ? inputErrorClassName : inputClassName}
          />
          {errors.email && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1.5">
            {t('register.password')}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('register.passwordPlaceholder')}
            required
            autoComplete="new-password"
            className={errors.password ? inputErrorClassName : inputClassName}
          />
          {errors.password && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.password}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-text-secondary mb-1.5">
            {t('register.confirmPassword')}
          </label>
          <input
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="new-password"
            className={errors.password_confirmation ? inputErrorClassName : inputClassName}
          />
          {errors.password_confirmation && <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errors.password_confirmation}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-500 to-teal-500 hover:from-primary-600 hover:to-teal-600 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 size={18} className="animate-spin" />}
          {t('register.submit')}
        </button>

        <p className="text-xs text-gray-500 dark:text-text-tertiary text-center">
          {t('register.terms.text')}{' '}
          <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline">{t('register.terms.termsOfService')}</a>
          {' '}{t('register.terms.and')}{' '}
          <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline">{t('register.terms.privacyPolicy')}</a>.
        </p>
      </form>

      <p className="text-center text-sm text-gray-600 dark:text-text-secondary mt-6">
        {t('register.hasAccount')}{' '}
        <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
          {t('register.signIn')}
        </Link>
      </p>
    </div>
    </>
  );
}

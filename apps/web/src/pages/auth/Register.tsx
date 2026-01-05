import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { translateApiError, translateValidationErrors } from '@/utils/apiErrors';
import { AxiosError } from 'axios';

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

  return (
    <Card className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✨</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{t('register.title')}</h1>
        <p className="text-gray-600 mt-2">{t('register.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
            {errors.general}
          </div>
        )}

        <Input
          label={t('register.name')}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('register.namePlaceholder')}
          error={errors.name}
          autoComplete="name"
        />

        <Input
          label={t('register.email')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('register.emailPlaceholder')}
          required
          error={errors.email}
          autoComplete="email"
        />

        <Input
          label={t('register.password')}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('register.passwordPlaceholder')}
          required
          error={errors.password}
          autoComplete="new-password"
        />

        <Input
          label={t('register.confirmPassword')}
          type="password"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          placeholder="••••••••"
          required
          error={errors.password_confirmation}
          autoComplete="new-password"
        />

        <Button type="submit" className="w-full" isLoading={isLoading}>
          {t('register.submit')}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          {t('register.terms.text')}{' '}
          <a href="#" className="text-primary-600 hover:underline">{t('register.terms.termsOfService')}</a>
          {' '}{t('register.terms.and')}{' '}
          <a href="#" className="text-primary-600 hover:underline">{t('register.terms.privacyPolicy')}</a>.
        </p>
      </form>

      <p className="text-center text-sm text-gray-600 mt-6">
        {t('register.hasAccount')}{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
          {t('register.signIn')}
        </Link>
      </p>
    </Card>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { translateApiError } from '@/utils/apiErrors';
import { AxiosError } from 'axios';

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

  return (
    <Card className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✨</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{t('login.title')}</h1>
        <p className="text-gray-600 mt-2">{t('login.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <Input
          label={t('login.email')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('login.emailPlaceholder')}
          required
          autoComplete="email"
        />

        <Input
          label={t('login.password')}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('login.passwordPlaceholder')}
          required
          autoComplete="current-password"
        />

        <div className="flex items-center justify-end">
          <a href="#" className="text-sm text-primary-600 hover:text-primary-700">
            {t('login.forgotPassword')}
          </a>
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          {t('login.submit')}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-6">
        {t('login.noAccount')}{' '}
        <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
          {t('login.signUp')}
        </Link>
      </p>
    </Card>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function MagicAuth() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithToken, isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);

  const token = searchParams.get('token');

  useEffect(() => {
    // If already authenticated and no token, redirect to dashboard
    if (isAuthenticated && !token) {
      navigate('/dashboard', { replace: true });
      return;
    }

    if (!token) {
      setError(t('auth.magic.noToken'));
      setIsValidating(false);
      return;
    }

    validateToken(token);
  }, [token, isAuthenticated]);

  const validateToken = async (magicToken: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/magic-token/${magicToken}`, {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Invalid token');
      }

      const data = await response.json();

      // Authenticate the user
      loginWithToken(data.token, data.user);

      // Redirect to the specified URL or dashboard
      const redirectUrl = data.redirect_url || '/dashboard';
      navigate(redirectUrl, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.magic.invalidToken'));
      setIsValidating(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('auth.magic.validating')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">{t('auth.magic.errorTitle')}</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="/login"
            className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            {t('auth.magic.goToLogin')}
          </a>
        </div>
      </div>
    );
  }

  return null;
}

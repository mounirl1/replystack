import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { AxiosError } from 'axios';
import { Loader2, CheckCircle, XCircle, Mail, ArrowRight } from 'lucide-react';
import { PageSEO } from '@/components/seo/PageSEO';

export function VerifyEmail() {
  const { t } = useTranslation('auth');
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>(() =>
    token ? 'verifying' : 'idle'
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [resendCooldown, setResendCooldown] = useState(0);

  const verifyToken = useCallback(async (verificationToken: string) => {
    setStatus('verifying');
    try {
      await authApi.verifyEmail(verificationToken);
      setStatus('success');
      // Refresh user to update email_verified_at
      await refreshUser();
    } catch (err) {
      setStatus('error');
      if (err instanceof AxiosError) {
        const message = err.response?.data?.message || '';
        if (message.includes('expired')) {
          setErrorMessage(t('verifyEmail.expiredToken'));
        } else {
          setErrorMessage(t('verifyEmail.invalidToken'));
        }
      } else {
        setErrorMessage(t('verifyEmail.error'));
      }
    }
  }, [t, refreshUser]);

  useEffect(() => {
    if (token) {
      verifyToken(token);
    }
  }, [token, verifyToken]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResendStatus('sending');
    try {
      await authApi.resendVerificationEmail();
      setResendStatus('sent');
      setResendCooldown(60);
    } catch {
      setResendStatus('error');
    }
  };

  // Verifying state
  if (status === 'verifying') {
    return (
      <>
        <PageSEO title="Verifying email - ReplyStack" description="Verifying your email address" noindex={true} includeHreflang={false} />
        <div className="w-full max-w-md bg-white dark:bg-dark-surface rounded-2xl shadow-xl border border-gray-100 dark:border-dark-border p-8">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-text-primary mb-2">
              {t('verifyEmail.verifying')}
            </h1>
          </div>
        </div>
      </>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <>
        <PageSEO title="Email verified - ReplyStack" description="Your email has been verified" noindex={true} includeHreflang={false} />
        <div className="w-full max-w-md bg-white dark:bg-dark-surface rounded-2xl shadow-xl border border-gray-100 dark:border-dark-border p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-text-primary mb-2">
              {t('verifyEmail.success')}
            </h1>
            <p className="text-gray-600 dark:text-text-secondary mb-6">
              {t('verifyEmail.successDescription')}
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-500 to-teal-500 hover:from-primary-600 hover:to-teal-600 shadow-lg shadow-primary-500/25 transition-all"
            >
              {t('verifyEmail.goToDashboard')}
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <>
        <PageSEO title="Verification failed - ReplyStack" description="Email verification failed" noindex={true} includeHreflang={false} />
        <div className="w-full max-w-md bg-white dark:bg-dark-surface rounded-2xl shadow-xl border border-gray-100 dark:border-dark-border p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-text-primary mb-2">
              {t('verifyEmail.error')}
            </h1>
            <p className="text-gray-600 dark:text-text-secondary mb-6">
              {errorMessage}
            </p>
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0 || resendStatus === 'sending'}
              className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-500 to-teal-500 hover:from-primary-600 hover:to-teal-600 shadow-lg shadow-primary-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {resendStatus === 'sending' && <Loader2 size={18} className="animate-spin" />}
              {resendCooldown > 0
                ? t('verifyEmail.resendCooldown', { seconds: resendCooldown })
                : t('verifyEmail.resend')}
            </button>
            {resendStatus === 'sent' && (
              <p className="mt-3 text-sm text-green-600 dark:text-green-400">{t('verifyEmail.resendSuccess')}</p>
            )}
          </div>
        </div>
      </>
    );
  }

  // Idle state (no token - check your email prompt)
  return (
    <>
      <PageSEO title="Verify your email - ReplyStack" description="Please verify your email address" noindex={true} includeHreflang={false} />
      <div className="w-full max-w-md bg-white dark:bg-dark-surface rounded-2xl shadow-xl border border-gray-100 dark:border-dark-border p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-text-primary mb-2">
            {t('verifyEmail.title')}
          </h1>
          <p className="text-gray-600 dark:text-text-secondary mb-6">
            {t('verifyEmail.checkEmail')}
          </p>

          <button
            onClick={handleResend}
            disabled={resendCooldown > 0 || resendStatus === 'sending'}
            className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-500 to-teal-500 hover:from-primary-600 hover:to-teal-600 shadow-lg shadow-primary-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
          >
            {resendStatus === 'sending' && <Loader2 size={18} className="animate-spin" />}
            {resendCooldown > 0
              ? t('verifyEmail.resendCooldown', { seconds: resendCooldown })
              : t('verifyEmail.resend')}
          </button>

          {resendStatus === 'sent' && (
            <p className="mb-4 text-sm text-green-600 dark:text-green-400">{t('verifyEmail.resendSuccess')}</p>
          )}

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
          >
            {t('verifyEmail.goToDashboard')}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Chrome, CreditCard, Trash2, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { userApi, stripeApi } from '@/services/api';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PlanBadge } from '@/components/ui/Badge';
import { AxiosError } from 'axios';
import { SUCCESS_TOAST_DURATION } from '@/constants';

export function Settings() {
  const { t } = useTranslation('settings');
  const { user, refreshUser, logout } = useAuth();

  // Profile state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Billing state
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setIsSavingProfile(true);

    try {
      await userApi.updateSettings({ name, email });
      await refreshUser();
      setProfileSuccess('Profile updated successfully');
      setTimeout(() => setProfileSuccess(''), SUCCESS_TOAST_DURATION);
    } catch (err) {
      if (err instanceof AxiosError) {
        setProfileError(err.response?.data?.message || 'Failed to update profile');
      } else {
        setProfileError('An error occurred');
      }
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleOpenBillingPortal = async () => {
    setIsLoadingPortal(true);
    try {
      const { url } = await stripeApi.createPortal();
      window.location.href = url;
    } catch (err) {
      console.error('Failed to open billing portal:', err);
    } finally {
      setIsLoadingPortal(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');
    setIsDeleting(true);

    try {
      await userApi.deleteAccount(deletePassword);
      logout();
    } catch (err) {
      if (err instanceof AxiosError) {
        setDeleteError(err.response?.data?.message || 'Failed to delete account');
      } else {
        setDeleteError('An error occurred');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Profile Settings */}
      <Card>
        <CardHeader
          title={t('profile.title')}
          description={t('profile.description')}
        />
        <form onSubmit={handleSaveProfile} className="space-y-4">
          {profileSuccess && (
            <div className="bg-green-500/10 text-green-500 px-4 py-3 rounded-xl text-sm border border-green-500/20">
              {profileSuccess}
            </div>
          )}
          {profileError && (
            <div className="bg-red-500/10 text-red-500 px-4 py-3 rounded-xl text-sm border border-red-500/20">
              {profileError}
            </div>
          )}

          <Input
            label={t('profile.name')}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('profile.namePlaceholder')}
          />

          <Input
            label={t('profile.email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('profile.emailPlaceholder')}
          />

          <Button type="submit" isLoading={isSavingProfile}>
            {t('profile.save')}
          </Button>
        </form>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader
          title={t('subscription.title')}
          description={t('subscription.description')}
        />
        <div className="flex items-center justify-between p-4 bg-light-hover dark:bg-dark-hover rounded-xl mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
              <CreditCard size={20} className="text-primary-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-text-dark-primary dark:text-text-primary capitalize">
                  {t('subscription.plan', { plan: user?.plan })}
                </p>
                <PlanBadge plan={user?.plan || 'free'} />
              </div>
              <p className="text-sm text-text-tertiary">
                {user?.plan === 'free'
                  ? t('subscription.free')
                  : user?.plan === 'starter'
                  ? t('subscription.starter')
                  : t('subscription.unlimited')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          {user?.plan === 'free' ? (
            <Link to="/pricing">
              <Button rightIcon={<ArrowUpRight size={16} />}>
                {t('subscription.upgrade')}
              </Button>
            </Link>
          ) : (
            <Button
              variant="outline"
              onClick={handleOpenBillingPortal}
              isLoading={isLoadingPortal}
            >
              {t('subscription.manageBilling')}
            </Button>
          )}
        </div>
      </Card>

      {/* Browser Extension */}
      <Card>
        <CardHeader
          title={t('extension.title')}
          description={t('extension.description')}
        />
        <p className="text-sm text-text-dark-secondary dark:text-text-secondary mb-4">
          {t('extension.instructions')}
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="#"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-light-border dark:border-dark-border text-sm font-medium text-text-dark-primary dark:text-text-primary hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
          >
            <Chrome size={18} />
            {t('extension.chrome')}
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-light-border dark:border-dark-border text-sm font-medium text-text-dark-primary dark:text-text-primary hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
          >
            🦊
            {t('extension.firefox')}
          </a>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="!border-red-500/30">
        <CardHeader
          title={t('danger.title')}
          description={t('danger.description')}
        />
        {!showDeleteConfirm ? (
          <Button
            variant="danger"
            leftIcon={<Trash2 size={16} />}
            onClick={() => setShowDeleteConfirm(true)}
          >
            {t('danger.deleteAccount')}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
              <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-400">
                <p className="font-medium text-red-500">{t('danger.confirm.title')}</p>
                <p className="mt-1">{t('danger.confirm.description')}</p>
              </div>
            </div>

            {deleteError && (
              <div className="bg-red-500/10 text-red-500 px-4 py-3 rounded-xl text-sm border border-red-500/20">
                {deleteError}
              </div>
            )}

            <Input
              label={t('danger.confirm.password')}
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder={t('danger.confirm.passwordPlaceholder')}
            />

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletePassword('');
                  setDeleteError('');
                }}
              >
                {t('danger.cancel')}
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteAccount}
                isLoading={isDeleting}
                disabled={!deletePassword}
              >
                {t('danger.deleteMyAccount')}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MessageSquare,
  Calendar,
  TrendingUp,
  Sparkles,
  ExternalLink,
  ArrowUpRight,
  Chrome,
  Clock,
  Palette,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { userApi, repliesApi, locationsApi, type UsageStats, type Response, type Location } from '@/services/api';
import { Card, CardHeader, StatCard, StatCardSkeleton } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, PlanBadge } from '@/components/ui/Badge';

export function Dashboard() {
  const { t } = useTranslation('dashboard');
  const { user } = useAuth();
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [recentReplies, setRecentReplies] = useState<Response[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usageData, repliesData, locationsData] = await Promise.all([
        userApi.getUsage(),
        repliesApi.getHistory(),
        locationsApi.getAll(),
      ]);
      setUsage(usageData);
      setRecentReplies(repliesData.responses.slice(0, 5));
      setLocations(locationsData.locations);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const primaryLocation = locations[0];
  const responseStyleConfigured = primaryLocation?.response_profile?.onboarding_completed ?? false;

  const quotaDisplay = usage?.quota.is_unlimited
    ? t('stats.unlimited')
    : `${usage?.quota.remaining ?? 0}`;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-dark-primary dark:text-text-primary">
            {t('welcome', { name: user?.name || user?.email?.split('@')[0] })}
          </h1>
          <p className="text-text-dark-secondary dark:text-text-secondary mt-1">
            {t('welcomeSubtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PlanBadge plan={user?.plan || 'free'} />
          {user?.plan === 'free' && (
            <Link to="/pricing">
              <Button size="sm" rightIcon={<ArrowUpRight size={14} />}>
                {t('upgrade')}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" data-onboarding="dashboard-stats">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title={t('stats.repliesRemaining')}
              value={quotaDisplay}
              description={
                usage?.quota.resets_at
                  ? t('stats.resets', { date: new Date(usage.quota.resets_at).toLocaleDateString() })
                  : undefined
              }
              icon={<MessageSquare size={20} />}
            />
            <StatCard
              title={t('stats.repliesToday')}
              value={usage?.responses_today ?? 0}
              icon={<Calendar size={20} />}
            />
            <StatCard
              title={t('stats.thisMonth')}
              value={usage?.responses_this_month ?? 0}
              icon={<TrendingUp size={20} />}
            />
            <StatCard
              title={t('stats.totalReplies')}
              value={usage?.total_responses ?? 0}
              icon={<Sparkles size={20} />}
            />
          </>
        )}
      </div>

      {/* Extension CTA - Moved up */}
      <Card className="!bg-gradient-to-br from-primary-600 to-primary-700 !border-0" padding="lg" data-onboarding="extension-cta">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h3 className="text-xl font-semibold text-white">
              {t('extensionCta.title')}
            </h3>
            <p className="text-primary-100 mt-2 max-w-md">
              {t('extensionCta.description')}
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <a
              href="#"
              className="inline-flex items-center gap-2 bg-white text-primary-700 px-5 py-2.5 rounded-xl font-medium hover:bg-primary-50 transition-colors"
            >
              <Chrome size={18} />
              {t('extensionCta.chrome')}
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 bg-white/10 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-white/20 transition-colors border border-white/20"
            >
              🦊
              {t('extensionCta.firefox')}
            </a>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader title={t('quickActions.title')} />
        <div className="grid sm:grid-cols-3 gap-4">
          <a
            href="https://business.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 p-4 rounded-xl border border-light-border dark:border-dark-border hover:border-primary-500/50 hover:bg-light-hover dark:hover:bg-dark-hover transition-all duration-150"
          >
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <span className="text-xl font-bold text-blue-500">G</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-text-dark-primary dark:text-text-primary group-hover:text-primary-500 transition-colors">
                {t('quickActions.googleBusiness')}
              </p>
              <p className="text-sm text-text-tertiary">{t('quickActions.manageReviews')}</p>
            </div>
            <ExternalLink size={16} className="text-text-tertiary group-hover:text-primary-500 transition-colors" />
          </a>

          <a
            href="https://www.tripadvisor.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 p-4 rounded-xl border border-light-border dark:border-dark-border hover:border-primary-500/50 hover:bg-light-hover dark:hover:bg-dark-hover transition-all duration-150"
          >
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
              <span className="text-xl">🦉</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-text-dark-primary dark:text-text-primary group-hover:text-primary-500 transition-colors">
                {t('quickActions.tripadvisor')}
              </p>
              <p className="text-sm text-text-tertiary">{t('quickActions.manageReviews')}</p>
            </div>
            <ExternalLink size={16} className="text-text-tertiary group-hover:text-primary-500 transition-colors" />
          </a>

          <Link
            to="/settings"
            className="group flex items-center gap-4 p-4 rounded-xl border border-light-border dark:border-dark-border hover:border-primary-500/50 hover:bg-light-hover dark:hover:bg-dark-hover transition-all duration-150"
          >
            <div className="w-12 h-12 bg-light-hover dark:bg-dark-hover rounded-xl flex items-center justify-center">
              <span className="text-xl">⚙️</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-text-dark-primary dark:text-text-primary group-hover:text-primary-500 transition-colors">
                {t('quickActions.settings')}
              </p>
              <p className="text-sm text-text-tertiary">{t('quickActions.configurePreferences')}</p>
            </div>
            <ArrowUpRight size={16} className="text-text-tertiary group-hover:text-primary-500 transition-colors" />
          </Link>
        </div>
      </Card>

      {/* Recent Replies */}
      <Card>
        <CardHeader
          title={t('recentReplies.title')}
          action={
            recentReplies.length > 0 && (
              <Link
                to="/history"
                className="text-sm text-primary-500 hover:text-primary-400 font-medium flex items-center gap-1"
              >
                {t('recentReplies.viewAll')}
                <ArrowUpRight size={14} />
              </Link>
            )
          }
        />
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-xl bg-light-hover dark:bg-dark-hover animate-pulse">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-4 w-16 bg-light-border dark:bg-dark-border rounded" />
                  <div className="h-4 w-20 bg-light-border dark:bg-dark-border rounded" />
                </div>
                <div className="h-4 w-full bg-light-border dark:bg-dark-border rounded" />
              </div>
            ))}
          </div>
        ) : recentReplies.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-light-hover dark:bg-dark-hover rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={24} className="text-text-tertiary" />
            </div>
            <p className="text-text-dark-primary dark:text-text-primary font-medium mb-1">
              {t('recentReplies.empty.title')}
            </p>
            <p className="text-sm text-text-tertiary mb-4">
              {t('recentReplies.empty.description')}
            </p>
            <Button variant="outline" size="sm" leftIcon={<Chrome size={16} />}>
              {t('recentReplies.empty.cta')}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentReplies.map((reply) => (
              <div
                key={reply.id}
                className="p-4 rounded-xl bg-light-hover dark:bg-dark-hover hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="primary">{reply.tone}</Badge>
                  {reply.review && (
                    <Badge>{reply.review.platform}</Badge>
                  )}
                  <span className="text-xs text-text-tertiary flex items-center gap-1 ml-auto">
                    <Clock size={12} />
                    {new Date(reply.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-text-dark-secondary dark:text-text-secondary line-clamp-2">
                  {reply.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Response Style Card - Always visible, at the bottom */}
      <Card data-onboarding="response-style">
        <CardHeader
          title={t('responseStyle.title')}
          action={
            !responseStyleConfigured && (
              <Badge variant="warning">{t('responseStyle.setupRequired')}</Badge>
            )
          }
        />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center">
              <Palette size={20} className="text-primary-500" />
            </div>
            <div>
              <p className="font-medium text-text-dark-primary dark:text-text-primary">
                {responseStyleConfigured
                  ? t('responseStyle.configured')
                  : t('responseStyle.notConfigured')}
              </p>
              <p className="text-sm text-text-tertiary">
                {t('responseStyle.description')}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/settings/response-style">
              <Button
                variant={responseStyleConfigured ? 'outline' : 'primary'}
                size="sm"
                leftIcon={<Palette size={16} />}
              >
                {responseStyleConfigured
                  ? t('responseStyle.edit')
                  : t('responseStyle.configure')}
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

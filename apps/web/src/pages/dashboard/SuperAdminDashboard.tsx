import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  DollarSign,
  Cpu,
  TrendingUp,
  RefreshCw,
  Shield,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, StatCard, StatCardSkeleton } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  superAdminApi,
  type DashboardOverview,
  type UserStats,
  type AICostsStats,
  type TrendsData,
} from '@/services/superAdmin';

type Period = '7d' | '30d' | '90d' | '12m';

export function SuperAdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [aiCosts, setAiCosts] = useState<AICostsStats | null>(null);
  const [trends, setTrends] = useState<TrendsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [period, setPeriod] = useState<Period>('30d');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not super admin
    if (user && !user.is_super_admin) {
      navigate('/dashboard');
      return;
    }
    loadData();
  }, [user, navigate]);

  useEffect(() => {
    if (overview) {
      loadPeriodData();
    }
  }, [period]);

  const loadData = async () => {
    try {
      setError(null);
      const [overviewData, usersData, costsData, trendsData] = await Promise.all([
        superAdminApi.getOverview(),
        superAdminApi.getUsers(period),
        superAdminApi.getAICosts(period),
        superAdminApi.getTrends('day', 30),
      ]);
      setOverview(overviewData);
      setUserStats(usersData);
      setAiCosts(costsData);
      setTrends(trendsData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data. Please check your permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPeriodData = async () => {
    try {
      const [usersData, costsData] = await Promise.all([
        superAdminApi.getUsers(period),
        superAdminApi.getAICosts(period),
      ]);
      setUserStats(usersData);
      setAiCosts(costsData);
    } catch (err) {
      console.error('Failed to load period data:', err);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await superAdminApi.clearCache();
      await loadData();
    } catch (err) {
      console.error('Failed to refresh:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatPercent = (value: number | null) => {
    if (value === null) return 'N/A';
    return `${value.toFixed(1)}%`;
  };

  if (!user?.is_super_admin) {
    return null;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Shield size={48} className="text-red-500" />
        <h2 className="text-xl font-semibold text-text-dark-primary dark:text-text-primary">
          Access Denied
        </h2>
        <p className="text-text-dark-secondary dark:text-text-secondary">{error}</p>
        <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Shield className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-text-dark-primary dark:text-text-primary">
              Super Admin Dashboard
            </h1>
            <p className="text-text-dark-secondary dark:text-text-secondary text-sm">
              Business metrics and AI costs overview
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="warning">Admin Only</Badge>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <Card padding="sm">
        <div className="flex items-center gap-2 flex-wrap">
          <Calendar size={16} className="text-text-tertiary" />
          <span className="text-sm text-text-dark-secondary dark:text-text-secondary mr-2">
            Period:
          </span>
          {(['7d', '30d', '90d', '12m'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                period === p
                  ? 'bg-primary-500 text-white'
                  : 'bg-light-hover dark:bg-dark-hover text-text-dark-secondary dark:text-text-secondary hover:text-text-dark-primary dark:hover:text-text-primary'
              }`}
            >
              {p === '7d' && '7 Days'}
              {p === '30d' && '30 Days'}
              {p === '90d' && '90 Days'}
              {p === '12m' && '12 Months'}
            </button>
          ))}
        </div>
      </Card>

      {/* Overview Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : overview ? (
          <>
            <StatCard
              title="Total Users"
              value={formatNumber(overview.users.total)}
              description={`${overview.users.new_this_month} new this month`}
              icon={<Users size={20} />}
            />
            <StatCard
              title="MRR"
              value={formatCurrency(overview.revenue.mrr)}
              description={`ARR: ${formatCurrency(overview.revenue.arr)}`}
              icon={<DollarSign size={20} />}
            />
            <StatCard
              title="AI Cost (All Time)"
              value={formatCurrency(overview.ai_costs.estimated_cost_usd)}
              description={`${formatNumber(overview.ai_costs.total_tokens)} tokens`}
              icon={<Cpu size={20} />}
            />
            <StatCard
              title="Margin"
              value={formatPercent(overview.ai_costs.margin_percent)}
              description="MRR - Monthly AI Cost"
              icon={<TrendingUp size={20} />}
              trend={overview.ai_costs.margin_percent !== null ? {
                value: overview.ai_costs.margin_percent,
                isPositive: overview.ai_costs.margin_percent > 0,
              } : undefined}
            />
          </>
        ) : null}
      </div>

      {/* Users & Revenue Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Users by Plan */}
        <Card>
          <CardHeader title="Users by Plan" />
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-8 skeleton-light rounded" />
              ))}
            </div>
          ) : userStats ? (
            <div className="space-y-3">
              {Object.entries(userStats.by_plan).map(([plan, count]) => {
                const percent = userStats.by_plan_percent[plan as keyof typeof userStats.by_plan_percent] || 0;
                const colors: Record<string, string> = {
                  free: 'bg-gray-400',
                  starter: 'bg-blue-500',
                  pro: 'bg-purple-500',
                  business: 'bg-amber-500',
                  enterprise: 'bg-emerald-500',
                };
                return (
                  <div key={plan} className="flex items-center gap-3">
                    <span className="w-20 text-sm capitalize text-text-dark-secondary dark:text-text-secondary">
                      {plan}
                    </span>
                    <div className="flex-1 h-6 bg-light-hover dark:bg-dark-hover rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors[plan] || 'bg-primary-500'} rounded-full transition-all duration-500`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-16 text-sm font-medium text-text-dark-primary dark:text-text-primary text-right">
                      {count}
                    </span>
                    <span className="w-12 text-xs text-text-tertiary text-right">
                      {percent.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
              <div className="pt-4 mt-4 border-t border-light-border dark:border-dark-border">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-text-dark-primary dark:text-text-primary">
                      {userStats.active_30d}
                    </p>
                    <p className="text-xs text-text-tertiary">Active (30d)</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-text-dark-primary dark:text-text-primary">
                      {userStats.paid_users}
                    </p>
                    <p className="text-xs text-text-tertiary">Paid Users</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary-500">
                      {userStats.conversion_rate}%
                    </p>
                    <p className="text-xs text-text-tertiary">Conversion</p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </Card>

        {/* Activity Stats */}
        <Card>
          <CardHeader title="Activity" />
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 skeleton-light rounded" />
              ))}
            </div>
          ) : overview ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-light-hover dark:bg-dark-hover">
                <div className="flex items-center gap-3">
                  <Activity size={18} className="text-green-500" />
                  <span className="text-text-dark-secondary dark:text-text-secondary">
                    Responses Today
                  </span>
                </div>
                <span className="text-lg font-semibold text-text-dark-primary dark:text-text-primary">
                  {overview.usage.responses_today}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-light-hover dark:bg-dark-hover">
                <div className="flex items-center gap-3">
                  <BarChart3 size={18} className="text-blue-500" />
                  <span className="text-text-dark-secondary dark:text-text-secondary">
                    Responses This Week
                  </span>
                </div>
                <span className="text-lg font-semibold text-text-dark-primary dark:text-text-primary">
                  {overview.usage.responses_this_week}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-light-hover dark:bg-dark-hover">
                <div className="flex items-center gap-3">
                  <TrendingUp size={18} className="text-purple-500" />
                  <span className="text-text-dark-secondary dark:text-text-secondary">
                    Responses This Month
                  </span>
                </div>
                <span className="text-lg font-semibold text-text-dark-primary dark:text-text-primary">
                  {overview.usage.responses_this_month}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-light-hover dark:bg-dark-hover">
                <div className="flex items-center gap-3">
                  <PieChart size={18} className="text-amber-500" />
                  <span className="text-text-dark-secondary dark:text-text-secondary">
                    Total Responses (All Time)
                  </span>
                </div>
                <span className="text-lg font-semibold text-text-dark-primary dark:text-text-primary">
                  {formatNumber(overview.usage.total_responses)}
                </span>
              </div>
            </div>
          ) : null}
        </Card>
      </div>

      {/* AI Costs Section */}
      <Card>
        <CardHeader
          title="AI Costs"
          description={`Token usage and cost estimates for the selected period (${period})`}
        />
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-24 skeleton-light rounded" />
            <div className="h-48 skeleton-light rounded" />
          </div>
        ) : aiCosts ? (
          <div className="space-y-6">
            {/* Cost Overview */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Total Tokens ({period})
                </p>
                <p className="text-2xl font-bold text-text-dark-primary dark:text-text-primary mt-1">
                  {formatNumber(aiCosts.total_tokens)}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Estimated Cost ({period})
                </p>
                <p className="text-2xl font-bold text-text-dark-primary dark:text-text-primary mt-1">
                  {formatCurrency(aiCosts.estimated_cost_usd)}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                  Gross Margin
                </p>
                <p className="text-2xl font-bold text-text-dark-primary dark:text-text-primary mt-1">
                  {formatPercent(aiCosts.margin_percent)}
                </p>
              </div>
            </div>

            {/* Provider Breakdown */}
            <div>
              <h4 className="text-sm font-medium text-text-dark-secondary dark:text-text-secondary mb-3">
                By Provider
              </h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 rounded-xl border border-light-border dark:border-dark-border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <span className="text-blue-500 font-bold text-xs">G</span>
                    </div>
                    <div>
                      <p className="font-medium text-text-dark-primary dark:text-text-primary">Gemini</p>
                      <p className="text-xs text-text-tertiary">
                        {formatNumber(aiCosts.by_provider.gemini.tokens)} tokens
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-text-dark-primary dark:text-text-primary">
                    {formatCurrency(aiCosts.by_provider.gemini.cost_usd)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl border border-light-border dark:border-dark-border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <span className="text-orange-500 font-bold text-xs">M</span>
                    </div>
                    <div>
                      <p className="font-medium text-text-dark-primary dark:text-text-primary">Mistral</p>
                      <p className="text-xs text-text-tertiary">
                        {formatNumber(aiCosts.by_provider.mistral.tokens)} tokens
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-text-dark-primary dark:text-text-primary">
                    {formatCurrency(aiCosts.by_provider.mistral.cost_usd)}
                  </span>
                </div>
              </div>
            </div>

            {/* Top Users */}
            {aiCosts.top_users.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-text-dark-secondary dark:text-text-secondary mb-3">
                  Top Users by Token Usage
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-light-border dark:border-dark-border">
                        <th className="text-left py-2 px-3 font-medium text-text-tertiary">#</th>
                        <th className="text-left py-2 px-3 font-medium text-text-tertiary">User</th>
                        <th className="text-right py-2 px-3 font-medium text-text-tertiary">Tokens</th>
                        <th className="text-right py-2 px-3 font-medium text-text-tertiary">Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aiCosts.top_users.slice(0, 10).map((user, index) => (
                        <tr
                          key={user.user_id}
                          className="border-b border-light-border dark:border-dark-border last:border-0"
                        >
                          <td className="py-2.5 px-3 text-text-tertiary">{index + 1}</td>
                          <td className="py-2.5 px-3">
                            <div>
                              <p className="font-medium text-text-dark-primary dark:text-text-primary">
                                {user.name || 'Unknown'}
                              </p>
                              <p className="text-xs text-text-tertiary">{user.email}</p>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right text-text-dark-primary dark:text-text-primary">
                            {formatNumber(user.tokens)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-medium text-text-dark-primary dark:text-text-primary">
                            {formatCurrency(user.estimated_cost_usd)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pricing Info */}
            <div className="p-4 rounded-xl bg-light-hover dark:bg-dark-hover">
              <h4 className="text-sm font-medium text-text-dark-secondary dark:text-text-secondary mb-2">
                Pricing Reference
              </h4>
              <div className="flex flex-wrap gap-4 text-xs text-text-tertiary">
                {Object.entries(aiCosts.pricing).map(([provider, info]) => (
                  <span key={provider}>
                    <span className="capitalize font-medium">{provider}</span>: ${info.cost_per_million_tokens}/1M tokens
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </Card>

      {/* Registration Trends */}
      <Card>
        <CardHeader title="Registration Trends (Last 30 Days)" />
        {isLoading ? (
          <div className="h-48 skeleton-light rounded animate-pulse" />
        ) : trends && trends.registrations.length > 0 ? (
          <div className="h-48 flex items-end gap-1">
            {trends.registrations.map((item, index) => {
              const maxCount = Math.max(...trends.registrations.map((t) => t.count), 1);
              const height = (item.count / maxCount) * 100;
              return (
                <div
                  key={index}
                  className="flex-1 group relative"
                  title={`${item.period}: ${item.count} registrations`}
                >
                  <div
                    className="w-full bg-primary-500 rounded-t hover:bg-primary-400 transition-colors"
                    style={{ height: `${Math.max(height, 2)}%` }}
                  />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-dark-surface text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {item.period}: {item.count}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-text-tertiary">
            No registration data available
          </div>
        )}
      </Card>

      {/* Last Updated */}
      {overview && (
        <p className="text-center text-xs text-text-tertiary">
          Last updated: {new Date(overview.generated_at).toLocaleString()}
        </p>
      )}
    </div>
  );
}

export default SuperAdminDashboard;

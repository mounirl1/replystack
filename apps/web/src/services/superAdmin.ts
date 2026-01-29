import api from './api';

// Types for Super Admin Dashboard
export interface DashboardOverview {
  users: {
    total: number;
    active: number;
    new_today: number;
    new_this_week: number;
    new_this_month: number;
  };
  revenue: {
    mrr: number;
    arr: number;
    active_subscriptions: number;
  };
  ai_costs: {
    total_tokens: number;
    estimated_cost_usd: number;
    margin_percent: number | null;
  };
  usage: {
    total_responses: number;
    responses_today: number;
    responses_this_week: number;
    responses_this_month: number;
  };
  generated_at: string;
}

export interface UserStats {
  total: number;
  by_plan: {
    free: number;
    starter: number;
    pro: number;
    business: number;
    enterprise: number;
  };
  by_plan_percent: {
    free: number;
    starter: number;
    pro: number;
    business: number;
    enterprise: number;
  };
  active_30d: number;
  new_today: number;
  new_this_week: number;
  new_this_month: number;
  paid_users: number;
  conversion_rate: number;
  trends: Array<{
    period: string;
    count: number;
  }>;
}

export interface RevenueStats {
  mrr: number;
  arr: number;
  by_plan: Record<string, number>;
  active_subscriptions: number;
  new_subscriptions: number;
  churns: number;
  churn_rate: number;
  by_status: Record<string, number>;
  trends: Array<{
    date: string;
    mrr: number;
  }>;
}

export interface AICostsStats {
  total_tokens: number;
  by_provider: {
    gemini: { tokens: number; cost_usd: number };
    mistral: { tokens: number; cost_usd: number };
  };
  estimated_cost_usd: number;
  margin_percent: number | null;
  top_users: Array<{
    user_id: number;
    email: string;
    name: string;
    tokens: number;
    estimated_cost_usd: number;
  }>;
  trends: Array<{
    period: string;
    tokens: number;
    estimated_cost_usd: number;
  }>;
  pricing: Record<string, {
    cost_per_million_tokens: number;
    description: string;
  }>;
}

export interface TrendsData {
  registrations: Array<{ period: string; count: number }>;
  responses: Array<{ period: string; count: number }>;
  tokens: Array<{ period: string; tokens: number; estimated_cost_usd: number }>;
  period: string;
  range: number;
}

// Super Admin API
export const superAdminApi = {
  getOverview: async (): Promise<DashboardOverview> => {
    const response = await api.get<DashboardOverview>('/super-admin/dashboard/overview');
    return response.data;
  },

  getUsers: async (period?: string): Promise<UserStats> => {
    const params = period ? { period } : {};
    const response = await api.get<UserStats>('/super-admin/dashboard/users', { params });
    return response.data;
  },

  getRevenue: async (period?: string): Promise<RevenueStats> => {
    const params = period ? { period } : {};
    const response = await api.get<RevenueStats>('/super-admin/dashboard/revenue', { params });
    return response.data;
  },

  getAICosts: async (period?: string): Promise<AICostsStats> => {
    const params = period ? { period } : {};
    const response = await api.get<AICostsStats>('/super-admin/dashboard/ai-costs', { params });
    return response.data;
  },

  getTrends: async (period: string = 'day', range: number = 30): Promise<TrendsData> => {
    const response = await api.get<TrendsData>('/super-admin/dashboard/trends', {
      params: { period, range },
    });
    return response.data;
  },

  clearCache: async (): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/super-admin/dashboard/clear-cache');
    return response.data;
  },
};

export default superAdminApi;

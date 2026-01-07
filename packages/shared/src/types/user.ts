export type Plan = 'free' | 'starter' | 'pro' | 'business' | 'enterprise';

export interface User {
  id: number;
  email: string;
  name: string;
  plan: Plan;
  monthly_quota: number;
  quota_used_month: number;
  quota_reset_at: string | null;
  organization_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface QuotaInfo {
  plan: Plan;
  quota_remaining: number | 'unlimited';
  quota_used: number;
  quota_limit: number | 'unlimited';
  resets_at: string | null;
}

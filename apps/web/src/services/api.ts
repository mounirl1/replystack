import axios, { AxiosError, type AxiosInstance } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: number;
  email: string;
  name: string | null;
  plan: 'free' | 'starter' | 'pro' | 'business' | 'enterprise';
  quota_remaining: number | 'unlimited';
}

export interface QuotaStatus {
  plan: string;
  has_quota: boolean;
  remaining: number | 'unlimited';
  used: number;
  limit: number | 'unlimited';
  resets_at: string | null;
  is_unlimited: boolean;
}

export interface UsageStats {
  total_responses: number;
  responses_this_month: number;
  responses_today: number;
  quota: QuotaStatus;
}

export interface Response {
  id: number;
  content: string;
  tone: string;
  language: string;
  is_published: boolean;
  generation_time_ms: number;
  tokens_used: number;
  created_at: string;
  review?: {
    id: number;
    platform: string;
    author_name: string;
    rating: number;
    content?: string;
  };
}

// Auth API
export const authApi = {
  register: async (data: { email: string; password: string; password_confirmation: string; name?: string }) => {
    const response = await api.post<{ token: string; user: User }>('/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post<{ token: string; user: User }>('/auth/login', data);
    return response.data;
  },

  logout: async () => {
    await api.post('/auth/logout');
  },

  getUser: async () => {
    const response = await api.get<{ user: User }>('/auth/user');
    return response.data.user;
  },
};

// User API
export const userApi = {
  getQuota: async () => {
    const response = await api.get<{ quota: QuotaStatus }>('/user/quota');
    return response.data.quota;
  },

  getUsage: async () => {
    const response = await api.get<{ usage: UsageStats }>('/user/usage');
    return response.data.usage;
  },

  updateSettings: async (data: { name?: string; email?: string; default_tone?: string; default_language?: string }) => {
    const response = await api.patch<{ message: string; user: User }>('/user/settings', data);
    return response.data;
  },

  deleteAccount: async (password: string) => {
    await api.delete('/user', { data: { password } });
  },
};

// Replies API
export const repliesApi = {
  getHistory: async (cursor?: string) => {
    const params = cursor ? { cursor } : {};
    const response = await api.get<{
      responses: Response[];
      next_cursor: string | null;
      has_more: boolean;
    }>('/replies', { params });
    return response.data;
  },

  getOne: async (id: number) => {
    const response = await api.get<{ response: Response }>(`/replies/${id}`);
    return response.data.response;
  },
};

// LemonSqueezy API
export const lemonSqueezyApi = {
  createCheckout: async (plan: 'starter' | 'pro' | 'business', billingCycle: 'monthly' | 'yearly' = 'yearly') => {
    const response = await api.post<{ url: string }>('/lemonsqueezy/checkout', {
      plan,
      billing_cycle: billingCycle
    });
    return response.data;
  },

  createPortal: async () => {
    const response = await api.post<{ url: string }>('/lemonsqueezy/portal');
    return response.data;
  },
};

// Backward compatibility alias
export const stripeApi = lemonSqueezyApi;

// Locations API
export interface Location {
  id: number;
  name: string;
  address: string | null;
  google_place_id: string | null;
  tripadvisor_id: string | null;
  default_tone: string;
  default_language: string;
  created_at: string;
  updated_at: string;
  response_profile?: {
    id: string;
    onboarding_completed: boolean;
  };
}

export interface LocationsResponse {
  locations: Location[];
  can_add: boolean;
  max_locations: number;
  current_count: number;
}

export const locationsApi = {
  getAll: async () => {
    const response = await api.get<LocationsResponse>('/locations');
    return response.data;
  },

  getOne: async (id: number) => {
    const response = await api.get<{ location: Location }>(`/locations/${id}`);
    return response.data;
  },

  create: async (data: Partial<Location>) => {
    const response = await api.post<{ location: Location }>('/locations', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Location>) => {
    const response = await api.patch<{ location: Location }>(`/locations/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/locations/${id}`);
  },
};

export default api;

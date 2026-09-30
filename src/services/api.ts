import axios from 'axios';
import {
  User,
  FinancialProfile,
  DashboardSummary,
  AnalyticsData,
  AIAdviceResponse,
  CreditScoreSummary,
  CreditScoreRecord
} from '../types';

// Axios instance
const api = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('credit_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling 401 unauthenticated
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto-redirect if checking /auth/me on initial load
      const isAuthCheck = error.config?.url?.includes('/auth/me');
      if (!isAuthCheck) {
        localStorage.removeItem('credit_token');
        localStorage.removeItem('credit_user');
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await api.post<{ access_token: string; token_type: string; user: User }>('/auth/login', credentials);
    return res.data;
  },

  register: async (payload: { name: string; email: string; password: string; confirm_password?: string }) => {
    const res = await api.post<{ access_token: string; token_type: string; user: User }>('/auth/register', payload);
    return res.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('credit_token');
      localStorage.removeItem('credit_user');
    }
  },

  getMe: async () => {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },

  getGoogleLoginUrl: async (frontendRedirect?: string) => {
    const params = frontendRedirect ? { frontend_redirect: frontendRedirect } : {};
    const res = await api.get<{ url: string }>('/auth/google/login', { params });
    return res.data.url;
  },

  verifyGoogleToken: async (credential: string) => {
    const res = await api.post<{ access_token: string; token_type: string; user: User }>('/auth/google/verify', { credential });
    return res.data;
  }
};

export const financialAPI = {
  getProfile: async () => {
    const res = await api.get<FinancialProfile | null>('/financial/profile');
    return res.data;
  },

  createProfile: async (profile: Partial<FinancialProfile> & { credit_score?: number }) => {
    const res = await api.post<FinancialProfile>('/financial/profile', profile);
    return res.data;
  },

  updateProfile: async (profile: Partial<FinancialProfile> & { credit_score?: number }) => {
    const res = await api.put<FinancialProfile>('/financial/profile', profile);
    return res.data;
  },

  getSnapshots: async () => {
    const res = await api.get<any[]>('/financial/snapshots');
    return res.data;
  }
};

export const creditAPI = {
  getCurrent: async () => {
    const res = await api.get<CreditScoreSummary>('/credit/current');
    return res.data;
  },

  getHistory: async () => {
    const res = await api.get<{ current: CreditScoreSummary; history: CreditScoreRecord[] }>('/credit/history');
    return res.data;
  },

  addScore: async (score: number, source: string = 'user_reported') => {
    const res = await api.post<CreditScoreSummary>('/credit/history', { credit_score: score, source });
    return res.data;
  }
};

export const dashboardAPI = {
  getSummary: async () => {
    const res = await api.get<DashboardSummary>('/dashboard/summary');
    return res.data;
  },

  getAnalytics: async () => {
    const res = await api.get<AnalyticsData>('/dashboard/analytics');
    return res.data;
  }
};

export const aiAPI = {
  analyze: async (customNote?: string) => {
    const res = await api.post<AIAdviceResponse>('/ai/analyze', { custom_note: customNote });
    return res.data;
  },

  getLatest: async () => {
    const res = await api.get<AIAdviceResponse | null>('/ai/latest');
    return res.data;
  }
};

export default api;

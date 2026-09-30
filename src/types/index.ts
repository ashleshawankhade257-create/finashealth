export interface User {
  id: number;
  name: string;
  email: string;
  google_id?: string | null;
  profile_picture?: string | null;
  auth_provider: 'local' | 'google';
  has_profile: boolean;
  created_at?: string;
}

export interface FinancialProfile {
  id: number;
  user_id: number;
  monthly_income: number;
  monthly_expenses: number;
  total_debt: number;
  monthly_debt_payment: number;
  total_credit_limit: number;
  credit_utilization: number;
  dti_ratio: number;
  monthly_savings: number;
  active_loans: number;
  missed_payments: number;
  financial_goal: string;
  created_at: string;
  updated_at: string;
}

export interface CreditScoreSummary {
  current_score: number | null;
  previous_score: number | null;
  delta: number | null;
  category: 'Poor' | 'Fair' | 'Good' | 'Very Good' | 'Excellent' | 'No Score';
  category_color: 'rose' | 'amber' | 'blue' | 'emerald' | 'violet' | 'slate';
  recorded_at: string | null;
  interpretation: string;
}

export interface CreditScoreRecord {
  id: number;
  credit_score: number;
  recorded_at: string;
  source: string;
}

export interface StepItem {
  step: number;
  title: string;
  description: string;
  target_timeline: string;
  impact_level: 'High' | 'Medium' | 'Low';
}

export interface MonthlyTarget {
  month: string;
  target_metric: string;
  action_goal: string;
}

export interface AIAdviceResponse {
  overall_assessment: string;
  risk_factors: string[];
  positive_factors: string[];
  priority_actions: string[];
  five_step_plan: StepItem[];
  monthly_targets: MonthlyTarget[];
  explanation: string;
  disclaimer: string;
  created_at?: string;
}

export interface MetricCardInfo {
  value: number;
  status: string;
  color?: string;
  action: string;
}

export interface DashboardSummary {
  user: User;
  score: CreditScoreSummary;
  profile: FinancialProfile | null;
  metrics: {
    dti: MetricCardInfo;
    utilization: MetricCardInfo;
    savings: MetricCardInfo;
    debt: MetricCardInfo;
    loans: MetricCardInfo;
    missed_payments: MetricCardInfo;
  };
}

export interface AnalyticsData {
  score_timeline: {
    id: number;
    date: string;
    shortDate: string;
    score: number;
    source: string;
  }[];
  utilization_breakdown: {
    name: string;
    value: number;
    color: string;
  }[];
  utilization_percentage: number;
  total_credit_limit: number;
  snapshots: {
    date: string;
    income: number;
    expenses: number;
    debt: number;
    savings: number;
    dti: number;
    utilization: number;
  }[];
}

export interface FeedbackItem {
  id: string;
  title: string;
  category: string;
  rating: number;
  comment: string;
  userEmail?: string;
  userName?: string;
  status: 'NEW' | 'REVIEWED' | 'IN_PROGRESS' | 'RESOLVED';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryDistribution {
  category: string;
  count: number;
  percentage: number;
}

export interface AnalyticsSummary {
  total: number;
  averageRating: number;
  npsScore: number;
  categoryDistribution: CategoryDistribution[];
  statusDistribution: {
    NEW: number;
    REVIEWED: number;
    IN_PROGRESS: number;
    RESOLVED: number;
  };
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  recentSubmissions: FeedbackItem[];
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface SystemHealthMetrics {
  status: 'UP' | 'DOWN';
  timestamp: string;
  version: string;
  service: string;
  database: {
    status: string;
    latencyMs: number;
  };
  system: {
    uptimeSeconds: number;
    uptimeFormatted: string;
    memory: {
      rssMb: number;
      heapTotalMb: number;
      heapUsedMb: number;
    };
  };
}

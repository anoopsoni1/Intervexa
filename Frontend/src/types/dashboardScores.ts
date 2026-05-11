/** Payload from GET /api/dashboard/interview-score and GET /api/dashboard/coding-score */
export interface DashboardAnalyticScorePayload {
  overallScore: number;
  monthlyImprovement: number;
  completedRounds: number;
  updatedAt: string;
}

export type DashboardAnalyticScoreApiEnvelope = {
  statuscode?: number;
  data?: DashboardAnalyticScorePayload | null;
  message?: string;
  success?: boolean;
};

export interface AttemptsTimelinePoint {
  label: string;
  interview: number;
  coding: number;
}

export interface DashboardAttemptsTimelinePayload {
  points: AttemptsTimelinePoint[];
  weekCount: number;
}

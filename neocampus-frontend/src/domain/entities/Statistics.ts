export interface OverviewStats {
  total_eleves: number;
  total_enseignants: number;
  total_classes: number;
  attendance_rate_today: number;
  collection_rate_month: number;
  total_parents?: number;
  total_comptables?: number;
  total_bibliothecaires?: number;
  total_admins?: number;
}

export interface AttendanceTrend {
  date: string;
  attendance_rate: number;
}

export interface GradeDistribution {
  subject: string;
  average_grade: number;
  min_grade: number;
  max_grade: number;
}

export interface FinanceTrend {
  month: string;
  collected: number;
  outstanding: number;
}

export interface UpcomingExam {
  id: number;
  title: string;
  subject: string;
  class_name: string;
  date: string;
}

export interface RecentActivity {
  id: string | number;
  action: string;
  description: string;
  created_at: string;
  user_name: string;
}

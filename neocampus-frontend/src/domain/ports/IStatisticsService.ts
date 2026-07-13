import { 
  OverviewStats, 
  AttendanceTrend, 
  GradeDistribution, 
  FinanceTrend, 
  UpcomingExam, 
  RecentActivity 
} from '../entities/Statistics';

export interface IStatisticsService {
  getOverviewStats(): Promise<OverviewStats>;
  getAttendanceTrend(period?: string): Promise<AttendanceTrend[]>;
  getGradeDistribution(): Promise<GradeDistribution[]>;
  getFinanceTrend(period?: string): Promise<FinanceTrend[]>;
  getUpcomingExams(limit?: number): Promise<UpcomingExam[]>;
  getRecentActivities(limit?: number): Promise<RecentActivity[]>;
}

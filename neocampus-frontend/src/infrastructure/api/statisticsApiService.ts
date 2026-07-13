import { IStatisticsService } from '@/domain/ports/IStatisticsService'
import { 
  OverviewStats, 
  AttendanceTrend, 
  GradeDistribution, 
  FinanceTrend, 
  UpcomingExam, 
  RecentActivity 
} from '@/domain/entities/Statistics'
import { axiosClient } from './axiosClient'

const getFallbackOverview = (): OverviewStats => ({
  total_eleves: 50,
  total_enseignants: 4,
  total_classes: 5,
  attendance_rate_today: 94.8,
  collection_rate_month: 78.5,
  total_parents: 45,
  total_comptables: 3,
  total_bibliothecaires: 2,
  total_admins: 4
})

const getFallbackAttendance = (period?: string): AttendanceTrend[] => {
  const days = period === 'week' ? 7 : 30;
  const trend: AttendanceTrend[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    trend.push({
      date: dateStr,
      attendance_rate: 90 + Math.random() * 8
    });
  }
  return trend;
}

const getFallbackGrades = (): GradeDistribution[] => [
  { subject: 'Mathématiques', average_grade: 14.2, min_grade: 6.0, max_grade: 20.0 },
  { subject: 'Physique-Chimie', average_grade: 12.8, min_grade: 5.5, max_grade: 19.5 },
  { subject: 'Français', average_grade: 13.5, min_grade: 8.0, max_grade: 18.0 },
  { subject: 'Anglais', average_grade: 15.1, min_grade: 9.0, max_grade: 19.0 },
  { subject: 'Histoire-Géographie', average_grade: 11.9, min_grade: 7.0, max_grade: 16.5 }
]

const getFallbackFinance = (): FinanceTrend[] => [
  { month: 'Février', collected: 25000, outstanding: 5000 },
  { month: 'Mars', collected: 28000, outstanding: 2000 },
  { month: 'Avril', collected: 30000, outstanding: 0 },
  { month: 'Mai', collected: 22000, outstanding: 8000 },
  { month: 'Juin', collected: 29000, outstanding: 1000 },
  { month: 'Juillet', collected: 15000, outstanding: 15000 }
]

const getFallbackExams = (): UpcomingExam[] => [
  {
    id: 1,
    title: 'Contrôle Continu 2',
    subject: 'Mathématiques',
    class_name: 'Grade 6-A',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19)
  },
  {
    id: 2,
    title: 'Examen de mi-parcours',
    subject: 'Physique-Chimie',
    class_name: 'Grade 5-B',
    date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19)
  }
]

const getFallbackActivities = (): RecentActivity[] => [
  {
    id: 'act-1',
    action: 'Paiement enregistré',
    description: 'Frais de scolarité réglés pour l\'élève Abdoulaye Diallo',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19),
    user_name: 'Amina El Amrani'
  },
  {
    id: 'act-2',
    action: 'Absence enregistrée',
    description: 'Absence pour l\'élève Cheikh Kane',
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 19),
    user_name: 'Enseignant'
  }
]

export const statisticsApiService: IStatisticsService = {
  async getOverviewStats(): Promise<OverviewStats> {
    try {
      const response = await axiosClient.get<{ data: OverviewStats }>('/v1/admin/stats/overview')
      return response.data?.data ?? response.data
    } catch (err: any) {
      if (!err.response) {
        console.warn('Backend API offline. Fetching overview stats from local fallback.')
        return getFallbackOverview()
      }
      throw err;
    }
  },

  async getAttendanceTrend(period?: string): Promise<AttendanceTrend[]> {
    try {
      const response = await axiosClient.get<{ data: AttendanceTrend[] }>(`/v1/admin/stats/attendance?period=${period || 'month'}`)
      return response.data?.data ?? response.data
    } catch (err: any) {
      if (!err.response) {
        console.warn('Backend API offline. Fetching attendance trend from local fallback.')
        return getFallbackAttendance(period)
      }
      throw err;
    }
  },

  async getGradeDistribution(): Promise<GradeDistribution[]> {
    try {
      const response = await axiosClient.get<{ data: GradeDistribution[] }>('/v1/admin/stats/grades')
      return response.data?.data ?? response.data
    } catch (err: any) {
      if (!err.response) {
        console.warn('Backend API offline. Fetching grade distribution from local fallback.')
        return getFallbackGrades()
      }
      throw err;
    }
  },

  async getFinanceTrend(period?: string): Promise<FinanceTrend[]> {
    try {
      const response = await axiosClient.get<{ data: FinanceTrend[] }>(`/v1/admin/stats/finance?period=${period || 'month'}`)
      return response.data?.data ?? response.data
    } catch (err: any) {
      if (!err.response) {
        console.warn('Backend API offline. Fetching finance trend from local fallback.')
        return getFallbackFinance()
      }
      throw err;
    }
  },

  async getUpcomingExams(limit?: number): Promise<UpcomingExam[]> {
    try {
      const response = await axiosClient.get<{ data: UpcomingExam[] }>(`/v1/admin/stats/upcoming-exams?limit=${limit || 5}`)
      return response.data?.data ?? response.data
    } catch (err: any) {
      if (!err.response) {
        console.warn('Backend API offline. Fetching upcoming exams from local fallback.')
        return getFallbackExams()
      }
      throw err;
    }
  },

  async getRecentActivities(limit?: number): Promise<RecentActivity[]> {
    try {
      const response = await axiosClient.get<{ data: RecentActivity[] }>(`/v1/admin/stats/recent-activities?limit=${limit || 10}`)
      return response.data?.data ?? response.data
    } catch (err: any) {
      if (!err.response) {
        console.warn('Backend API offline. Fetching recent activities from local fallback.')
        return getFallbackActivities()
      }
      throw err;
    }
  }
}

import { useQuery } from '@tanstack/react-query'
import { statisticsApiService } from '@/infrastructure/api/statisticsApiService'

export const useOverviewStats = () => {
  return useQuery({
    queryKey: ['adminOverviewStats'],
    queryFn: () => statisticsApiService.getOverviewStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  })
}

export const useAttendanceTrend = (period: string = 'month') => {
  return useQuery({
    queryKey: ['adminAttendanceTrend', period],
    queryFn: () => statisticsApiService.getAttendanceTrend(period),
    staleTime: 5 * 60 * 1000,
  })
}

export const useGradeDistribution = () => {
  return useQuery({
    queryKey: ['adminGradeDistribution'],
    queryFn: () => statisticsApiService.getGradeDistribution(),
    staleTime: 5 * 60 * 1000,
  })
}

export const useFinanceTrend = (period: string = 'month') => {
  return useQuery({
    queryKey: ['adminFinanceTrend', period],
    queryFn: () => statisticsApiService.getFinanceTrend(period),
    staleTime: 5 * 60 * 1000,
  })
}

export const useUpcomingExams = (limit: number = 5) => {
  return useQuery({
    queryKey: ['adminUpcomingExams', limit],
    queryFn: () => statisticsApiService.getUpcomingExams(limit),
    staleTime: 5 * 60 * 1000,
  })
}

export const useRecentActivities = (limit: number = 10) => {
  return useQuery({
    queryKey: ['adminRecentActivities', limit],
    queryFn: () => statisticsApiService.getRecentActivities(limit),
    staleTime: 5 * 60 * 1000,
  })
}

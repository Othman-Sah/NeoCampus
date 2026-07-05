import { useQuery } from '@tanstack/react-query'
import { libraryApiService } from '@/infrastructure/api/libraryApiService'

export const useLibraryAnalytics = () => {
  const analyticsQuery = useQuery({
    queryKey: ['library-analytics'],
    queryFn: () => libraryApiService.getAnalytics(),
  })

  return {
    analytics: analyticsQuery.data ?? {
      top_books: [],
      top_genres: [],
      monthly_trends: [],
      kpis: {
        overdue_rate: 0,
        active_borrowers: 0,
        total_outstanding_fines: 0,
        total_collected_fines: 0,
      }
    },
    loading: analyticsQuery.isLoading,
    error: analyticsQuery.error,
    refetch: analyticsQuery.refetch,
  }
}

export default useLibraryAnalytics

import { useQuery } from '@tanstack/react-query'
import { libraryApiService } from '@/infrastructure/api/libraryApiService'

export const useLibraryStats = () => {
  const statsQuery = useQuery({
    queryKey: ['library-stats'],
    queryFn: () => libraryApiService.getStats(),
    refetchInterval: 30000, // auto refetch stats every 30 seconds
  });

  return {
    stats: statsQuery.data ?? { total_books: 0, active_loans: 0, overdue_loans: 0 },
    loading: statsQuery.isLoading,
    isFetching: statsQuery.isFetching,
    error: statsQuery.error,
    refetch: statsQuery.refetch,
  };
};

export default useLibraryStats;

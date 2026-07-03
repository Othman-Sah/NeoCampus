import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { libraryApiService } from '@/infrastructure/api/libraryApiService'

export const useOverdueLoans = (filters: { 
  per_page?: number; 
  page?: number; 
} = {}) => {
  const overdueQuery = useQuery({
    queryKey: ['overdue-loans', filters],
    queryFn: () => libraryApiService.getOverdueLoans(filters),
    placeholderData: keepPreviousData,
  });

  return {
    loans: overdueQuery.data?.data ?? [],
    meta: overdueQuery.data?.meta ?? { current_page: 1, last_page: 1, total: 0 },
    loading: overdueQuery.isLoading,
    isFetching: overdueQuery.isFetching,
    error: overdueQuery.error,
    refetch: overdueQuery.refetch,
  };
};

export default useOverdueLoans;

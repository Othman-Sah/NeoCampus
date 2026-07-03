import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { libraryApiService } from '@/infrastructure/api/libraryApiService'

export const useLoans = (filters: {
  statut?: string;
  q?: string;
  date_debut?: string;
  date_fin?: string;
  per_page?: number;
  page?: number;
} = {}) => {
  const queryClient = useQueryClient();

  const loansQuery = useQuery({
    queryKey: ['loans', filters],
    queryFn: () => libraryApiService.getLoans(filters),
    placeholderData: keepPreviousData,
  });

  const createLoanMutation = useMutation({
    mutationFn: ({ livreId, adherentId }: { livreId: number; adherentId: number }) =>
      libraryApiService.createLoan(livreId, adherentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['library-stats'] });
      queryClient.invalidateQueries({ queryKey: ['overdue-loans'] });
    }
  });

  const returnLoanMutation = useMutation({
    mutationFn: (id: number) => libraryApiService.returnLoan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['library-stats'] });
      queryClient.invalidateQueries({ queryKey: ['overdue-loans'] });
    }
  });

  const searchMembers = async (q: string) => {
    return libraryApiService.searchMembers(q);
  };

  return {
    loans: loansQuery.data?.data ?? [],
    meta: loansQuery.data?.meta ?? { current_page: 1, last_page: 1, total: 0 },
    loading: loansQuery.isLoading,
    isFetching: loansQuery.isFetching,
    error: loansQuery.error,
    refetch: loansQuery.refetch,
    createLoan: createLoanMutation.mutateAsync,
    creating: createLoanMutation.isPending,
    returnLoan: returnLoanMutation.mutateAsync,
    returning: returnLoanMutation.isPending,
    searchMembers,
  };
};

export default useLoans;

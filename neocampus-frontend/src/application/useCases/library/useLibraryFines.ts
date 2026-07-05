import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { libraryApiService } from '@/infrastructure/api/libraryApiService'

export const useLibraryFines = (filters: { status?: string; q?: string; page?: number; per_page?: number } = {}) => {
  const queryClient = useQueryClient()

  const finesQuery = useQuery({
    queryKey: ['library-fines-list', filters],
    queryFn: () => libraryApiService.getFines(filters),
    placeholderData: keepPreviousData,
  })

  const payMutation = useMutation({
    mutationFn: (id: number) => libraryApiService.payFine(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-fines-list'] })
      queryClient.invalidateQueries({ queryKey: ['library-analytics'] })
    },
  })

  const waiveMutation = useMutation({
    mutationFn: (id: number) => libraryApiService.waiveFine(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-fines-list'] })
      queryClient.invalidateQueries({ queryKey: ['library-analytics'] })
    },
  })

  return {
    fines: finesQuery.data?.data ?? [],
    meta: finesQuery.data?.meta ?? { current_page: 1, last_page: 1, total: 0 },
    loading: finesQuery.isLoading,
    isFetching: finesQuery.isFetching,
    error: finesQuery.error,
    refetch: finesQuery.refetch,
    payFine: payMutation.mutateAsync,
    paying: payMutation.isPending,
    waiveFine: waiveMutation.mutateAsync,
    waiving: waiveMutation.isPending,
  }
}

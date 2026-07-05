import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { libraryApiService } from '@/infrastructure/api/libraryApiService'

export const useLibraryMembers = (filters: { q?: string; page?: number; per_page?: number } = {}) => {
  const membersQuery = useQuery({
    queryKey: ['library-members-list', filters],
    queryFn: () => libraryApiService.getMembersList(filters),
    placeholderData: keepPreviousData,
  })

  return {
    members: membersQuery.data?.data ?? [],
    meta: membersQuery.data?.meta ?? { current_page: 1, last_page: 1, total: 0 },
    loading: membersQuery.isLoading,
    isFetching: membersQuery.isFetching,
    error: membersQuery.error,
    refetch: membersQuery.refetch,
  }
}

export const useMemberHistory = (memberId?: number) => {
  const historyQuery = useQuery({
    queryKey: ['library-member-history', memberId],
    queryFn: () => libraryApiService.getMemberHistory(memberId!),
    enabled: !!memberId,
  })

  return {
    history: historyQuery.data ?? [],
    loading: historyQuery.isLoading,
    error: historyQuery.error,
    refetch: historyQuery.refetch,
  }
}

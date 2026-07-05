import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { libraryApiService } from '@/infrastructure/api/libraryApiService'

export const useLibrarySettings = () => {
  const queryClient = useQueryClient()

  const settingsQuery = useQuery({
    queryKey: ['library-settings'],
    queryFn: () => libraryApiService.getSettings(),
  })

  const updateMutation = useMutation({
    mutationFn: (settings: { max_loans_per_member: number; loan_duration_days: number; fine_per_day_mad: number }) =>
      libraryApiService.updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-settings'] })
    },
  })

  return {
    settings: settingsQuery.data,
    loading: settingsQuery.isLoading,
    error: settingsQuery.error,
    updateSettings: updateMutation.mutateAsync,
    updating: updateMutation.isPending,
  }
}

export default useLibrarySettings

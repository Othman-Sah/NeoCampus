import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { presenceApiService } from '@/infrastructure/api/presenceApiService';

export const usePresence = () => {
  const queryClient = useQueryClient();

  const useClassPresences = (classeId: number, date: string) => {
    return useQuery({
      queryKey: ['presences', 'class', classeId, date],
      queryFn: () => presenceApiService.getClassPresences(classeId, date),
      enabled: !!classeId && !!date,
    });
  };

  const useStudentPresences = (eleveId: number) => {
    return useQuery({
      queryKey: ['presences', 'student', eleveId],
      queryFn: () => presenceApiService.getStudentPresences(eleveId),
      enabled: !!eleveId,
    });
  };

  const submitBulkMutation = useMutation({
    mutationFn: ({ seanceId, date, presences }: {
      seanceId: number;
      date: string;
      presences: { eleve_id: number; statut: string; motif?: string | null }[];
    }) => presenceApiService.submitBulk(seanceId, date, presences),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['presences'] });
    },
  });

  const useAllPresences = (filters: { range?: string; search?: string }) => {
    return useQuery({
      queryKey: ['presences', 'all', filters],
      queryFn: () => presenceApiService.getAllPresences(filters),
    });
  };

  const updatePresenceStatusMutation = useMutation({
    mutationFn: ({ id, statut, motif }: { id: number; statut: string; motif?: string | null }) =>
      presenceApiService.updatePresenceStatus(id, statut, motif),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presences'] });
    },
  });

  return {
    useClassPresences,
    useStudentPresences,
    useAllPresences,
    submitBulk: submitBulkMutation.mutateAsync,
    submittingBulk: submitBulkMutation.isPending,
    updatePresenceStatus: updatePresenceStatusMutation.mutateAsync,
    updatingPresenceStatus: updatePresenceStatusMutation.isPending,
  };
};

export default usePresence;

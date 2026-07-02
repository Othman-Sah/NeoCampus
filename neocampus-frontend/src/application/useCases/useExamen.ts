import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { examenApiService } from '@/infrastructure/api/examenApiService';

export const useExamen = () => {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ['examen-settings'],
    queryFn: () => examenApiService.getSettings(),
  });

  const teacherExamsQuery = useQuery({
    queryKey: ['examen-teacher'],
    queryFn: () => examenApiService.getTeacherExams(),
  });

  const pendingProposalsQuery = useQuery({
    queryKey: ['examen-proposals-pending'],
    queryFn: () => examenApiService.getPendingProposals(),
  });

  const useExamenDetails = (id: number) => {
    return useQuery({
      queryKey: ['examen', id],
      queryFn: () => examenApiService.getTeacherExams().then(exams => exams.find(e => e.id === id) || null),
      enabled: !!id,
    });
  };

  const proposeScheduleMutation = useMutation({
    mutationFn: (data: { intitule: string; classe_id: number; matiere_id: number; date_proposee: string }) =>
      examenApiService.proposeSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examen-teacher'] });
    },
  });

  const reviewScheduleMutation = useMutation({
    mutationFn: ({ id, status, comment }: { id: number; status: 'approved' | 'rejected'; comment?: string }) =>
      examenApiService.reviewSchedule(id, status, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examen-proposals-pending'] });
      queryClient.invalidateQueries({ queryKey: ['examen-teacher'] });
    },
  });

  const uploadSujetMutation = useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      examenApiService.uploadSujet(id, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['examen', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['examen-teacher'] });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (settings: any) => examenApiService.updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['examen-settings'] });
    },
  });

  return {
    settings: settingsQuery.data ?? null,
    loadingSettings: settingsQuery.isLoading,
    teacherExams: teacherExamsQuery.data ?? [],
    loadingTeacherExams: teacherExamsQuery.isLoading,
    pendingProposals: pendingProposalsQuery.data ?? [],
    loadingPendingProposals: pendingProposalsQuery.isLoading,
    useExamenDetails,

    proposeSchedule: proposeScheduleMutation.mutateAsync,
    proposingSchedule: proposeScheduleMutation.isPending,
    reviewSchedule: reviewScheduleMutation.mutateAsync,
    reviewingSchedule: reviewScheduleMutation.isPending,
    uploadSujet: uploadSujetMutation.mutateAsync,
    uploadingSujet: uploadSujetMutation.isPending,
    updateSettings: updateSettingsMutation.mutateAsync,
    updatingSettings: updateSettingsMutation.isPending,
  };
};

export default useExamen;

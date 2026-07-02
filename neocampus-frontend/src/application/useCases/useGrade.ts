import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gradeApiService } from '@/infrastructure/api/gradeApiService';

export const useGrade = () => {
  const queryClient = useQueryClient();

  const pendingExceptionsQuery = useQuery({
    queryKey: ['grades-exceptions-pending'],
    queryFn: () => gradeApiService.getPendingExceptions(),
  });

  const useExamenGrades = (examenId: number) => {
    return useQuery({
      queryKey: ['grades', 'examen', examenId],
      queryFn: () => gradeApiService.findByExamen(examenId),
      enabled: !!examenId,
    });
  };

  const useCheckGradingWindow = (examenId: number) => {
    return useQuery({
      queryKey: ['grades-window', examenId],
      queryFn: () => gradeApiService.checkWindow(examenId),
      enabled: !!examenId,
    });
  };

  const submitBulkMutation = useMutation({
    mutationFn: ({ examenId, grades }: { examenId: number; grades: { eleve_id: number; valeur: number }[] }) =>
      gradeApiService.submitBulk(examenId, grades),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['grades', 'examen', variables.examenId] });
      queryClient.invalidateQueries({ queryKey: ['grades-window', variables.examenId] });
      queryClient.invalidateQueries({ queryKey: ['examen-teacher'] });
    },
  });

  const requestExceptionMutation = useMutation({
    mutationFn: ({ examenId, motif }: { examenId: number; motif: string }) =>
      gradeApiService.requestException(examenId, motif),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['grades-window', variables.examenId] });
      queryClient.invalidateQueries({ queryKey: ['grades-exceptions-pending'] });
    },
  });

  const approveExceptionMutation = useMutation({
    mutationFn: (id: number) => gradeApiService.approveException(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades-exceptions-pending'] });
      queryClient.invalidateQueries({ queryKey: ['grades-window'] });
    },
  });

  return {
    pendingExceptions: pendingExceptionsQuery.data ?? [],
    loadingPendingExceptions: pendingExceptionsQuery.isLoading,
    useExamenGrades,
    useCheckGradingWindow,

    submitBulk: submitBulkMutation.mutateAsync,
    submittingBulk: submitBulkMutation.isPending,
    requestException: requestExceptionMutation.mutateAsync,
    requestingException: requestExceptionMutation.isPending,
    approveException: approveExceptionMutation.mutateAsync,
    approvingException: approveExceptionMutation.isPending,
  };
};

export default useGrade;

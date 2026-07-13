import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseMaterialApiService } from '@/infrastructure/api/courseMaterialApiService';

export const useCourseMaterial = () => {
  const queryClient = useQueryClient();

  const useSupports = (classeId: number, matiereId?: number) => {
    return useQuery({
      queryKey: ['teacher', 'supports', classeId, matiereId],
      queryFn: () => courseMaterialApiService.listSupports(classeId, matiereId),
      enabled: !!classeId,
    });
  };

  const createSupportMutation = useMutation({
    mutationFn: (data: {
      classe_id: number;
      matiere_id: number;
      titre: string;
      description?: string;
      fichier_url?: string;
      type: 'document' | 'video' | 'link' | 'image';
    }) => courseMaterialApiService.createSupport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'supports'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'supports'] });
    },
  });

  const deleteSupportMutation = useMutation({
    mutationFn: (id: number) => courseMaterialApiService.deleteSupport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'supports'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'supports'] });
    },
  });

  const useHomework = (classeId: number, matiereId?: number) => {
    return useQuery({
      queryKey: ['teacher', 'homework', classeId, matiereId],
      queryFn: () => courseMaterialApiService.listHomework(classeId, matiereId),
      enabled: !!classeId,
    });
  };

  const createHomeworkMutation = useMutation({
    mutationFn: (data: {
      classe_id: number;
      matiere_id: number;
      titre: string;
      description?: string;
      date_echeance: string;
      fichier_url?: string;
    }) => courseMaterialApiService.createHomework(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'homework'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'homework'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'dashboard'] });
    },
  });

  const updateHomeworkMutation = useMutation({
    mutationFn: ({ id, data }: {
      id: number;
      data: {
        classe_id?: number;
        matiere_id?: number;
        titre?: string;
        description?: string;
        date_echeance?: string;
        fichier_url?: string;
      };
    }) => courseMaterialApiService.updateHomework(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'homework'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'homework'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'dashboard'] });
    },
  });

  const deleteHomeworkMutation = useMutation({
    mutationFn: (id: number) => courseMaterialApiService.deleteHomework(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'homework'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'homework'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'dashboard'] });
    },
  });

  return {
    useSupports,
    createSupport: createSupportMutation.mutateAsync,
    isCreatingSupport: createSupportMutation.isPending,
    deleteSupport: deleteSupportMutation.mutateAsync,
    isDeletingSupport: deleteSupportMutation.isPending,

    useHomework,
    createHomework: createHomeworkMutation.mutateAsync,
    isCreatingHomework: createHomeworkMutation.isPending,
    updateHomework: updateHomeworkMutation.mutateAsync,
    isUpdatingHomework: updateHomeworkMutation.isPending,
    deleteHomework: deleteHomeworkMutation.mutateAsync,
    isDeletingHomework: deleteHomeworkMutation.isPending,
  };
};

export default useCourseMaterial;

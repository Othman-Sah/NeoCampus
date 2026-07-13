import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { parentApiService } from '@/infrastructure/api/parentApiService';
import { ParentUser } from '@/domain/ports/IParentService';

export const useParents = () => {
  const queryClient = useQueryClient();

  const parentsQuery = useQuery({
    queryKey: ['admin-parents'],
    queryFn: () => parentApiService.findAll(),
  });

  const createParentMutation = useMutation({
    mutationFn: (data: any) => parentApiService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-parents'] });
    },
  });

  const updateParentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      parentApiService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-parents'] });
    },
  });

  const deleteParentMutation = useMutation({
    mutationFn: (id: number) => parentApiService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-parents'] });
    },
  });

  return {
    parents: parentsQuery.data ?? [],
    loading: parentsQuery.isLoading,
    createParent: createParentMutation.mutateAsync,
    creating: createParentMutation.isPending,
    updateParent: updateParentMutation.mutateAsync,
    updating: updateParentMutation.isPending,
    deleteParent: deleteParentMutation.mutateAsync,
    deleting: deleteParentMutation.isPending,
  };
};

export default useParents;

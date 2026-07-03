import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountantApiService } from '@/infrastructure/api/accountantApiService';

export const useAccountant = () => {
  const queryClient = useQueryClient();

  const accountantsQuery = useQuery({
    queryKey: ['admin-accountants'],
    queryFn: () => accountantApiService.findAll(),
  });

  const createAccountantMutation = useMutation({
    mutationFn: (data: any) => accountantApiService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-accountants'] });
    },
  });

  const updateAccountantMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      accountantApiService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-accountants'] });
    },
  });

  const deleteAccountantMutation = useMutation({
    mutationFn: (id: number) => accountantApiService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-accountants'] });
    },
  });

  return {
    accountants: accountantsQuery.data ?? [],
    loading: accountantsQuery.isLoading,
    createAccountant: createAccountantMutation.mutateAsync,
    creating: createAccountantMutation.isPending,
    updateAccountant: updateAccountantMutation.mutateAsync,
    updating: updateAccountantMutation.isPending,
    deleteAccountant: deleteAccountantMutation.mutateAsync,
    deleting: deleteAccountantMutation.isPending,
  };
};

export default useAccountant;

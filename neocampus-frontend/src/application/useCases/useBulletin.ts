import { useMutation } from '@tanstack/react-query';
import { bulletinApiService } from '@/infrastructure/api/bulletinApiService';

export const useBulletin = () => {
  const generateBulkMutation = useMutation({
    mutationFn: ({ classeId, periode }: { classeId: number; periode: string }) =>
      bulletinApiService.generateBulk(classeId, periode),
  });

  return {
    generateBulk: generateBulkMutation.mutateAsync,
    generatingBulk: generateBulkMutation.isPending,
  };
};

export default useBulletin;

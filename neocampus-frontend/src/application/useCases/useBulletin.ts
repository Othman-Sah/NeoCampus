import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bulletinApiService } from '@/infrastructure/api/bulletinApiService';
import { BulletinConfig, GroupeMatiere, TypeEvaluation } from '@/domain/entities/Bulletin';

export const useBulletin = () => {
  const queryClient = useQueryClient();

  const useGetBulletin = (id: string) => {
    return useQuery({
      queryKey: ['bulletin', id],
      queryFn: () => bulletinApiService.getBulletin(id),
      enabled: !!id,
    });
  };

  const useGetBulletinsByClasse = (classeId: number, periode: string, anneeScolaire: string) => {
    return useQuery({
      queryKey: ['bulletins', classeId, periode, anneeScolaire],
      queryFn: () => bulletinApiService.getBulletinsByClasse(classeId, periode, anneeScolaire),
      enabled: !!classeId && !!periode && !!anneeScolaire,
    });
  };

  const useGetMyBulletins = () => {
    return useQuery({
      queryKey: ['my-bulletins'],
      queryFn: () => bulletinApiService.getMyBulletins(),
    });
  };

  const generateBulkMutation = useMutation({
    mutationFn: ({ classeId, periode, anneeScolaire }: { classeId: number; periode: string; anneeScolaire: string }) =>
      bulletinApiService.generateBulk(classeId, periode, anneeScolaire),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bulletins', variables.classeId, variables.periode, variables.anneeScolaire] });
    }
  });

  const generateSingleMutation = useMutation({
    mutationFn: ({ eleveId, periode, anneeScolaire }: { eleveId: number; periode: string; anneeScolaire: string }) =>
      bulletinApiService.generateSingle(eleveId, periode, anneeScolaire),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bulletins'] });
    }
  });

  const updateAppreciationsMutation = useMutation({
    mutationFn: ({ bulletinId, matiereId, appreciation }: { bulletinId: string; matiereId: number; appreciation: string }) =>
      bulletinApiService.updateAppreciations(bulletinId, matiereId, appreciation),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bulletin', variables.bulletinId] });
    }
  });

  const publishMutation = useMutation({
    mutationFn: (bulletinId: string) => bulletinApiService.publish(bulletinId),
    onSuccess: (_, bulletinId) => {
      queryClient.invalidateQueries({ queryKey: ['bulletin', bulletinId] });
      queryClient.invalidateQueries({ queryKey: ['bulletins'] });
    }
  });

  // Council Decision Mutation
  const updateDecisionMutation = useMutation({
    mutationFn: ({
      bulletinId,
      decision,
      mention,
      appreciationGenerale
    }: {
      bulletinId: string;
      decision: string | null;
      mention: string | null;
      appreciationGenerale: string | null;
    }) => bulletinApiService.updateDecision(bulletinId, decision, mention, appreciationGenerale),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bulletin', variables.bulletinId] });
      queryClient.invalidateQueries({ queryKey: ['bulletins'] });
    }
  });

  // Validate Mutation
  const validateMutation = useMutation({
    mutationFn: (bulletinId: string) => bulletinApiService.validate(bulletinId),
    onSuccess: (_, bulletinId) => {
      queryClient.invalidateQueries({ queryKey: ['bulletin', bulletinId] });
      queryClient.invalidateQueries({ queryKey: ['bulletins'] });
    }
  });

  // Configuration Queries & Mutations
  const useGetSettings = () => {
    return useQuery({
      queryKey: ['bulletin-settings'],
      queryFn: () => bulletinApiService.getSettings(),
    });
  };

  const updateSettingsMutation = useMutation({
    mutationFn: (settings: Partial<BulletinConfig>) => bulletinApiService.updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bulletin-settings'] });
    }
  });

  // Per-class Coefficients Queries & Mutations
  const useGetCoefficients = (classeId: number) => {
    return useQuery({
      queryKey: ['class-coefficients', classeId],
      queryFn: () => bulletinApiService.getCoefficients(classeId),
      enabled: !!classeId,
    });
  };

  const saveCoefficientMutation = useMutation({
    mutationFn: ({
      classeId,
      matiereId,
      coefficient,
      applyToLevel
    }: {
      classeId: number;
      matiereId: number;
      coefficient: number;
      applyToLevel?: boolean;
    }) => bulletinApiService.saveCoefficient(classeId, matiereId, coefficient, applyToLevel),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['class-coefficients', variables.classeId] });
    }
  });

  const deleteCoefficientMutation = useMutation({
    mutationFn: ({ classeId, matiereId }: { classeId: number; matiereId: number }) =>
      bulletinApiService.deleteCoefficient(classeId, matiereId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['class-coefficients', variables.classeId] });
    }
  });

  // Evaluation Types Queries & Mutations
  const useGetEvaluationTypes = () => {
    return useQuery({
      queryKey: ['evaluation-types'],
      queryFn: () => bulletinApiService.getEvaluationTypes(),
    });
  };

  const saveEvaluationTypeMutation = useMutation({
    mutationFn: (type: Partial<TypeEvaluation>) => bulletinApiService.saveEvaluationType(type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluation-types'] });
    }
  });

  const deleteEvaluationTypeMutation = useMutation({
    mutationFn: (id: number) => bulletinApiService.deleteEvaluationType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluation-types'] });
    }
  });

  // Subject Groups Queries & Mutations
  const useGetSubjectGroups = () => {
    return useQuery({
      queryKey: ['subject-groups'],
      queryFn: () => bulletinApiService.getSubjectGroups(),
    });
  };

  const saveSubjectGroupMutation = useMutation({
    mutationFn: (group: Partial<GroupeMatiere>) => bulletinApiService.saveSubjectGroup(group),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subject-groups'] });
    }
  });

  const deleteSubjectGroupMutation = useMutation({
    mutationFn: (id: number) => bulletinApiService.deleteSubjectGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subject-groups'] });
    }
  });

  return {
    useGetBulletin,
    useGetBulletinsByClasse,
    useGetMyBulletins,
    generateBulk: generateBulkMutation.mutateAsync,
    generatingBulk: generateBulkMutation.isPending,
    generateSingle: generateSingleMutation.mutateAsync,
    generatingSingle: generateSingleMutation.isPending,
    updateAppreciations: updateAppreciationsMutation.mutateAsync,
    updatingAppreciations: updateAppreciationsMutation.isPending,
    publish: publishMutation.mutateAsync,
    publishing: publishMutation.isPending,

    // Decision & Validate
    updateDecision: updateDecisionMutation.mutateAsync,
    updatingDecision: updateDecisionMutation.isPending,
    validate: validateMutation.mutateAsync,
    validating: validateMutation.isPending,

    // Configuration
    useGetSettings,
    updateSettings: updateSettingsMutation.mutateAsync,
    updatingSettings: updateSettingsMutation.isPending,

    // Class Coefficients
    useGetCoefficients,
    saveCoefficient: saveCoefficientMutation.mutateAsync,
    savingCoefficient: saveCoefficientMutation.isPending,
    deleteCoefficient: deleteCoefficientMutation.mutateAsync,

    // Evaluation Types
    useGetEvaluationTypes,
    saveEvaluationType: saveEvaluationTypeMutation.mutateAsync,
    savingEvaluationType: saveEvaluationTypeMutation.isPending,
    deleteEvaluationType: deleteEvaluationTypeMutation.mutateAsync,

    // Subject Groups
    useGetSubjectGroups,
    saveSubjectGroup: saveSubjectGroupMutation.mutateAsync,
    savingSubjectGroup: saveSubjectGroupMutation.isPending,
    deleteSubjectGroup: deleteSubjectGroupMutation.mutateAsync,
  };
};

export default useBulletin;

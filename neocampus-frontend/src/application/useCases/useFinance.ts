import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { financeGroupeApiService } from '@/infrastructure/api/financeGroupeApiService';
import { financeTypeApiService } from '@/infrastructure/api/financeTypeApiService';
import { financeFeeApiService } from '@/infrastructure/api/financeFeeApiService';
import { financePaymentApiService } from '@/infrastructure/api/financePaymentApiService';
import { financeReportApiService } from '@/infrastructure/api/financeReportApiService';
import { financeAccountingApiService } from '@/infrastructure/api/financeAccountingApiService';

export const useFinance = (filters: Record<string, string> = {}) => {
  const queryClient = useQueryClient();

  // --- Fee Groups Queries & Mutations ---
  const groupsQuery = useQuery({
    queryKey: ['finance-groups'],
    queryFn: () => financeGroupeApiService.findAll(),
  });

  const createGroupMutation = useMutation({
    mutationFn: (data: { nom: string; description?: string | null }) =>
      financeGroupeApiService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-groups'] });
    },
  });

  const updateGroupMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      financeGroupeApiService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-groups'] });
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (id: number) => financeGroupeApiService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-groups'] });
    },
  });

  // --- Fee Types Queries & Mutations ---
  const typesQuery = useQuery({
    queryKey: ['finance-types', filters.groupe_id],
    queryFn: () => financeTypeApiService.findAll({ groupe_id: filters.groupe_id || '' }),
    placeholderData: keepPreviousData,
  });

  const createTypeMutation = useMutation({
    mutationFn: (data: { libelle: string; groupe_frais_id: number; montant_par_defaut: number }) =>
      financeTypeApiService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-types'] });
    },
  });

  const updateTypeMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      financeTypeApiService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-types'] });
    },
  });

  const deleteTypeMutation = useMutation({
    mutationFn: (id: number) => financeTypeApiService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-types'] });
    },
  });

  // --- Student Fees & Balances ---
  const feesQuery = useQuery({
    queryKey: ['finance-fees', filters],
    queryFn: () => financeFeeApiService.findAll(filters),
    placeholderData: keepPreviousData,
  });

  const useStudentBalance = (studentId: number) => {
    return useQuery({
      queryKey: ['finance-student-balance', studentId],
      queryFn: () => financePaymentApiService.getStudentBalance(studentId),
      enabled: !!studentId,
    });
  };

  const assignFeesMutation = useMutation({
    mutationFn: (data: {
      type_frais_ids: number[];
      eleve_id?: number | null;
      classe_id?: number | null;
      date_echeance: string;
      annee_scolaire?: string | null;
      custom_amount?: number;
    }) => financeFeeApiService.assign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-fees'] });
      queryClient.invalidateQueries({ queryKey: ['finance-student-balance'] });
      queryClient.invalidateQueries({ queryKey: ['finance-reports-summary'] });
    },
  });

  const applyRemiseMutation = useMutation({
    mutationFn: ({ feeId, pourcentage, motif }: { feeId: number; pourcentage: number; motif?: string | null }) =>
      financeFeeApiService.applyRemise(feeId, { pourcentage, motif }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['finance-fees'] });
      queryClient.invalidateQueries({ queryKey: ['finance-student-balance'] });
      queryClient.invalidateQueries({ queryKey: ['finance-reports-summary'] });
    },
  });

  const applyPenaliteMutation = useMutation({
    mutationFn: ({ feeId, montant, motif }: { feeId: number; montant: number; motif?: string | null }) =>
      financeFeeApiService.applyPenalite(feeId, { montant, motif }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-fees'] });
      queryClient.invalidateQueries({ queryKey: ['finance-student-balance'] });
      queryClient.invalidateQueries({ queryKey: ['finance-reports-summary'] });
    },
  });

  const recordPaymentMutation = useMutation({
    mutationFn: (data: {
      frais_id: number;
      montant_paye: number;
      date_paiement: string;
      mode: 'cash' | 'virement' | 'cheque';
      reference?: string | null;
    }) => financePaymentApiService.recordPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-fees'] });
      queryClient.invalidateQueries({ queryKey: ['finance-payments'] });
      queryClient.invalidateQueries({ queryKey: ['finance-student-balance'] });
      queryClient.invalidateQueries({ queryKey: ['finance-reports-summary'] });
      queryClient.invalidateQueries({ queryKey: ['finance-reports-transactions'] });
    },
  });

  const paymentsQuery = useQuery({
    queryKey: ['finance-payments', filters],
    queryFn: () => financePaymentApiService.findAll(filters),
    placeholderData: keepPreviousData,
  });

  // --- Reports & Accounting ---
  const reportsSummaryQuery = useQuery({
    queryKey: ['finance-reports-summary', filters.from, filters.to],
    queryFn: () => financeReportApiService.getSummary({ from: filters.from || '', to: filters.to || '' }),
    placeholderData: keepPreviousData,
  });

  const transactionsQuery = useQuery({
    queryKey: ['finance-reports-transactions', filters],
    queryFn: () => financeReportApiService.getTransactions(filters),
    placeholderData: keepPreviousData,
  });

  const accountingQuery = useQuery({
    queryKey: ['finance-accounting', filters],
    queryFn: () => financeAccountingApiService.findAll(filters),
    placeholderData: keepPreviousData,
  });

  const createAccountingMutation = useMutation({
    mutationFn: (data: {
      libelle: string;
      montant: number;
      type: 'recette' | 'depense';
      categorie?: string | null;
      date: string;
      justificatif?: string | null;
    }) => financeAccountingApiService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-accounting'] });
    },
  });

  const updateAccountingMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      financeAccountingApiService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-accounting'] });
    },
  });

  const deleteAccountingMutation = useMutation({
    mutationFn: (id: number) => financeAccountingApiService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-accounting'] });
    },
  });

  return {
    // Data
    groups: groupsQuery.data ?? [],
    loadingGroups: groupsQuery.isLoading,
    types: typesQuery.data ?? [],
    loadingTypes: typesQuery.isLoading,
    fees: feesQuery.data ?? [],
    loadingFees: feesQuery.isLoading,
    payments: paymentsQuery.data ?? [],
    loadingPayments: paymentsQuery.isLoading,
    summary: reportsSummaryQuery.data ?? null,
    loadingSummary: reportsSummaryQuery.isLoading,
    transactions: transactionsQuery.data ?? [],
    loadingTransactions: transactionsQuery.isLoading,
    accountingEntries: accountingQuery.data ?? [],
    loadingAccounting: accountingQuery.isLoading,

    // Hook constructors
    useStudentBalance,

    // Mutations
    createGroup: createGroupMutation.mutateAsync,
    creatingGroup: createGroupMutation.isPending,
    updateGroup: updateGroupMutation.mutateAsync,
    updatingGroup: updateGroupMutation.isPending,
    deleteGroup: deleteGroupMutation.mutateAsync,
    deletingGroup: deleteGroupMutation.isPending,

    createType: createTypeMutation.mutateAsync,
    creatingType: createTypeMutation.isPending,
    updateType: updateTypeMutation.mutateAsync,
    updatingType: updateTypeMutation.isPending,
    deleteType: deleteTypeMutation.mutateAsync,
    deletingType: deleteTypeMutation.isPending,

    assignFees: assignFeesMutation.mutateAsync,
    assigningFees: assignFeesMutation.isPending,
    applyRemise: applyRemiseMutation.mutateAsync,
    applyingRemise: applyRemiseMutation.isPending,
    applyPenalite: applyPenaliteMutation.mutateAsync,
    applyingPenalite: applyPenaliteMutation.isPending,
    recordPayment: recordPaymentMutation.mutateAsync,
    recordingPayment: recordPaymentMutation.isPending,

    createAccounting: createAccountingMutation.mutateAsync,
    creatingAccounting: createAccountingMutation.isPending,
    updateAccounting: updateAccountingMutation.mutateAsync,
    updatingAccounting: updateAccountingMutation.isPending,
    deleteAccounting: deleteAccountingMutation.mutateAsync,
    deletingAccounting: deleteAccountingMutation.isPending,
  };
};

export default useFinance;

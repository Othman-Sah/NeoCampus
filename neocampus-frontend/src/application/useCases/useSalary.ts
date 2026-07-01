import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { salaryApiService } from '@/infrastructure/api/salaryApiService'
import { Salary } from '@/domain/entities/Salary'

export const useSalary = (filters: Record<string, string> = {}) => {
  const queryClient = useQueryClient()

  // Queries
  const salariesQuery = useQuery({
    queryKey: ['salaries', filters],
    queryFn: () => salaryApiService.findAll(filters),
    placeholderData: keepPreviousData,
  })

  const mySalariesQuery = useQuery({
    queryKey: ['my-salaries'],
    queryFn: () => salaryApiService.findMySalaries(),
  })

  const useSalaryDetails = (id: number) => {
    return useQuery({
      queryKey: ['salary', id],
      queryFn: () => salaryApiService.findById(id),
      enabled: !!id && id > 0,
    })
  }

  // Mutations
  const createSalaryMutation = useMutation({
    mutationFn: (salaryData: any) => salaryApiService.create(salaryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries'] })
    },
  })

  const updateSalaryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Salary> }) =>
      salaryApiService.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['salaries'] })
      queryClient.invalidateQueries({ queryKey: ['salary', updated.id] })
      queryClient.invalidateQueries({ queryKey: ['my-salaries'] })
    },
  })

  const deleteSalaryMutation = useMutation({
    mutationFn: (id: number) => salaryApiService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries'] })
    },
  })

  return {
    salaries: salariesQuery.data ?? [],
    loadingSalaries: salariesQuery.isLoading,
    mySalaries: mySalariesQuery.data ?? [],
    loadingMySalaries: mySalariesQuery.isLoading,
    useSalaryDetails,

    createSalary: createSalaryMutation.mutateAsync,
    creatingSalary: createSalaryMutation.isPending,
    updateSalary: updateSalaryMutation.mutateAsync,
    updatingSalary: updateSalaryMutation.isPending,
    deleteSalary: deleteSalaryMutation.mutateAsync,
    deletingSalary: deleteSalaryMutation.isPending,
  }
}

export default useSalary;

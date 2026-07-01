import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { studentApiService } from '@/infrastructure/api/studentApiService'
import { Student } from '@/domain/ports/IStudentService'

export const useStudent = (filters: Record<string, string> = {}) => {
  const queryClient = useQueryClient()

  // 1. Query for searching students
  const studentsQuery = useQuery({
    queryKey: ['students', filters],
    queryFn: () => studentApiService.search(filters),
    placeholderData: keepPreviousData,
  })

  // 2. Query for a single student
  const useStudentDetails = (id: number) => {
    return useQuery({
      queryKey: ['student', id],
      queryFn: () => studentApiService.findById(id),
      enabled: !!id && id > 0,
    })
  }

  // 3. Mutation for creating a student
  const createMutation = useMutation({
    mutationFn: (studentData: Omit<Student, 'id' | 'etablissement_id'>) =>
      studentApiService.create(studentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })

  // 4. Mutation for updating a student
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Student> }) =>
      studentApiService.update(id, data),
    onSuccess: (updatedStudent) => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['student', updatedStudent.id] })
    },
  })

  // 5. Mutation for deleting a student
  const deleteMutation = useMutation({
    mutationFn: (id: number) => studentApiService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })

  return {
    students: (studentsQuery.data as Student[]) ?? [],
    loading: studentsQuery.isLoading,
    isFetching: studentsQuery.isFetching,
    error: studentsQuery.error,
    refetch: studentsQuery.refetch,
    useStudentDetails,
    createStudent: createMutation.mutateAsync,
    creating: createMutation.isPending,
    updateStudent: updateMutation.mutateAsync,
    updating: updateMutation.isPending,
    deleteStudent: deleteMutation.mutateAsync,
    deleting: deleteMutation.isPending,
    uploadAvatar: studentApiService.uploadAvatar,
    revealPassword: studentApiService.revealPassword,
    updatePassword: studentApiService.updatePassword,
  }
}

export default useStudent

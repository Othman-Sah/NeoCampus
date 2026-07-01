import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { teacherApiService } from '@/infrastructure/api/teacherApiService'

export const useTeacher = (filters: Record<string, string> = {}) => {
  const queryClient = useQueryClient()

  // Queries
  const teachersQuery = useQuery({
    queryKey: ['teachers', filters],
    queryFn: () => teacherApiService.findAll(filters),
    placeholderData: keepPreviousData,
  })

  const subjectsQuery = useQuery({
    queryKey: ['subjects'],
    queryFn: () => teacherApiService.findAllSubjects(),
  })

  const useTeacherDetails = (id: number) => {
    return useQuery({
      queryKey: ['teacher', id],
      queryFn: () => teacherApiService.findById(id),
      enabled: !!id && id > 0,
    })
  }

  // Mutations
  const createTeacherMutation = useMutation({
    mutationFn: (teacherData: any) => teacherApiService.create(teacherData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
    },
  })

  const updateTeacherMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      teacherApiService.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      queryClient.invalidateQueries({ queryKey: ['teacher', updated.id] })
    },
  })

  const deleteTeacherMutation = useMutation({
    mutationFn: (id: number) => teacherApiService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
    },
  })

  const assignMutation = useMutation({
    mutationFn: ({ teacherId, classId, subjectId }: { teacherId: number; classId: number; subjectId: number }) =>
      teacherApiService.assign(teacherId, classId, subjectId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      queryClient.invalidateQueries({ queryKey: ['teacher', variables.teacherId] })
      queryClient.invalidateQueries({ queryKey: ['classes'] })
    },
  })

  const unassignMutation = useMutation({
    mutationFn: ({ teacherId, classId, subjectId }: { teacherId: number; classId: number; subjectId: number }) =>
      teacherApiService.unassign(teacherId, classId, subjectId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      queryClient.invalidateQueries({ queryKey: ['teacher', variables.teacherId] })
      queryClient.invalidateQueries({ queryKey: ['classes'] })
    },
  })

  return {
    teachers: teachersQuery.data ?? [],
    loadingTeachers: teachersQuery.isLoading,
    subjects: subjectsQuery.data ?? [],
    loadingSubjects: subjectsQuery.isLoading,
    useTeacherDetails,

    createTeacher: createTeacherMutation.mutateAsync,
    creatingTeacher: createTeacherMutation.isPending,
    updateTeacher: updateTeacherMutation.mutateAsync,
    updatingTeacher: updateTeacherMutation.isPending,
    deleteTeacher: deleteTeacherMutation.mutateAsync,
    deletingTeacher: deleteTeacherMutation.isPending,

    assignTeacher: assignMutation.mutateAsync,
    assigningTeacher: assignMutation.isPending,
    unassignTeacher: unassignMutation.mutateAsync,
    unassigningTeacher: unassignMutation.isPending,
    revealPassword: teacherApiService.revealPassword,
    uploadAvatar: teacherApiService.uploadAvatar,
  }
}

export default useTeacher;

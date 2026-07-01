import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { seanceApiService } from '@/infrastructure/api/seanceApiService'
import { Seance } from '@/domain/entities/Seance'

export const useSeance = () => {
  const queryClient = useQueryClient()

  // Fetch timetable sessions for a class
  const useClassTimetable = (classId: number) => {
    return useQuery({
      queryKey: ['seances', 'class', classId],
      queryFn: () => seanceApiService.findAllByClass(classId),
      enabled: !!classId && classId > 0,
    })
  }

  // Fetch timetable sessions for a teacher
  const useTeacherTimetable = (teacherId: number) => {
    return useQuery({
      queryKey: ['seances', 'teacher', teacherId],
      queryFn: () => seanceApiService.findAllByTeacher(teacherId),
      enabled: !!teacherId && teacherId > 0,
    })
  }

  // Mutation for creating a session
  const createMutation = useMutation({
    mutationFn: (seanceData: Omit<Seance, 'id' | 'etablissement_id'>) =>
      seanceApiService.create(seanceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seances'] })
    },
  })

  // Mutation for updating/rescheduling a session
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Seance> }) =>
      seanceApiService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seances'] })
    },
  })

  // Mutation for deleting a session
  const deleteMutation = useMutation({
    mutationFn: (id: number) => seanceApiService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seances'] })
    },
  })

  return {
    useClassTimetable,
    useTeacherTimetable,
    createSeance: createMutation.mutateAsync,
    creating: createMutation.isPending,
    updateSeance: updateMutation.mutateAsync,
    updating: updateMutation.isPending,
    deleteSeance: deleteMutation.mutateAsync,
    deleting: deleteMutation.isPending,
  }
}

export default useSeance

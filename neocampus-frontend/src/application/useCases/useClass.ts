import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { classApiService } from '@/infrastructure/api/classApiService'
import { Class } from '@/domain/entities/Class'

export const useClass = (filters: Record<string, string> = {}) => {
  const queryClient = useQueryClient()

  // Queries
  const classesQuery = useQuery({
    queryKey: ['classes', filters],
    queryFn: () => classApiService.findAll(filters),
    placeholderData: keepPreviousData,
  })

  const sectionsQuery = useQuery({
    queryKey: ['sections'],
    queryFn: () => classApiService.findAllSections(),
  })

  const yearsQuery = useQuery({
    queryKey: ['academic-years'],
    queryFn: () => classApiService.findAllAcademicYears(),
  })

  const useClassDetails = (id: number) => {
    return useQuery({
      queryKey: ['class', id],
      queryFn: () => classApiService.findById(id),
      enabled: !!id && id > 0,
    })
  }

  // Mutations
  const createClassMutation = useMutation({
    mutationFn: (classData: Omit<Class, 'id' | 'etablissement_id'>) =>
      classApiService.create(classData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
    },
  })

  const updateClassMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Class> }) =>
      classApiService.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
      queryClient.invalidateQueries({ queryKey: ['class', updated.id] })
    },
  })

  const deleteClassMutation = useMutation({
    mutationFn: (id: number) => classApiService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
    },
  })

  const createSectionMutation = useMutation({
    mutationFn: (sectionData: { nom: string }) => classApiService.createSection(sectionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] })
    },
  })

  const deleteSectionMutation = useMutation({
    mutationFn: (id: number) => classApiService.deleteSection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] })
    },
  })

  return {
    classes: classesQuery.data ?? [],
    loadingClasses: classesQuery.isLoading,
    sections: sectionsQuery.data ?? [],
    loadingSections: sectionsQuery.isLoading,
    years: yearsQuery.data ?? [],
    loadingYears: yearsQuery.isLoading,
    useClassDetails,
    
    createClass: createClassMutation.mutateAsync,
    creatingClass: createClassMutation.isPending,
    updateClass: updateClassMutation.mutateAsync,
    updatingClass: updateClassMutation.isPending,
    deleteClass: deleteClassMutation.mutateAsync,
    deletingClass: deleteClassMutation.isPending,

    createSection: createSectionMutation.mutateAsync,
    creatingSection: createSectionMutation.isPending,
    deleteSection: deleteSectionMutation.mutateAsync,
    deletingSection: deleteSectionMutation.isPending,
  }
}

export default useClass

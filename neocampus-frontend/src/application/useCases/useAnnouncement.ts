import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { announcementApiService } from '@/infrastructure/api/announcementApiService';
import { Announcement } from '@/domain/entities/Announcement';

export const useAnnouncement = () => {
  const queryClient = useQueryClient();

  const useAnnouncements = (filters: Record<string, any> = {}) => {
    return useQuery({
      queryKey: ['announcements', filters],
      queryFn: () => announcementApiService.getAnnouncements(filters),
      placeholderData: keepPreviousData,
    });
  };

  const useAnnouncementDetails = (id: number) => {
    return useQuery({
      queryKey: ['announcement', id],
      queryFn: () => announcementApiService.getAnnouncement(id),
      enabled: !!id,
    });
  };

  const createAnnouncementMutation = useMutation({
    mutationFn: (data: Partial<Announcement>) => announcementApiService.createAnnouncement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });

  const updateAnnouncementMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Announcement> }) =>
      announcementApiService.updateAnnouncement(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['announcement', data.id] });
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: (id: number) => announcementApiService.deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });

  const togglePinMutation = useMutation({
    mutationFn: (id: number) => announcementApiService.togglePin(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['announcement', data.id] });
    },
  });

  return {
    useAnnouncements,
    useAnnouncementDetails,
    createAnnouncement: createAnnouncementMutation.mutateAsync,
    creatingAnnouncement: createAnnouncementMutation.isPending,
    updateAnnouncement: updateAnnouncementMutation.mutateAsync,
    updatingAnnouncement: updateAnnouncementMutation.isPending,
    deleteAnnouncement: deleteAnnouncementMutation.mutateAsync,
    deletingAnnouncement: deleteAnnouncementMutation.isPending,
    togglePinAnnouncement: togglePinMutation.mutateAsync,
    togglingPinAnnouncement: togglePinMutation.isPending,
  };
};

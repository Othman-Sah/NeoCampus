import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { notificationApiService } from '@/infrastructure/api/notificationApiService';

export const useNotification = () => {
  const queryClient = useQueryClient();

  const useNotifications = (filters: Record<string, any> = {}) => {
    return useQuery({
      queryKey: ['notifications', filters],
      queryFn: () => notificationApiService.getNotifications(filters),
      placeholderData: keepPreviousData,
    });
  };

  const useUnreadCount = () => {
    return useQuery({
      queryKey: ['notifications-unread-count'],
      queryFn: () => notificationApiService.getUnreadCount(),
      refetchInterval: 30000, // Poll every 30 seconds
    });
  };

  const useLatestUnread = (limit: number = 5) => {
    return useQuery({
      queryKey: ['notifications-latest', limit],
      queryFn: () => notificationApiService.getLatestUnread(limit),
      refetchInterval: 30000, // Poll every 30 seconds
    });
  };

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => notificationApiService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-latest'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationApiService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-latest'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    useNotifications,
    useUnreadCount,
    useLatestUnread,
    markAsRead: markAsReadMutation.mutateAsync,
    markingAsRead: markAsReadMutation.isPending,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    markingAllAsRead: markAllAsReadMutation.isPending,
  };
};

import { useQuery } from '@tanstack/react-query';
import { parentPortalApiService } from '@/infrastructure/api/parentPortalApiService';

export const useChildren = () => {
  return useQuery({
    queryKey: ['parent', 'children'],
    queryFn: () => parentPortalApiService.getChildren(),
  });
};

export const useChildGrades = (childId: number) => {
  return useQuery({
    queryKey: ['parent', 'grades', childId],
    queryFn: () => parentPortalApiService.getChildGrades(childId),
    enabled: !!childId,
  });
};

export const useChildAttendance = (childId: number, params?: { start_date?: string; end_date?: string }) => {
  return useQuery({
    queryKey: ['parent', 'attendance', childId, params],
    queryFn: () => parentPortalApiService.getChildAttendance(childId, params),
    enabled: !!childId,
  });
};

export const useChildTimetable = (childId: number) => {
  return useQuery({
    queryKey: ['parent', 'timetable', childId],
    queryFn: () => parentPortalApiService.getChildTimetable(childId),
    enabled: !!childId,
  });
};

export const useChildBalance = (childId: number) => {
  return useQuery({
    queryKey: ['parent', 'balance', childId],
    queryFn: () => parentPortalApiService.getChildBalance(childId),
    enabled: !!childId,
  });
};

export const useChildBulletins = (childId: number) => {
  return useQuery({
    queryKey: ['parent', 'bulletins', childId],
    queryFn: () => parentPortalApiService.getChildBulletins(childId),
    enabled: !!childId,
  });
};

export const useChildLoans = (childId: number) => {
  return useQuery({
    queryKey: ['parent', 'loans', childId],
    queryFn: () => parentPortalApiService.getChildLoans(childId),
    enabled: !!childId,
  });
};

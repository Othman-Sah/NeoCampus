import { useQuery } from '@tanstack/react-query';
import { studentPortalApiService } from '@/infrastructure/api/studentPortalApiService';

export const useStudentDashboard = () => {
  return useQuery({
    queryKey: ['student', 'dashboard'],
    queryFn: () => studentPortalApiService.getDashboard(),
  });
};

export const useMyGrades = () => {
  return useQuery({
    queryKey: ['student', 'grades'],
    queryFn: () => studentPortalApiService.getMyGrades(),
  });
};

export const useMyAttendance = (params?: { start_date?: string; end_date?: string }) => {
  return useQuery({
    queryKey: ['student', 'attendance', params],
    queryFn: () => studentPortalApiService.getMyAttendance(params),
  });
};

export const useMyTimetable = () => {
  return useQuery({
    queryKey: ['student', 'timetable'],
    queryFn: () => studentPortalApiService.getMyTimetable(),
  });
};

export const useMySupports = () => {
  return useQuery({
    queryKey: ['student', 'supports'],
    queryFn: () => studentPortalApiService.getMySupports(),
  });
};

export const useMyHomework = () => {
  return useQuery({
    queryKey: ['student', 'homework'],
    queryFn: () => studentPortalApiService.getMyHomework(),
  });
};

export const useMyLoans = () => {
  return useQuery({
    queryKey: ['student', 'loans'],
    queryFn: () => studentPortalApiService.getMyLoans(),
  });
};

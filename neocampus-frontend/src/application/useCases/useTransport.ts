import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { transportApiService } from '@/infrastructure/api/transportApiService';
import { Vehicle } from '@/domain/entities/Vehicle';
import { Driver } from '@/domain/entities/Driver';
import { TransportRoute } from '@/domain/entities/TransportRoute';

export const useTransport = () => {
  const queryClient = useQueryClient();

  // --- Vehicles Hooks ---
  const useVehicles = (filters: Record<string, any> = {}) => {
    return useQuery({
      queryKey: ['vehicles', filters],
      queryFn: () => transportApiService.listVehicles(filters),
      placeholderData: keepPreviousData,
    });
  };

  const useVehicle = (id: number) => {
    return useQuery({
      queryKey: ['vehicle', id],
      queryFn: () => transportApiService.getVehicle(id),
      enabled: !!id,
    });
  };

  const createVehicleMutation = useMutation({
    mutationFn: (data: Partial<Vehicle>) => transportApiService.createVehicle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });

  const updateVehicleMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Vehicle> }) =>
      transportApiService.updateVehicle(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle', data.id] });
    },
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: (id: number) => transportApiService.deleteVehicle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });

  // --- Drivers Hooks ---
  const useDrivers = (filters: Record<string, any> = {}) => {
    return useQuery({
      queryKey: ['drivers', filters],
      queryFn: () => transportApiService.listDrivers(filters),
      placeholderData: keepPreviousData,
    });
  };

  const useAvailableDrivers = () => {
    return useQuery({
      queryKey: ['available-drivers'],
      queryFn: () => transportApiService.getAvailableDrivers(),
    });
  };

  const useDriver = (id: number) => {
    return useQuery({
      queryKey: ['driver', id],
      queryFn: () => transportApiService.getDriver(id),
      enabled: !!id,
    });
  };

  const createDriverMutation = useMutation({
    mutationFn: (data: Partial<Driver>) => transportApiService.createDriver(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['available-drivers'] });
    },
  });

  const updateDriverMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Driver> }) =>
      transportApiService.updateDriver(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['driver', data.id] });
      queryClient.invalidateQueries({ queryKey: ['available-drivers'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] }); // Invalidate vehicles since driver vehicle changed
    },
  });

  const deleteDriverMutation = useMutation({
    mutationFn: (id: number) => transportApiService.deleteDriver(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['available-drivers'] });
    },
  });

  // --- Routes Hooks ---
  const useRoutes = (filters: Record<string, any> = {}) => {
    return useQuery({
      queryKey: ['routes', filters],
      queryFn: () => transportApiService.listRoutes(filters),
      placeholderData: keepPreviousData,
    });
  };

  const useRoute = (id: number) => {
    return useQuery({
      queryKey: ['route', id],
      queryFn: () => transportApiService.getRoute(id),
      enabled: !!id,
    });
  };

  const createRouteMutation = useMutation({
    mutationFn: (data: Partial<TransportRoute>) => transportApiService.createRoute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });

  const updateRouteMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TransportRoute> }) =>
      transportApiService.updateRoute(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      queryClient.invalidateQueries({ queryKey: ['route', data.id] });
    },
  });

  const deleteRouteMutation = useMutation({
    mutationFn: (id: number) => transportApiService.deleteRoute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });

  // --- Assignments Hooks ---
  const assignStudentsMutation = useMutation({
    mutationFn: ({ routeId, assignments }: { routeId: number; assignments: any[] }) =>
      transportApiService.assignStudents(routeId, assignments),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      queryClient.invalidateQueries({ queryKey: ['route', variables.routeId] });
    },
  });

  const removeStudentMutation = useMutation({
    mutationFn: ({ routeId, studentId }: { routeId: number; studentId: number }) =>
      transportApiService.removeStudent(routeId, studentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      queryClient.invalidateQueries({ queryKey: ['route', variables.routeId] });
    },
  });

  // --- Driver Console Query ---
  const useDriverRoute = () => {
    return useQuery({
      queryKey: ['driver-route'],
      queryFn: () => transportApiService.getDriverRoute(),
      refetchInterval: 60000, // Refresh driver screen every minute
    });
  };

  // --- Student-specific Transport Route Hooks ---
  const useStudentRoute = (studentId: number) => {
    return useQuery({
      queryKey: ['student-route', studentId],
      queryFn: () => transportApiService.getStudentRoute(studentId),
      enabled: !!studentId,
    });
  };

  const saveStudentRouteMutation = useMutation({
    mutationFn: ({ studentId, data }: { studentId: number; data: { itineraire_id: number | null; point_ramassage: string | null; latitude: number | null; longitude: number | null } }) =>
      transportApiService.saveStudentRoute(studentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-route', variables.studentId] });
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      queryClient.invalidateQueries({ queryKey: ['route'] });
    },
  });

  return {
    useVehicles,
    useVehicle,
    createVehicle: createVehicleMutation.mutateAsync,
    creatingVehicle: createVehicleMutation.isPending,
    updateVehicle: updateVehicleMutation.mutateAsync,
    updatingVehicle: updateVehicleMutation.isPending,
    deleteVehicle: deleteVehicleMutation.mutateAsync,
    deletingVehicle: deleteVehicleMutation.isPending,

    useDrivers,
    useAvailableDrivers,
    useDriver,
    createDriver: createDriverMutation.mutateAsync,
    creatingDriver: createDriverMutation.isPending,
    updateDriver: updateDriverMutation.mutateAsync,
    updatingDriver: updateDriverMutation.isPending,
    deleteDriver: deleteDriverMutation.mutateAsync,
    deletingDriver: deleteDriverMutation.isPending,

    useRoutes,
    useRoute,
    createRoute: createRouteMutation.mutateAsync,
    creatingRoute: createRouteMutation.isPending,
    updateRoute: updateRouteMutation.mutateAsync,
    updatingRoute: updateRouteMutation.isPending,
    deleteRoute: deleteRouteMutation.mutateAsync,
    deletingRoute: deleteRouteMutation.isPending,

    assignStudents: assignStudentsMutation.mutateAsync,
    assigningStudents: assignStudentsMutation.isPending,
    removeStudent: removeStudentMutation.mutateAsync,
    removingStudent: removeStudentMutation.isPending,

    useDriverRoute,
    useStudentRoute,
    saveStudentRoute: saveStudentRouteMutation.mutateAsync,
    savingStudentRoute: saveStudentRouteMutation.isPending,
  };
};

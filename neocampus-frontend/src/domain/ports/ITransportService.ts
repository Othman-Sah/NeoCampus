import { Vehicle } from '../entities/Vehicle';
import { Driver } from '../entities/Driver';
import { TransportRoute } from '../entities/TransportRoute';

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
    per_page?: number;
  };
}

export interface ITransportService {
  // Vehicles
  listVehicles(params?: Record<string, any>): Promise<PaginatedResponse<Vehicle>>;
  getVehicle(id: number): Promise<Vehicle>;
  createVehicle(data: Partial<Vehicle>): Promise<Vehicle>;
  updateVehicle(id: number, data: Partial<Vehicle>): Promise<Vehicle>;
  deleteVehicle(id: number): Promise<void>;
  
  // Drivers
  listDrivers(params?: Record<string, any>): Promise<PaginatedResponse<Driver>>;
  getAvailableDrivers(): Promise<Driver[]>;
  getDriver(id: number): Promise<Driver>;
  createDriver(data: Partial<Driver>): Promise<Driver>;
  updateDriver(id: number, data: Partial<Driver>): Promise<Driver>;
  deleteDriver(id: number): Promise<void>;
  
  // Routes
  listRoutes(params?: Record<string, any>): Promise<PaginatedResponse<TransportRoute>>;
  getRoute(id: number): Promise<TransportRoute>;
  createRoute(data: Partial<TransportRoute>): Promise<TransportRoute>;
  updateRoute(id: number, data: Partial<TransportRoute>): Promise<TransportRoute>;
  deleteRoute(id: number): Promise<void>;
  
  // Student assignment
  assignStudents(routeId: number, assignments: { eleve_id: number; point_ramassage?: string; latitude?: number; longitude?: number }[]): Promise<void>;
  removeStudent(routeId: number, studentId: number): Promise<void>;
  
  // Driver queries
  getDriverRoute(): Promise<TransportRoute | null>;

  // Student specific transport routes
  getStudentRoute(studentId: number): Promise<{ route_id: number; nom: string; zone: string; point_ramassage: string; latitude: number | null; longitude: number | null } | null>;
  saveStudentRoute(studentId: number, data: { itineraire_id: number | null; point_ramassage: string | null; latitude: number | null; longitude: number | null }): Promise<void>;
}

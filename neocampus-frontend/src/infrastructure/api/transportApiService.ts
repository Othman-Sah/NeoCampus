import { axiosClient } from './axiosClient';
import { ITransportService, PaginatedResponse } from '../../domain/ports/ITransportService';
import { Vehicle } from '../../domain/entities/Vehicle';
import { Driver } from '../../domain/entities/Driver';
import { TransportRoute } from '../../domain/entities/TransportRoute';

export const transportApiService: ITransportService = {
  // Vehicles
  async listVehicles(params) {
    const response = await axiosClient.get('/transport/vehicules', { params });
    return {
      data: response.data.data,
      meta: response.data.meta || { current_page: 1, last_page: 1, total: response.data.data?.length || 0 }
    };
  },

  async getVehicle(id) {
    const response = await axiosClient.get(`/transport/vehicules/${id}`);
    return response.data.data;
  },

  async createVehicle(data) {
    const response = await axiosClient.post('/transport/vehicules', data);
    return response.data.data;
  },

  async updateVehicle(id, data) {
    const response = await axiosClient.put(`/transport/vehicules/${id}`, data);
    return response.data.data;
  },

  async deleteVehicle(id) {
    await axiosClient.delete(`/transport/vehicules/${id}`);
  },

  // Drivers
  async listDrivers(params) {
    const response = await axiosClient.get('/transport/chauffeurs', { params });
    return {
      data: response.data.data,
      meta: response.data.meta || { current_page: 1, last_page: 1, total: response.data.data?.length || 0 }
    };
  },

  async getAvailableDrivers() {
    const response = await axiosClient.get('/transport/chauffeurs/available');
    return response.data.data;
  },

  async getDriver(id) {
    const response = await axiosClient.get(`/transport/chauffeurs/${id}`);
    return response.data.data;
  },

  async createDriver(data) {
    const response = await axiosClient.post('/transport/chauffeurs', data);
    return response.data.data;
  },

  async updateDriver(id, data) {
    const response = await axiosClient.put(`/transport/chauffeurs/${id}`, data);
    return response.data.data;
  },

  async deleteDriver(id) {
    await axiosClient.delete(`/transport/chauffeurs/${id}`);
  },

  // Routes
  async listRoutes(params) {
    const response = await axiosClient.get('/transport/itineraires', { params });
    return {
      data: response.data.data,
      meta: response.data.meta || { current_page: 1, last_page: 1, total: response.data.data?.length || 0 }
    };
  },

  async getRoute(id) {
    const response = await axiosClient.get(`/transport/itineraires/${id}`);
    return response.data.data;
  },

  async createRoute(data) {
    const response = await axiosClient.post('/transport/itineraires', data);
    return response.data.data;
  },

  async updateRoute(id, data) {
    const response = await axiosClient.put(`/transport/itineraires/${id}`, data);
    return response.data.data;
  },

  async deleteRoute(id) {
    await axiosClient.delete(`/transport/itineraires/${id}`);
  },

  // Student assignment
  async assignStudents(routeId, assignments) {
    await axiosClient.post(`/transport/itineraires/${routeId}/assign`, { assignments });
  },

  async removeStudent(routeId, studentId) {
    await axiosClient.delete(`/transport/itineraires/${routeId}/students/${studentId}`);
  },

  // Driver queries
  async getDriverRoute() {
    const response = await axiosClient.get('/transport/driver-route');
    return response.data.data;
  },

  // Student specific transport routes
  async getStudentRoute(studentId) {
    const response = await axiosClient.get(`/transport/students/${studentId}/route`);
    return response.data.data;
  },

  async saveStudentRoute(studentId, data) {
    await axiosClient.post(`/transport/students/${studentId}/route`, data);
  }
};

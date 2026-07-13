import { axiosClient } from './axiosClient';
import { IStudentPortalService } from '../../domain/ports/IStudentPortalService';

export const studentPortalApiService: IStudentPortalService = {
  async getDashboard() {
    const response = await axiosClient.get('/student/dashboard');
    return response.data.data;
  },

  async getMyGrades() {
    const response = await axiosClient.get('/student/notes');
    return response.data.data;
  },

  async getMyAttendance(params) {
    const response = await axiosClient.get('/student/presences', { params });
    return response.data.data;
  },

  async getMyTimetable() {
    const response = await axiosClient.get('/student/emploi-du-temps');
    return response.data.data;
  },

  async getMySupports() {
    const response = await axiosClient.get('/student/supports');
    return response.data.data;
  },

  async getMyHomework() {
    const response = await axiosClient.get('/student/devoirs');
    return response.data.data;
  },

  async getMyLoans() {
    const response = await axiosClient.get('/student/livres');
    return response.data.data;
  }
};

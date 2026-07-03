import { axiosClient } from './axiosClient';
import { ILibraryService } from '../../domain/ports/ILibraryService';

export const libraryApiService: ILibraryService = {
  async getBooks(params) {
    const response = await axiosClient.get('/v1/library/books', { params });
    return {
      data: response.data.data,
      meta: response.data.meta || { current_page: 1, last_page: 1, total: response.data.data?.length || 0 }
    };
  },

  async createBook(book) {
    const response = await axiosClient.post('/v1/library/books', book);
    return response.data.data;
  },

  async updateBook(id, book) {
    const response = await axiosClient.put(`/v1/library/books/${id}`, book);
    return response.data.data;
  },

  async deleteBook(id) {
    await axiosClient.delete(`/v1/library/books/${id}`);
  },

  async getLoans(params) {
    const response = await axiosClient.get('/v1/library/loans', { params });
    return {
      data: response.data.data,
      meta: response.data.meta || { current_page: 1, last_page: 1, total: response.data.data?.length || 0 }
    };
  },

  async createLoan(livreId, adherentId) {
    const response = await axiosClient.post('/v1/library/loans', {
      livre_id: livreId,
      adherent_id: adherentId
    });
    return response.data.data;
  },

  async returnLoan(id) {
    const response = await axiosClient.put(`/v1/library/loans/${id}/return`);
    return response.data.data;
  },

  async getOverdueLoans(params) {
    const response = await axiosClient.get('/v1/library/overdue', { params });
    return {
      data: response.data.data,
      meta: response.data.meta || { current_page: 1, last_page: 1, total: response.data.data?.length || 0 }
    };
  },

  async getStats() {
    const response = await axiosClient.get('/v1/library/stats');
    return response.data;
  },

  async searchMembers(q) {
    const response = await axiosClient.get('/v1/library/members', { params: { q } });
    return response.data.data;
  }
};

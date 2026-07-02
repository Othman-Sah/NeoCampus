import { axiosClient } from './axiosClient';
import { IBulletinService } from '../../domain/ports/IBulletinService';
import { Bulletin } from '../../domain/entities/Bulletin';

export const bulletinApiService: IBulletinService = {
  async generateBulk(classeId, periode) {
    const response = await axiosClient.post('/bulletins/generate', { classe_id: classeId, periode });
    return response.data.data;
  }
};

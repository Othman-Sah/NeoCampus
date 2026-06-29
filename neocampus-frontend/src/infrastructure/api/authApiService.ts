import { IAuthService, LoginResponse } from '@/domain/ports/IAuthService'
import { User } from '@/domain/entities/User'
import { axiosClient } from './axiosClient'

export const authApiService: IAuthService = {
  async login(email, password): Promise<LoginResponse> {
    const response = await axiosClient.post<LoginResponse>('/auth/login', { email, password })
    return response.data
  },

  async logout(): Promise<void> {
    await axiosClient.post('/auth/logout')
  },

  async me(): Promise<User> {
    const response = await axiosClient.get<User>('/auth/me')
    return response.data
  },
}

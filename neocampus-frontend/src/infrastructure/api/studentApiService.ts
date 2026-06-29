import { IStudentService, Student } from '@/domain/ports/IStudentService'
import { axiosClient } from './axiosClient'

export const studentApiService: IStudentService = {
  async findById(id: number): Promise<Student> {
    const response = await axiosClient.get<Student>(`/admin/eleves/${id}`)
    return response.data
  },

  async findAllByClasse(classeId: number): Promise<Student[]> {
    const response = await axiosClient.get<Student[]>(`/admin/eleves`, {
      params: { classe_id: classeId },
    })
    return response.data
  },

  async create(studentData: Omit<Student, 'id'>): Promise<Student> {
    const response = await axiosClient.post<Student>(`/admin/eleves`, studentData)
    return response.data
  },

  async update(id: number, studentData: Partial<Student>): Promise<Student> {
    const response = await axiosClient.put<Student>(`/admin/eleves/${id}`, studentData)
    return response.data
  },

  async delete(id: number): Promise<void> {
    await axiosClient.delete(`/admin/eleves/${id}`)
  },

  async search(filters: Record<string, string>): Promise<Student[]> {
    const response = await axiosClient.get<Student[]>(`/admin/eleves`, {
      params: filters,
    })
    return response.data
  },
}

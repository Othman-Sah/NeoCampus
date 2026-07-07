import { IClassService } from '@/domain/ports/IClassService'
import { Class, ClassMatiereAssignment } from '@/domain/entities/Class'
import { Section } from '@/domain/entities/Section'
import { axiosClient } from './axiosClient'

const CLASSES_STORAGE_KEY = 'neocampus_classes_db'
const SECTIONS_STORAGE_KEY = 'neocampus_sections_db'
const YEARS_STORAGE_KEY = 'neocampus_years_db'

const getLocalSections = (): Section[] => {
  const data = localStorage.getItem(SECTIONS_STORAGE_KEY)
  if (data) return JSON.parse(data)
  const initial = [
    { id: 1, nom: 'Primaire', etablissement_id: 1 },
    { id: 2, nom: 'Collège', etablissement_id: 1 },
    { id: 3, nom: 'Lycée', etablissement_id: 1 },
  ]
  localStorage.setItem(SECTIONS_STORAGE_KEY, JSON.stringify(initial))
  return initial
}

const getLocalClasses = (): Class[] => {
  const data = localStorage.getItem(CLASSES_STORAGE_KEY)
  if (data) return JSON.parse(data)
  const initial = [
    { id: 1, nom: 'CM1-A', niveau: 'CM1', section_id: 1, annee_scolaire_id: 1, etablissement_id: 1, students_count: 12, teachers_count: 2 },
    { id: 2, nom: 'CM2-B', niveau: 'CM2', section_id: 1, annee_scolaire_id: 1, etablissement_id: 1, students_count: 13, teachers_count: 2 },
    { id: 3, nom: '6ème-A', niveau: '6ème', section_id: 2, annee_scolaire_id: 1, etablissement_id: 1, students_count: 6, teachers_count: 3 },
    { id: 4, nom: '5ème-B', niveau: '5ème', section_id: 2, annee_scolaire_id: 1, etablissement_id: 1, students_count: 6, teachers_count: 2 },
    { id: 5, nom: '4ème-A', niveau: '4ème', section_id: 2, annee_scolaire_id: 1, etablissement_id: 1, students_count: 6, teachers_count: 2 },
    { id: 6, nom: '3ème-B', niveau: '3ème', section_id: 2, annee_scolaire_id: 1, etablissement_id: 1, students_count: 6, teachers_count: 3 },
    { id: 7, nom: 'Seconde-A', niveau: 'Seconde', section_id: 3, annee_scolaire_id: 1, etablissement_id: 1, students_count: 1, teachers_count: 2 },
    { id: 8, nom: 'Terminale-C', niveau: 'Terminale', section_id: 3, annee_scolaire_id: 1, etablissement_id: 1, students_count: 0, teachers_count: 2 },
  ]
  localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(initial))
  return initial
}

const getLocalYears = (): any[] => {
  const data = localStorage.getItem(YEARS_STORAGE_KEY)
  if (data) return JSON.parse(data)
  const initial = [
    { id: 1, libelle: '2025/2026', date_debut: '2025-09-01', date_fin: '2026-06-30', etablissement_id: 1 },
    { id: 2, libelle: '2026/2027', date_debut: '2026-09-01', date_fin: '2027-06-30', etablissement_id: 1 },
  ]
  localStorage.setItem(YEARS_STORAGE_KEY, JSON.stringify(initial))
  return initial
}

export const classApiService: IClassService = {
  async findById(id: number): Promise<Class> {
    try {
      const response = await axiosClient.get<{ data: Class }>(`/admin/classes/${id}`)
      return response.data.data
    } catch (err: any) {
      if (!err.response) {
        const local = getLocalClasses()
        const c = local.find(item => item.id === id)
        if (c) return c
        throw new Error('Class not found locally')
      }
      throw err;
    }
  },

  async findAll(filters?: Record<string, string>): Promise<Class[]> {
    try {
      const response = await axiosClient.get<{ data: Class[] }>(`/admin/classes`, { params: filters })
      return response.data.data
    } catch (err: any) {
      if (!err.response) {
        let result = getLocalClasses()
        if (filters?.section_id) {
          result = result.filter(c => c.section_id === parseInt(filters.section_id))
        }
        if (filters?.annee_scolaire_id) {
          result = result.filter(c => c.annee_scolaire_id === parseInt(filters.annee_scolaire_id))
        }
        if (filters?.search) {
          const q = filters.search.toLowerCase()
          result = result.filter(c => c.nom.toLowerCase().includes(q))
        }
        return result
      }
      throw err;
    }
  },

  async create(classData: Omit<Class, 'id' | 'etablissement_id'>): Promise<Class> {
    try {
      const response = await axiosClient.post<{ data: Class }>(`/admin/classes`, classData)
      return response.data.data
    } catch (err: any) {
      if (!err.response) {
        const local = getLocalClasses()
        const maxId = local.reduce((max, c) => c.id > max ? c.id : max, 0)
        const newClass: Class = {
          ...classData,
          id: maxId + 1,
          etablissement_id: 1,
          students_count: 0,
          teachers_count: 0,
        }
        local.push(newClass)
        localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(local))
        return newClass
      }
      throw err;
    }
  },

  async update(id: number, classData: Partial<Class>): Promise<Class> {
    try {
      const response = await axiosClient.put<{ data: Class }>(`/admin/classes/${id}`, classData)
      return response.data.data
    } catch (err: any) {
      if (!err.response) {
        const local = getLocalClasses()
        const index = local.findIndex(c => c.id === id)
        if (index === -1) throw new Error('Class not found')
        const updated = { ...local[index], ...classData }
        local[index] = updated
        localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(local))
        return updated
      }
      throw err;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await axiosClient.delete(`/admin/classes/${id}`)
    } catch (err: any) {
      if (!err.response) {
        const local = getLocalClasses()
        const filtered = local.filter(c => c.id !== id)
        localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(filtered))
        return
      }
      throw err;
    }
  },

  async findAllSections(): Promise<Section[]> {
    try {
      const response = await axiosClient.get<{ data: Section[] }>(`/admin/sections`)
      return response.data.data
    } catch (err: any) {
      if (!err.response) {
        return getLocalSections()
      }
      throw err;
    }
  },

  async createSection(sectionData: { nom: string }): Promise<Section> {
    try {
      const response = await axiosClient.post<{ data: Section }>(`/admin/sections`, sectionData)
      return response.data.data
    } catch (err: any) {
      if (!err.response) {
        const local = getLocalSections()
        const maxId = local.reduce((max, s) => s.id > max ? s.id : max, 0)
        const newSec = { id: maxId + 1, nom: sectionData.nom, etablissement_id: 1 }
        local.push(newSec)
        localStorage.setItem(SECTIONS_STORAGE_KEY, JSON.stringify(local))
        return newSec
      }
      throw err;
    }
  },

  async deleteSection(id: number): Promise<void> {
    try {
      await axiosClient.delete(`/admin/sections/${id}`)
    } catch (err: any) {
      if (!err.response) {
        const local = getLocalSections()
        const filtered = local.filter(s => s.id !== id)
        localStorage.setItem(SECTIONS_STORAGE_KEY, JSON.stringify(filtered))
        return
      }
      throw err;
    }
  },

  async findAllAcademicYears(): Promise<any[]> {
    try {
      const response = await axiosClient.get<{ data: any[] }>(`/admin/academic-years`)
      return response.data.data
    } catch (err: any) {
      if (!err.response) {
        return getLocalYears()
      }
      throw err;
    }
  },

  async getClassMatieres(classeId: number): Promise<ClassMatiereAssignment[]> {
    const response = await axiosClient.get<{ data: ClassMatiereAssignment[] }>(`/admin/classes/${classeId}/matieres`);
    return response.data.data;
  },

  async addMatiereToClass(classeId: number, matiereId: number): Promise<void> {
    await axiosClient.post(`/admin/classes/${classeId}/matieres`, { matiere_id: matiereId });
  },

  async removeMatiereFromClass(classeId: number, matiereId: number): Promise<void> {
    await axiosClient.delete(`/admin/classes/${classeId}/matieres/${matiereId}`);
  },

  async assignTeacherToMatiere(classeId: number, matiereId: number, enseignantId: number): Promise<void> {
    await axiosClient.put(`/admin/classes/${classeId}/matieres/${matiereId}/enseignant`, { enseignant_id: enseignantId });
  },

  async setClassMatiereCoefficient(classeId: number, matiereId: number, coefficient: number): Promise<void> {
    await axiosClient.put(`/admin/classes/${classeId}/matieres/${matiereId}/coefficient`, { coefficient });
  },

  async getMatieresWithEnseignants(classeId: number): Promise<any[]> {
    const response = await axiosClient.get<{ data: any[] }>(`/admin/classes/${classeId}/matieres-with-enseignants`);
    return response.data.data;
  }
}

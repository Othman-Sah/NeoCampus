import { ISeanceService } from '@/domain/ports/ISeanceService'
import { Seance } from '@/domain/entities/Seance'
import { axiosClient } from './axiosClient'

const SEANCES_STORAGE_KEY = 'neocampus_seances_db'

const getLocalSeances = (): Seance[] => {
  const data = localStorage.getItem(SEANCES_STORAGE_KEY)
  if (data) return JSON.parse(data)

  // Seed default mock timetable sessions for offline demo
  // We'll distribute these sessions across different days and hours for classes
  const initial: Seance[] = [
    // Class 1 (CM1-A)
    { id: 1, jour: 'Lundi', heure_debut: '08:00', heure_fin: '09:00', classe_id: 1, classe_nom: 'CM1-A', enseignant_id: 1, enseignant_nom: 'Mohamed Alaoui', matiere_id: 1, matiere_nom: 'Mathématiques', matiere_intitule: 'Mathématiques', etablissement_id: 1 },
    { id: 2, jour: 'Lundi', heure_debut: '10:00', heure_fin: '11:00', classe_id: 1, classe_nom: 'CM1-A', enseignant_id: 2, enseignant_nom: 'Aicha El Idrissi', matiere_id: 2, matiere_nom: 'Physique-Chimie', matiere_intitule: 'Physique-Chimie', etablissement_id: 1 },
    { id: 3, jour: 'Mardi', heure_debut: '09:00', heure_fin: '10:00', classe_id: 1, classe_nom: 'CM1-A', enseignant_id: 3, enseignant_nom: 'Youssef Benjelloun', matiere_id: 3, matiere_nom: 'Français', matiere_intitule: 'Français', etablissement_id: 1 },
    { id: 4, jour: 'Mercredi', heure_debut: '11:00', heure_fin: '12:00', classe_id: 1, classe_nom: 'CM1-A', enseignant_id: 4, enseignant_nom: 'Khadija Tazi', matiere_id: 4, matiere_nom: 'Anglais', matiere_intitule: 'Anglais', etablissement_id: 1 },
    { id: 5, jour: 'Jeudi', heure_debut: '14:00', heure_fin: '15:00', classe_id: 1, classe_nom: 'CM1-A', enseignant_id: 5, enseignant_nom: 'Omar Amrani', matiere_id: 5, matiere_nom: 'Histoire-Géographie', matiere_intitule: 'Histoire-Géographie', etablissement_id: 1 },
    { id: 6, jour: 'Vendredi', heure_debut: '08:00', heure_fin: '09:00', classe_id: 1, classe_nom: 'CM1-A', enseignant_id: 1, enseignant_nom: 'Mohamed Alaoui', matiere_id: 1, matiere_nom: 'Mathématiques', matiere_intitule: 'Mathématiques', etablissement_id: 1 },

    // Class 2 (CM2-B)
    { id: 7, jour: 'Lundi', heure_debut: '09:00', heure_fin: '10:00', classe_id: 2, classe_nom: 'CM2-B', enseignant_id: 2, enseignant_nom: 'Aicha El Idrissi', matiere_id: 2, matiere_nom: 'Physique-Chimie', matiere_intitule: 'Physique-Chimie', etablissement_id: 1 },
    { id: 8, jour: 'Mardi', heure_debut: '11:00', heure_fin: '12:00', classe_id: 2, classe_nom: 'CM2-B', enseignant_id: 1, enseignant_nom: 'Mohamed Alaoui', matiere_id: 1, matiere_nom: 'Mathématiques', matiere_intitule: 'Mathématiques', etablissement_id: 1 },
    { id: 9, jour: 'Mercredi', heure_debut: '14:00', heure_fin: '15:00', classe_id: 2, classe_nom: 'CM2-B', enseignant_id: 3, enseignant_nom: 'Youssef Benjelloun', matiere_id: 3, matiere_nom: 'Français', matiere_intitule: 'Français', etablissement_id: 1 },
    
    // Class 3 (6ème-A)
    { id: 10, jour: 'Lundi', heure_debut: '14:00', heure_fin: '15:00', classe_id: 3, classe_nom: '6ème-A', enseignant_id: 3, enseignant_nom: 'Youssef Benjelloun', matiere_id: 3, matiere_nom: 'Français', matiere_intitule: 'Français', etablissement_id: 1 },
    { id: 11, jour: 'Mardi', heure_debut: '08:00', heure_fin: '09:00', classe_id: 3, classe_nom: '6ème-A', enseignant_id: 4, enseignant_nom: 'Khadija Tazi', matiere_id: 4, matiere_nom: 'Anglais', matiere_intitule: 'Anglais', etablissement_id: 1 },
    { id: 12, jour: 'Jeudi', heure_debut: '10:00', heure_fin: '11:00', classe_id: 3, classe_nom: '6ème-A', enseignant_id: 1, enseignant_nom: 'Mohamed Alaoui', matiere_id: 1, matiere_nom: 'Mathématiques', matiere_intitule: 'Mathématiques', etablissement_id: 1 }
  ]
  localStorage.setItem(SEANCES_STORAGE_KEY, JSON.stringify(initial))
  return initial
}

const saveLocalSeances = (seances: Seance[]) => {
  localStorage.setItem(SEANCES_STORAGE_KEY, JSON.stringify(seances))
}

export const seanceApiService: ISeanceService = {
  async findAllByClass(classId: number): Promise<Seance[]> {
    try {
      const response = await axiosClient.get<{ data: Seance[] }>(`/classes/${classId}/seances`)
      return response.data.data
    } catch (err: any) {
      if (!err.response) {
        console.warn('Backend API offline. Fetching class timetable from local storage.')
        const local = getLocalSeances()
        return local.filter(s => s.classe_id === classId)
      }
      throw err;
    }
  },

  async findAllByTeacher(teacherId: number): Promise<Seance[]> {
    try {
      const response = await axiosClient.get<{ data: Seance[] }>(`/enseignants/${teacherId}/seances`)
      return response.data.data
    } catch (err: any) {
      if (!err.response) {
        console.warn('Backend API offline. Fetching teacher timetable from local storage.')
        const local = getLocalSeances()
        return local.filter(s => s.enseignant_id === teacherId)
      }
      throw err;
    }
  },

  async create(seanceData: Omit<Seance, 'id' | 'etablissement_id'>): Promise<Seance> {
    try {
      const response = await axiosClient.post<{ data: Seance }>(`/seances`, seanceData)
      const resData = response.data as any
      return resData && resData.data ? resData.data : resData
    } catch (err: any) {
      if (!err.response) {
        // Local validation of conflict
        const local = getLocalSeances()
        const conflict = local.some(s => 
          s.jour === seanceData.jour &&
          ((seanceData.heure_debut < s.heure_fin && seanceData.heure_fin > s.heure_debut)) &&
          (s.classe_id === seanceData.classe_id || s.enseignant_id === seanceData.enseignant_id)
        )

        if (conflict) {
          const errorResponse = {
            response: {
              status: 422,
              data: {
                errors: {
                  conflict: ['A conflict was detected: teacher or class is already scheduled during this slot.']
                }
              }
            }
          }
          return Promise.reject(errorResponse)
        }

        const maxId = local.reduce((max, s) => s.id > max ? s.id : max, 0)
        const newSeance: Seance = {
          ...seanceData,
          id: maxId + 1,
          etablissement_id: 1
        }
        local.push(newSeance)
        saveLocalSeances(local)
        return newSeance
      }
      throw err;
    }
  },

  async update(id: number, seanceData: Partial<Seance>): Promise<Seance> {
    try {
      const response = await axiosClient.put<{ data: Seance }>(`/seances/${id}`, seanceData)
      const resData = response.data as any
      return resData && resData.data ? resData.data : resData
    } catch (err: any) {
      if (!err.response) {
        const local = getLocalSeances()
        const index = local.findIndex(s => s.id === id)
        if (index === -1) {
          throw new Error('Timetable session not found')
        }

        const current = local[index]
        const merged = { ...current, ...seanceData }

        // Local validation of conflict (excluding the current session)
        const conflict = local.some(s => 
          s.id !== id &&
          s.jour === merged.jour &&
          ((merged.heure_debut < s.heure_fin && merged.heure_fin > s.heure_debut)) &&
          (s.classe_id === merged.classe_id || s.enseignant_id === merged.enseignant_id)
        )

        if (conflict) {
          const errorResponse = {
            response: {
              status: 422,
              data: {
                errors: {
                  conflict: ['A conflict was detected: teacher or class is already scheduled during this slot.']
                }
              }
            }
          }
          return Promise.reject(errorResponse)
        }

        local[index] = merged
        saveLocalSeances(local)
        return merged
      }
      throw err;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await axiosClient.delete(`/seances/${id}`)
    } catch (err: any) {
      if (!err.response) {
        const local = getLocalSeances()
        const filtered = local.filter(s => s.id !== id)
        saveLocalSeances(filtered)
        return
      }
      throw err;
    }
  }
}

import { ITeacherService } from '@/domain/ports/ITeacherService'
import { Teacher } from '@/domain/entities/Teacher'
import { axiosClient } from './axiosClient'

const TEACHERS_STORAGE_KEY = 'neocampus_teachers_db'
const SUBJECTS_STORAGE_KEY = 'neocampus_subjects_db'

const getLocalSubjects = (): any[] => {
  const data = localStorage.getItem(SUBJECTS_STORAGE_KEY)
  if (data) return JSON.parse(data)
  const initial = [
    { id: 1, nom: 'Mathématiques', code: 'MATH', etablissement_id: 1 },
    { id: 2, nom: 'Physique-Chimie', code: 'PHYS', etablissement_id: 1 },
    { id: 3, nom: 'Français', code: 'FRAN', etablissement_id: 1 },
    { id: 4, nom: 'Anglais', code: 'ANGL', etablissement_id: 1 },
    { id: 5, nom: 'Histoire-Géographie', code: 'HIST', etablissement_id: 1 },
  ]
  localStorage.setItem(SUBJECTS_STORAGE_KEY, JSON.stringify(initial))
  return initial
}

const getLocalTeachers = (): Teacher[] => {
  const data = localStorage.getItem(TEACHERS_STORAGE_KEY)
  if (data) return JSON.parse(data)
  
  const initial: Teacher[] = []
  const firstNames = ['Mohamed', 'Aicha', 'Youssef', 'Khadija', 'Omar', 'Fatima', 'Mehdi', 'Zineb', 'Adnane', 'Hiba']
  const lastNames = ['Alaoui', 'El Idrissi', 'Benjelloun', 'Tazi', 'Amrani', 'Berrada', 'Naji', 'Chraibi', 'Slaoui', 'Mansouri']
  const specialties = ['Mathématiques', 'Physique-Chimie', 'Français', 'Anglais', 'Histoire-Géographie']

  for (let i = 0; i < 10; i++) {
    const fn = firstNames[i % firstNames.length]
    const ln = lastNames[i % lastNames.length]
    const spec = specialties[i % specialties.length]
    initial.push({
      id: i + 1,
      user_id: 300 + i,
      specialite: spec,
      etablissement_id: 1,
      user: {
        id: 300 + i,
        etablissement_id: 1,
        nom: ln,
        prenom: fn,
        email: i === 0 ? 'enseignant@neocampus.com' : `${fn.toLowerCase()}.${ln.toLowerCase()}@neocampus.com`,
        role: 'enseignant'
      },
      classes: [
        {
          classe_id: (i % 8) + 1,
          classe_nom: ['CM1-A', 'CM2-B', '6ème-A', '5ème-B', '4ème-A', '3ème-B', 'Seconde-A', 'Terminale-C'][i % 8],
          niveau: ['CM1', 'CM2', '6ème', '5ème', '4ème', '3ème', 'Seconde', 'Terminale'][i % 8],
          matiere_id: (i % 5) + 1,
          matiere_nom: spec
        },
        {
          classe_id: ((i + 1) % 8) + 1,
          classe_nom: ['CM1-A', 'CM2-B', '6ème-A', '5ème-B', '4ème-A', '3ème-B', 'Seconde-A', 'Terminale-C'][(i + 1) % 8],
          niveau: ['CM1', 'CM2', '6ème', '5ème', '4ème', '3ème', 'Seconde', 'Terminale'][(i + 1) % 8],
          matiere_id: (i % 5) + 1,
          matiere_nom: spec
        }
      ]
    })
  }

  localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(initial))
  return initial
}

export const teacherApiService: ITeacherService = {
  async findById(id: number): Promise<Teacher> {
    try {
      const response = await axiosClient.get<{ data: Teacher }>(`/admin/enseignants/${id}`)
      return response.data.data
    } catch (err: any) {
      if (!err.response) {
        const local = getLocalTeachers()
        const t = local.find(item => item.id === id)
        if (t) return t
        throw new Error('Teacher not found locally')
      }
      throw err;
    }
  },

  async findAll(filters?: Record<string, string>): Promise<Teacher[]> {
    try {
      const response = await axiosClient.get<{ data: Teacher[] }>(`/admin/enseignants`, { params: filters })
      return response.data.data
    } catch (err: any) {
      if (!err.response) {
        let result = getLocalTeachers()
        if (filters?.search) {
          const q = filters.search.toLowerCase()
          result = result.filter(t => 
            t.user?.nom.toLowerCase().includes(q) ||
            t.user?.prenom.toLowerCase().includes(q)
          )
        }
        if (filters?.specialite) {
          result = result.filter(t => t.specialite === filters.specialite)
        }
        return result
      }
      throw err;
    }
  },

  async create(teacherData: any): Promise<Teacher> {
    try {
      const response = await axiosClient.post<{ data: Teacher }>(`/admin/enseignants`, teacherData)
      return response.data.data
    } catch (err: any) {
      if (!err.response) {
        const local = getLocalTeachers()
        const maxId = local.reduce((max, t) => t.id > max ? t.id : max, 0)
        
        const newTeacher: Teacher = {
          id: maxId + 1,
          user_id: 400 + maxId,
          specialite: teacherData.specialite,
          etablissement_id: 1,
          user: {
            id: 400 + maxId,
            etablissement_id: 1,
            nom: teacherData.nom,
            prenom: teacherData.prenom,
            email: teacherData.email,
            role: 'enseignant',
            avatar: teacherData.avatar || null
          },
          classes: teacherData.classes?.map((cId: any) => {
            const mockClasses = ['CM1-A', 'CM2-B', '6ème-A', '5ème-B', '4ème-A', '3ème-B', 'Seconde-A', 'Terminale-C']
            const mockNiveaux = ['CM1', 'CM2', '6ème', '5ème', '4ème', '3ème', 'Seconde', 'Terminale']
            const cIndex = (cId - 1) % 8
            return {
              classe_id: parseInt(cId),
              classe_nom: mockClasses[cIndex] || 'Classe ' + cId,
              niveau: mockNiveaux[cIndex] || 'Général',
              matiere_id: 1,
              matiere_nom: teacherData.specialite
            }
          }) || []
        }
        local.push(newTeacher)
        localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(local))
        return newTeacher
      }
      throw err;
    }
  },

  async update(id: number, teacherData: any): Promise<Teacher> {
    try {
      const response = await axiosClient.put<{ data: Teacher }>(`/admin/enseignants/${id}`, teacherData)
      return response.data.data
    } catch (err: any) {
      if (!err.response) {
        const local = getLocalTeachers()
        const index = local.findIndex(t => t.id === id)
        if (index === -1) throw new Error('Teacher not found')
        
        const existing = local[index]
        const updatedUser = existing.user ? {
          ...existing.user,
          nom: teacherData.nom ?? existing.user.nom,
          prenom: teacherData.prenom ?? existing.user.prenom,
          email: teacherData.email ?? existing.user.email,
          avatar: teacherData.avatar !== undefined ? teacherData.avatar : existing.user.avatar,
        } : null

        const updatedClasses = teacherData.classes ? teacherData.classes.map((cId: any) => {
          if (typeof cId === 'object') return cId
          const mockClasses = ['CM1-A', 'CM2-B', '6ème-A', '5ème-B', '4ème-A', '3ème-B', 'Seconde-A', 'Terminale-C']
          const mockNiveaux = ['CM1', 'CM2', '6ème', '5ème', '4ème', '3ème', 'Seconde', 'Terminale']
          const cIndex = (cId - 1) % 8
          return {
            classe_id: parseInt(cId),
            classe_nom: mockClasses[cIndex] || 'Classe ' + cId,
            niveau: mockNiveaux[cIndex] || 'Général',
            matiere_id: 1,
            matiere_nom: teacherData.specialite || existing.specialite
          }
        }) : existing.classes

        const updated: Teacher = {
          ...existing,
          specialite: teacherData.specialite ?? existing.specialite,
          user: updatedUser,
          classes: updatedClasses
        }

        local[index] = updated
        localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(local))
        return updated
      }
      throw err;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await axiosClient.delete(`/admin/enseignants/${id}`)
    } catch (err: any) {
      if (!err.response) {
        const local = getLocalTeachers()
        const filtered = local.filter(t => t.id !== id)
        localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(filtered))
        return
      }
      throw err;
    }
  },

  async assign(teacherId: number, classId: number, subjectId: number): Promise<void> {
    try {
      await axiosClient.post(`/admin/enseignants/assign`, {
        enseignant_id: teacherId,
        classe_id: classId,
        matiere_id: subjectId
      })
    } catch (err: any) {
      if (!err.response) {
        const local = getLocalTeachers()
        const index = local.findIndex(t => t.id === teacherId)
        if (index !== -1) {
          const teacher = local[index]
          const assignments = teacher.classes || []
          const exists = assignments.some(a => a.classe_id === classId && a.matiere_id === subjectId)
          if (!exists) {
            const mockClasses = ['CM1-A', 'CM2-B', '6ème-A', '5ème-B', '4ème-A', '3ème-B', 'Seconde-A', 'Terminale-C']
            const mockNiveaux = ['CM1', 'CM2', '6ème', '5ème', '4ème', '3ème', 'Seconde', 'Terminale']
            const cIndex = (classId - 1) % 8
            const subjects = getLocalSubjects()
            const sub = subjects.find(s => s.id === subjectId)
            assignments.push({
              classe_id: classId,
              classe_nom: mockClasses[cIndex] || 'Classe ' + classId,
              niveau: mockNiveaux[cIndex] || 'Général',
              matiere_id: subjectId,
              matiere_nom: sub ? sub.nom : 'Matière'
            })
            teacher.classes = assignments
            local[index] = teacher
            localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(local))
          }
        }
        return
      }
      throw err;
    }
  },

  async unassign(teacherId: number, classId: number, subjectId: number): Promise<void> {
    try {
      await axiosClient.post(`/admin/enseignants/unassign`, {
        enseignant_id: teacherId,
        classe_id: classId,
        matiere_id: subjectId
      })
    } catch (err: any) {
      if (!err.response) {
        const local = getLocalTeachers()
        const index = local.findIndex(t => t.id === teacherId)
        if (index !== -1) {
          const teacher = local[index]
          teacher.classes = (teacher.classes || []).filter(a => !(a.classe_id === classId && a.matiere_id === subjectId))
          local[index] = teacher
          localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(local))
        }
        return
      }
      throw err;
    }
  },

  async findAllSubjects(): Promise<any[]> {
    try {
      const response = await axiosClient.get<{ data: any[] }>(`/admin/subjects`)
      return response.data.data
    } catch (err: any) {
      if (!err.response) {
        return getLocalSubjects()
      }
      throw err;
    }
  },

  async revealPassword(id: number, adminPassword: string): Promise<string> {
    try {
      const response = await axiosClient.post<{ password: string }>(`/admin/enseignants/${id}/reveal-password`, { admin_password: adminPassword })
      return response.data.password
    } catch (err: any) {
      if (!err.response) {
        if (adminPassword.length < 4) throw new Error('Invalid administrator password.')
        const local = getLocalTeachers()
        const t = local.find(item => item.id === id)
        return t?.user?.temp_password || 'TeacherPass123!'
      }
      throw err;
    }
  },

  async uploadAvatar(id: number, file: File): Promise<string> {
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const response = await axiosClient.post<{ avatar_url: string }>(
        `/admin/enseignants/${id}/avatar`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      return response.data.avatar_url
    } catch (err: any) {
      if (!err.response) {
        // Offline fallback: update local storage with a blob URL preview
        const local = getLocalTeachers()
        const index = local.findIndex(t => t.id === id)
        if (index !== -1 && local[index].user) {
          const objectUrl = URL.createObjectURL(file)
          local[index].user!.avatar = objectUrl
          localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(local))
          return objectUrl
        }
        return ''
      }
      throw err;
    }
  },
}

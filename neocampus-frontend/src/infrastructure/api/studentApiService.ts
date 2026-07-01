import { IStudentService, Student } from '@/domain/ports/IStudentService'
import { axiosClient } from './axiosClient'

const LOCAL_STORAGE_KEY = 'neocampus_students_db'
let memoryStudentsCache: Student[] | null = null

const getLocalStudents = (): Student[] => {
  if (memoryStudentsCache) {
    return memoryStudentsCache
  }
  
  const data = localStorage.getItem(LOCAL_STORAGE_KEY)
  if (data) {
    try {
      memoryStudentsCache = JSON.parse(data)
      return memoryStudentsCache!
    } catch (e) {
      console.error('Failed to parse local students data', e)
    }
  }

  // Initialize with 50 realistic mock students for SaaS demo fallback
  const initial: Student[] = []
  const firstNames = ['Abdoulaye', 'Fatou', 'Cheikh', 'Moussa', 'Amine', 'Sarah', 'Karim', 'John', 'Jane', 'Michael', 'Emily', 'David', 'Jessica', 'Daniel', 'Sophia']
  const lastNames = ['Diallo', 'Ndiaye', 'Kane', 'Sow', 'Yacoubi', 'Benali', 'Smith', 'Doe', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis']
  const relations = ['Father', 'Mother', 'Guardian']
  const schools = ['Al Jabr School', 'La Residence School', 'Lycée Lyautey', 'Anisse Institution']
  
  for (let i = 0; i < 50; i++) {
    const fn = firstNames[i % firstNames.length]
    const ln = lastNames[i % lastNames.length]
    initial.push({
      id: i + 1,
      etablissement_id: 1,
      user_id: 100 + i,
      matricule: `MAT-2026-${String(i + 1).padStart(3, '0')}`,
      nom: ln,
      prenom: fn,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@neocampus.com`,
      sexe: i % 2 === 0 ? 'Male' : 'Female',
      date_naissance: `2012-05-${String((i % 28) + 1).padStart(2, '0')}`,
      classe_id: (i % 5) + 1,
      classe_nom: ['Grade 6-A', 'Grade 5-B', 'Grade 3-A', 'Grade 6-C', 'Grade 5-A'][i % 5],
      status: i % 8 === 0 ? 'Suspended' : 'Active',
      parent_contact: {
        nom: `${ln} ${firstNames[(i + 3) % firstNames.length]}`,
        relation: relations[i % relations.length],
        telephone: `+212 600 ${String(100000 + i)}`,
        email: `parent.${ln.toLowerCase()}@example.com`
      },
      documents: {
        birth_certificate: true,
        previous_transcript: true,
        photos: true
      },
      scolarite_anterieure: schools[i % schools.length]
    })
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial))
  memoryStudentsCache = initial
  return initial
}

const saveLocalStudents = (students: Student[]) => {
  memoryStudentsCache = students
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(students))
}

export const studentApiService: IStudentService = {
  async findById(id: number): Promise<Student> {
    try {
      const response = await axiosClient.get<Student>(`/admin/eleves/${id}`)
      const resData = response.data as any
      return resData && resData.data ? resData.data : resData
    } catch (err: any) {
      if (!err.response) {
        console.warn('Backend API offline. Fetching student from local storage.')
        const local = getLocalStudents()
        const s = local.find(item => item.id === id)
        if (s) return s
        throw new Error('Student not found locally')
      }
      throw err;
    }
  },

  async findAllByClasse(classeId: number): Promise<Student[]> {
    try {
      const response = await axiosClient.get<Student[]>(`/admin/eleves`, {
        params: { classe_id: classeId },
      })
      const resData = response.data as any
      const rawList = resData && resData.data ? resData.data : resData
      return Array.isArray(rawList) ? rawList : []
    } catch (err: any) {
      if (!err.response) {
        console.warn('Backend API offline. Fetching class list from local storage.')
        const local = getLocalStudents()
        return local.filter(s => s.classe_id === classeId)
      }
      throw err;
    }
  },

  async create(studentData: Omit<Student, 'id' | 'etablissement_id'>): Promise<Student> {
    try {
      const response = await axiosClient.post<Student>(`/admin/eleves`, studentData)
      const resData = response.data as any
      return resData && resData.data ? resData.data : resData
    } catch (err: any) {
      if (!err.response) {
        console.warn('Backend API offline. Creating student in local storage.')
        const local = getLocalStudents()
        const maxId = local.reduce((max, s) => s.id > max ? s.id : max, 0)
        
        const mockClasses = ['Grade 6-A', 'Grade 5-B', 'Grade 3-A', 'Grade 6-C', 'Grade 5-A']
        const classIndex = studentData.classe_id ? (studentData.classe_id - 1) : 0
        const classNom = studentData.classe_nom || mockClasses[classIndex] || 'Unknown Grade'
        
        const newStudent: Student = {
          ...studentData,
          id: maxId + 1,
          etablissement_id: 1,
          user_id: 200 + maxId,
          classe_nom: classNom,
        }
        
        local.push(newStudent)
        saveLocalStudents(local)
        return newStudent
      }
      throw err;
    }
  },

  async update(id: number, studentData: Partial<Student>): Promise<Student> {
    try {
      const response = await axiosClient.put<Student>(`/admin/eleves/${id}`, studentData)
      const resData = response.data as any
      return resData && resData.data ? resData.data : resData
    } catch (err: any) {
      if (!err.response) {
        console.warn('Backend API offline. Updating student in local storage.')
        const local = getLocalStudents()
        const index = local.findIndex(s => s.id === id)
        if (index === -1) throw new Error('Student not found')
        
        const mockClasses = ['Grade 6-A', 'Grade 5-B', 'Grade 3-A', 'Grade 6-C', 'Grade 5-A']
        const classIndex = studentData.classe_id ? (studentData.classe_id - 1) : (local[index].classe_id ? (local[index].classe_id! - 1) : 0)

        const classNom = studentData.classe_nom || mockClasses[classIndex] || 'Unknown Grade'

        const updated: Student = {
          ...local[index],
          ...studentData,
          classe_nom: classNom,
        }
        local[index] = updated
        saveLocalStudents(local)
        return updated
      }
      throw err;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await axiosClient.delete(`/admin/eleves/${id}`)
    } catch (err: any) {
      if (!err.response) {
        console.warn('Backend API offline. Deleting student from local storage.')
        const local = getLocalStudents()
        const filtered = local.filter(s => s.id !== id)
        saveLocalStudents(filtered)
        return
      }
      throw err;
    }
  },

  async search(filters: Record<string, string>): Promise<Student[]> {
    try {
      const response = await axiosClient.get<Student[]>(`/admin/eleves`, {
        params: filters,
      })
      const resData = response.data as any
      const rawList = resData && resData.data ? resData.data : resData
      return Array.isArray(rawList) ? rawList : []
    } catch (err: any) {
      if (!err.response) {
        console.warn('Backend API offline. Searching students in local storage.')
        let result = getLocalStudents()
        
        if (filters.search) {
          const q = filters.search.toLowerCase()
          result = result.filter(s => 
            s.nom.toLowerCase().includes(q) || 
            s.prenom.toLowerCase().includes(q) || 
            s.matricule.toLowerCase().includes(q)
          )
        }
        
        if (filters.classe_id) {
          result = result.filter(s => s.classe_id !== null && s.classe_id !== undefined && s.classe_id === parseInt(filters.classe_id))
        }
        
        if (filters.status) {
          result = result.filter(s => s.status === filters.status)
        }
        
        if (filters.section) {
          const sec = filters.section.toLowerCase()
          if (sec === 'collège' || sec === 'college') {
            result = result.filter(s => s.classe_id !== null && s.classe_id !== undefined && s.classe_id <= 4)
          } else if (sec === 'primaire' || sec === 'primary') {
            result = result.filter(s => s.classe_id !== null && s.classe_id !== undefined && s.classe_id === 5)
          }
        }
        
        return result
      }
      throw err;
    }
  },

  async uploadAvatar(id: number, file: File): Promise<string> {
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const response = await axiosClient.post<{ avatar_url: string }>(
        `/admin/eleves/${id}/avatar`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      return response.data.avatar_url
    } catch (err: any) {
      if (!err.response) {
        // Offline fallback: update local storage with a blob URL preview
        const local = getLocalStudents()
        const index = local.findIndex(s => s.id === id)
        if (index !== -1) {
          const objectUrl = URL.createObjectURL(file)
          ;(local[index] as any).avatar = objectUrl
          saveLocalStudents(local)
          return objectUrl
        }
        return ''
      }
      throw err;
    }
  },

  async revealPassword(id: number, adminPassword: string): Promise<string> {
    try {
      const response = await axiosClient.post<{ password: string }>(
        `/admin/eleves/${id}/reveal-password`,
        { admin_password: adminPassword }
      )
      return response.data.password
    } catch (err: any) {
      if (!err.response) {
        // Offline fallback: basic admin password check
        if (adminPassword.length < 4) throw new Error('Invalid administrator password.')
        const local = getLocalStudents()
        const s = local.find(item => item.id === id)
        return (s as any)?.temp_password || 'Pass1234'
      }
      throw err;
    }
  },

  async updatePassword(id: number, adminPassword: string, newPassword: string): Promise<void> {
    try {
      await axiosClient.put(`/admin/eleves/${id}/password`, {
        admin_password: adminPassword,
        new_password: newPassword,
      })
    } catch (err: any) {
      if (!err.response) {
        // Offline fallback: update temp_password in local storage
        if (adminPassword.length < 4) throw new Error('Invalid administrator password.')
        const local = getLocalStudents()
        const index = local.findIndex(s => s.id === id)
        if (index !== -1) {
          ;(local[index] as any).temp_password = newPassword
          saveLocalStudents(local)
        }
        return
      }
      throw err;
    }
  },
}

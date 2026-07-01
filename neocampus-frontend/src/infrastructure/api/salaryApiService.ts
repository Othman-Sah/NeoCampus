import { ISalaryService } from '@/domain/ports/ISalaryService'
import { Salary } from '@/domain/entities/Salary'
import { axiosClient } from './axiosClient'

const SALARIES_STORAGE_KEY = 'neocampus_salaries_db'

const getLocalSalaries = (): Salary[] => {
  const data = localStorage.getItem(SALARIES_STORAGE_KEY)
  if (data) return JSON.parse(data)
  
  const initial: Salary[] = []
  const teachers = [
    { id: 1, nom: 'Alaoui', prenom: 'Mohamed', spec: 'Mathématiques' },
    { id: 2, nom: 'El Idrissi', prenom: 'Aicha', spec: 'Physique-Chimie' },
    { id: 3, nom: 'Benjelloun', prenom: 'Youssef', spec: 'Français' },
    { id: 4, nom: 'Tazi', prenom: 'Khadija', spec: 'Anglais' },
    { id: 5, nom: 'Amrani', prenom: 'Omar', spec: 'Histoire-Géographie' }
  ]

  teachers.forEach((t, i) => {
    const base = 6000 + (i * 500)
    
    // May 2026
    initial.push({
      id: (i * 2) + 1,
      enseignant_id: t.id,
      etablissement_id: 1,
      mois: '2026-05',
      salaire_de_base: base,
      primes: 300,
      indemnites: 200,
      retenues: 100,
      salaire_net: base + 300 + 200 - 100,
      statut: 'Paid',
      date_paiement: '2026-05-28',
      notes: 'Salaire versé par virement bancaire.',
      enseignant: {
        id: t.id,
        specialite: t.spec,
        nom: t.nom,
        prenom: t.prenom,
        email: `${t.prenom.toLowerCase()}.${t.nom.toLowerCase()}@neocampus.com`
      }
    })

    // June 2026
    const paid = i % 2 === 0
    initial.push({
      id: (i * 2) + 2,
      enseignant_id: t.id,
      etablissement_id: 1,
      mois: '2026-06',
      salaire_de_base: base,
      primes: paid ? 400 : 0,
      indemnites: 250,
      retenues: 100,
      salaire_net: base + (paid ? 400 : 0) + 250 - 100,
      statut: paid ? 'Paid' : 'Draft',
      date_paiement: paid ? '2026-06-27' : null,
      notes: paid ? 'Salaire versé par virement bancaire.' : 'Validation comptable en cours.',
      enseignant: {
        id: t.id,
        specialite: t.spec,
        nom: t.nom,
        prenom: t.prenom,
        email: `${t.prenom.toLowerCase()}.${t.nom.toLowerCase()}@neocampus.com`
      }
    })
  })

  localStorage.setItem(SALARIES_STORAGE_KEY, JSON.stringify(initial))
  return initial
}

export const salaryApiService: ISalaryService = {
  async findById(id: number): Promise<Salary> {
    try {
      const response = await axiosClient.get<{ data: Salary }>(`/finance/salaires/${id}`)
      return response.data.data
    } catch (err: any) {
      if (!err.response) {
        const local = getLocalSalaries()
        const s = local.find(item => item.id === id)
        if (s) return s
        throw new Error('Salary record not found locally')
      }
      throw err;
    }
  },

  async findAll(filters?: Record<string, string>): Promise<Salary[]> {
    try {
      const response = await axiosClient.get<{ data: Salary[] }>(`/finance/salaires`, { params: filters })
      return response.data.data
    } catch (err: any) {
      if (!err.response) {
        let result = getLocalSalaries()
        if (filters?.mois) {
          result = result.filter(s => s.mois === filters.mois)
        }
        if (filters?.enseignant_id) {
          result = result.filter(s => s.enseignant_id === parseInt(filters.enseignant_id))
        }
        if (filters?.statut) {
          result = result.filter(s => s.statut === filters.statut)
        }
        return result
      }
      throw err;
    }
  },

  async create(salaryData: any): Promise<Salary> {
    try {
      const response = await axiosClient.post<{ data: Salary }>(`/finance/salaires`, salaryData)
      return response.data.data
    } catch (err: any) {
      if (!err.response) {
        const local = getLocalSalaries()
        const maxId = local.reduce((max, s) => s.id > max ? s.id : max, 0)
        
        const base = parseFloat(salaryData.salaire_de_base || 0)
        const primes = parseFloat(salaryData.primes || 0)
        const indemnites = parseFloat(salaryData.indemnites || 0)
        const retenues = parseFloat(salaryData.retenues || 0)
        const net = base + primes + indemnites - retenues

        const teachersStorage = localStorage.getItem('neocampus_teachers_db')
        const teachers = teachersStorage ? JSON.parse(teachersStorage) : []
        const t = teachers.find((item: any) => item.id === parseInt(salaryData.enseignant_id))

        const newSalary: Salary = {
          id: maxId + 1,
          enseignant_id: parseInt(salaryData.enseignant_id),
          etablissement_id: 1,
          mois: salaryData.mois,
          salaire_de_base: base,
          primes: primes,
          indemnites: indemnites,
          retenues: retenues,
          salaire_net: net,
          statut: salaryData.statut || 'Draft',
          date_paiement: salaryData.date_paiement || null,
          notes: salaryData.notes || null,
          enseignant: t ? {
            id: t.id,
            specialite: t.specialite,
            nom: t.user?.nom,
            prenom: t.user?.prenom,
            email: t.user?.email
          } : null
        }
        
        local.push(newSalary)
        localStorage.setItem(SALARIES_STORAGE_KEY, JSON.stringify(local))
        return newSalary
      }
      throw err;
    }
  },

  async update(id: number, salaryData: Partial<Salary>): Promise<Salary> {
    try {
      const response = await axiosClient.put<{ data: Salary }>(`/finance/salaires/${id}`, salaryData)
      return response.data.data
    } catch (err: any) {
      if (!err.response) {
        const local = getLocalSalaries()
        const index = local.findIndex(s => s.id === id)
        if (index === -1) throw new Error('Salary record not found')
        
        const existing = local[index]
        const base = parseFloat(salaryData.salaire_de_base !== undefined ? salaryData.salaire_de_base as any : existing.salaire_de_base)
        const primes = parseFloat(salaryData.primes !== undefined ? salaryData.primes as any : existing.primes)
        const indemnites = parseFloat(salaryData.indemnites !== undefined ? salaryData.indemnites as any : existing.indemnites)
        const retenues = parseFloat(salaryData.retenues !== undefined ? salaryData.retenues as any : existing.retenues)
        const net = base + primes + indemnites - retenues

        const updated: Salary = {
          ...existing,
          ...salaryData,
          salaire_de_base: base,
          primes: primes,
          indemnites: indemnites,
          retenues: retenues,
          salaire_net: net,
        }

        local[index] = updated
        localStorage.setItem(SALARIES_STORAGE_KEY, JSON.stringify(local))
        return updated
      }
      throw err;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await axiosClient.delete(`/finance/salaires/${id}`)
    } catch (err: any) {
      if (!err.response) {
        const local = getLocalSalaries()
        const filtered = local.filter(s => s.id !== id)
        localStorage.setItem(SALARIES_STORAGE_KEY, JSON.stringify(filtered))
        return
      }
      throw err;
    }
  },

  async findMySalaries(): Promise<Salary[]> {
    try {
      const response = await axiosClient.get<{ data: Salary[] }>(`/teacher/salaires`)
      return response.data.data
    } catch (err: any) {
      if (!err.response) {
        const authData = localStorage.getItem('neocampus_auth_store')
        const auth = authData ? JSON.parse(authData) : null
        const currentUser = auth?.state?.user
        
        const local = getLocalSalaries()
        if (currentUser && currentUser.role === 'enseignant') {
          const teachersStorage = localStorage.getItem('neocampus_teachers_db')
          const teachers = teachersStorage ? JSON.parse(teachersStorage) : []
          const t = teachers.find((item: any) => item.user?.id === currentUser.id)
          if (t) {
            return local.filter(s => s.enseignant_id === t.id)
          }
        }
        return []
      }
      throw err;
    }
  },
}

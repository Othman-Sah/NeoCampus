import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { authApiService } from '@/infrastructure/api/authApiService'

export const useAuth = () => {
  const store = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFallbackMode, setIsFallbackMode] = useState(false)

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    setIsFallbackMode(false)
    try {
      const response = await authApiService.login(email, password)
      store.login(response.user, response.token)
      return response.user
    } catch (err: any) {
      // Fallback: If backend is offline or network fails, log in with simulated credentials for demo/testing
      if (!err.response) {
        console.warn('Backend API appears offline. Falling back to simulated login for testing.')
        setIsFallbackMode(true)
        
        // Determine role based on email hints to allow testing different dashboards easily
        let role: 'admin' | 'comptable' | 'enseignant' | 'bibliothecaire' | 'parent' | 'eleve' = 'admin'
        const lowerEmail = email.toLowerCase()
        if (lowerEmail.includes('comptable') || lowerEmail.includes('finance')) {
          role = 'comptable'
        } else if (lowerEmail.includes('enseignant') || lowerEmail.includes('teacher') || lowerEmail.includes('prof')) {
          role = 'enseignant'
        } else if (lowerEmail.includes('bibliothecaire') || lowerEmail.includes('library') || lowerEmail.includes('biblio')) {
          role = 'bibliothecaire'
        } else if (lowerEmail.includes('parent')) {
          role = 'parent'
        } else if (lowerEmail.includes('eleve') || lowerEmail.includes('student')) {
          role = 'eleve'
        }

        const dummyUser = {
          id: 99,
          etablissement_id: 1,
          nom: 'Squelette',
          prenom: role.charAt(0).toUpperCase() + role.slice(1),
          email: email,
          role: role,
        }
        
        // Save mock session locally
        store.login(dummyUser, 'simulated-sanctum-token')
        return dummyUser
      }

      const errMsg = err.response?.data?.message || err.response?.data?.errors?.email?.[0] || 'Erreur d\'authentification'
      setError(errMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await authApiService.logout()
    } catch (err) {
      console.error('Remote logout failed, clearing local session anyway', err)
    } finally {
      store.logout()
      setLoading(false)
    }
  }

  return {
    user: store.user,
    token: store.token,
    isAuthenticated: store.isAuthenticated,
    language: store.language,
    setLanguage: store.setLanguage,
    login,
    logout,
    loading,
    error,
    isFallbackMode,
  }
}

export default useAuth

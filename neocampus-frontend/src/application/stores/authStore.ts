import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/domain/entities/User'

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  language: 'fr' | 'en';
  login: (user: User, token: string) => void;
  logout: () => void;
  setLanguage: (lang: 'fr' | 'en') => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      language: 'fr',
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'neocampus-auth-storage',
    }
  )
)

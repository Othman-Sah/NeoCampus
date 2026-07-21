import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/domain/entities/User'

interface AuthState {
  user: User | null;
  token: string | null;
  originalUser: User | null;
  originalToken: string | null;
  impersonatedUser: User | null;
  isAuthenticated: boolean;
  language: 'fr' | 'en';
  login: (user: User, token: string) => void;
  startImpersonation: (user: User, token: string, originalUser: User, originalToken: string) => void;
  stopImpersonation: () => void;
  logout: () => void;
  setLanguage: (lang: 'fr' | 'en') => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      originalUser: null,
      originalToken: null,
      impersonatedUser: null,
      isAuthenticated: false,
      language: 'en',
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      startImpersonation: (user, token, originalUser, originalToken) => set({
        user,
        token,
        originalUser,
        originalToken,
        impersonatedUser: user,
        isAuthenticated: true,
      }),
      stopImpersonation: () => set((state) => ({
        user: state.originalUser,
        token: state.originalToken,
        originalUser: null,
        originalToken: null,
        impersonatedUser: null,
        isAuthenticated: Boolean(state.originalUser && state.originalToken),
      })),
      logout: () => set({ user: null, token: null, originalUser: null, originalToken: null, impersonatedUser: null, isAuthenticated: false }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'neocampus-auth-storage',
    }
  )
)

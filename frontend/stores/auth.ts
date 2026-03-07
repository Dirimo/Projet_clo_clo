import { defineStore } from 'pinia'

export type AuthUser = {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: 'USER' | 'ADMIN'
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as AuthUser | null,
    accessToken: null as string | null,
    loading: false,
  }),

  getters: {
    isLoggedIn: (state) => !!state.accessToken && !!state.user,
    isAdmin: (state) => state.user?.role === 'ADMIN',
    fullName: (state) =>
      state.user
        ? [state.user.firstName, state.user.lastName].filter(Boolean).join(' ') || state.user.email
        : '',
  },

  actions: {
    setAuth(user: AuthUser, accessToken: string) {
      this.user = user
      this.accessToken = accessToken
    },

    clearAuth() {
      this.user = null
      this.accessToken = null
    },
  },

  // Persistance en sessionStorage (pas localStorage — le token expire)
  persist: {
    key: 'clo-clo-auth',
    storage: typeof window !== 'undefined' ? sessionStorage : undefined,
    paths: ['user', 'accessToken'],
  },
})

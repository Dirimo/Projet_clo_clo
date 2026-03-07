import { useAuthStore } from '~/stores/auth'

export function useAuth() {
  const authStore = useAuthStore()
  const config = useRuntimeConfig()
  const router = useRouter()
  const baseURL = config.public.apiUrl

  const loading = ref(false)
  const error = ref<string | null>(null)

  async function register(payload: {
    email: string
    password: string
    firstName?: string
    lastName?: string
  }) {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<{ user: any; accessToken: string }>(
        `${baseURL}/auth/register`,
        { method: 'POST', body: payload, credentials: 'include' },
      )
      authStore.setAuth(data.user, data.accessToken)
      await router.push('/')
    } catch (e: any) {
      error.value = e?.data?.message || 'Erreur lors de l\'inscription.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function login(email: string, password: string) {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<{ user: any; accessToken: string }>(
        `${baseURL}/auth/login`,
        { method: 'POST', body: { email, password }, credentials: 'include' },
      )
      authStore.setAuth(data.user, data.accessToken)
      await router.push('/')
    } catch (e: any) {
      error.value = e?.data?.message || 'Email ou mot de passe incorrect.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    try {
      if (authStore.accessToken) {
        await $fetch(`${baseURL}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${authStore.accessToken}` },
          credentials: 'include',
        })
      }
    } finally {
      authStore.clearAuth()
      loading.value = false
      await router.push('/')
    }
  }

  return {
    user: computed(() => authStore.user),
    isLoggedIn: computed(() => authStore.isLoggedIn),
    isAdmin: computed(() => authStore.isAdmin),
    fullName: computed(() => authStore.fullName),
    loading: readonly(loading),
    error: readonly(error),
    register,
    login,
    logout,
  }
}

/**
 * Composable de base pour tous les appels API.
 * Injecte automatiquement le Bearer token si l'utilisateur est connecté.
 * Gère le refresh token automatique en cas de 401.
 */
import { useAuthStore } from '~/stores/auth'

export function useApi() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()
  const router = useRouter()

  const baseURL = config.public.apiUrl

  async function apiFetch<T>(
    path: string,
    options: Parameters<typeof $fetch>[1] = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    }

    if (authStore.accessToken) {
      headers['Authorization'] = `Bearer ${authStore.accessToken}`
    }

    try {
      return await $fetch<T>(`${baseURL}${path}`, {
        ...options,
        headers,
        credentials: 'include', // envoie les cookies httpOnly (refresh token)
      })
    } catch (error: any) {
      // Token expiré → tentative de refresh automatique
      if (error?.status === 401 && authStore.accessToken) {
        const refreshed = await tryRefresh()
        if (refreshed) {
          headers['Authorization'] = `Bearer ${authStore.accessToken}`
          return $fetch<T>(`${baseURL}${path}`, {
            ...options,
            headers,
            credentials: 'include',
          })
        }
        // Refresh échoué → déconnexion
        authStore.clearAuth()
        router.push('/login')
      }
      throw error
    }
  }

  async function tryRefresh(): Promise<boolean> {
    try {
      const data = await $fetch<{ accessToken: string }>(`${baseURL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      })
      authStore.accessToken = data.accessToken
      return true
    } catch {
      return false
    }
  }

  return { apiFetch }
}

import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()
  const localePath = useLocalePath()

  if (!authStore.isLoggedIn) {
    return navigateTo(localePath('/login'))
  }
  if (!authStore.isAdmin) {
    return navigateTo(localePath('/'))
  }
})

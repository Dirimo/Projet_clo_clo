/**
 * ============================================================
 * middleware/auth.ts — Protection des routes authentifiées
 * ============================================================
 * Rôle : Redirige vers /login si l'utilisateur n'est pas connecté.
 *
 * S'applique aux pages qui déclarent :
 *   definePageMeta({ middleware: ['auth'] })
 *
 * Exemples de pages protégées : /account, /account/orders
 *
 * Fonctionnement :
 *  1. Lit l'état isLoggedIn depuis le store Pinia (persisté en sessionStorage)
 *  2. Si non connecté → redirige vers /login (avec i18n via localePath)
 *  3. Si connecté → laisse passer (rien n'est retourné)
 *
 * Note : Ce middleware est côté CLIENT uniquement.
 *        Pour une sécurité complète, le backend valide aussi le JWT
 *        sur chaque endpoint protégé (JwtAuthGuard).
 * ============================================================
 */
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()       // Accès au store d'authentification
  const localePath = useLocalePath()    // Génère le chemin avec le préfixe i18n

  // Si l'utilisateur n'est pas connecté → redirection vers la page de login
  if (!authStore.isLoggedIn) {
    return navigateTo(localePath('/login'))
  }
  // Si connecté → middleware passthrough (navigation autorisée)
})

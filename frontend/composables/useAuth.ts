/**
 * ============================================================
 * useAuth.ts — Composable d'authentification
 * ============================================================
 * Rôle : Fournit les actions register / login / logout
 *        en communiquant directement avec l'API backend.
 *
 * Fonctionnement :
 *  1. Appels $fetch vers POST /auth/register|login|logout
 *  2. Le backend pose un cookie httpOnly (refresh_token) automatiquement
 *  3. L'accessToken (JWT 15 min) est stocké dans le store Pinia
 *  4. En cas de succès → redirection automatique via useRouter()
 *
 * Utilisation dans un composant Vue :
 *   const { login, loading, error } = useAuth()
 * ============================================================
 */
import { useAuthStore } from '~/stores/auth'

export function useAuth() {
  // ── Dépendances injectées par Nuxt ───────────────────────
  const authStore = useAuthStore()     // Store Pinia : persiste user + accessToken
  const config = useRuntimeConfig()    // Accès aux variables .env publiques
  const router = useRouter()           // Navigation programmatique côté client
  const baseURL = config.public.apiUrl // URL de base API (ex: http://localhost:3001/api)

  // ── États réactifs locaux ────────────────────────────────
  const loading = ref(false)              // true pendant un appel réseau en cours
  const error = ref<string | null>(null)  // Message d'erreur affiché dans l'UI

  /**
   * register — Crée un nouveau compte utilisateur
   * ─────────────────────────────────────────────
   * Étape 1 : POST /auth/register avec les données du formulaire
   * Étape 2 : Le backend hache le mot de passe (bcrypt, 10 rounds)
   * Étape 3 : Retourne { user, accessToken } + pose le cookie refresh_token
   * Étape 4 : authStore.setAuth() sauvegarde l'état "connecté" dans Pinia
   * Étape 5 : Redirection vers la page d'accueil
   */
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
        { method: 'POST', body: payload, credentials: 'include' }, // credentials: 'include' nécessaire pour recevoir le cookie
      )
      authStore.setAuth(data.user, data.accessToken) // Sauvegarde dans Pinia
      await router.push('/')                          // Redirection accueil
    } catch (e: any) {
      // Priorité au message backend (ex: "Email déjà utilisé") sinon message générique
      error.value = e?.data?.message || 'Erreur lors de l\'inscription.'
      throw e // Re-lancer pour que le composant parent puisse réagir
    } finally {
      loading.value = false // Toujours désactiver le loader, succès ou erreur
    }
  }

  /**
   * login — Authentifie un utilisateur existant
   * ────────────────────────────────────────────
   * Étape 1 : POST /auth/login avec email + password en clair (sur HTTPS)
   * Étape 2 : Backend compare le mot de passe au hash bcrypt en DB
   * Étape 3 : Retourne { user, accessToken } + renouvelle le cookie refresh
   * Étape 4 : Sauvegarde dans Pinia + redirection
   */
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

  /**
   * logout — Déconnecte l'utilisateur
   * ───────────────────────────────────
   * Étape 1 : POST /auth/logout → backend efface refreshToken en DB + supprime cookie
   * Étape 2 : authStore.clearAuth() vide le store Pinia (user = null, token = null)
   * Étape 3 : Redirection vers l'accueil
   * Note : Si le token est déjà invalide, on nettoie quand même localement (finally)
   */
  async function logout() {
    loading.value = true
    try {
      if (authStore.accessToken) {
        await $fetch(`${baseURL}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${authStore.accessToken}` }, // Token requis par JwtAuthGuard
          credentials: 'include', // Envoie le cookie pour que le backend le supprime
        })
      }
    } finally {
      authStore.clearAuth()    // Nettoyage local dans tous les cas
      loading.value = false
      await router.push('/')
    }
  }

  // ── Exposition publique du composable ────────────────────
  return {
    user: computed(() => authStore.user),           // Objet utilisateur (null si déconnecté)
    isLoggedIn: computed(() => authStore.isLoggedIn), // Boolean : connecté ?
    isAdmin: computed(() => authStore.isAdmin),     // Boolean : rôle ADMIN ?
    fullName: computed(() => authStore.fullName),   // "Prénom Nom" ou email si absent
    loading: readonly(loading),   // Lecture seule pour l'UI (pas de mutation externe)
    error: readonly(error),       // Message d'erreur pour l'UI
    register,
    login,
    logout,
  }
}

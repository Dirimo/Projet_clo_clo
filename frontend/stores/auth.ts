/**
 * ============================================================
 * stores/auth.ts — Store Pinia d'authentification
 * ============================================================
 * Rôle : Centralise l'état de connexion de l'utilisateur dans toute l'app.
 *
 * Stratégie de tokens (double token) :
 *  - accessToken  → JWT valide 15 min, stocké en mémoire/sessionStorage
 *                   Envoyé dans le header "Authorization: Bearer <token>"
 *  - refreshToken → JWT valide 7 jours, httpOnly cookie géré par le backend
 *                   Invisible au JavaScript (protection XSS)
 *                   Hash bcrypt stocké en DB, comparé à chaque refresh
 *
 * Persistance : sessionStorage clé 'clo-clo-auth'
 *  → Survit au rechargement de page (F5)
 *  → Perdu à la fermeture de l'onglet (plus sécurisé que localStorage)
 *  → Seuls user et accessToken sont persistés (pas loading)
 *
 * Utilisé par :
 *  - useAuth.ts       → actions login/logout/register
 *  - useApi.ts        → injection Bearer token dans les requêtes HTTP
 *  - middleware/admin → vérification du rôle ADMIN
 *  - AppNavbar.vue    → affichage conditionnel (login vs profil)
 * ============================================================
 */
import { defineStore } from 'pinia'

/** Données de l'utilisateur connecté (subset sans password) */
export type AuthUser = {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: 'USER' | 'ADMIN'
}

export const useAuthStore = defineStore('auth', {

  // ── State ─────────────────────────────────────────────────
  state: () => ({
    user: null as AuthUser | null,        // null = non connecté
    accessToken: null as string | null,   // JWT Bearer (expire dans 15 min)
    loading: false,                       // Indicateur de chargement global
  }),

  // ── Getters ───────────────────────────────────────────────
  getters: {
    /**
     * isLoggedIn — Vrai uniquement si token ET user sont présents
     * Double vérification : token seul ne suffit pas (l'user peut être null après erreur)
     */
    isLoggedIn: (state) => !!state.accessToken && !!state.user,

    /** isAdmin — Vrai si l'utilisateur connecté a le rôle ADMIN */
    isAdmin: (state) => state.user?.role === 'ADMIN',

    /**
     * fullName — Nom complet affiché dans la navbar
     * Priorité : "Prénom Nom" → email si firstName/lastName absents
     */
    fullName: (state) =>
      state.user
        ? [state.user.firstName, state.user.lastName].filter(Boolean).join(' ') || state.user.email
        : '',
  },

  // ── Actions ───────────────────────────────────────────────
  actions: {
    /**
     * setAuth — Sauvegarde l'état après login/register réussi
     * Appelé par useAuth.ts après réception de la réponse API.
     */
    setAuth(user: AuthUser, accessToken: string) {
      this.user = user
      this.accessToken = accessToken
    },

    /**
     * clearAuth — Efface l'état après logout ou expiration du refresh
     * Le cookie httpOnly est supprimé côté backend (POST /auth/logout).
     * Ici on nettoie uniquement la mémoire cliente.
     */
    clearAuth() {
      this.user = null
      this.accessToken = null
    },
  },

  // ── Persistance sessionStorage ─────────────────────────────
  // sessionStorage (vs localStorage) : plus sécurisé car vidé à la fermeture du navigateur.
  // Guard SSR : typeof window !== 'undefined' (Nuxt s'exécute aussi côté serveur Node.js
  // où sessionStorage n'existe pas).
  persist: {
    key: 'clo-clo-auth',
    storage: typeof window !== 'undefined' ? sessionStorage : undefined,
    paths: ['user', 'accessToken'],  // Ne pas persister 'loading'
  },
})

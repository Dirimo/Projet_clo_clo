/**
 * ============================================================
 * middleware/admin.ts — Protection des routes administration
 * ============================================================
 * Rôle : Double vérification pour les pages d'administration.
 *        Seuls les utilisateurs avec le rôle ADMIN peuvent accéder.
 *
 * S'applique aux pages qui déclarent :
 *   definePageMeta({ layout: 'admin', middleware: ['admin'] })
 *
 * Pages protégées : /admin, /admin/products, /admin/orders, /admin/categories
 *
 * Fonctionnement (2 niveaux de vérification) :
 *  Niveau 1 : L'utilisateur est-il connecté ?
 *    → Non : redirection vers /login
 *  Niveau 2 : L'utilisateur a-t-il le rôle ADMIN ?
 *    → Non : redirection vers l'accueil (/)
 *    → Oui : navigation autorisée
 *
 * Sécurité double :
 *  - Frontend : ce middleware bloque l'accès aux pages admin
 *  - Backend  : RolesGuard + @Roles(Role.ADMIN) sur chaque endpoint admin
 *               → même si le middleware frontend est contourné, l'API refusera
 * ============================================================
 */
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()       // Accès au store d'authentification
  const localePath = useLocalePath()    // Chemin i18n-aware

  // Vérification 1 : est-ce que l'utilisateur est connecté ?
  if (!authStore.isLoggedIn) {
    return navigateTo(localePath('/login'))  // Non connecté → page de login
  }

  // Vérification 2 : est-ce que l'utilisateur est administrateur ?
  if (!authStore.isAdmin) {
    return navigateTo(localePath('/'))  // Connecté mais pas admin → accueil
  }
  // Rôle ADMIN confirmé → accès autorisé à la page admin
})

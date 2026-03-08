/**
 * ============================================================
 * stores/cart.ts — Store Pinia du panier CLO-CLO
 * ============================================================
 * Rôle : Gère l'état du panier côté client (architecture hybride).
 *
 * Architecture hybride :
 *  - Ce store gère l'UX : ajout/suppression/quantités en temps réel
 *  - La VALIDATION des prix/stock se fait OBLIGATOIREMENT côté serveur
 *    (dans useCart.ts → POST /cart/validate avant tout paiement)
 *  - Règle de sécurité : les prix ici ne servent qu'à l'affichage,
 *    jamais pour facturer → le backend recalcule tout depuis la DB
 *
 * Persistance : localStorage clé 'clo-clo-cart'
 *  → Le panier survit aux rechargements et fermetures d'onglet
 *  → Vidé après un checkout réussi via clearCart()
 *
 * ⚠️ Règle fondamentale : les prix sont TOUJOURS en centimes.
 *    Exemple : 29,00 € = 2900 centimes
 *    Utiliser formatPrice(cents) pour l'affichage utilisateur.
 * ============================================================
 */
import { defineStore } from 'pinia'

/** Représente un article dans le panier */
export type CartItem = {
  productId: string
  variantId?: string
  name: string
  slug: string
  imageUrl?: string
  price: number      // en centimes
  quantity: number
  variantLabel?: string
}

export const useCartStore = defineStore('cart', {

  // ── State : données brutes du panier ──────────────────────
  state: () => ({
    items: [] as CartItem[],  // Liste de tous les articles
    promoCode: '' as string,  // Code promo saisi par l'utilisateur (ex: "SUMMER10")
  }),

  // ── Getters : valeurs calculées depuis le state ────────────
  getters: {
    /** Nombre total d'articles (somme de toutes les quantités) */
    itemCount: (state) =>
      state.items.reduce((total, item) => total + item.quantity, 0),

    /** Sous-total en centimes (somme prix × quantité, avant réduction) */
    subtotal: (state) =>
      state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),

    /** Sous-total formaté pour l'affichage (ex: "58,00 €") */
    subtotalFormatted(): string {
      return formatPrice(this.subtotal)
    },

    /** Vrai si le panier ne contient aucun article */
    isEmpty: (state) => state.items.length === 0,
  },

  // ── Actions : mutations de l'état ─────────────────────────
  actions: {
    /**
     * addItem — Ajoute un article au panier
     * Si un article avec le même productId + variantId existe,
     * incrémente sa quantité (pas de doublon).
     */
    addItem(item: Omit<CartItem, 'quantity'> & { quantity?: number }) {
      const quantity = item.quantity ?? 1  // Quantité par défaut : 1
      // Clé unique pour identifier l'article (gère les variantes)
      const key = itemKey(item.productId, item.variantId)
      const existing = this.items.find((i) => itemKey(i.productId, i.variantId) === key)

      if (existing) {
        existing.quantity += quantity   // Article déjà présent → incrémenter
      } else {
        this.items.push({ ...item, quantity })  // Nouvel article → ajouter
      }
    },

    /**
     * removeItem — Supprime un article du panier
     * Filtre par clé unique (productId + variantId)
     */
    removeItem(productId: string, variantId?: string) {
      const key = itemKey(productId, variantId)
      this.items = this.items.filter((i) => itemKey(i.productId, i.variantId) !== key)
    },

    /**
     * updateQuantity — Met à jour la quantité d'un article
     * Si quantity <= 0 → supprime l'article (pas de quantité négative)
     */
    updateQuantity(productId: string, quantity: number, variantId?: string) {
      const key = itemKey(productId, variantId)
      const item = this.items.find((i) => itemKey(i.productId, i.variantId) === key)
      if (!item) return  // Article introuvable → ignorer

      if (quantity <= 0) {
        this.removeItem(productId, variantId)  // Quantité 0 → supprimer
      } else {
        item.quantity = quantity
      }
    },

    /** setPromoCode — Enregistre le code promo saisi dans le CartDrawer */
    setPromoCode(code: string) {
      this.promoCode = code
    },

    /** clearCart — Vide entièrement le panier (appelé après checkout Stripe réussi) */
    clearCart() {
      this.items = []
      this.promoCode = ''
    },
  },

  // ── Persistance localStorage ───────────────────────────────
  // Le panier survit aux rechargements et fermetures d'onglet.
  // Guard SSR : typeof window !== 'undefined' car Nuxt peut s'exécuter côté serveur
  // où localStorage n'existe pas.
  persist: {
    key: 'clo-clo-cart',
    storage: typeof window !== 'undefined' ? localStorage : undefined,
  },
})

// ── Helpers ───────────────────────────────────────────────────

/**
 * itemKey — Génère une clé unique pour identifier un article
 * Pourquoi : un même produit peut avoir plusieurs variantes (tailles différentes)
 * qui doivent être traitées comme des articles séparés dans le panier.
 * Exemple : "abc123" ou "abc123__variant456"
 */
function itemKey(productId: string, variantId?: string): string {
  return variantId ? `${productId}__${variantId}` : productId
}

/**
 * formatPrice — Convertit des centimes en euros formatés
 * Utilise l'API Intl.NumberFormat pour le formatage localisé français.
 * @example formatPrice(2900) → "29,00 €"
 * @example formatPrice(1050) → "10,50 €"
 */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100)
}

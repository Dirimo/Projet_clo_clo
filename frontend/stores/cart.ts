import { defineStore } from 'pinia'

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
  state: () => ({
    items: [] as CartItem[],
    promoCode: '' as string,
  }),

  getters: {
    itemCount: (state) =>
      state.items.reduce((total, item) => total + item.quantity, 0),

    subtotal: (state) =>
      state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),

    // Affichage formaté en euros
    subtotalFormatted(): string {
      return formatPrice(this.subtotal)
    },

    isEmpty: (state) => state.items.length === 0,
  },

  actions: {
    addItem(item: Omit<CartItem, 'quantity'> & { quantity?: number }) {
      const quantity = item.quantity ?? 1
      const key = itemKey(item.productId, item.variantId)
      const existing = this.items.find((i) => itemKey(i.productId, i.variantId) === key)

      if (existing) {
        existing.quantity += quantity
      } else {
        this.items.push({ ...item, quantity })
      }
    },

    removeItem(productId: string, variantId?: string) {
      const key = itemKey(productId, variantId)
      this.items = this.items.filter((i) => itemKey(i.productId, i.variantId) !== key)
    },

    updateQuantity(productId: string, quantity: number, variantId?: string) {
      const key = itemKey(productId, variantId)
      const item = this.items.find((i) => itemKey(i.productId, i.variantId) === key)
      if (!item) return

      if (quantity <= 0) {
        this.removeItem(productId, variantId)
      } else {
        item.quantity = quantity
      }
    },

    setPromoCode(code: string) {
      this.promoCode = code
    },

    clearCart() {
      this.items = []
      this.promoCode = ''
    },
  },

  // Persistance dans localStorage
  persist: {
    key: 'clo-clo-cart',
    storage: typeof window !== 'undefined' ? localStorage : undefined,
  },
})

// ─── Helpers ─────────────────────────────────────────────────────

function itemKey(productId: string, variantId?: string): string {
  return variantId ? `${productId}__${variantId}` : productId
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100)
}

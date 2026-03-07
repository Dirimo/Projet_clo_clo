import { loadStripe } from '@stripe/stripe-js'
import { useCartStore, type CartItem, formatPrice } from '~/stores/cart'

export function useCart() {
  const cartStore = useCartStore()
  const config = useRuntimeConfig()
  const baseURL = config.public.apiUrl

  const checkoutLoading = ref(false)
  const checkoutError = ref<string | null>(null)
  const validationError = ref<string | null>(null)

  function addToCart(item: Omit<CartItem, 'quantity'> & { quantity?: number }) {
    cartStore.addItem(item)
  }

  function removeFromCart(productId: string, variantId?: string) {
    cartStore.removeItem(productId, variantId)
  }

  function updateQuantity(productId: string, quantity: number, variantId?: string) {
    cartStore.updateQuantity(productId, quantity, variantId)
  }

  /**
   * Checkout complet :
   * 1. Validation serveur (prix, stock, promos)
   * 2. Création session Stripe Checkout
   * 3. Redirection vers Stripe
   */
  async function checkout() {
    if (cartStore.isEmpty) return
    checkoutLoading.value = true
    checkoutError.value = null
    validationError.value = null

    try {
      // Étape 1 : validation serveur
      const validatedCart = await $fetch<any>(`${baseURL}/cart/validate`, {
        method: 'POST',
        body: {
          items: cartStore.items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
          promoCode: cartStore.promoCode || undefined,
        },
      })

      // Étape 2 : session Stripe
      const { url } = await $fetch<{ url: string; sessionId: string; orderId: string }>(
        `${baseURL}/stripe/checkout`,
        {
          method: 'POST',
          body: {
            items: cartStore.items.map((i) => ({
              productId: i.productId,
              variantId: i.variantId,
              quantity: i.quantity,
            })),
            promoCode: cartStore.promoCode || undefined,
          },
          credentials: 'include',
        },
      )

      // Étape 3 : redirection Stripe
      if (url) {
        cartStore.clearCart()
        window.location.href = url
      }
    } catch (e: any) {
      const msg = e?.data?.message
      if (e?.status === 422 || e?.status === 400) {
        validationError.value = msg || 'Erreur de validation du panier.'
      } else {
        checkoutError.value = msg || 'Une erreur est survenue. Réessayez.'
      }
    } finally {
      checkoutLoading.value = false
    }
  }

  return {
    items: computed(() => cartStore.items),
    itemCount: computed(() => cartStore.itemCount),
    subtotal: computed(() => cartStore.subtotal),
    subtotalFormatted: computed(() => cartStore.subtotalFormatted),
    isEmpty: computed(() => cartStore.isEmpty),
    promoCode: computed(() => cartStore.promoCode),
    checkoutLoading: readonly(checkoutLoading),
    checkoutError: readonly(checkoutError),
    validationError: readonly(validationError),
    addToCart,
    removeFromCart,
    updateQuantity,
    setPromoCode: cartStore.setPromoCode,
    clearCart: cartStore.clearCart,
    checkout,
    formatPrice,
  }
}

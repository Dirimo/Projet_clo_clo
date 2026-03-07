<template>
  <Teleport to="body">
    <!-- Overlay -->
    <Transition name="overlay">
      <div v-if="cartOpen" class="cart-overlay" @click="cartOpen = false" />
    </Transition>

    <!-- Drawer -->
    <Transition name="drawer">
      <aside v-if="cartOpen" class="cart-drawer">
        <div class="cart-drawer__header">
          <h2 class="cart-drawer__title">{{ $t('cart.title') }}</h2>
          <button class="cart-drawer__close" @click="cartOpen = false" aria-label="Fermer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Panier vide -->
        <div v-if="isEmpty" class="cart-drawer__empty">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          <p>{{ $t('cart.empty') }}</p>
          <NuxtLink
            :to="localePath('/shop')"
            class="btn btn-primary"
            @click="cartOpen = false"
          >
            {{ $t('cart.emptyAction') }}
          </NuxtLink>
        </div>

        <!-- Articles -->
        <div v-else class="cart-drawer__body">
          <ul class="cart-items">
            <li v-for="item in items" :key="`${item.productId}-${item.variantId}`" class="cart-item">
              <div class="cart-item__image">
                <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" />
                <div v-else class="cart-item__image-placeholder" />
              </div>

              <div class="cart-item__info">
                <p class="cart-item__name">{{ item.name }}</p>
                <p v-if="item.variantLabel" class="cart-item__variant">{{ item.variantLabel }}</p>
                <p class="cart-item__price">{{ formatPrice(item.price) }}</p>
              </div>

              <div class="cart-item__actions">
                <div class="qty-control">
                  <button @click="updateQuantity(item.productId, item.quantity - 1, item.variantId)">−</button>
                  <span>{{ item.quantity }}</span>
                  <button @click="updateQuantity(item.productId, item.quantity + 1, item.variantId)">+</button>
                </div>
                <button
                  class="cart-item__remove"
                  @click="removeFromCart(item.productId, item.variantId)"
                  aria-label="Supprimer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"/>
                    <path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              </div>
            </li>
          </ul>

          <!-- Code promo -->
          <div class="cart-promo">
            <input
              v-model="localPromo"
              type="text"
              :placeholder="$t('cart.promoCode')"
              class="cart-promo__input"
            />
            <button class="cart-promo__btn" @click="applyPromo">{{ $t('cart.apply') }}</button>
          </div>

          <!-- Livraison offerte -->
          <p class="cart-shipping">🎁 {{ $t('cart.freeShipping') }}</p>

          <!-- Total -->
          <div class="cart-total">
            <div class="cart-total__line">
              <span>{{ $t('cart.subtotal') }}</span>
              <span>{{ subtotalFormatted }}</span>
            </div>
          </div>
        </div>

        <!-- Footer CTA -->
        <div v-if="!isEmpty" class="cart-drawer__footer">
          <button
            class="btn btn-primary"
            style="width:100%;"
            :disabled="checkoutLoading"
            @click="doCheckout"
          >
            <span v-if="checkoutLoading">{{ $t('common.loading') }}</span>
            <span v-else>{{ $t('cart.checkout') }} — {{ subtotalFormatted }}</span>
          </button>
          <p v-if="validationError" class="cart-error">{{ validationError }}</p>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useCart } from '~/composables/useCart'

const localePath = useLocalePath()
const cartOpen = useState('cartOpen', () => false)

const {
  items, isEmpty, subtotalFormatted,
  removeFromCart, updateQuantity, setPromoCode,
  checkout, checkoutLoading, validationError, formatPrice,
} = useCart()

const localPromo = ref('')

function applyPromo() {
  setPromoCode(localPromo.value.trim().toUpperCase())
}

async function doCheckout() {
  cartOpen.value = false
  await checkout()
}
</script>

<style scoped>
/* Overlay */
.cart-overlay {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 0.45);
  z-index: 300;
}
.overlay-enter-active, .overlay-leave-active { transition: opacity 0.25s; }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }

/* Drawer */
.cart-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 420px;
  max-width: 100vw;
  background: var(--color-surface);
  z-index: 400;
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 40px rgb(0 0 0 / 0.15);
}
.drawer-enter-active, .drawer-leave-active { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.drawer-enter-from, .drawer-leave-to { transform: translateX(100%); }

/* Header */
.cart-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border);
}
.cart-drawer__title {
  font-size: 1.1rem;
  font-weight: 900;
}
.cart-drawer__close {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  color: var(--color-text-muted);
  transition: all 0.15s;
}
.cart-drawer__close:hover { background: var(--color-bg); color: var(--burning-orange); }

/* Empty */
.cart-drawer__empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 40px 24px;
  text-align: center;
  color: var(--color-text-muted);
}

/* Body */
.cart-drawer__body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Items */
.cart-items {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cart-item {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.cart-item__image {
  width: 70px;
  height: 70px;
  border-radius: var(--radius);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--color-bg);
}
.cart-item__image img { width: 100%; height: 100%; object-fit: cover; }
.cart-item__image-placeholder { width: 100%; height: 100%; background: var(--color-border); }

.cart-item__info { flex: 1; }
.cart-item__name {
  font-weight: 700;
  font-size: 0.9rem;
  line-height: 1.3;
}
.cart-item__variant {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-top: 2px;
}
.cart-item__price {
  font-weight: 800;
  color: var(--burning-orange);
  margin-top: 4px;
  font-size: 0.9rem;
}

.cart-item__actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.qty-control {
  display: flex;
  align-items: center;
  gap: 0;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius);
  overflow: hidden;
}
.qty-control button {
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  color: var(--color-text);
  transition: background 0.1s;
}
.qty-control button:hover { background: var(--color-bg); }
.qty-control span {
  width: 28px;
  text-align: center;
  font-size: 0.85rem;
  font-weight: 700;
}

.cart-item__remove {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  transition: color 0.15s;
  padding: 4px;
}
.cart-item__remove:hover { color: #e63946; }

/* Promo */
.cart-promo {
  display: flex;
  gap: 8px;
  border-top: 1px solid var(--color-border);
  padding-top: 16px;
}
.cart-promo__input {
  flex: 1;
  padding: 10px 14px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius);
  font-family: var(--font-sans);
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.15s;
}
.cart-promo__input:focus { border-color: var(--burning-orange); }
.cart-promo__btn {
  padding: 10px 16px;
  background: var(--color-text);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  font-weight: 700;
  font-size: 0.875rem;
  cursor: pointer;
  font-family: var(--font-sans);
  transition: background 0.15s;
}
.cart-promo__btn:hover { background: var(--burning-orange); }

/* Shipping */
.cart-shipping {
  font-size: 0.8rem;
  color: var(--paradiso);
  font-weight: 700;
  text-align: center;
  padding: 8px;
  background: rgba(61, 143, 141, 0.08);
  border-radius: var(--radius);
}

/* Total */
.cart-total {
  border-top: 1px solid var(--color-border);
  padding-top: 12px;
}
.cart-total__line {
  display: flex;
  justify-content: space-between;
  font-weight: 800;
  font-size: 1rem;
}

/* Footer */
.cart-drawer__footer {
  padding: 20px 24px;
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cart-error {
  font-size: 0.8rem;
  color: #e63946;
  text-align: center;
  font-weight: 600;
}
</style>

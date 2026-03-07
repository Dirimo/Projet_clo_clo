<template>
  <article class="product-card" v-motion-fade-visible>
    <NuxtLink :to="localePath(`/product/${product.slug}`)" class="product-card__image-wrap">
      <img
        v-if="product.images?.[0]"
        :src="product.images[0].url"
        :alt="product.images[0].alt || product.name"
        class="product-card__image"
        loading="lazy"
      />
      <div v-else class="product-card__image-placeholder" />

      <!-- Badges -->
      <div class="product-card__badges">
        <span v-if="product.isFeatured" class="badge badge-new">{{ $t('common.new') }}</span>
        <span v-if="product.comparePrice && product.comparePrice > product.price" class="badge badge-promo">
          -{{ discountPct }}%
        </span>
        <span v-if="product.stock === 0" class="badge badge-sold-out">{{ $t('common.soldOut') }}</span>
      </div>
    </NuxtLink>

    <div class="product-card__body">
      <p v-if="product.category" class="product-card__cat">{{ product.category.name }}</p>
      <NuxtLink :to="localePath(`/product/${product.slug}`)" class="product-card__name">
        {{ product.name }}
      </NuxtLink>

      <div class="product-card__footer">
        <div class="product-card__prices">
          <span class="product-card__price">{{ formatPrice(product.price) }}</span>
          <span v-if="product.comparePrice" class="product-card__compare">
            {{ formatPrice(product.comparePrice) }}
          </span>
        </div>

        <button
          v-if="product.stock > 0"
          class="product-card__add"
          :class="{ 'product-card__add--added': added }"
          :aria-label="$t('common.addToCart')"
          @click.prevent="handleAdd"
        >
          <svg v-if="!added" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M20 6 9 17l-5-5"/>
          </svg>
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { formatPrice } from '~/stores/cart'
import { useCart } from '~/composables/useCart'
import type { Product } from '~/composables/useProducts'

const props = defineProps<{ product: Product }>()

const localePath = useLocalePath()
const { addToCart } = useCart()
const cartOpen = useState('cartOpen', () => false)

const added = ref(false)

const discountPct = computed(() => {
  if (!props.product.comparePrice) return 0
  return Math.round((1 - props.product.price / props.product.comparePrice) * 100)
})

function handleAdd() {
  addToCart({
    productId: props.product.id,
    name: props.product.name,
    slug: props.product.slug,
    imageUrl: props.product.images?.[0]?.url,
    price: props.product.price,
    quantity: 1,
  })
  added.value = true
  cartOpen.value = true
  setTimeout(() => { added.value = false }, 2000)
}
</script>

<style scoped>
.product-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border);
  transition: box-shadow 0.2s, transform 0.2s;
  display: flex;
  flex-direction: column;
}
.product-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-3px);
}

/* Image */
.product-card__image-wrap {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  background: var(--color-bg);
  display: block;
}
.product-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}
.product-card:hover .product-card__image {
  transform: scale(1.04);
}
.product-card__image-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--color-bg) 0%, var(--color-border) 100%);
}

/* Badges */
.product-card__badges {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Body */
.product-card__body {
  padding: 14px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.product-card__cat {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
}

.product-card__name {
  font-weight: 800;
  font-size: 0.95rem;
  line-height: 1.3;
  color: var(--color-text);
  text-decoration: none;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.product-card__name:hover { color: var(--burning-orange); }

.product-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 10px;
}

.product-card__prices {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.product-card__price {
  font-weight: 900;
  font-size: 1rem;
  color: var(--color-text);
}

.product-card__compare {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  text-decoration: line-through;
}

.product-card__add {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--burning-orange);
  color: #fff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}
.product-card__add:hover { background: var(--neon-carrot); transform: scale(1.1); }
.product-card__add--added { background: var(--paradiso); }
</style>

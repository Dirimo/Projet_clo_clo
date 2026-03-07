<template>
  <div v-if="product" class="product-page">
    <div class="container">

      <!-- Fil d'ariane -->
      <nav class="breadcrumb">
        <NuxtLink :to="localePath('/')">Accueil</NuxtLink>
        <span>/</span>
        <NuxtLink :to="localePath('/shop')">{{ $t('nav.shop') }}</NuxtLink>
        <span v-if="product.category">/</span>
        <NuxtLink
          v-if="product.category"
          :to="localePath(`/shop?categorySlug=${product.category.slug}`)"
        >
          {{ product.category.name }}
        </NuxtLink>
        <span>/</span>
        <span>{{ product.name }}</span>
      </nav>

      <div class="product-layout">

        <!-- ── Galerie ── -->
        <div class="product-gallery">
          <div class="product-gallery__main">
            <img
              v-if="selectedImage"
              :src="selectedImage.url"
              :alt="selectedImage.alt || product.name"
              class="product-gallery__img"
            />
            <div v-else class="product-gallery__placeholder" />
          </div>

          <div v-if="product.images.length > 1" class="product-gallery__thumbs">
            <button
              v-for="img in product.images"
              :key="img.id"
              class="product-gallery__thumb"
              :class="{ 'product-gallery__thumb--active': selectedImage?.id === img.id }"
              @click="selectedImage = img"
            >
              <img :src="img.url" :alt="img.alt || product.name" />
            </button>
          </div>
        </div>

        <!-- ── Infos produit ── -->
        <div class="product-info">
          <p v-if="product.category" class="product-info__cat">{{ product.category.name }}</p>
          <h1 class="product-info__name">{{ product.name }}</h1>

          <!-- Prix -->
          <div class="product-info__prices">
            <span class="product-info__price">{{ formatPrice(effectivePrice) }}</span>
            <span v-if="product.comparePrice" class="product-info__compare">
              {{ formatPrice(product.comparePrice) }}
            </span>
          </div>

          <!-- Variantes -->
          <div v-if="product.variants.length > 0" class="product-variants">
            <p class="product-variants__label">{{ $t('product.variants') }}</p>
            <div class="product-variants__options">
              <button
                v-for="variant in product.variants"
                :key="variant.id"
                class="variant-btn"
                :class="{
                  'variant-btn--active': selectedVariant?.id === variant.id,
                  'variant-btn--disabled': variant.stock === 0,
                }"
                :disabled="variant.stock === 0"
                @click="selectedVariant = variant"
              >
                {{ variant.value }}
                <span v-if="variant.priceAdjustment > 0" class="variant-btn__adj">
                  +{{ formatPrice(variant.priceAdjustment) }}
                </span>
              </button>
            </div>
          </div>

          <!-- Quantité -->
          <div class="product-qty">
            <p class="product-qty__label">{{ $t('common.quantity') }}</p>
            <div class="qty-ctrl">
              <button @click="qty = Math.max(1, qty - 1)">−</button>
              <span>{{ qty }}</span>
              <button @click="qty = Math.min(maxQty, qty + 1)">+</button>
            </div>
          </div>

          <!-- Stock -->
          <p v-if="product.stock === 0" class="product-stock product-stock--out">
            {{ $t('product.outOfStock') }}
          </p>
          <p v-else class="product-stock product-stock--in">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
            {{ $t('common.inStock') }}
          </p>

          <!-- CTA -->
          <div class="product-ctas">
            <button
              class="btn btn-primary"
              style="flex:1"
              :disabled="product.stock === 0 || addedFeedback"
              @click="handleAdd"
            >
              {{ addedFeedback ? $t('product.addedToCart') : $t('common.addToCart') }}
            </button>
          </div>

          <!-- Description -->
          <div v-if="product.description" class="product-description">
            <h3>{{ $t('product.description') }}</h3>
            <p>{{ product.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Loading -->
  <div v-else-if="loading" class="product-page-loading container">
    <div class="skeleton-img" />
    <div class="skeleton-info">
      <div class="skeleton-line" style="width:60%;height:14px" />
      <div class="skeleton-line" style="width:85%;height:28px" />
      <div class="skeleton-line" style="width:40%;height:22px" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '~/stores/cart'
import { useCart } from '~/composables/useCart'
import { useProducts } from '~/composables/useProducts'

const localePath = useLocalePath()
const route = useRoute()
const { fetchProductBySlug } = useProducts()
const { addToCart } = useCart()
const cartOpen = useState('cartOpen', () => false)

const product = ref<any>(null)
const loading = ref(true)
const selectedImage = ref<any>(null)
const selectedVariant = ref<any>(null)
const qty = ref(1)
const addedFeedback = ref(false)

const effectivePrice = computed(() => {
  if (!product.value) return 0
  return product.value.price + (selectedVariant.value?.priceAdjustment ?? 0)
})

const maxQty = computed(() => {
  if (!product.value) return 1
  return selectedVariant.value?.stock ?? product.value.stock
})

onMounted(async () => {
  try {
    const slug = route.params.slug as string
    product.value = await fetchProductBySlug(slug)
    selectedImage.value = product.value.images?.[0] ?? null
    if (product.value.variants?.length) {
      const inStock = product.value.variants.find((v: any) => v.stock > 0)
      selectedVariant.value = inStock ?? null
    }
    // SEO
    useSeoMeta({
      title: `${product.value.name} — CLO-CLO`,
      description: product.value.description || `${product.value.name} sur CLO-CLO.`,
    })
  } finally {
    loading.value = false
  }
})

function handleAdd() {
  if (!product.value) return
  addToCart({
    productId: product.value.id,
    variantId: selectedVariant.value?.id,
    name: product.value.name,
    slug: product.value.slug,
    imageUrl: selectedImage.value?.url,
    price: effectivePrice.value,
    quantity: qty.value,
    variantLabel: selectedVariant.value
      ? `${selectedVariant.value.name}: ${selectedVariant.value.value}`
      : undefined,
  })
  addedFeedback.value = true
  cartOpen.value = true
  setTimeout(() => { addedFeedback.value = false }, 2500)
}
</script>

<style scoped>
.product-page {
  padding: 32px 0 80px;
}

/* Fil d'ariane */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-bottom: 36px;
  flex-wrap: wrap;
}
.breadcrumb a { color: var(--color-text-muted); text-decoration: none; transition: color 0.15s; }
.breadcrumb a:hover { color: var(--burning-orange); }
.breadcrumb span:not(:last-child) { color: var(--color-border); }

/* Layout */
.product-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: start;
}

/* Galerie */
.product-gallery__main {
  aspect-ratio: 1;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-bg);
}
.product-gallery__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}
.product-gallery__img:hover { transform: scale(1.03); }
.product-gallery__placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--color-bg), var(--color-border));
}

.product-gallery__thumbs {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.product-gallery__thumb {
  width: 68px;
  height: 68px;
  border-radius: var(--radius);
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
  background: transparent;
  transition: border-color 0.15s;
}
.product-gallery__thumb img { width: 100%; height: 100%; object-fit: cover; }
.product-gallery__thumb--active { border-color: var(--burning-orange); }

/* Infos */
.product-info__cat {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  margin-bottom: 8px;
}
.product-info__name {
  font-size: 2rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  line-height: 1.15;
  margin-bottom: 16px;
}
.product-info__prices {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 28px;
}
.product-info__price {
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--burning-orange);
}
.product-info__compare {
  font-size: 1rem;
  color: var(--color-text-muted);
  text-decoration: line-through;
}

/* Variantes */
.product-variants { margin-bottom: 24px; }
.product-variants__label {
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 10px;
  color: var(--color-text-muted);
}
.product-variants__options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.variant-btn {
  padding: 8px 16px;
  border-radius: var(--radius);
  border: 2px solid var(--color-border);
  background: transparent;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  gap: 4px;
}
.variant-btn:hover { border-color: var(--burning-orange); }
.variant-btn--active { border-color: var(--burning-orange); background: var(--burning-orange); color: #fff; }
.variant-btn--disabled { opacity: 0.4; cursor: not-allowed; text-decoration: line-through; }
.variant-btn__adj { font-size: 0.75rem; opacity: 0.8; }

/* Quantité */
.product-qty { margin-bottom: 20px; }
.product-qty__label {
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  margin-bottom: 10px;
}
.qty-ctrl {
  display: inline-flex;
  align-items: center;
  border: 2px solid var(--color-border);
  border-radius: var(--radius);
  overflow: hidden;
}
.qty-ctrl button {
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.1s;
  font-family: var(--font-sans);
}
.qty-ctrl button:hover { background: var(--color-bg); }
.qty-ctrl span {
  width: 40px;
  text-align: center;
  font-weight: 800;
}

/* Stock */
.product-stock {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  font-weight: 700;
  margin-bottom: 20px;
}
.product-stock--in  { color: var(--paradiso); }
.product-stock--out { color: #e63946; }

/* CTAs */
.product-ctas {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
}
.product-ctas .btn { padding: 14px 24px; font-size: 0.95rem; }

/* Description */
.product-description {
  border-top: 1px solid var(--color-border);
  padding-top: 24px;
}
.product-description h3 {
  font-size: 0.9rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  margin-bottom: 12px;
}
.product-description p {
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--color-text-muted);
}

/* Loading skeleton */
.product-page-loading {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  padding: 40px 0;
}
.skeleton-img {
  aspect-ratio: 1;
  border-radius: var(--radius-lg);
  background: linear-gradient(90deg, var(--color-border) 25%, var(--color-bg) 50%, var(--color-border) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
.skeleton-info { display: flex; flex-direction: column; gap: 16px; padding-top: 20px; }
.skeleton-line {
  border-radius: 6px;
  background: linear-gradient(90deg, var(--color-border) 25%, var(--color-bg) 50%, var(--color-border) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

@media (max-width: 768px) {
  .product-layout { grid-template-columns: 1fr; gap: 32px; }
}
</style>

<template>
  <div class="shop-page">

    <!-- ── CATEGORY BANNER ── -->
    <transition name="banner-fade">
      <div
        v-if="activeCat"
        class="cat-banner"
        :style="`--bcolor: ${activeCat.color}; --bcolorLight: ${activeCat.colorLight}`"
      >
        <div class="cat-banner__inner container">
          <div class="cat-banner__left">
            <NuxtLink :to="localePath('/shop')" class="cat-banner__back">
              ← {{ $t('common.back') }}
            </NuxtLink>
            <div class="cat-banner__icon" v-html="activeCat.icon" />
            <div>
              <h1 class="cat-banner__title">{{ $t(activeCat.label) }}</h1>
              <p v-if="total > 0" class="cat-banner__count">{{ total }} {{ total === 1 ? 'produit' : 'produits' }}</p>
            </div>
          </div>
          <div class="cat-banner__colorbar">
            <span style="background: var(--burning-orange)" />
            <span style="background: var(--neon-carrot)" />
            <span style="background: var(--bright-sun)" />
            <span style="background: var(--wattle)" />
            <span style="background: var(--paradiso)" />
          </div>
        </div>
      </div>
      <div v-else class="shop-header container">
        <div>
          <h1 class="shop-title">{{ $t('shop.title') }}</h1>
          <p v-if="total > 0" class="shop-count">{{ total }} {{ total === 1 ? 'produit' : 'produits' }}</p>
        </div>
      </div>
    </transition>

    <!-- ── CAT TABS (filtre rapide) ── -->
    <div class="cat-tabs">
      <div class="cat-tabs__inner container">
        <button
          class="cat-tab"
          :class="{ 'cat-tab--active': !query.categorySlug }"
          @click="setCategory(undefined)"
        >
          Tous
        </button>
        <button
          v-for="cat in cats"
          :key="cat.slug"
          class="cat-tab"
          :class="{ 'cat-tab--active': query.categorySlug === cat.slug }"
          :style="query.categorySlug === cat.slug ? `--tc: ${cat.color}` : ''"
          @click="setCategory(cat.slug)"
        >
          <span class="cat-tab__icon" v-html="cat.tabIcon" />
          {{ $t(cat.label) }}
        </button>
      </div>
    </div>

    <div class="container">
      <div class="shop-layout">

        <!-- ── Filtres sidebar ── -->
        <aside class="shop-filters">
          <h3 class="filters-title">{{ $t('shop.filters') }}</h3>

          <!-- Prix -->
          <div class="filter-group">
            <p class="filter-group__label">Prix</p>
            <div class="filter-price">
              <input v-model.number="priceMin" type="number" min="0" placeholder="Min €" class="filter-price__input" />
              <span>—</span>
              <input v-model.number="priceMax" type="number" min="0" placeholder="Max €" class="filter-price__input" />
            </div>
            <button class="btn btn-ghost" style="width:100%;margin-top:10px;font-size:0.8rem" @click="applyPrice">
              Appliquer
            </button>
          </div>

          <!-- Trier -->
          <div class="filter-group">
            <p class="filter-group__label">Trier par</p>
            <div class="sort-list">
              <button
                v-for="opt in sortOptions"
                :key="opt.value"
                class="sort-opt"
                :class="{ 'sort-opt--active': query.sortBy === opt.value }"
                @click="query.sortBy = opt.value; loadProducts()"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
        </aside>

        <!-- ── Grille produits ── -->
        <div class="shop-main">

          <!-- Skeleton -->
          <div v-if="loading" class="products-grid">
            <div v-for="n in 8" :key="n" class="product-skeleton" />
          </div>

          <!-- Produits -->
          <div v-else-if="products.length" class="products-grid">
            <ProductCard v-for="p in products" :key="p.id" :product="p" />
          </div>

          <!-- Vide -->
          <div v-else class="shop-empty">
            <div class="shop-empty__icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </div>
            <p>{{ $t('shop.noResults') }}</p>
            <button class="btn btn-ghost" style="margin-top:16px" @click="setCategory(undefined)">
              Voir tous les produits
            </button>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="pagination">
            <button
              v-for="p in totalPages"
              :key="p"
              class="pagination__btn"
              :class="{ 'pagination__btn--active': p === query.page }"
              @click="goPage(p)"
            >
              {{ p }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProducts } from '~/composables/useProducts'

const localePath = useLocalePath()
const route = useRoute()
const { t } = useI18n()
const { fetchProducts } = useProducts()

useSeoMeta({ title: `CLO-CLO — ${t('shop.title')}` })

const cats = [
  {
    slug: 'puzzles-pins',
    label: 'nav.puzzles',
    color: '#ff6933',
    colorLight: 'rgba(255,105,51,0.08)',
    tabIcon: `<svg width="14" height="14" viewBox="0 0 48 48" fill="currentColor"><rect x="6" y="6" width="15" height="15" rx="2" opacity="0.8"/></svg>`,
    icon: `<svg width="52" height="52" viewBox="0 0 48 48" fill="none">
      <rect x="6" y="6" width="15" height="15" rx="2" fill="white" opacity="0.9"/>
      <rect x="27" y="6" width="15" height="15" rx="2" fill="white" opacity="0.7"/>
      <rect x="6" y="27" width="15" height="15" rx="2" fill="white" opacity="0.7"/>
      <rect x="27" y="27" width="15" height="15" rx="2" fill="white" opacity="0.5"/>
      <circle cx="21" cy="14" r="3.5" fill="#ff6933"/>
      <circle cx="27" cy="34" r="3.5" fill="#ff6933"/>
    </svg>`,
  },
  {
    slug: 'livres-activites',
    label: 'nav.activites',
    color: '#ffc83d',
    colorLight: 'rgba(255,200,61,0.08)',
    tabIcon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
    icon: `<svg width="52" height="52" viewBox="0 0 48 48" fill="none">
      <path d="M8 10C8 8.9 8.9 8 10 8h20l10 10v22a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V10z" fill="white" opacity="0.9"/>
      <path d="M28 8v10h10" stroke="rgba(0,0,0,0.3)" stroke-width="2"/>
      <path d="M14 22h20M14 28h14" stroke="rgba(0,0,0,0.4)" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
  {
    slug: 'livres-colorier',
    label: 'nav.colorier',
    color: '#d3e156',
    colorLight: 'rgba(211,225,86,0.1)',
    tabIcon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>`,
    icon: `<svg width="52" height="52" viewBox="0 0 48 48" fill="none">
      <path d="M8 10C8 8.9 8.9 8 10 8h20l10 10v22a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V10z" fill="white" opacity="0.9"/>
      <path d="M28 8v10h10" stroke="rgba(0,0,0,0.3)" stroke-width="2"/>
      <path d="M30 36l-4-10 7-7 4 10-7 7z" fill="rgba(0,0,0,0.2)"/>
    </svg>`,
  },
  {
    slug: 'cahiers-vacances',
    label: 'nav.vacances',
    color: '#ff9b3d',
    colorLight: 'rgba(255,155,61,0.08)',
    tabIcon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="5"/><path d="M3 21v-1a9 9 0 0 1 18 0v1"/></svg>`,
    icon: `<svg width="52" height="52" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="16" r="9" fill="white" opacity="0.9"/>
      <rect x="12" y="28" width="24" height="14" rx="2" fill="white" opacity="0.7"/>
      <path d="M16 34h16M16 38h10" stroke="rgba(0,0,0,0.3)" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
  {
    slug: 't-shirts',
    label: 'nav.tshirts',
    color: '#3d8f8d',
    colorLight: 'rgba(61,143,141,0.08)',
    tabIcon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/></svg>`,
    icon: `<svg width="52" height="52" viewBox="0 0 48 48" fill="none">
      <path d="M16 6h16l6 8-6 4v24H16V18l-6-4 6-8z" fill="white" opacity="0.9" stroke="rgba(255,255,255,0.5)" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M16 6c0 4 4 6 8 6s8-2 8-6" stroke="rgba(255,255,255,0.6)" stroke-width="2"/>
    </svg>`,
  },
]

const query = reactive({
  search:       (route.query.search as string) || undefined,
  categorySlug: (route.query.categorySlug as string) || undefined,
  isFeatured:   route.query.isFeatured === 'true' ? true : undefined,
  sortBy:       (route.query.sortBy as any) || 'newest',
  page:         Number(route.query.page) || 1,
  limit:        12,
})

const priceMin = ref<number | undefined>(undefined)
const priceMax = ref<number | undefined>(undefined)

const products  = ref<any[]>([])
const total     = ref(0)
const totalPages = ref(1)
const loading   = ref(true)

const activeCat = computed(() => {
  if (!query.categorySlug) return null
  return cats.find((c) => c.slug === query.categorySlug) ?? null
})

const sortOptions = [
  { value: 'newest',     label: t('shop.newest') },
  { value: 'price_asc',  label: t('shop.priceAsc') },
  { value: 'price_desc', label: t('shop.priceDesc') },
  { value: 'name_asc',   label: t('shop.nameAsc') },
]

async function loadProducts() {
  loading.value = true
  try {
    const res = await fetchProducts({
      ...query,
      minPrice: priceMin.value ? priceMin.value * 100 : undefined,
      maxPrice: priceMax.value ? priceMax.value * 100 : undefined,
    })
    products.value = res.data
    total.value = res.meta.total
    totalPages.value = res.meta.totalPages
  } finally {
    loading.value = false
  }
}

function setCategory(slug?: string) {
  query.categorySlug = slug
  query.page = 1
  loadProducts()
}

function applyPrice() {
  query.page = 1
  loadProducts()
}

function goPage(p: number) {
  query.page = p
  loadProducts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(loadProducts)
</script>

<style scoped>
.shop-page {
  padding-bottom: 80px;
}

/* ── SHOP HEADER (sans catégorie) ── */
.shop-header {
  padding: 40px 0 24px;
}
.shop-title {
  font-size: 2rem;
  font-weight: 900;
  letter-spacing: -0.02em;
}
.shop-count {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  font-weight: 600;
  margin-top: 4px;
}

/* ── CATEGORY BANNER ── */
.cat-banner {
  background: linear-gradient(135deg, var(--bcolor) 0%, color-mix(in srgb, var(--bcolor) 70%, #000) 100%);
  color: #fff;
  padding: 0;
  margin-bottom: 0;
}

.cat-banner__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 32px;
  padding-bottom: 32px;
  gap: 20px;
}

.cat-banner__left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.cat-banner__back {
  font-size: 0.8rem;
  font-weight: 700;
  color: rgba(255,255,255,0.75);
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.15s;
}
.cat-banner__back:hover { color: #fff; }

.cat-banner__icon {
  width: 60px;
  height: 60px;
  background: rgba(255,255,255,0.15);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cat-banner__title {
  font-size: 1.8rem;
  font-weight: 900;
  letter-spacing: -0.02em;
}
.cat-banner__count {
  font-size: 0.85rem;
  opacity: 0.75;
  margin-top: 2px;
  font-weight: 600;
}

.cat-banner__colorbar {
  display: flex;
  border-radius: 999px;
  overflow: hidden;
  height: 8px;
  width: 80px;
  flex-shrink: 0;
}
.cat-banner__colorbar span { flex: 1; }

/* Banner transition */
.banner-fade-enter-active, .banner-fade-leave-active {
  transition: opacity 0.25s, transform 0.25s;
}
.banner-fade-enter-from { opacity: 0; transform: translateY(-8px); }
.banner-fade-leave-to { opacity: 0; transform: translateY(-8px); }

/* ── CAT TABS ── */
.cat-tabs {
  border-bottom: 2px solid var(--color-border);
  background: var(--color-surface);
  position: sticky;
  top: var(--nav-h);
  z-index: 10;
}

.cat-tabs__inner {
  display: flex;
  gap: 0;
  overflow-x: auto;
  scrollbar-width: none;
}
.cat-tabs__inner::-webkit-scrollbar { display: none; }

.cat-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 14px 18px;
  border: none;
  background: transparent;
  font-family: var(--font-sans);
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-text-muted);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  white-space: nowrap;
  transition: all 0.15s;
  flex-shrink: 0;
}

.cat-tab:hover { color: var(--color-text); }
.cat-tab--active {
  color: var(--tc, var(--burning-orange));
  border-bottom-color: var(--tc, var(--burning-orange));
}

.cat-tab__icon {
  display: flex;
  align-items: center;
  opacity: 0.7;
}

/* ── LAYOUT ── */
.shop-layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 40px;
  align-items: start;
  padding-top: 32px;
}

/* ── Filtres ── */
.shop-filters {
  position: sticky;
  top: calc(var(--nav-h) + 56px);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.filters-title {
  font-weight: 900;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
}

.filter-group {}
.filter-group__label {
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 10px;
  color: var(--color-text);
}

.filter-price {
  display: flex;
  align-items: center;
  gap: 8px;
}
.filter-price__input {
  flex: 1;
  padding: 8px 10px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius);
  font-family: var(--font-sans);
  font-size: 0.875rem;
  outline: none;
  width: 0;
  transition: border-color 0.15s;
}
.filter-price__input:focus { border-color: var(--burning-orange); }

.sort-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.sort-opt {
  display: block;
  width: 100%;
  text-align: left;
  padding: 7px 10px;
  border-radius: var(--radius);
  background: transparent;
  border: none;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text-muted);
  cursor: pointer;
  font-family: var(--font-sans);
  transition: all 0.15s;
}
.sort-opt:hover { color: var(--burning-orange); background: rgba(255,105,51,0.05); }
.sort-opt--active { color: var(--burning-orange); font-weight: 800; background: rgba(255,105,51,0.08); }

/* ── Main ── */
.shop-main {}

/* Empty */
.shop-empty {
  text-align: center;
  padding: 80px 0;
  color: var(--color-text-muted);
}
.shop-empty__icon {
  margin: 0 auto 16px;
  width: 64px; height: 64px;
  display: flex; align-items: center; justify-content: center;
  background: var(--color-bg);
  border-radius: 50%;
}

/* Skeleton */
.product-skeleton {
  aspect-ratio: 1;
  border-radius: var(--radius-lg);
  background: linear-gradient(90deg, var(--color-border) 25%, var(--color-bg) 50%, var(--color-border) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 48px;
}
.pagination__btn {
  width: 40px;
  height: 40px;
  border-radius: var(--radius);
  border: 1.5px solid var(--color-border);
  background: transparent;
  font-weight: 700;
  font-size: 0.875rem;
  cursor: pointer;
  font-family: var(--font-sans);
  transition: all 0.15s;
}
.pagination__btn:hover { border-color: var(--burning-orange); color: var(--burning-orange); }
.pagination__btn--active { background: var(--burning-orange); color: #fff; border-color: var(--burning-orange); }

/* ── RESPONSIVE ── */
@media (max-width: 768px) {
  .shop-layout { grid-template-columns: 1fr; }
  .shop-filters { position: static; }
  .cat-banner__inner { flex-direction: column; align-items: flex-start; }
  .cat-banner__colorbar { display: none; }
}
</style>

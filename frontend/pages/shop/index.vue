<template>
  <div class="shop-page">
    <div class="container">

      <!-- Header page -->
      <div class="shop-header">
        <h1 class="shop-title">
          {{ activeCategory ? activeCategory : $t('shop.title') }}
        </h1>
        <p v-if="total > 0" class="shop-count">
          {{ total }} {{ total === 1 ? 'produit' : 'produits' }}
        </p>
      </div>

      <div class="shop-layout">

        <!-- ── Filtres sidebar ── -->
        <aside class="shop-filters">
          <h3 class="filters-title">{{ $t('shop.filters') }}</h3>

          <!-- Catégories -->
          <div class="filter-group">
            <p class="filter-group__label">Catégories</p>
            <ul class="filter-cats">
              <li>
                <button
                  class="filter-cat"
                  :class="{ 'filter-cat--active': !query.categorySlug }"
                  @click="setCategory(undefined)"
                >
                  Tous
                </button>
              </li>
              <li v-for="cat in cats" :key="cat.slug">
                <button
                  class="filter-cat"
                  :class="{ 'filter-cat--active': query.categorySlug === cat.slug }"
                  @click="setCategory(cat.slug)"
                >
                  {{ $t(cat.label) }}
                </button>
              </li>
            </ul>
          </div>

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
        </aside>

        <!-- ── Grille produits ── -->
        <div class="shop-main">
          <!-- Barre de tri -->
          <div class="shop-toolbar">
            <div class="sort-select-wrap">
              <select v-model="query.sortBy" class="sort-select" @change="loadProducts">
                <option value="newest">{{ $t('shop.newest') }}</option>
                <option value="price_asc">{{ $t('shop.priceAsc') }}</option>
                <option value="price_desc">{{ $t('shop.priceDesc') }}</option>
                <option value="name_asc">{{ $t('shop.nameAsc') }}</option>
              </select>
            </div>
          </div>

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
            <p>{{ $t('shop.noResults') }}</p>
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
const router = useRouter()
const { t } = useI18n()
const { fetchProducts } = useProducts()

useSeoMeta({ title: `CLO-CLO — ${t('shop.title')}` })

const cats = [
  { slug: 'puzzles-pins',     label: 'nav.puzzles' },
  { slug: 'livres-activites', label: 'nav.activites' },
  { slug: 'livres-colorier',  label: 'nav.colorier' },
  { slug: 'cahiers-vacances', label: 'nav.vacances' },
  { slug: 't-shirts',         label: 'nav.tshirts' },
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

const activeCategory = computed(() => {
  if (!query.categorySlug) return null
  const cat = cats.find((c) => c.slug === query.categorySlug)
  return cat ? t(cat.label) : null
})

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
  padding: 40px 0 80px;
}

.shop-header {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 40px;
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
}

.shop-layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 40px;
  align-items: start;
}

/* Filtres */
.shop-filters {
  position: sticky;
  top: calc(var(--nav-h) + 20px);
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
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
}

.filter-group {}
.filter-group__label {
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 10px;
  color: var(--color-text);
}

.filter-cats {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-cat {
  display: block;
  width: 100%;
  text-align: left;
  padding: 7px 10px;
  border-radius: var(--radius);
  background: transparent;
  border: none;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-muted);
  cursor: pointer;
  font-family: var(--font-sans);
  transition: all 0.15s;
}
.filter-cat:hover { color: var(--burning-orange); background: var(--color-bg); }
.filter-cat--active { color: var(--burning-orange); font-weight: 800; background: rgba(255,105,51,0.08); }

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

/* Toolbar */
.shop-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.sort-select-wrap { position: relative; }
.sort-select {
  padding: 8px 36px 8px 14px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius);
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 600;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s;
}
.sort-select:focus { border-color: var(--burning-orange); }

/* Empty */
.shop-empty {
  text-align: center;
  padding: 60px 0;
  color: var(--color-text-muted);
  font-size: 1rem;
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

@media (max-width: 768px) {
  .shop-layout { grid-template-columns: 1fr; }
  .shop-filters { position: static; }
}
</style>

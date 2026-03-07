<template>
  <div class="admin-products">
    <div class="page-toolbar">
      <input
        v-model="search"
        type="text"
        placeholder="Rechercher un produit…"
        class="toolbar-search"
        @input="debouncedLoad"
      />
      <NuxtLink to="/admin/products/create" class="btn btn-primary">
        + {{ $t('admin.newProduct') }}
      </NuxtLink>
    </div>

    <div class="admin-card">
      <div v-if="loading" class="admin-loading">Chargement…</div>
      <table v-else-if="products.length" class="admin-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Nom</th>
            <th>Catégorie</th>
            <th>Prix</th>
            <th>Stock</th>
            <th>Actif</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in products" :key="p.id">
            <td>
              <div class="product-thumb">
                <img v-if="p.images?.[0]" :src="p.images[0].url" :alt="p.name" />
                <div v-else class="product-thumb-empty" />
              </div>
            </td>
            <td>
              <p class="product-name">{{ p.name }}</p>
              <p class="product-slug">{{ p.slug }}</p>
            </td>
            <td>{{ p.category?.name || '—' }}</td>
            <td class="price-col">{{ formatPrice(p.price) }}</td>
            <td>
              <span :class="p.stock === 0 ? 'stock-empty' : 'stock-ok'">{{ p.stock }}</span>
            </td>
            <td>
              <button
                class="toggle-btn"
                :class="p.isActive ? 'toggle-btn--on' : 'toggle-btn--off'"
                @click="toggleActive(p)"
              >
                {{ p.isActive ? 'Actif' : 'Inactif' }}
              </button>
            </td>
            <td>
              <div class="row-actions">
                <NuxtLink :to="`/product/${p.slug}`" target="_blank" class="action-btn action-btn--view" title="Voir">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </NuxtLink>
                <NuxtLink :to="`/admin/products/${p.id}`" class="action-btn action-btn--edit" title="Modifier">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </NuxtLink>
                <button class="action-btn action-btn--delete" title="Supprimer" @click="deleteProduct(p)">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="admin-empty">Aucun produit trouvé.</p>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="admin-pagination">
        <button
          v-for="p in totalPages" :key="p"
          class="pagination__btn"
          :class="{ 'pagination__btn--active': p === page }"
          @click="goPage(p)"
        >{{ p }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '~/stores/cart'
import { useApi } from '~/composables/useApi'

definePageMeta({ layout: 'admin', middleware: ['admin'] })
useSeoMeta({ title: 'Produits — CLO-CLO Admin' })

const { apiFetch } = useApi()
const search = ref('')
const products = ref<any[]>([])
const loading = ref(true)
const page = ref(1)
const totalPages = ref(1)

async function loadProducts() {
  loading.value = true
  try {
    const params = new URLSearchParams({ page: String(page.value), limit: '15' })
    if (search.value) params.set('search', search.value)
    const res = await apiFetch<any>(`/products?${params}`)
    products.value = res.data
    totalPages.value = res.meta.totalPages
  } finally {
    loading.value = false
  }
}

let debounceTimer: ReturnType<typeof setTimeout>
function debouncedLoad() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { page.value = 1; loadProducts() }, 350)
}

function goPage(p: number) {
  page.value = p
  loadProducts()
}

async function toggleActive(product: any) {
  await apiFetch(`/products/${product.id}/toggle`, { method: 'PATCH' })
  product.isActive = !product.isActive
}

async function deleteProduct(product: any) {
  if (!confirm(`Supprimer "${product.name}" ?`)) return
  await apiFetch(`/products/${product.id}`, { method: 'DELETE' })
  products.value = products.value.filter((p) => p.id !== product.id)
}

onMounted(loadProducts)
</script>

<style scoped>
.page-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.toolbar-search {
  flex: 1;
  max-width: 340px;
  padding: 10px 16px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius);
  font-family: var(--font-sans);
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.15s;
}
.toolbar-search:focus { border-color: var(--burning-orange); }

.product-thumb {
  width: 48px;
  height: 48px;
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--color-bg);
}
.product-thumb img { width: 100%; height: 100%; object-fit: cover; }
.product-thumb-empty { width: 100%; height: 100%; background: var(--color-border); }

.product-name { font-weight: 700; font-size: 0.875rem; }
.product-slug { font-size: 0.75rem; color: var(--color-text-muted); }

.price-col { font-weight: 800; color: var(--burning-orange); }

.stock-ok   { color: var(--paradiso); font-weight: 700; }
.stock-empty { color: #e63946; font-weight: 700; }

.toggle-btn {
  padding: 4px 10px;
  border-radius: 999px;
  border: none;
  font-size: 0.7rem;
  font-weight: 800;
  cursor: pointer;
  font-family: var(--font-sans);
}
.toggle-btn--on  { background: rgba(61,143,141,0.12); color: var(--paradiso); }
.toggle-btn--off { background: #f3f4f6; color: var(--color-text-muted); }

.row-actions { display: flex; gap: 4px; }
.action-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius);
  border: none;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.15s;
  background: transparent;
  color: var(--color-text-muted);
}
.action-btn:hover { background: var(--color-bg); }
.action-btn--delete:hover { color: #e63946; background: #fef2f2; }

.admin-pagination {
  display: flex;
  gap: 6px;
  padding: 16px 20px;
  border-top: 1px solid var(--color-border);
}
.pagination__btn {
  width: 34px; height: 34px;
  border-radius: var(--radius);
  border: 1.5px solid var(--color-border);
  background: transparent;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  font-family: var(--font-sans);
  transition: all 0.15s;
}
.pagination__btn:hover { border-color: var(--burning-orange); color: var(--burning-orange); }
.pagination__btn--active { background: var(--burning-orange); color: #fff; border-color: var(--burning-orange); }

/* Réutilisés depuis admin global */
.admin-card { background: #fff; border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden; }
.admin-loading, .admin-empty { padding: 32px 24px; text-align: center; color: var(--color-text-muted); font-size: 0.875rem; }
.admin-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.admin-table th { padding: 12px 16px; text-align: left; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-text-muted); font-weight: 700; background: #fafafa; border-bottom: 1px solid var(--color-border); }
.admin-table td { padding: 12px 16px; border-bottom: 1px solid var(--color-border); }
.admin-table tr:last-child td { border-bottom: none; }
.admin-table tr:hover td { background: #fafafa; }
</style>

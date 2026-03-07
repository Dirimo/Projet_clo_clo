<template>
  <div class="admin-orders">
    <div class="admin-card">
      <div v-if="loading" class="admin-loading">Chargement…</div>
      <table v-else-if="orders.length" class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Client</th>
            <th>Articles</th>
            <th>Total</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td class="order-id">{{ order.id.slice(0, 8) }}…</td>
            <td>{{ formatDate(order.createdAt) }}</td>
            <td>{{ order.user?.email || order.guestEmail || '—' }}</td>
            <td>{{ order.items?.length ?? 0 }}</td>
            <td class="total-col">{{ formatPrice(order.total) }}</td>
            <td>
              <select
                :value="order.status"
                class="status-select"
                @change="updateStatus(order, ($event.target as HTMLSelectElement).value)"
              >
                <option v-for="s in statuses" :key="s" :value="s">
                  {{ $t(`admin.status.${s}`) }}
                </option>
              </select>
            </td>
            <td>
              <button class="action-btn" @click="expandedOrder = expandedOrder === order.id ? null : order.id">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </td>
          </tr>

          <!-- Détail étendu -->
          <template v-if="expandedOrder">
            <tr v-for="order in orders.filter(o => o.id === expandedOrder)" :key="`detail-${order.id}`">
              <td colspan="7" class="order-detail">
                <div class="order-items-list">
                  <div v-for="item in order.items" :key="item.id" class="order-item-row">
                    <span class="order-item-name">{{ item.productName }}</span>
                    <span v-if="item.variantLabel" class="order-item-variant">{{ item.variantLabel }}</span>
                    <span class="order-item-qty">× {{ item.quantity }}</span>
                    <span class="order-item-price">{{ formatPrice(item.unitPrice * item.quantity) }}</span>
                  </div>
                </div>
                <div class="order-addresses" v-if="order.shippingAddress">
                  <p class="order-address-label">Livraison :</p>
                  <pre class="order-address-json">{{ JSON.stringify(order.shippingAddress, null, 2) }}</pre>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
      <p v-else class="admin-empty">Aucune commande.</p>

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
useSeoMeta({ title: 'Commandes — CLO-CLO Admin' })

const { apiFetch } = useApi()
const orders = ref<any[]>([])
const loading = ref(true)
const page = ref(1)
const totalPages = ref(1)
const expandedOrder = ref<string | null>(null)

const statuses = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']

async function loadOrders() {
  loading.value = true
  try {
    const res = await apiFetch<any>(`/orders?page=${page.value}&limit=20`)
    orders.value = res.data
    totalPages.value = res.meta.totalPages
  } finally {
    loading.value = false
  }
}

async function updateStatus(order: any, status: string) {
  await apiFetch(`/orders/${order.id}/status`, { method: 'PATCH', body: { status } })
  order.status = status
}

function goPage(p: number) {
  page.value = p
  loadOrders()
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

onMounted(loadOrders)
</script>

<style scoped>
.admin-card { background: #fff; border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden; }
.admin-loading, .admin-empty { padding: 32px 24px; text-align: center; color: var(--color-text-muted); font-size: 0.875rem; }
.admin-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.admin-table th { padding: 12px 16px; text-align: left; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-text-muted); font-weight: 700; background: #fafafa; border-bottom: 1px solid var(--color-border); }
.admin-table td { padding: 12px 16px; border-bottom: 1px solid var(--color-border); }
.admin-table tr:last-child td { border-bottom: none; }
.admin-table tr:hover td { background: #fafafa; }

.order-id { font-family: monospace; font-size: 0.8rem; color: var(--color-text-muted); }
.total-col { font-weight: 800; color: var(--burning-orange); }

.status-select {
  padding: 5px 10px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius);
  font-family: var(--font-sans);
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  outline: none;
  background: #fff;
  transition: border-color 0.15s;
}
.status-select:focus { border-color: var(--burning-orange); }

.action-btn {
  width: 30px; height: 30px;
  display: flex; align-items: center; justify-content: center;
  border-radius: var(--radius); border: none; cursor: pointer;
  background: transparent; color: var(--color-text-muted); transition: all 0.15s;
}
.action-btn:hover { background: var(--color-bg); color: var(--burning-orange); }

.order-detail { background: #fafafa !important; }
.order-items-list { display: flex; flex-direction: column; gap: 6px; padding: 8px 0; }
.order-item-row {
  display: flex; align-items: center; gap: 12px;
  font-size: 0.875rem; padding: 6px 12px;
  background: #fff; border-radius: var(--radius);
  border: 1px solid var(--color-border);
}
.order-item-name { font-weight: 700; flex: 1; }
.order-item-variant { font-size: 0.8rem; color: var(--color-text-muted); }
.order-item-qty { color: var(--color-text-muted); }
.order-item-price { font-weight: 800; color: var(--burning-orange); margin-left: auto; }

.order-addresses { margin-top: 12px; }
.order-address-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-text-muted); margin-bottom: 6px; }
.order-address-json { font-size: 0.75rem; background: #f3f4f6; padding: 10px; border-radius: var(--radius); overflow: auto; }

.admin-pagination { display: flex; gap: 6px; padding: 16px 20px; border-top: 1px solid var(--color-border); }
.pagination__btn { width: 34px; height: 34px; border-radius: var(--radius); border: 1.5px solid var(--color-border); background: transparent; font-size: 0.8rem; font-weight: 700; cursor: pointer; font-family: var(--font-sans); transition: all 0.15s; }
.pagination__btn:hover { border-color: var(--burning-orange); color: var(--burning-orange); }
.pagination__btn--active { background: var(--burning-orange); color: #fff; border-color: var(--burning-orange); }
</style>

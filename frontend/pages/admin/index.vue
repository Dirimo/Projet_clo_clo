<template>
  <div class="dashboard">
    <!-- Stats cards -->
    <div class="stats-grid">
      <div
        v-for="(stat, i) in stats"
        :key="stat.label"
        class="stat-card"
        :style="`--card-color: ${stat.color}`"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: i * 80 } }"
      >
        <div class="stat-card__icon" v-html="stat.icon" />
        <div class="stat-card__body">
          <p class="stat-card__value">{{ stat.value }}</p>
          <p class="stat-card__label">{{ $t(stat.label) }}</p>
        </div>
      </div>
    </div>

    <!-- Commandes récentes -->
    <div class="admin-card">
      <div class="admin-card__header">
        <h3>{{ $t('admin.recentOrders') }}</h3>
        <NuxtLink to="/admin/orders" class="admin-link">{{ $t('common.seeAll') }} →</NuxtLink>
      </div>

      <div v-if="loadingOrders" class="admin-loading">Chargement…</div>
      <table v-else-if="recentOrders.length" class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Total</th>
            <th>Statut</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in recentOrders" :key="order.id">
            <td class="order-id">{{ order.id.slice(0, 8) }}…</td>
            <td>{{ formatDate(order.createdAt) }}</td>
            <td class="order-total">{{ formatPrice(order.total) }}</td>
            <td><span class="status-badge" :class="`status-${order.status}`">{{ $t(`admin.status.${order.status}`) }}</span></td>
            <td>
              <NuxtLink :to="`/admin/orders?id=${order.id}`" class="admin-link">Voir</NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="admin-empty">Aucune commande.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '~/stores/cart'
import { useApi } from '~/composables/useApi'

definePageMeta({ layout: 'admin', middleware: ['admin'] })
useSeoMeta({ title: 'Dashboard — CLO-CLO Admin' })

const { apiFetch } = useApi()

const recentOrders = ref<any[]>([])
const loadingOrders = ref(true)
const statsData = ref({ totalOrders: 0, revenue: 0, totalProducts: 0, totalUsers: 0 })

onMounted(async () => {
  try {
    const [ordersRes, products, users] = await Promise.all([
      apiFetch<any>('/orders?limit=5'),
      apiFetch<any>('/products?limit=1'),
      apiFetch<any>('/users'),
    ])
    recentOrders.value = ordersRes.data || []
    statsData.value = {
      totalOrders:   ordersRes.meta?.total ?? 0,
      revenue:       (ordersRes.data || []).reduce((s: number, o: any) => s + (o.status === 'PAID' ? o.total : 0), 0),
      totalProducts: products.meta?.total ?? 0,
      totalUsers:    Array.isArray(users) ? users.length : 0,
    }
  } finally {
    loadingOrders.value = false
  }
})

const stats = computed(() => [
  {
    label: 'admin.totalOrders',
    value: statsData.value.totalOrders,
    color: 'var(--burning-orange)',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
  },
  {
    label: 'admin.revenue',
    value: formatPrice(statsData.value.revenue),
    color: 'var(--paradiso)',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  },
  {
    label: 'admin.totalProducts',
    value: statsData.value.totalProducts,
    color: 'var(--bright-sun)',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  },
  {
    label: 'admin.totalUsers',
    value: statsData.value.totalUsers,
    color: 'var(--wattle)',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  },
])

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  border-left: 4px solid var(--card-color);
}
.stat-card__icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius);
  background: color-mix(in srgb, var(--card-color) 12%, transparent);
  color: var(--card-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-card__value {
  font-size: 1.5rem;
  font-weight: 900;
  line-height: 1;
}
.stat-card__label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  font-weight: 700;
  margin-top: 4px;
}

.admin-card {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.admin-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border);
}
.admin-card__header h3 { font-weight: 800; font-size: 1rem; }
.admin-link {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--burning-orange);
  text-decoration: none;
}
.admin-link:hover { opacity: 0.7; }

.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}
.admin-table th {
  padding: 12px 20px;
  text-align: left;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  font-weight: 700;
  background: #fafafa;
  border-bottom: 1px solid var(--color-border);
}
.admin-table td {
  padding: 14px 20px;
  border-bottom: 1px solid var(--color-border);
}
.admin-table tr:last-child td { border-bottom: none; }
.admin-table tr:hover td { background: #fafafa; }

.order-id { font-family: monospace; font-size: 0.8rem; color: var(--color-text-muted); }
.order-total { font-weight: 800; color: var(--burning-orange); }

.status-badge {
  display: inline-flex;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.status-PENDING    { background: #fff3cd; color: #856404; }
.status-PAID       { background: rgba(61,143,141,0.12); color: var(--paradiso); }
.status-PROCESSING { background: #cce5ff; color: #004085; }
.status-SHIPPED    { background: #d4edda; color: #155724; }
.status-DELIVERED  { background: rgba(211,225,86,0.3); color: #2d3a00; }
.status-CANCELLED  { background: #f8d7da; color: #721c24; }
.status-REFUNDED   { background: #e2e3e5; color: #383d41; }

.admin-loading, .admin-empty {
  padding: 32px 24px;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.875rem;
}
</style>
